import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { Button } from "../../../components/common/Button";
import api from "../../../config/axiosInstance";
import toast from "react-hot-toast";
import styles from "./StrategyDrill.module.css";
import GeneratingModal from "../../../components/common/GeneratingModal";
import { recordStudyDayAlways } from "../../../utils/recordStudyDay";

export const StrategyDrill = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse query params in case state is missing
    const searchParams = new URLSearchParams(location.search);
    const queryTab = searchParams.get('tab');
    const querySub = searchParams.get('sub');
    
    const strategyTab = location.state?.strategyTab || queryTab;
    const subCategory = location.state?.subCategory || querySub;
    const isDynamic = location.state?.isDynamic || false;
    const promptInstructions = location.state?.promptInstructions || "";

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Multi-select state for SATA, single for others
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const questionStartedAt = useRef(Date.now());

    useEffect(() => {
        questionStartedAt.current = Date.now();
    }, [currentIndex]);

    useEffect(() => {
        if (!strategyTab) {
            toast.error("Strategy tab not specified");
            navigate("/strategy-zone");
            return;
        }

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                
                if (isDynamic && promptInstructions) {
                    const payload = {
                        strategyTab,
                        subCategory: subCategory || strategyTab,
                        promptInstructions,
                        count: 5
                    };
                    const res = await api.post('/user/strategy/generate', payload);
                    if (res.data.success) {
                        setQuestions(res.data.data);
                    } else {
                        toast.error(res.data.message || "Failed to generate dynamic questions");
                    }
                } else {
                    const res = await api.get(`/user/getStrategyQuestions?strategyTab=${encodeURIComponent(strategyTab)}&limit=15`);
                    if (res.data.success) {
                        // Filter by subcategory if needed, though random from tab is fine too
                        let filtered = res.data.data;
                        if (subCategory) {
                            filtered = filtered.filter(q => q.subCategory === subCategory);
                        }
                        if (filtered.length === 0) filtered = res.data.data; // fallback

                        setQuestions(filtered);
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load strategy questions");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [strategyTab, subCategory, isDynamic, promptInstructions, navigate]);

    if (loading) return <GeneratingModal isOpen={true} message="AI is crafting your strategy practice questions. This may take up to 30 seconds." />;
    if (questions.length === 0) return <div>No questions found for this strategy yet. Check back later!</div>;

    const currentQ = questions[currentIndex];
    const isSATA = currentQ.strategyTab === "SATA Boot Camp" || currentQ.correctAnswers?.length > 1;

    const handleSelect = (idx) => {
        if (isSubmitted) return;
        const optionText = currentQ.options[idx];

        if (isSATA) {
            setSelectedOptions(prev => 
                prev.includes(optionText) 
                ? prev.filter(o => o !== optionText)
                : [...prev, optionText]
            );
        } else {
            setSelectedOptions([optionText]);
        }
    };

    const handleSubmit = () => {
        const isSataQ = currentQ.strategyTab === "SATA Boot Camp" || currentQ.correctAnswers?.length > 1;
        const correct = isSataQ
            ? (currentQ.correctAnswers || []).length === selectedOptions.length &&
              (currentQ.correctAnswers || []).every((c) => selectedOptions.includes(c))
            : selectedOptions.length > 0 && (currentQ.correctAnswers || []).includes(selectedOptions[0]);
        setIsSubmitted(true);
        const timeSpentSeconds = Math.max(
            1,
            Math.round((Date.now() - questionStartedAt.current) / 1000)
        );
        // Count this answer toward Progress questions/accuracy/streak
        recordStudyDayAlways("strategy-zone", {
            isCorrect: correct,
            questionId: currentQ._id,
            topicTitle: strategyTab || "Strategy Zone",
            userAnswer: selectedOptions.join(", "),
            timeSpentSeconds,
        });
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptions([]);
            setIsSubmitted(false);
        } else if (isDynamic) {
            // Fetch the next batch
            try {
                setLoading(true);
                const payload = {
                    strategyTab,
                    subCategory: subCategory || strategyTab,
                    promptInstructions,
                    count: 5
                };
                const res = await api.post('/user/strategy/generate', payload);
                if (res.data.success) {
                    setQuestions(prev => [...prev, ...res.data.data]);
                    setCurrentIndex(prev => prev + 1);
                    setSelectedOptions([]);
                    setIsSubmitted(false);
                } else {
                    toast.error(res.data.message || "Failed to generate dynamic questions");
                    navigate("/strategy-zone");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error generating next batch");
                navigate("/strategy-zone");
            } finally {
                setLoading(false);
            }
        } else {
            toast.success("Drill Complete!");
            navigate("/strategy-zone");
        }
    };

    const isCorrectChoice = (opt) => currentQ.correctAnswers?.includes(opt);
    const isFullyCorrect = isSATA 
        ? currentQ.correctAnswers.every(c => selectedOptions.includes(c)) && selectedOptions.length === currentQ.correctAnswers.length
        : selectedOptions.length > 0 && currentQ.correctAnswers.includes(selectedOptions[0]);

    // Parse "A: text ... B: text ..." into [{ letter, text }] rows
    const parseWrongAnswers = (raw) => {
        if (!raw) return [];
        const parts = raw.match(/([A-F]):\s*([\s\S]*?)(?=\s+[A-F]:|$)/g) || [];
        return parts.map((part) => {
            const m = part.match(/^([A-F]):\s*([\s\S]*)$/);
            if (!m) return null;
            return { letter: m[1], text: m[2].trim() };
        }).filter(Boolean);
    };
    const wrongAnswerRows = parseWrongAnswers(currentQ.whyIncorrect);
    const selectedCorrectRows = parseWrongAnswers(currentQ.whySelectedCorrect);

    return (
        <div className={styles.drillContainer}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <main className={styles.mainArea}>
                <Topbar pageTitle={strategyTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles.drillCard}>
                    <div className={styles.drillHeader}>
                        <span className={styles.drillCount}>Q {currentIndex + 1} / {questions.length} - {currentQ.subCategory}</span>
                        {isSATA && <span style={{color: '#d9534f', fontWeight: 'bold'}}>Select All That Apply</span>}
                    </div>
                    <h2 className={styles.questionText}>{currentQ.question}</h2>
                </div>

                <div className={styles.optionsContainer}>
                    {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedOptions.includes(opt);
                        const correctOpt = isCorrectChoice(opt);
                        
                        let className = styles.option;
                        if (!isSubmitted && isSelected) className += ` ${styles.selected}`;
                        if (isSubmitted && correctOpt) className += ` ${styles.correct}`;
                        if (isSubmitted && isSelected && !correctOpt) className += ` ${styles.wrong}`;

                        return (
                            <div key={idx} className={className} onClick={() => handleSelect(idx)}>
                                <span className={styles.letter}>{String.fromCharCode(65 + idx)}.</span>
                                <span className={styles.optionText}>{opt}</span>
                            </div>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div className={styles.feedbackWrap}>
                        <h3 className={styles.feedbackTitle}>{isFullyCorrect ? "✅ Correct!" : "❌ Incorrect"}</h3>
                        <p><strong>Rationale:</strong> {currentQ.rationale}</p>
                        
                        {currentQ.whySelectedCorrect && (
                            <>
                                <div className={styles.feedbackSubtitle} style={{color: '#2e9e5b'}}>Why each selected answer is correct:</div>
                                {selectedCorrectRows.length > 0 ? (
                                    <div className={styles.wrongAnswers}>
                                        {selectedCorrectRows.map((row, i) => (
                                            <div key={i} className={styles.wrongAnswerRow}>
                                                <span className={styles.correctAnswerLetter}>{row.letter}</span>
                                                <span className={styles.wrongAnswerText}>{row.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{currentQ.whySelectedCorrect}</p>
                                )}
                            </>
                        )}
                        
                        {currentQ.whyIncorrect && (
                            <>
                                <div className={styles.feedbackSubtitle}>Why other answers are wrong:</div>
                                {wrongAnswerRows.length > 0 ? (
                                    <div className={styles.wrongAnswers}>
                                        {wrongAnswerRows.map((row, i) => (
                                            <div key={i} className={styles.wrongAnswerRow}>
                                                <span className={styles.wrongAnswerLetter}>{row.letter}</span>
                                                <span className={styles.wrongAnswerText}>{row.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{currentQ.whyIncorrect}</p>
                                )}
                            </>
                        )}
                        
                        {currentQ.nclexTrap && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#ffebee', borderRadius: '4px'}}>
                                <strong>🚨 NCLEX Trap:</strong> {currentQ.nclexTrap}
                            </div>
                        )}
                        
                        {currentQ.memoryTrick && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#e3f2fd', borderRadius: '4px'}}>
                                <strong>🧠 Memory Trick:</strong> {currentQ.memoryTrick}
                            </div>
                        )}

                        {currentQ.clinicalPearl && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#f3e5f5', borderRadius: '4px'}}>
                                <strong>💡 Clinical Pearl:</strong> {currentQ.clinicalPearl}
                            </div>
                        )}

                        {currentQ.clinicalPharmacologyBreakdown && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#e8f5e9', borderRadius: '4px'}}>
                                <strong>💊 Clinical Pharmacology Breakdown:</strong> {currentQ.clinicalPharmacologyBreakdown}
                            </div>
                        )}

                        {currentQ.nclexConnection && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#fff3e0', borderRadius: '4px'}}>
                                <strong>🔗 NCLEX Connection:</strong> {currentQ.nclexConnection}
                            </div>
                        )}

                        {currentQ.preprxTestTakingStrategy && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#e0f7fa', borderRadius: '4px'}}>
                                <strong>🎯 PrepRX Test-Taking Strategy:</strong> {currentQ.preprxTestTakingStrategy}
                            </div>
                        )}

                        {currentQ.authoritativeReferenceValidation && (
                            <div style={{marginTop: '12px', padding: '8px', background: '#fce4ec', borderRadius: '4px'}}>
                                <strong>📚 Authoritative Reference Validation:</strong> {currentQ.authoritativeReferenceValidation}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.drillButtons}>
                    {isSubmitted && (
                        <button 
                            className={styles.submitBtn} 
                            onClick={async () => {
                                try {
                                    const payload = {
                                        topic: strategyTab,
                                        questionText: currentQ.question,
                                        answerText: currentQ.correctAnswers.join(", "),
                                        rationale: currentQ.rationale || "No rationale provided"
                                    };
                                    const res = await api.post('/user/flashcards/add', payload);
                                    if (res.data.success) toast.success("Flagged for review!");
                                } catch {
                                    toast.error("Failed to flag question");
                                }
                            }}
                            style={{ background: '#e0e5ed', color: '#072445' }}
                        >
                            Flag for Review
                        </button>
                    )}
                    <button 
                        className={styles.submitBtn} 
                        onClick={isSubmitted ? handleNext : handleSubmit}
                        disabled={selectedOptions.length === 0}
                    >
                        {isSubmitted ? (currentIndex < questions.length - 1 ? "Next Question" : "Finish Drill") : "Submit Answer"}
                    </button>
                </div>

            </main>
        </div>
    );
};
