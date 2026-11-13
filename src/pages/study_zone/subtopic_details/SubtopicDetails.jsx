import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import api from "../../../config/axiosInstance";
import GeneratingModal from "../../../components/common/GeneratingModal";
import styles from './SubtopicDetails.module.css';
import { recordStudyDayAlways } from '../../../utils/recordStudyDay';

export const SubtopicDetails = () => {
    const { subtopicSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);

    // New states for interactive questions
    const [userAnswers, setUserAnswers] = useState({});
    const [submittedAnswers, setSubmittedAnswers] = useState({});
    const questionStartedAt = useRef({});

    const subtopicId = location.state?.subtopicId;
    const subtopicTitle = location.state?.subtopicTitle || "Subtopic Details";
    const topicTitle = location.state?.topicTitle;

    // 1. Get the content from the navigation state!
    const subtopicContent = location.state?.subtopicContent || "No study material available for this topic.";

    useEffect(() => {
        if (!subtopicId) {
            setError("Subtopic ID not found");
            setLoading(false);
            return;
        }

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/user/getQuestionsBySubtopic/${subtopicId}`);

                let questionsData = [];

                if (res.data && res.data.success) {
                    questionsData = res.data.questions || res.data.data || [];
                } else if (Array.isArray(res.data)) {
                    questionsData = res.data;
                } else {
                    setError("Failed to load questions.");
                    setLoading(false);
                    return;
                }

                const normalizedQuestions = questionsData.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.option || q.options || [],
                    correctAnswer: q.correctAnswer,
                    explanation: q.rationale || q.explanation,
                    whyIncorrect: q.whyIncorrect,
                    memoryTrick: q.memoryTrick,
                    nclexTrap: q.nclexTrap,
                    primaryFramework: q.primaryFramework,
                    secondaryFramework: q.secondaryFramework,
                    clinicalPearl: q.clinicalPearl,
                    clinicalPharmacologyBreakdown: q.clinicalPharmacologyBreakdown,
                    difficulty: q.difficulty || 'Medium',
                    clinicalPediatricBreakdown: q.clinicalPediatricBreakdown,
                    nclexConnection: q.nclexConnection,
                    pedrxStrategy: q.pedrxStrategy
                }));

                setQuestions(normalizedQuestions);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError(err.message || "Failed to load questions");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [subtopicId]);

    const handleOptionSelect = (qIndex, optionIndex) => {
        if (!submittedAnswers[qIndex]) {
            if (!questionStartedAt.current[qIndex]) {
                questionStartedAt.current[qIndex] = Date.now();
            }
            setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
        }
    };

    const handleCheckAnswer = (qIndex) => {
        if (userAnswers[qIndex] !== undefined) {
            setSubmittedAnswers(prev => ({ ...prev, [qIndex]: true }));
            const question = questions[qIndex];
            const selectedIdx = userAnswers[qIndex];
            const selectedText = question?.options?.[selectedIdx];
            const correct = selectedText === question?.correctAnswer;
            const started = questionStartedAt.current[qIndex] || Date.now();
            const timeSpentSeconds = Math.max(1, Math.round((Date.now() - started) / 1000));
            recordStudyDayAlways("subtopic-quiz", {
                isCorrect: correct,
                questionId: question?._id,
                topicTitle: topicTitle || subtopicTitle || "Study Zone",
                userAnswer: selectedText || "",
                timeSpentSeconds,
            });
        }
    };

    const handleBack = () => navigate(-1);

    const questionCount = questions?.length || 0;

    return (
        <div className={styles.sd_layout}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN COLUMN */}
            <main className={styles["sd-main"]}>
                {/* TOPBAR stays fixed at the top */}
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Scrollable area over the gradient background */}
                <div className={styles.scrollContainer}>
                    <div className={styles.pageWrapper}>

                        {/* Header Area */}
                        <div className={styles.headerArea}>
                            <button onClick={handleBack} className={styles.backBtn}>
                                ← Back to Topics
                            </button>
                        </div>

                        {/* The White Box containing everything */}
                        <div className={styles.contentCard}>

                            <div className={styles.cardHeader}>
                                <h2>{subtopicTitle}</h2>
                                <span className={styles.badge}>
                                    {!loading && !error && `${questionCount} Question${questionCount !== 1 ? 's' : ''}`}
                                </span>
                            </div>

                            {/* 2. THE NEW CONTENT AREA */}
                            <div className={styles.textContent}>
                                <p>{subtopicContent}</p>
                            </div>

                            {/* A subtle divider line between content and questions */}
                            <hr className={styles.contentDivider} />

                            <div className={styles.questionsContainer}>
                                <GeneratingModal isOpen={loading} message="AI is crafting personalized NCLEX questions for this subtopic..." />

                                {error && <div className={styles.errorText}>Error: {error}</div>}

                                {!loading && !error && questionCount === 0 && (
                                    <div className={styles.noDataText}>No questions available for this subtopic.</div>
                                )}

                                {!loading && !error && questions?.map((question, index) => {
                                    const isSubmitted = submittedAnswers[index];
                                    const selectedOption = userAnswers[index];
                                    const isCorrect = isSubmitted && question.options[selectedOption] === question.correctAnswer;
                                    
                                    return (
                                    <div key={question._id || index} className={styles.questionItem}>
                                        <div className={styles.questionHeader}>
                                            <span className={styles.qNumber}>Q{index + 1}</span>
                                            <span className={styles.difficultyBadge}>
                                                {question.difficulty || 'Medium'}
                                            </span>
                                        </div>

                                        <div className={styles.questionText}>
                                            {question.question || question.questionText || 'No question text'}
                                        </div>

                                        {question.options && question.options.length > 0 && (
                                            <div className={styles.optionsContainer}>
                                                {question.options.map((option, optIdx) => {
                                                    let optionStyle = {};
                                                    if (isSubmitted) {
                                                        if (option === question.correctAnswer) {
                                                            optionStyle = { backgroundColor: '#dcfce7', borderColor: '#22c55e' }; // Green for correct
                                                        } else if (selectedOption === optIdx) {
                                                            optionStyle = { backgroundColor: '#fee2e2', borderColor: '#ef4444' }; // Red for incorrect selected
                                                        }
                                                    } else if (selectedOption === optIdx) {
                                                        optionStyle = { backgroundColor: '#eff6ff', borderColor: '#3b82f6', boxShadow: '0 0 0 1px #3b82f6' }; // Blue highlight for selected
                                                    }
                                                    
                                                    return (
                                                    <div key={optIdx} className={styles.option} style={{...optionStyle, display: 'flex', alignItems: 'center', padding: '12px', margin: '8px 0', borderRadius: '8px', border: optionStyle.borderColor ? `1px solid ${optionStyle.borderColor}` : '1px solid #e2e8f0', cursor: isSubmitted ? 'default' : 'pointer', transition: 'all 0.2s ease'}}>
                                                        <input
                                                            type="radio"
                                                            id={`q${index}_opt${optIdx}`}
                                                            name={`question${index}`}
                                                            checked={selectedOption === optIdx}
                                                            onChange={() => handleOptionSelect(index, optIdx)}
                                                            disabled={isSubmitted}
                                                            style={{ marginRight: '12px', cursor: isSubmitted ? 'default' : 'pointer' }}
                                                        />
                                                        <label htmlFor={`q${index}_opt${optIdx}`} style={{ cursor: isSubmitted ? 'default' : 'pointer', width: '100%', margin: 0, fontWeight: selectedOption === optIdx ? '500' : 'normal' }}>
                                                            {option}
                                                        </label>
                                                    </div>
                                                )})}
                                            </div>
                                        )}

                                        {!isSubmitted && (
                                            <button 
                                                onClick={() => handleCheckAnswer(index)}
                                                disabled={selectedOption === undefined}
                                                style={{ 
                                                    marginTop: '15px', 
                                                    padding: '10px 20px', 
                                                    backgroundColor: selectedOption === undefined ? '#cbd5e1' : '#0284c7', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    cursor: selectedOption === undefined ? 'not-allowed' : 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Check Answer
                                            </button>
                                        )}

                                        {isSubmitted && (
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    marginBottom: '15px',
                                                    backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                                                    color: isCorrect ? '#166534' : '#991b1b',
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`
                                                }}>
                                                    {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
                                                </div>

                                                {question.explanation && (
                                                    <div className={styles.explanation}>
                                                        <strong>Explanation:</strong> {question.explanation}
                                                    </div>
                                                )}

                                                {question.rationale && !question.explanation && (
                                                    <div className={styles.explanation}>
                                                        <strong>Explanation:</strong> {question.rationale}
                                                    </div>
                                                )}

                                                {question.whyIncorrect && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px' }}>
                                                        <strong>Why Incorrect:</strong> {question.whyIncorrect}
                                                    </div>
                                                )}
                                                {question.memoryTrick && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                                                        <strong>🧠 Memory Trick:</strong> {question.memoryTrick}
                                                    </div>
                                                )}
                                                {question.nclexTrap && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#fff1f2', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #e11d48' }}>
                                                        <strong>⚠️ NCLEX Trap:</strong> {question.nclexTrap}
                                                    </div>
                                                )}
                                                {question.clinicalPearl && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#fdf4ff', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #c026d3' }}>
                                                        <strong>💡 Clinical Pearl:</strong> {question.clinicalPearl}
                                                    </div>
                                                )}
                                                {question.clinicalPharmacologyBreakdown && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #475569' }}>
                                                        <strong>💊 Clinical Pharmacology Breakdown:</strong>
                                                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                                            {question.clinicalPharmacologyBreakdown.drugConcept && <li><strong>Drug Concept:</strong> {question.clinicalPharmacologyBreakdown.drugConcept}</li>}
                                                            {question.clinicalPharmacologyBreakdown.whyItMatters && <li><strong>Why It Matters:</strong> {question.clinicalPharmacologyBreakdown.whyItMatters}</li>}
                                                            {question.clinicalPharmacologyBreakdown.nclexSafetyPriority && <li><strong>NCLEX Safety Priority:</strong> {question.clinicalPharmacologyBreakdown.nclexSafetyPriority}</li>}
                                                            {question.clinicalPharmacologyBreakdown.patientTeaching && <li><strong>Patient Teaching:</strong> {question.clinicalPharmacologyBreakdown.patientTeaching}</li>}
                                                            {question.clinicalPharmacologyBreakdown.labsToMonitor && <li><strong>Labs to Monitor:</strong> {question.clinicalPharmacologyBreakdown.labsToMonitor}</li>}
                                                            {question.clinicalPharmacologyBreakdown.majorSideEffects && <li><strong>Major Side Effects:</strong> {question.clinicalPharmacologyBreakdown.majorSideEffects}</li>}
                                                            {question.clinicalPharmacologyBreakdown.toxicitySigns && <li><strong>Toxicity Signs:</strong> {question.clinicalPharmacologyBreakdown.toxicitySigns}</li>}
                                                            {question.clinicalPharmacologyBreakdown.nursingActions && <li><strong>Nursing Actions:</strong> {question.clinicalPharmacologyBreakdown.nursingActions}</li>}
                                                        </ul>
                                                    </div>
                                                )}
                                                {question.clinicalPediatricBreakdown && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#ecfeff', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #0891b2' }}>
                                                        <strong>🩺 Clinical Pediatric Breakdown:</strong> {question.clinicalPediatricBreakdown}
                                                    </div>
                                                )}
                                                {question.nclexConnection && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px' }}>
                                                        <strong>🔗 NCLEX Connection:</strong> {question.nclexConnection}
                                                    </div>
                                                )}
                                                {question.pedrxStrategy && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                                                        <strong>🎯 Strategy:</strong> {question.pedrxStrategy}
                                                    </div>
                                                )}
                                                {(question.primaryFramework || question.secondaryFramework) && (
                                                    <div className={styles.explanation} style={{ marginTop: '10px' }}>
                                                        <strong>Framework:</strong> {question.primaryFramework} {question.secondaryFramework && `| ${question.secondaryFramework}`}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};