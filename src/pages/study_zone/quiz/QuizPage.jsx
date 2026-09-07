import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { Button } from "../../../components/common/Button";
import api from "../../../config/axiosInstance";
import styles from "./QuizPage.module.css";
import toast from 'react-hot-toast';
import GeneratingModal from "../../../components/common/GeneratingModal";


export const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Configuration from CustomQuizzes page
  const { questions: preFetchedQuestions, topics, difficulty, timeMode, time, questionCount } = location.state || {};

  // State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz Interaction State
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false); // Submitted CURRENT QUESTION checks
  const [userAnswers, setUserAnswers] = useState([]); // Accumulate answers

  // Timer State
  const [timeLeft, setTimeLeft] = useState(timeMode && time ? time * 60 : null);

  // Helper to map difficulty number to string
  const getDifficultyString = (diff) => {
    if (diff === 1) return "Easy";
    if (diff === 2) return "Moderate";
    if (diff === 3) return "Hard";
    return "Moderate";
  };

  // 1. Fetch Quiz on Mount (If not pre-fetched)
  useEffect(() => {
    // If we already have questions from custom-quizzes navigation, use them
    if (preFetchedQuestions && preFetchedQuestions.length > 0) {
      setQuestions(preFetchedQuestions);
      setLoading(false);
      return;
    }

    if (!topics || !topics.length) {
      toast.error("No topics selected");
      navigate("/study-zone");
      return;
    }

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const payload = {
          titles: topics,
          difficulty: getDifficultyString(difficulty),
          nofQuest: questionCount || 10
        };

        const response = await api.post('/user/CreateCustomQuiz', payload);
        if (response.data.success) {
          setQuestions(response.data.questions);
        } else {
          toast.error("Failed to generate quiz");
        }
      } catch (error) {
        console.error("Quiz Fetch Error:", error);
        toast.error("Error loading quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [preFetchedQuestions, topics, difficulty, questionCount, navigate]);

  // 2. Timer Logic
  useEffect(() => {
    if (!timeMode || timeLeft === null || loading) return;
    if (timeLeft <= 0) {
      toast('Time is up!', { icon: '⏳' });
      handleAutoFinish();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, timeMode, loading]);

  const handleAutoFinish = () => {
    // Collect all answers, mark unanswered as missed
    const finalResults = questions.map((q, idx) => {
      const existingAnswer = userAnswers.find(a => a.questionId === q._id);
      const correctIdx = q.option.findIndex(opt => opt === q.correctAnswer);

      if (existingAnswer) {
        const isCorrect = existingAnswer.selectedOption === q.correctAnswer;
        return {
          question: q.question,
          userAnswer: existingAnswer.selectedOption,
          correctAnswer: q.correctAnswer,
          status: isCorrect ? "correct" : "incorrect"
        };
      } else {
        return {
          question: q.question,
          userAnswer: null,
          correctAnswer: q.correctAnswer,
          status: "missed"
        };
      }
    });

    const stats = calculateStats(finalResults);
    navigate('/study-zone/quiz-result', { state: { results: finalResults, stats }, replace: true });
  };

  const calculateStats = (finalResults) => {
    const total = finalResults.length;
    const correct = finalResults.filter(r => r.status === "correct").length;
    const incorrect = finalResults.filter(r => r.status === "incorrect").length;
    const missed = finalResults.filter(r => r.status === "missed").length;
    const score = Math.round((correct / total) * 100);

    return { total, correct, incorrect, missed, score };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  // Current Question Helpers
  const currentQuestion = questions[currentQuestionIndex];
  
  // Parse correct answers — handle both string (Single Choice) and array (SATA)
  let correctAnswersArray = [];
  if (currentQuestion) {
    if (Array.isArray(currentQuestion.correctAnswer)) {
      // AI returned a proper JSON array for SATA — use it directly
      correctAnswersArray = currentQuestion.correctAnswer;
    } else if (typeof currentQuestion.correctAnswer === 'string') {
      try {
        const parsed = JSON.parse(currentQuestion.correctAnswer);
        if (Array.isArray(parsed)) {
          correctAnswersArray = parsed;
        } else {
          correctAnswersArray = [currentQuestion.correctAnswer.trim()];
        }
      } catch (e) {
        // Single Choice or unparsable: just wrap in array for uniform handling
        correctAnswersArray = [currentQuestion.correctAnswer.trim()];
      }
    }
  }

  const isSATA = currentQuestion?.questionType === 'SATA' || correctAnswersArray.length > 1;

  const isFullyCorrect = isSubmitted && (
    isSATA
      ? correctAnswersArray.length === selectedOptions.length && correctAnswersArray.every(c => selectedOptions.includes(c))
      : selectedOptions.length > 0 && correctAnswersArray.includes(selectedOptions[0])
  );

  const handleSelect = (idx) => {
    if (isSubmitted) return; // Prevent changing after submit
    const optionText = currentQuestion.option[idx];

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

  const handleCheckAnswer = () => {
    if (selectedOptions.length === 0) return;
    setIsSubmitted(true);

    // Immediate record of the answer attempt
    const newAnswer = {
      questionId: currentQuestion._id,
      selectedOption: selectedOptions.join(', ')
    };
    setUserAnswers(prev => [...prev.filter(a => a.questionId !== currentQuestion._id), newAnswer]);
  };

  const handleAddToFlashcard = async () => {
    try {
      const payload = {
        topic: topics[0],
        questionText: currentQuestion.question,
        answerText: currentQuestion.correctAnswer,
        rationale: currentQuestion.rationale || "No rationale provided"
      };
      const response = await api.post('/user/flashcards/add', payload);
      if (response.data.success) {
        toast.success("Added to flashcards!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to flashcards");
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptions([]);
      setIsSubmitted(false);
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    // Final check to ensure current is included if not somehow
    const finalResults = questions.map((q) => {
      const answer = userAnswers.find(a => a.questionId === q._id);
      const isCorrect = answer?.selectedOption === q.correctAnswer;

      return {
        question: q.question,
        userAnswer: answer?.selectedOption || null,
        correctAnswer: q.correctAnswer,
        status: answer ? (isCorrect ? "correct" : "incorrect") : "missed"
      };
    });

    const stats = calculateStats(finalResults);

    try {
      // Optional: still submit to existing API for history
      const payload = {
        topicId: topics[0],
        answers: userAnswers
      };
      await api.post('/user/startQuiz', payload);
    } catch (e) {
      console.warn("Backend sync failed", e);
    }

    navigate('/study-zone/quiz-result', { state: { results: finalResults, stats }, replace: true });
  };


  if (loading) {
    return (
      <div className={styles["quizpage-container"]}>
        <Sidebar sidebarOpen={sidebarOpen} />
        <GeneratingModal isOpen={loading} message="AI is crafting your personalized NCLEX questions. This may take up to 30 seconds..." />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={styles["quizpage-container"]}>
        <Sidebar sidebarOpen={sidebarOpen} />
        <main className={styles["main-area"]}>
          <h2>No questions found. Please try again.</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles["quizpage-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["main-area"]}>
        <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* HEADER / TIMER */}
        <div className={styles["quiz-card"]}>
            <div className={styles["quiz-header"]}>
            <p className={styles["quiz-count"]}>
              Q{currentQuestionIndex + 1}/{questions.length}
              {isSATA && <span style={{color: '#d9534f', fontWeight: 'bold', marginLeft: '12px'}}>Select All That Apply</span>}
              {timeMode && (
                <div className={styles["timer-container"]}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.75 11.38V6H11.25V12L15.493 16.243L16.553 15.183L12.75 11.38ZM12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22Z" fill="#072445" />
                  </svg>
                  <span>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </p>
            <button className={styles["exit-btn"]} onClick={() => navigate("/study-zone/custom-quizzes")}>
              Exit
            </button>
          </div>

          <p className={styles["quiz-question"]}>
            {currentQuestion.question}
          </p>
        </div>

        {/* OPTIONS */}
        <div className={styles["options-container"]}>
          {currentQuestion.option.map((text, idx) => {
            const isSelected = selectedOptions.includes(text);
            const isCorrectOption = correctAnswersArray.includes(text);
            
            const showCorrect = isSubmitted && isCorrectOption;
            const showWrong = isSubmitted && isSelected && !isCorrectOption;

            let className = styles.option;
            if (!isSubmitted && isSelected) className += ` ${styles.selected}`;
            if (isSubmitted && isCorrectOption) className += ` ${styles.correct}`;
            if (isSubmitted && isSelected && !isCorrectOption) className += ` ${styles.wrong}`;

            return (
              <div
                key={idx}
                className={className}
                onClick={() => handleSelect(idx)}
              >
                <span className={styles.letter}>{String.fromCharCode(65 + idx)}.</span>
                <span className={styles["option-text"]}>{text}</span>

                {/* RESULT ICONS */}
                {isSubmitted && showCorrect && (
                  <span className={`${styles["result-icon"]} ${styles["result-icon--correct"]}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#0C4866" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}

                {isSubmitted && showWrong && (
                  <span className={`${styles["result-icon"]} ${styles["result-icon--wrong"]}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#D9534F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* FEEDBACK SECTION */}
        {isSubmitted && (
          <div className={styles["feedback-wrap"]}>
            <div className={styles["feedback-card"]}>
              <h3 className={styles["feedback-title"]}>Rationale</h3>

              {isFullyCorrect ? (
                <p className={styles["feedback-subtitle"]}>✅ Correct! {currentQuestion.rationale}</p>
              ) : (
                <>
                  <p className={styles["feedback-subtitle"]}>Why this answer is incorrect</p>
                  <p>{currentQuestion.rationale}</p>
                  <hr />
                  {correctAnswersArray.length > 0 && (
                    <p className={styles["feedback-subtitle"]}>
                      Correct answer is{" "}
                      {correctAnswersArray
                        .map(ans => {
                          const idx = currentQuestion.option.indexOf(ans);
                          return idx !== -1 ? String.fromCharCode(65 + idx) : null;
                        })
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </>
              )}

              {/* Topic / Client Needs Category */}
              {(currentQuestion.topic || currentQuestion.clientNeedsCategory) && (
                <div style={{ marginTop: '16px', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#15803d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 NCLEX Category</h4>
                  {currentQuestion.topic && <p style={{ margin: '2px 0', fontSize: '13px', color: '#166534' }}><strong>Topic:</strong> {currentQuestion.topic}</p>}
                  {currentQuestion.subtopic && <p style={{ margin: '2px 0', fontSize: '13px', color: '#166534' }}><strong>Subtopic:</strong> {currentQuestion.subtopic}</p>}
                  {currentQuestion.clientNeedsCategory && <p style={{ margin: '2px 0', fontSize: '13px', color: '#166534' }}><strong>Client Needs:</strong> {currentQuestion.clientNeedsCategory}</p>}
                  {currentQuestion.clinicalJudgmentDomain && <p style={{ margin: '2px 0', fontSize: '13px', color: '#166534' }}><strong>Clinical Judgment Domain:</strong> {currentQuestion.clinicalJudgmentDomain}</p>}
                </div>
              )}

              {/* Why Incorrect */}
              {currentQuestion.whyIncorrect && (
                <>
                  <hr />
                  <p className={styles["feedback-subtitle"]}>Why Incorrect Options Are Wrong</p>
                  <p style={{ fontSize: '14px' }}>{currentQuestion.whyIncorrect}</p>
                </>
              )}

              {/* Option Evaluations */}
              {currentQuestion.optionEvaluations && currentQuestion.optionEvaluations.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '15px' }}>📊 Option-by-Option Analysis</h4>
                  {currentQuestion.optionEvaluations.map((ev, i) => (
                    <div key={i} style={{ marginBottom: '8px', padding: '10px', borderRadius: '8px', backgroundColor: ev.isTrue ? '#f0fdf4' : '#fef2f2', borderLeft: `4px solid ${ev.isTrue ? '#22c55e' : '#ef4444'}` }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '13px', color: ev.isTrue ? '#15803d' : '#b91c1c' }}>{ev.isTrue ? '✓ CORRECT' : '✗ INCORRECT'}: {ev.optionText}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{ev.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Safety Pearl */}
              {currentQuestion.safetyPearl && (
                <div style={{ marginTop: '16px', backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f97316' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#c2410c', fontSize: '15px' }}>🛡️ Safety Pearl</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{currentQuestion.safetyPearl}</p>
                </div>
              )}

              {/* Memory Trick */}
              {currentQuestion.memoryTrick && (
                <div style={{ marginTop: '16px', backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '15px' }}>🧠 Memory Trick</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{currentQuestion.memoryTrick}</p>
                </div>
              )}

              {/* Clinical Pearl */}
              {currentQuestion.clinicalPearl && (
                <div style={{ marginTop: '16px', backgroundColor: '#fdf4ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #c026d3' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#86198f', fontSize: '15px' }}>💡 Clinical Pearl</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{currentQuestion.clinicalPearl}</p>
                </div>
              )}

              {/* NCLEX Trap */}
              {currentQuestion.nclexTrap && (
                <div style={{ marginTop: '16px', backgroundColor: '#fff1f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #e11d48' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#be123c', fontSize: '15px' }}>⚠️ NCLEX Trap</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{currentQuestion.nclexTrap}</p>
                </div>
              )}

              {/* Frameworks Used */}
              {(currentQuestion.primaryFramework || currentQuestion.secondaryFramework) && (
                <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '15px' }}>📐 Frameworks Used</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                    {currentQuestion.primaryFramework} {currentQuestion.secondaryFramework && `| ${currentQuestion.secondaryFramework}`}
                  </p>
                </div>
              )}

              {/* Clinical Judgment Breakdown (8-step breakdown from prompt) */}
              {currentQuestion.clinicalJudgmentBreakdown && (
                <div style={{ marginTop: '16px', backgroundColor: '#f1f5f9', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '15px' }}>🩺 Clinical Judgment Breakdown</h4>
                  {[
                    { label: '1. Assessment', key: 'assessment' },
                    { label: '2. Cue Recognition', key: 'cueRecognition' },
                    { label: '3. Cue Analysis', key: 'cueAnalysis' },
                    { label: '4. Priority Problem', key: 'priorityProblem' },
                    { label: '5. Nursing Intervention', key: 'nursingIntervention' },
                    { label: '6. Medication Considerations', key: 'medicationConsiderations' },
                    { label: '7. Outcome Evaluation', key: 'outcomeEvaluation' },
                  ].map(({ label, key }) => currentQuestion.clinicalJudgmentBreakdown[key] ? (
                    <div key={key} style={{ marginBottom: '10px', padding: '8px 10px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: '0 0 3px 0', fontWeight: 700, fontSize: '13px', color: '#1e40af' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{currentQuestion.clinicalJudgmentBreakdown[key]}</p>
                    </div>
                  ) : null)}
                </div>
              )}

            </div>

            {/* ASK MICHELLE CARD */}
            <div className={styles["ask-card"]}>
              <p>Need a clearer explanation?</p>
              <Button
                className={styles["ask-btn"]}
                onClick={() =>
                  navigate("/michelle-ai", {
                    state: {
                      prefillMessage: `Can you explain this question to me?\n\n"${currentQuestion.question}"`
                    }
                  })
                }
              >
                Ask Michelle
                <svg width="38" height="38" viewBox="0 0 60 60" fill="none">
                  <path d="M30 7.5C43.75 7.5 55 16.45 55 27.5C55 38.55 43.75 47.5 30 47.5C26.9 47.5 23.925 47.05 21.175 46.25C13.875 52.5 5 52.5 5 52.5C10.825 46.675 11.75 42.75 11.875 41.25C7.625 37.675 5 32.825 5 27.5C5 16.45 16.25 7.5 30 7.5Z" fill="#D5308B" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* WHY MATTERS */}
        {isSubmitted && currentQuestion.whyMatters && (
          <div className={styles["why-matters-horizontal-card"]}>
            <h4>Why this matters on floor</h4>
            <p>{currentQuestion.whyMatters}</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className={styles["quiz-buttons-container"]}>
          {isSubmitted && (
            <Button
              className={styles["flashcard-btn"]}
              onClick={handleAddToFlashcard}
            >
              Flag for Review / Flashcard
            </Button>
          )}

          <Button
            className={styles["submit-btn"]}
            onClick={isSubmitted ? handleNext : handleCheckAnswer}
            disabled={selectedOptions.length === 0}
          // style={{ flex: 1 }}
          >
            {isSubmitted
              ? (currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz")
              : "Submit"}
          </Button>
        </div>
      </main>
    </div>
  );
};
















// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Sidebar } from "../../../components/common/sidebar/Sidebar";
// import { Topbar } from "../../../components/common/topbar/Topbar";
// import { Button } from "../../../components/common/Button";
// import styles from "./QuizPage.module.css";
// import toast from "react-hot-toast";

// export const QuizPage = () => {
//   const navigate = useNavigate();

//   /* ===========================
//      STATIC CONFIG (UI MODE)
//   ============================ */
//   const timeMode = true;
//   const timeLeft = 9 * 60; // 9:00 static display

//   /* ===========================
//      STATIC QUESTIONS
//   ============================ */
//   const questions = [
//     {
//       _id: "q1",
//       question: "Which condition is most commonly associated with chronic alcohol use?",
//       option: [
//         "Wernicke encephalopathy",
//         "Parkinson disease",
//         "Multiple sclerosis",
//         "Amyotrophic lateral sclerosis"
//       ],
//       correctAnswer: "Wernicke encephalopathy",
//       rationale:
//         "Chronic alcohol use leads to thiamine deficiency, which can cause Wernicke encephalopathy.",
//       otherExplanations: [
//         "Parkinson disease is neurodegenerative and unrelated to alcohol use.",
//         "Multiple sclerosis is autoimmune.",
//         "ALS affects motor neurons."
//       ],
//       whyMatters:
//         "Recognizing alcohol-related neurologic conditions is critical in acute clinical settings."
//     },
//     {
//       _id: "q2",
//       question: "What is the first-line treatment for acute opioid overdose?",
//       option: ["Naloxone", "Methadone", "Buprenorphine", "Naltrexone"],
//       correctAnswer: "Naloxone",
//       rationale:
//         "Naloxone rapidly reverses opioid-induced respiratory depression.",
//       whyMatters:
//         "Early naloxone administration saves lives in emergency situations."
//     }
//   ];

//   /* ===========================
//      STATE (UNCHANGED)
//   ============================ */
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [userAnswers, setUserAnswers] = useState([]);

//   const currentQuestion = questions[currentQuestionIndex];

//   const correctOptionIndex =
//     currentQuestion.option.findIndex(
//       opt => opt === currentQuestion.correctAnswer
//     );

//   const isCorrect =
//     isSubmitted && selectedOptionIndex === correctOptionIndex;

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   /* ===========================
//      HANDLERS (STATIC)
//   ============================ */
//   const handleSelect = (idx) => {
//     if (isSubmitted) return;
//     setSelectedOptionIndex(idx);
//   };

//   const handleCheckAnswer = () => {
//     if (selectedOptionIndex === null) return;
//     setIsSubmitted(true);

//     setUserAnswers(prev => [
//       ...prev,
//       {
//         questionId: currentQuestion._id,
//         selectedOption: currentQuestion.option[selectedOptionIndex]
//       }
//     ]);
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(prev => prev + 1);
//       setSelectedOptionIndex(null);
//       setIsSubmitted(false);
//     } else {
//       toast.success("Quiz finished (UI mode)");
//     }
//   };

//   const handleAddToFlashcard = () => {
//     toast.success("Added to flashcards!");
//   };

//   /* ===========================
//      UI (UNCHANGED)
//   ============================ */
//   return (
//     <div className={styles["quizpage-container"]}>
//       <Sidebar sidebarOpen={sidebarOpen} />

//       <main className={styles["main-area"]}>
//         <Topbar
//           pageTitle="Study Zone"
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//         />

//         <div className={styles["quiz-card"]}>
//           <div className={styles["quiz-header"]}>
//             <div className={styles["quiz-count"]}>
//               Q{currentQuestionIndex + 1}/{questions.length}
//               <div className={styles["timer-container"]}>
//                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path fillRule="evenodd" clipRule="evenodd" d="M12.75 11.38V6H11.25V12L15.493 16.243L16.553 15.183L12.75 11.38ZM12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22Z" fill="#072445" />
//                 </svg>
//                 {timeMode && (
//                   <span>
//                     {formatTime(timeLeft)}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <button className={styles["exit-btn"]} onClick={() => navigate("/study-zone/custom-quizzes")}>
//               Exit
//             </button>
//           </div>

//           <p className={styles["quiz-question"]}>
//             {currentQuestion.question}
//           </p>
//         </div>

//         <div className={styles["options-container"]}>
//           {currentQuestion.option.map((text, idx) => {
//             const isSelected = selectedOptionIndex === idx;
//             const showCorrect = isSubmitted && idx === correctOptionIndex;
//             const showWrong =
//               isSubmitted && isSelected && idx !== correctOptionIndex;

//             let className = styles.option;
//             if (!isSubmitted && isSelected)
//               className += ` ${styles.selected}`;
//             if (showCorrect)
//               className += ` ${styles.correct}`;
//             if (showWrong)
//               className += ` ${styles.wrong}`;

//             return (
//               <div
//                 key={idx}
//                 className={className}
//                 onClick={() => handleSelect(idx)}
//               >
//                 <span className={styles.letter}>
//                   {String.fromCharCode(65 + idx)}.
//                 </span>
//                 <span className={styles["option-text"]}>{text}</span>
//               </div>
//             );
//           })}
//         </div>

//         {isSubmitted && (
//           <div className={styles["feedback-wrap"]}>
//             <div className={styles["feedback-card"]}>
//               <h3>Rationale</h3>
//               <p>{currentQuestion.rationale}</p>
//             </div>
//           </div>
//         )}

//         <div className={styles["quiz-buttons-container"]}>
//           {isSubmitted && (
//             <Button
//               className={styles["flashcard-btn"]}
//               onClick={handleAddToFlashcard}
//             >
//               Add to flash card
//             </Button>
//           )}

//           <Button
//             className={styles["submit-btn"]}
//             onClick={isSubmitted ? handleNext : handleCheckAnswer}
//             disabled={selectedOptionIndex === null}
//           >
//             {isSubmitted
//               ? currentQuestionIndex < questions.length - 1
//                 ? "Next Question"
//                 : "Finish Quiz"
//               : "Submit"}
//           </Button>
//         </div>
//       </main>
//     </div>
//   );
// };
