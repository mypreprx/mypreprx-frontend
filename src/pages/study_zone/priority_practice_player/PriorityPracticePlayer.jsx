import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { Button } from "../../../components/common/Button";
import styles from "./PriorityPracticePlayer.module.css";
import toast from "react-hot-toast";
import api from "../../../config/axiosInstance";
import { recordStudyDayAlways } from "../../../utils/recordStudyDay";

export const PriorityPracticePlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { caseStudy: initialCaseStudy, isPreview } = location.state || {};

  const [caseStudy] = useState(initialCaseStudy || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const questionStartedAt = useRef(Date.now());

  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, [currentQuestionIndex]);

  const currentQuestion = caseStudy?.questions ? caseStudy.questions[currentQuestionIndex] : null;
  const correctOptionIndex = currentQuestion?.options?.findIndex(
    (opt) => opt === currentQuestion.correctAnswer
  ) ?? -1;

  // Auto-reveal logic for Preview Mode
  useEffect(() => {
    if (isPreview && currentQuestion) {
      setSelectedOptionIndex(correctOptionIndex);
      setIsSubmitted(true);
    }
  }, [currentQuestionIndex, isPreview, currentQuestion, correctOptionIndex]);

  if (!caseStudy) {
    return (
      <div className={styles["pp-container"]}>
        <main className={styles["main-area"]}>
          <h2>No case study found. Please try again.</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </main>
      </div>
    );
  }

  const isCorrect = isSubmitted && selectedOptionIndex === correctOptionIndex;

  const handleSelect = (idx) => {
    if (isSubmitted) return; // Disable selection after submit or if in preview
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) {
      toast.error("Please select an answer");
      return;
    }
    setIsSubmitted(true);

    const selected = currentQuestion.options[selectedOptionIndex];
    const newAnswer = {
      questionId: currentQuestion._id || `q-${currentQuestionIndex}`,
      selectedOption: selected,
    };
    setUserAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== newAnswer.questionId),
      newAnswer,
    ]);

    const timeSpentSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartedAt.current) / 1000)
    );
    recordStudyDayAlways("priority-practice", {
      isCorrect: selected === currentQuestion.correctAnswer,
      questionId: currentQuestion._id,
      topicTitle: caseStudy?.title || "Priority Practice",
      userAnswer: selected || "",
      timeSpentSeconds,
    });
  };

  const handleAddToFlashcard = async () => {
    try {
      const payload = {
        topic: caseStudy.title,
        questionText: currentQuestion.questionText,
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

  const handleNext = () => {
    if (currentQuestionIndex < caseStudy.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      if (!isPreview) {
        setSelectedOptionIndex(null);
        setIsSubmitted(false);
      }
    } else {
      isPreview ? navigate(-1) : finishCase();
    }
  };

  const finishCase = () => {
    const finalResults = (caseStudy.questions || []).map((q, idx) => {
      const answer = userAnswers.find((a) => a.questionId === (q._id || `q-${idx}`));
      const isCorrect = answer?.selectedOption === q.correctAnswer;
      return {
        step: q.step,
        cjmStage: q.cjmStage,
        question: q.questionText,
        userAnswer: answer?.selectedOption || null,
        correctAnswer: q.correctAnswer,
        status: answer ? (isCorrect ? "correct" : "incorrect") : "missed",
      };
    });
    navigate("/study-zone/priority-practice-result", {
      state: { results: finalResults, stats: calculateStats(finalResults), caseTitle: caseStudy.title },
      replace: true,
    });
  };

  const calculateStats = (res) => {
    const total = res.length;
    const correct = res.filter((r) => r.status === "correct").length;
    const incorrect = res.filter((r) => r.status === "incorrect").length;
    const missed = res.filter((r) => r.status === "missed").length;
    return { total, correct, incorrect, missed, score: Math.round((correct / total) * 100) };
  };

  return (
    <div className={styles["pp-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />
      <main className={styles["main-area"]}>
        <Topbar pageTitle={isPreview ? "Case Preview" : "Priority Practice"} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {isPreview && (
          <div style={{ background: '#FFF3CD', color: '#856404', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            Preview Mode: Correct answers and rationales are displayed automatically.
          </div>
        )}

        <div className={styles["case-header"]}>
          <div className={styles["case-title-section"]}>
            <h1 className={styles["case-title"]}>{caseStudy.title}</h1>
            <p className={styles["case-difficulty"]}>Difficulty: {caseStudy.difficulty}</p>
          </div>
          <button className={styles["exit-btn"]} onClick={() => navigate(-1)}>Exit</button>
        </div>

        <div className={styles["patient-chart-card"]}>
          <h2 className={styles["section-title"]}>Patient Chart</h2>
          <div className={styles["patient-grid"]}>
            {caseStudy.patientChart && Object.entries(caseStudy.patientChart).map(([key, value]) => (
              <div key={key} className={styles["patient-item"]}>
                <span className={styles["patient-label"]}>{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                <span className={styles["patient-value"]}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {caseStudy.scenarioNarrative && (
          <div className={styles["scenario-card"]}>
            <h2 className={styles["section-title"]}>Clinical Scenario</h2>
            <p className={styles["scenario-text"]}>{caseStudy.scenarioNarrative}</p>
          </div>
        )}

        {currentQuestion && (
          <>
            <div className={styles["question-card"]}>
              <p className={styles["question-count"]}>Q{currentQuestionIndex + 1}/{caseStudy.questions.length}</p>
              <p className={styles["question-text"]}>{currentQuestion.questionText}</p>
            </div>

            <div className={styles["options-container"]}>
              {currentQuestion.options?.map((text, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const showCorrect = isSubmitted && idx === correctOptionIndex;
                const showWrong = isSubmitted && isSelected && idx !== correctOptionIndex;

                let className = styles.option;
                if (!isSubmitted && isSelected) className += ` ${styles.selected}`;
                if (isSubmitted && idx === correctOptionIndex) className += ` ${styles.correct}`;
                if (isSubmitted && isSelected && idx !== correctOptionIndex) className += ` ${styles.wrong}`;

                return (
                  <div key={idx} className={className} onClick={() => handleSelect(idx)}>
                    <span className={styles.letter}>{String.fromCharCode(65 + idx)}.</span>
                    <span className={styles["option-text"]}>{text}</span>
                  </div>
                );
              })}
            </div>

            {isSubmitted && (
              <div className={styles["feedback-wrap"]}>
                <div className={styles["feedback-card"]}>
                  <h3 className={styles["feedback-title"]}>Rationale</h3>
                  <p>{currentQuestion.rationale}</p>
                  {currentQuestion.distractorExplanation && (
                    <p style={{marginTop:'10px'}}><strong>Distractors:</strong> {currentQuestion.distractorExplanation}</p>
                  )}
                </div>
              </div>
            )}

            <div className={styles["quiz-buttons-container"]} style={{ display: 'flex', gap: '10px' }}>
              {isSubmitted && !isPreview && (
                <Button 
                  onClick={handleAddToFlashcard} 
                  style={{ background: '#00A5B7' }}
                >
                  Flag for Review
                </Button>
              )}
              <Button onClick={isSubmitted ? handleNext : handleCheckAnswer}>
                {isSubmitted ? (currentQuestionIndex < caseStudy.questions.length - 1 ? "Next" : "Finish") : "Submit"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};