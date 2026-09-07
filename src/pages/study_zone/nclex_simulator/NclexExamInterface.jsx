import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../config/axiosInstance";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import GeneratingModal from "../../../components/common/GeneratingModal";
import ConfirmationModal from "../../../components/common/modal/ConfirmationModal";

import styles from "./NclexSimulatorDashboard.module.css";

function clock(s) {
    s = Math.max(0, s | 0);
    return [
        String((s / 3600) | 0).padStart(2, '0'),
        String(((s % 3600) / 60) | 0).padStart(2, '0'),
        String(s % 60).padStart(2, '0')
    ].join(":");
}

export const NclexExamInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60 * 60); // 5 hours in seconds
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [testStartTime, setTestStartTime] = useState(Date.now());

    // Case Study state
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        if (!location.state?.attemptId || !location.state?.nextItem) {
            toast.error("Invalid session. Redirecting.");
            navigate('/study-zone/nclex-simulator');
            return;
        }
        setAttemptId(location.state.attemptId);
        setCurrentQuestion(location.state.nextItem);
        if (location.state.currentQuestionNumber) {
            setQuestionNumber(location.state.currentQuestionNumber);
        }
        setQuestionStartTime(Date.now());
        setTestStartTime(Date.now());
        
        // Save qrecv stats
        updateProgress(p => ({ ...p, qrecv: p.qrecv + 1 }));

        if (location.state.nextItem?.tabs && Object.keys(location.state.nextItem.tabs).length > 0) {
            setActiveTab(Object.keys(location.state.nextItem.tabs)[0]);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (currentQuestion?.tabs && Object.keys(currentQuestion.tabs).length > 0) {
            setActiveTab(Object.keys(currentQuestion.tabs)[0]);
        }
    }, [currentQuestion]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [attemptId]);

    const updateProgress = (updater) => {
        const p = JSON.parse(localStorage.getItem("prx") || 'null') || { started:0, completed:0, passes:0, fails:0, abandoned:0, qrecv:0, qans:0, testsec:0, actsec:0, hist:[] };
        const newP = updater(p);
        localStorage.setItem("prx", JSON.stringify(newP));
        return newP;
    };

    const handleTimeOut = async () => {
        handleSubmit();
    };

    const handleOptionSelect = (optionText) => {
        if (currentQuestion.questionType === 'SATA' || currentQuestion.questionType === 'multiple') {
            setSelectedOptions(prev => 
                prev.includes(optionText)
                    ? prev.filter(o => o !== optionText)
                    : [...prev, optionText]
            );
        } else {
            setSelectedOptions([optionText]);
        }
    };

    const handleSubmit = async () => {
        if (selectedOptions.length === 0 && timeRemaining > 0) {
            toast.error("Select a response.");
            return;
        }

        const elapsedSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
        setIsSubmitting(true);

        updateProgress(p => ({ ...p, qans: p.qans + 1, actsec: p.actsec + elapsedSeconds }));

        try {
            // Note: backend expects userAnswer array or single value depending on questionType
            const response = await api.post('/user/submit-nclex-answer', {
                attemptId,
                question: currentQuestion,
                userAnswer: (currentQuestion.questionType === 'SATA' || currentQuestion.questionType === 'multiple') ? selectedOptions : selectedOptions[0],
                elapsedSeconds
            });

            if (response.data.success) {
                if (response.data.status !== 'in-progress') {
                    // Exam finished
                    finishExam(response.data.status, response.data.decisionRule, questionNumber);
                } else {
                    // Next question
                    setCurrentQuestion(response.data.nextItem);
                    setSelectedOptions([]);
                    setQuestionStartTime(Date.now());
                    if (response.data.currentQuestionNumber) {
                        setQuestionNumber(response.data.currentQuestionNumber);
                    } else {
                        setQuestionNumber(prev => prev + 1);
                    }
                    updateProgress(p => ({ ...p, qrecv: p.qrecv + 1 }));
                }
            }
        } catch (error) {
            console.error("Failed to submit answer", error);
            toast.error("Failed to submit answer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const finishExam = (status, decision, totalAnswered) => {
        const sec = Math.min(5 * 60 * 60, Math.floor((Date.now() - testStartTime) / 1000));
        const res = status.toUpperCase() === 'PASS' ? 'PASS' : (status.toUpperCase() === 'FAIL' ? 'FAIL' : 'ABANDONED');
        
        updateProgress(p => {
            const actsec = p.actsec;
            if (res === 'ABANDONED') {
                p.abandoned++;
            } else {
                p.completed++;
                p.testsec += sec;
                if (res === 'PASS') p.passes++;
                else p.fails++;
            }
            p.hist.push({
                date: new Date().toLocaleDateString(),
                result: res,
                q: totalAnswered,
                sec,
                avg: totalAnswered ? actsec / totalAnswered : 0,
                decision: decision || (res === 'ABANDONED' ? 'User Ended' : 'Time Limit')
            });
            return p;
        });

        navigate('/study-zone/nclex-simulator/result', {
            state: {
                status: res,
                decisionRule: decision,
                questionsReceived: totalAnswered,
                testingTime: sec
            }
        });
    };

    const handleEndTest = () => {
        setIsEndModalOpen(true);
    };

    const confirmEndTest = () => {
        setIsEndModalOpen(false);
        finishExam("ABANDONED", "User Ended", questionNumber);
    };

    if (!currentQuestion) return null;

    const isMultiple = currentQuestion.questionType === 'SATA' || currentQuestion.questionType === 'multiple';

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }} className={styles.app}>
                <header className={styles.topbar}>
                    <div className={styles.brand}>PrepRX NCLEX-RN Simulator</div>
                    <div className={styles.topmeta}>
                        <span>Question {questionNumber}</span>
                        <span>{clock(timeRemaining)}</span>
                    </div>
                </header>

                <main className={styles.container}>
                    <section className={styles.questionWrap}>
                        <div className={styles.card}>
                            {currentQuestion.caseId && (
                                <>
                                    <div className={styles.caseBanner}>
                                        {currentQuestion.caseTitle} — Case Study Screen {currentQuestion.screen || 1} of 6
                                    </div>
                                    <div className={styles.tabs}>
                                        {Object.keys(currentQuestion.tabs || {}).map(tabKey => (
                                            <button 
                                                key={tabKey}
                                                className={`${styles.tab} ${activeTab === tabKey ? styles.tabActive : ''}`}
                                                onClick={() => setActiveTab(tabKey)}
                                            >
                                                {tabKey}
                                            </button>
                                        ))}
                                    </div>
                                    <div className={styles.exhibit}>
                                        {currentQuestion.tabs?.[activeTab]}
                                    </div>
                                </>
                            )}
                            
                            <div className={styles.kicker}>NCLEX-RN Practice Item</div>
                            <div className={styles.stem}>{currentQuestion.question || currentQuestion.stem}</div>
                            
                            <div>
                                {currentQuestion.options?.map((option, idx) => {
                                    const checked = selectedOptions.includes(option);
                                    return (
                                        <label key={idx} className={styles.option}>
                                            <input 
                                                type={isMultiple ? "checkbox" : "radio"} 
                                                name="a" 
                                                checked={checked}
                                                onChange={() => handleOptionSelect(option)}
                                            />
                                            <span>{idx + 1}. {option.replace(/^\d+[\.\)]\s*/, '')}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.primary} onClick={handleSubmit} disabled={isSubmitting}>
                                    Submit &amp; Next
                                </button>
                                <button className={styles.danger} onClick={handleEndTest}>
                                    End Test
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <GeneratingModal isOpen={isSubmitting} message="AI is selecting your next adaptive question. This takes about 5–10 seconds." />
            <ConfirmationModal
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                onConfirm={confirmEndTest}
                title="End Examination"
                message="Are you sure you want to end the exam? This will be recorded as Abandoned and cannot be resumed."
            />
        </div>
    );
};
