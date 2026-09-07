import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../config/axiosInstance";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import GeneratingModal from "../../../components/common/GeneratingModal";

import styles from "./CustomQuizzes.module.css";
import { BackButton } from "../../../components/common/BackButton";



const TIME_OPTIONS = [1, 10, 20, 30, 40];

export const CustomQuizzes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch ALL topics from DB on mount (not just saved topics)
  const [allTopics, setAllTopics] = useState([]);

  useEffect(() => {
    const fetchAllTopics = async () => {
      try {
        const res = await api.get('/user/getAllTopics');
        const topics = res.data?.topics || res.data?.data || res.data || [];
        setAllTopics(Array.isArray(topics) ? topics : []);
      } catch (err) {
        console.error('Failed to fetch topics', err);
        toast.error('Could not load topics.');
      }
    };
    fetchAllTopics();
  }, []);

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState(2); // 1=Easy, 2=Moderate, 3=Hard
  const [questionType, setQuestionType] = useState('All'); // 'All', 'SATA', 'Single Choice'
  const [timeMode, setTimeMode] = useState(true);
  const [selectedTime, setSelectedTime] = useState(20);
  const [questionCount, setQuestionCount] = useState(10);

  const handleTopicToggle = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleIncrement = () => {
    setQuestionCount((prev) => Math.min(prev + 5, 100));
  };

  const handleDecrement = () => {
    setQuestionCount((prev) => Math.max(prev - 5, 5));
  };

  const getDifficultyString = (diffFloat) => {
    const diff = Math.round(diffFloat);
    if (diff === 1) return "Easy";
    if (diff === 2) return "Moderate";
    if (diff === 3) return "Hard";
    return "Moderate";
  };

  const handleStartQuiz = async () => {
    if (!selectedTopics.length) return;
    
    try {
      setIsGenerating(true);
      
      const payload = {
        titles: selectedTopics,
        difficulty: getDifficultyString(difficulty),
        nofQuest: questionCount,
        questionType: questionType,
        isCustomQuiz: true  // Use dedicated flag for Custom Quiz AI generation
      };

      const response = await api.post('/user/CreateCustomQuiz', payload);
      
      if (response.data.success && response.data.questions && response.data.questions.length > 0) {
        navigate("/study-zone/quiz", {
          state: {
            questions: response.data.questions,
            topics: selectedTopics,
            difficulty: Math.round(difficulty),
            timeMode,
            time: selectedTime,
            questionCount: response.data.questions.length
          }
        });
      } else {
        toast.error("Failed to generate some quiz questions. Please try again.");
      }
    } catch (error) {
      console.error("Quiz Fetch Error:", error);
      toast.error(error.response?.data?.message || "Server is too busy or no questions exist in the DB for this criteria.");
    } finally {
      setIsGenerating(false);
    }
  };

  // const getDifficultyLabel = () => {
  //   if (difficulty === 1) return "Easy";
  //   if (difficulty === 2) return "Moderate";
  //   return "Hard";
  // };

  return (
    <div className={styles['cq-layout']}>
      {/* Generating overlay popup */}
      <GeneratingModal isOpen={isGenerating} message="AI is building your personalized quiz questions. This may take up to 30 seconds." />

      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles['cq-main']}>
        {/* TOPBAR */}
        <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles['back-btn-container']}>
          <BackButton to="/study-zone" />
        </div>

        {/* HEADER */}
        <HeaderCard
          title="Custom Quizzes"
          subtitle="Build your own quiz based on topic, difficulty, or time."
          className={styles['cq-header-card']}
        />

        {/* QUIZ CONTAINER */}
        <div className={styles['cq-quiz-box']}>

          {/* Choose Topic */}
          <div className={styles['cq-section']}>
            <h4>Choose Topic</h4>
            <div className={styles['cq-topic-row']}>
              {allTopics.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Loading topics...
                </p>
              ) : (
                allTopics.map((topic) => (
                  <button
                    key={topic._id}
                    className={`${styles['cq-topic-btn']} ${selectedTopics.includes(topic.title) ? styles['selected'] : ''}`}
                    onClick={() => handleTopicToggle(topic.title)}
                  >
                    {topic.title}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Difficulty */}
          <div className={styles['cq-section']}>
            <h4>Difficulty</h4>
            <p className={styles['cq-helper-text']}>Select how challenging you want it</p>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className={styles['cq-slider']}
            />
            <div className={styles['cq-slider-labels']}>
              <span className={Math.round(difficulty) === 1 ? styles['active-label'] : ''}>Easy</span>
              <span className={Math.round(difficulty) === 2 ? styles['active-label'] : ''}>Moderate</span>
              <span className={Math.round(difficulty) === 3 ? styles['active-label'] : ''}>Hard</span>
            </div>
          </div>

          {/* Question Type */}
          <div className={styles['cq-section']}>
            <h4>Question Type</h4>
            <div className={styles['cq-topic-row']}>
              <button 
                className={`${styles['cq-topic-btn']} ${questionType === 'All' ? styles['selected'] : ''}`}
                onClick={() => setQuestionType('All')}
              >All</button>
              <button 
                className={`${styles['cq-topic-btn']} ${questionType === 'SATA' ? styles['selected'] : ''}`}
                onClick={() => setQuestionType('SATA')}
              >Sata (Select all that applies)</button>
              <button 
                className={`${styles['cq-topic-btn']} ${questionType === 'Single Choice' ? styles['selected'] : ''}`}
                onClick={() => setQuestionType('Single Choice')}
              >Single Choice</button>
            </div>
          </div>

          {/* Time + Number of Questions */}
          <div className={styles['cq-lower']}>
            <div className={styles['cq-section']}>
              <h4>Time</h4>
              <div className={styles['cq-time-toggle']}>
                <span>Time Mode</span>
                <label className={styles['cq-switch']}>
                  <input
                    type="checkbox"
                    checked={timeMode}
                    onChange={(e) => setTimeMode(e.target.checked)}
                  />
                  <span className={styles['cq-toggle-circle']}></span>
                </label>
              </div>

              <div className={styles['cq-time-options']}>
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    className={selectedTime === time ? styles['selected'] : ''}
                    onClick={() => setSelectedTime(time)}
                    disabled={!timeMode}
                  >
                    {time} min
                  </button>
                ))}
              </div>
            </div>

            <div className={styles['cq-section']}>
              <h4>Number of Questions</h4>
              <div className={styles['cq-counter']}>
                <button onClick={handleDecrement}>-</button>
                <span>{questionCount}</span>
                <button onClick={handleIncrement}>+</button>
              </div>
            </div>
          </div>
        </div>
        {/* Start Button */}
        <div className={styles['cq-start-wrap']}>
          <Button
            className={styles['cq-start-btn']}
            onClick={handleStartQuiz}
            disabled={selectedTopics.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <div className={styles["cq-loader-btn"]}>
                <span className={styles["cq-spinner"]}></span>
                Generating Quiz...
              </div>
            ) : "Start Quiz"}
          </Button>
        </div>
      </main>
    </div>
  );
};