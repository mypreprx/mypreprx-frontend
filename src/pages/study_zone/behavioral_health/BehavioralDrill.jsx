import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../../../components/common/sidebar/Sidebar';
import { Topbar } from '../../../components/common/topbar/Topbar';
import api from '../../../config/axiosInstance';
import toast from 'react-hot-toast';
import styles from './BehavioralDrill.module.css';

export const BehavioralDrill = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const topic = searchParams.get('topic');

    const [cases, setCases] = useState([]);
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            if (!topic) {
                toast.error("No topic selected");
                navigate(-1);
                return;
            }
            try {
                setLoading(true);
                const res = await api.get(`/user/getAllBehavioralHealth?topic=${encodeURIComponent(topic)}&limit=3`);
                if (res.data.success && res.data.data.length > 0) {
                    setCases(res.data.data);
                } else {
                    toast.error("No cases available for this topic.");
                    navigate(-1);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load cases.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [topic, navigate]);

    if (loading) {
        return (
            <div className={styles.layout}>
                <Sidebar sidebarOpen={false} />
                <main className={styles.main}>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#00A5B7' }}>
                        Loading Case Study...
                    </div>
                </main>
            </div>
        );
    }

    if (cases.length === 0) return null;

    const currentCase = cases[currentCaseIndex];
    const currentQ = currentCase.questions[currentQuestionIndex];
    const isMultipleChoice = currentQ.correctAnswers.length > 1;

    const handleOptionToggle = (opt) => {
        if (isSubmitted) return;
        if (isMultipleChoice) {
            setSelectedOptions(prev => 
                prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
            );
        } else {
            setSelectedOptions([opt]);
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentCase.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptions([]);
            setIsSubmitted(false);
        } else if (currentCaseIndex < cases.length - 1) {
            setCurrentCaseIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            setSelectedOptions([]);
            setIsSubmitted(false);
            toast.success("Moving to next case study!");
        } else {
            toast.success("You've completed all cases for this session!");
            navigate('/study-zone/behavioral-health');
        }
    };

    const isCorrect = isSubmitted && 
                      selectedOptions.length === currentQ.correctAnswers.length &&
                      selectedOptions.every(val => currentQ.correctAnswers.includes(val));

    // Parse "A: text ... B: text ..." or "A. text ... B. text ..." into [{ letter, text }] rows
    const parseWrongAnswers = (raw) => {
        if (!raw) return [];
        const parts = raw.match(/([A-F])[:.]\s*([\s\S]*?)(?=\s+[A-F][:.]|$)/g) || [];
        return parts.map((part) => {
            const m = part.match(/^([A-F])[:.]\s*([\s\S]*)$/);
            if (!m) return null;
            return { letter: m[1], text: m[2].trim() };
        }).filter(Boolean);
    };
    const wrongAnswerRows = parseWrongAnswers(currentQ.whyIncorrect);

    return (
        <div className={styles.layout}>
            <Sidebar sidebarOpen={false} />
            <main className={styles.main}>
                <Topbar pageTitle="Behavioral Health Rx" sidebarOpen={false} />

                <div className={styles.content}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

                    <div className={styles.drillHeader}>
                        <h2>Case Study: {topic}</h2>
                        <p>Case {currentCaseIndex + 1} of {cases.length} | Question {currentQuestionIndex + 1} of {currentCase.questions.length}</p>
                    </div>

                    <div className={styles.scenarioCard}>
                        <h3>Clinical Scenario</h3>
                        <p>{currentCase.clinicalScenario}</p>
                    </div>

                    <div className={styles.questionCard}>
                        {currentQ.ncjmmStep && (
                            <div className={styles.stepBadge}>
                                {currentQ.ncjmmStep}
                                {currentQ.currentFormat ? ` · ${currentQ.currentFormat}` : ''}
                            </div>
                        )}
                        <p className={styles.questionText}>{currentQ.questionText}</p>
                        {isMultipleChoice && <p className={styles.sataHint}>Select all that apply</p>}

                        <div className={styles.optionsList}>
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = selectedOptions.includes(opt);
                                const isActualCorrect = currentQ.correctAnswers.includes(opt);

                                let optClass = styles.optionCard;
                                if (isSelected) optClass += ` ${styles.selected}`;

                                if (isSubmitted) {
                                    if (isActualCorrect) optClass += ` ${styles.correct}`;
                                    else if (isSelected && !isActualCorrect) optClass += ` ${styles.wrong}`;
                                }

                                return (
                                    <div 
                                        key={idx} 
                                        className={optClass}
                                        onClick={() => handleOptionToggle(opt)}
                                    >
                                        <div className={styles.checkbox}>
                                            {isSelected && <div className={styles.checkboxInner} />}
                                        </div>
                                        <span>{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {isSubmitted && (
                        <div className={styles.rationaleCard}>
                            <h3>Rationale</h3>
                            <div className={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
                                {isCorrect ? "Correct!" : "Incorrect."}
                            </div>
                            <p>{currentQ.rationale}</p>

                            {currentQ.whyIncorrect && (
                                <div className={styles.teachingBlock}>
                                    <h4>Why Each Incorrect Answer Is Wrong</h4>
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
                                </div>
                            )}
                            {currentQ.memoryTrick && (
                                <div className={styles.teachingBlock}>
                                    <h4>Memory Trick</h4>
                                    <p>{currentQ.memoryTrick}</p>
                                </div>
                            )}
                            {currentQ.nclexTrap && (
                                <div className={styles.teachingBlock}>
                                    <h4>NCLEX Trap</h4>
                                    <p>{currentQ.nclexTrap}</p>
                                </div>
                            )}
                            {currentQ.clinicalPearl && (
                                <div className={styles.teachingBlock}>
                                    <h4>Clinical Pearl</h4>
                                    <p>{currentQ.clinicalPearl}</p>
                                </div>
                            )}
                            {currentQ.clinicalBreakdown && (
                                <div className={styles.teachingBlock}>
                                    <h4>Clinical Breakdown</h4>
                                    <p>{currentQ.clinicalBreakdown}</p>
                                </div>
                            )}
                            {currentQ.nclexConnection && (
                                <div className={styles.teachingBlock}>
                                    <h4>NCLEX Connection</h4>
                                    <p>{currentQ.nclexConnection}</p>
                                </div>
                            )}
                            {currentQ.preprxStrategy && (
                                <div className={styles.teachingBlock}>
                                    <h4>PrepRX CJ FAST+ Strategy</h4>
                                    <p>{currentQ.preprxStrategy}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.drillButtons}>
                        {isSubmitted && (
                            <button
                                className={styles.submitBtn}
                                style={{ background: '#e0e5ed', color: '#072445' }}
                                onClick={async () => {
                                    try {
                                        const payload = {
                                            topic: topic,
                                            questionText: currentQ.questionText,
                                            answerText: currentQ.correctAnswers.join(', '),
                                            rationale: currentQ.rationale || 'No rationale provided'
                                        };
                                        const res = await api.post('/user/flashcards/add', payload);
                                        if (res.data.success) toast.success('Flagged for review!');
                                    } catch (error) {
                                        toast.error('Failed to flag question');
                                    }
                                }}
                            >
                                Flag for Review
                            </button>
                        )}
                        <button 
                            className={styles.submitBtn} 
                            onClick={isSubmitted ? handleNext : handleSubmit}
                            disabled={selectedOptions.length === 0}
                        >
                            {isSubmitted ? 
                                (currentQuestionIndex < currentCase.questions.length - 1 ? "Next Question" : 
                                 currentCaseIndex < cases.length - 1 ? "Next Case Study" : "Finish Session") 
                            : "Submit Answer"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
