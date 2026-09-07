import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import api from "../../../config/axiosInstance";
import toast from "react-hot-toast";
import styles from "./TopicDrill.module.css";
import GeneratingModal from "../../../components/common/GeneratingModal";

export const TopicDrill = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const topicId = location.state?.topicId;
    const topicTitle = location.state?.title || "Topic";

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (!topicId) {
            toast.error("Topic not specified");
            navigate("/study-zone/all-topics");
            return;
        }

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/user/getAllQuestionsByTopic/${topicId}`);
                if (res.data.success && res.data.questions && res.data.questions.length > 0) {
                    // Shuffle questions each time the drill is opened
                    const shuffled = [...res.data.questions];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    setQuestions(shuffled);
                } else {
                    toast.error("No questions available for this topic.");
                    navigate("/study-zone/all-topics");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load questions.");
                navigate("/study-zone/all-topics");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [topicId, navigate]);

    if (loading) return <GeneratingModal isOpen={true} message={`Loading ${topicTitle} questions...`} />;

    if (currentIndex >= questions.length) {
        return (
            <div className={styles.drillContainer}>
                <Sidebar sidebarOpen={sidebarOpen} />
                <main className={styles.mainArea}>
                    <Topbar pageTitle={topicTitle} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className={styles.completeCard}>
                        <h2 className={styles.completeTitle}>🎉 Drill Complete!</h2>
                        <p className={styles.completeText}>You've reviewed all {questions.length} {topicTitle} questions.</p>
                        <button className={styles.submitBtn} onClick={() => navigate("/study-zone/all-topics")}>
                            Back to All Topics
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const options = currentQ.option || currentQ.options || [];

    const handleSelect = (opt) => {
        if (isSubmitted) return;
        setSelectedOption(opt);
    };

    const handleSubmit = () => setIsSubmitted(true);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        }
    };

    const isCorrect = isSubmitted && selectedOption === currentQ.correctAnswer;

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

    const handleFlag = async () => {
        try {
            const payload = {
                topic: topicTitle,
                questionText: currentQ.question,
                answerText: currentQ.correctAnswer,
                rationale: currentQ.rationale || "No rationale provided"
            };
            await api.post('/user/flashcards/add', payload);
            toast.success("Flagged for review!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to flag question");
        }
    };

    return (
        <div className={styles.drillContainer}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <main className={styles.mainArea}>
                <Topbar pageTitle={topicTitle} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

                <div className={styles.drillCard}>
                    <div className={styles.drillHeader}>
                        <span className={styles.drillCount}>Q {currentIndex + 1} / {questions.length}</span>
                        {currentQ.subtopicTitle && <span className={styles.subtopicBadge}>{currentQ.subtopicTitle}</span>}
                    </div>
                    <h2 className={styles.questionText}>{currentQ.question}</h2>
                </div>

                <div className={styles.optionsContainer}>
                    {options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const correctOpt = currentQ.correctAnswer === opt;

                        let className = styles.option;
                        if (!isSubmitted && isSelected) className += ` ${styles.selected}`;
                        if (isSubmitted && correctOpt) className += ` ${styles.correct}`;
                        if (isSubmitted && isSelected && !correctOpt) className += ` ${styles.wrong}`;

                        return (
                            <div key={idx} className={className} onClick={() => handleSelect(opt)}>
                                <span className={styles.letter}>{String.fromCharCode(65 + idx)}.</span>
                                <span className={styles.optionText}>{opt}</span>
                            </div>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div className={styles.feedbackWrap}>
                        <h3 className={styles.feedbackTitle}>{isCorrect ? "✅ Correct!" : "❌ Incorrect"}</h3>

                        {currentQ.decoderFocus && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f2f7', borderLeft: '4px solid #009cbf' }}>
                                <strong>🎯 Decoder Focus:</strong> {currentQ.decoderFocus}
                            </div>
                        )}

                        <p><strong>Rationale:</strong> {currentQ.rationale}</p>

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
                            <div className={styles.feedbackBox} style={{ background: '#ffebee' }}>
                                <strong>🚨 NCLEX Trap:</strong> {currentQ.nclexTrap}
                            </div>
                        )}

                        {currentQ.memoryTrick && (
                            <div className={styles.feedbackBox} style={{ background: '#e3f2fd' }}>
                                <strong>🧠 Memory Trick:</strong> {currentQ.memoryTrick}
                            </div>
                        )}

                        {currentQ.clinicalPearl && (
                            <div className={styles.feedbackBox} style={{ background: '#f3e5f5' }}>
                                <strong>💡 Clinical Pearl:</strong> {currentQ.clinicalPearl}
                            </div>
                        )}

                        {currentQ.clinicalPediatricBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Clinical Pediatric Breakdown:</strong> {currentQ.clinicalPediatricBreakdown}
                            </div>
                        )}

                        {currentQ.clinicalMedSurgBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Clinical Med-Surg Breakdown:</strong> {currentQ.clinicalMedSurgBreakdown}
                            </div>
                        )}

                        {currentQ.managementOfCareBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Management of Care Breakdown:</strong> {currentQ.managementOfCareBreakdown}
                            </div>
                        )}

                        {currentQ.basicCareComfortBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Basic Care & Comfort Breakdown:</strong> {currentQ.basicCareComfortBreakdown}
                            </div>
                        )}

                        {currentQ.reductionOfRiskBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Reduction of Risk Potential Breakdown:</strong> {currentQ.reductionOfRiskBreakdown}
                            </div>
                        )}

                        {currentQ.physiologicalAdaptationBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Physiological Adaptation Breakdown:</strong> {currentQ.physiologicalAdaptationBreakdown}
                            </div>
                        )}

                        {currentQ.pharmacologicalParenteralBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Pharmacological & Parenteral Therapies Breakdown:</strong> {currentQ.pharmacologicalParenteralBreakdown}
                            </div>
                        )}

                        {currentQ.pharmacologyBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Pharmacology Breakdown:</strong> {currentQ.pharmacologyBreakdown}
                            </div>
                        )}

                        {currentQ.safetyInfectionControlBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Safety & Infection Control Breakdown:</strong> {currentQ.safetyInfectionControlBreakdown}
                            </div>
                        )}

                        {currentQ.psychosocialBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Psychosocial Integrity Breakdown:</strong> {currentQ.psychosocialBreakdown}
                            </div>
                        )}

                        {currentQ.healthPromotionBreakdown && (
                            <div className={styles.feedbackBox} style={{ background: '#e0f7fa' }}>
                                <strong>🩺 Health Promotion & Maintenance Breakdown:</strong> {currentQ.healthPromotionBreakdown}
                            </div>
                        )}

                        {currentQ.clinicalPharmacologyBreakdown?.drugConcept && (
                            <div className={styles.feedbackBox} style={{ background: '#e8f5e9' }}>
                                <strong>💊 Clinical Pharmacology Breakdown:</strong> {currentQ.clinicalPharmacologyBreakdown.drugConcept}
                            </div>
                        )}

                        {currentQ.nclexConnection && (
                            <div className={styles.feedbackBox} style={{ background: '#fff3e0' }}>
                                <strong>🔗 NCLEX Connection:</strong> {currentQ.nclexConnection}
                            </div>
                        )}

                        {currentQ.pedrxStrategy && (
                            <div className={styles.feedbackBox} style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
                                <strong>🎯 PrepRX Strategy:</strong> {currentQ.pedrxStrategy}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.drillButtons}>
                    {isSubmitted && (
                        <button className={`${styles.submitBtn} ${styles.flagBtn}`} onClick={handleFlag}>
                            Flag for Review
                        </button>
                    )}
                    <button
                        className={styles.submitBtn}
                        onClick={isSubmitted ? handleNext : handleSubmit}
                        disabled={!isSubmitted && selectedOption === null}
                    >
                        {isSubmitted ? (currentIndex < questions.length - 1 ? "Next Question" : "Finish Drill") : "Submit Answer"}
                    </button>
                </div>
            </main>
        </div>
    );
};
