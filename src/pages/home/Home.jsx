import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import GeneratingModal from "../../components/common/GeneratingModal";

import styles from "./Home.module.css";

import api from "../../config/axiosInstance";
import useAuthStore from "../../store/authStore";
import useGrowthZoneStore from "../../store/growthZoneStore";

export const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { userTopics, fetchUserSavedTopics } = useGrowthZoneStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const [analytics, setAnalytics] = useState(null);
  const [affirmation, setAffirmation] = useState("I am calm, capable and ready to succeed.");
  const [dailyTip, setDailyTip] = useState({ title: "Remember the ABCs (Airway, Breathing, Circulation)", desc: "Always remember basics of prioritization in NCLEX." });

  useEffect(() => {
    fetchUserSavedTopics();
    if (user?._id) {
        api.get(`/user/Analytics/${user._id}`)
            .then(res => setAnalytics(res.data.data))
            .catch(err => console.error("Failed to fetch analytics:", err));
            
        // Fetch today's AI-generated affirmation (same endpoint as MindRx & Progress pages)
        api.get('/user/daily-affirmation', { params: { _t: Date.now() } })
            .then(res => {
                if (res.data?.data?.text) {
                    setAffirmation(res.data.data.text);
                }
            })
            .catch(err => console.error("Failed to fetch affirmation:", err));
    }
  }, [user]);

  const progressValue = analytics?.overallProgress ?? 0;
  const streak = analytics?.streak ?? 0;
  const totalQuestions = analytics?.lifetimeTotalQuestions ?? analytics?.totalQuestions ?? 0;
  const doseCompleted = totalQuestions > 0;
  const weakArea = analytics?.weakAreas?.[0] || null;

  // Returns a unique SVG icon matching the topic keyword
  const getTopicIcon = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('pharma') || t.includes('drug') || t.includes('med')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM11 17H9V13H7V11H9V7H11V11H13V13H11V17Z" fill="#00A5B7"/>
        </svg>
      );
    }
    if (t.includes('cardiac') || t.includes('heart') || t.includes('cardio')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#ff6b6b"/>
        </svg>
      );
    }
    if (t.includes('psych') || t.includes('mental') || t.includes('behav')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M9.5 2C7.57 2 6 3.57 6 5.5C6 6.52 6.46 7.43 7.19 8.04C5.36 8.56 4 10.21 4 12.2V13H20V12.2C20 10.21 18.64 8.56 16.81 8.04C17.54 7.43 18 6.52 18 5.5C18 3.57 16.43 2 14.5 2H9.5ZM4 15V16C4 18.21 5.79 20 8 20H12C12 20 12 21 12 21H8C5.79 21 4 19.21 4 17V15H4ZM20 15V17C20 19.21 18.21 21 16 21H12V20H16C18.21 20 20 18.21 20 16V15H20Z" fill="#9b59b6"/>
        </svg>
      );
    }
    if (t.includes('infection') || t.includes('immune') || t.includes('virus') || t.includes('bacteria')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 2L8.5 7.5H15.5L12 2ZM12 22L15.5 16.5H8.5L12 22ZM2 12L7.5 8.5V15.5L2 12ZM22 12L16.5 15.5V8.5L22 12ZM5.64 5.64L7.78 10.22L4.22 7.78L5.64 5.64ZM18.36 18.36L16.22 13.78L19.78 16.22L18.36 18.36ZM18.36 5.64L16.22 10.22L19.78 7.78L18.36 5.64ZM5.64 18.36L7.78 13.78L4.22 16.22L5.64 18.36ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#e74c3c"/>
        </svg>
      );
    }
    if (t.includes('neuro') || t.includes('brain') || t.includes('nerve')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M13 3C10.79 3 9 4.79 9 7C9 8.1 9.45 9.1 10.17 9.83C9.44 10.56 9 11.56 9 12.67C9 13.47 9.27 14.21 9.73 14.8C9.28 15.38 9 16.11 9 16.9C9 18.6 10.2 20.05 11.81 20.42L12 21L12.19 20.42C13.8 20.05 15 18.6 15 16.9C15 16.11 14.72 15.38 14.27 14.8C14.73 14.21 15 13.47 15 12.67C15 11.56 14.56 10.56 13.83 9.83C14.55 9.1 15 8.1 15 7C15 4.79 13.21 3 11 3H13Z" fill="#3498db"/>
        </svg>
      );
    }
    if (t.includes('resp') || t.includes('lung') || t.includes('pulm') || t.includes('breath')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 2C11.4 2 11 2.5 11 3V9.5C9.6 9.2 8.5 8 8.5 6.5C8.5 4.6 7.2 3 5.5 3C3.6 3 2 4.8 2 7C2 10.5 4.5 13.4 8 14.3V21H10V14C10 13.4 10.5 13 11 13H13C13.6 13 14 13.5 14 14V21H16V14.3C19.5 13.4 22 10.5 22 7C22 4.8 20.4 3 18.5 3C16.8 3 15.5 4.6 15.5 6.5C15.5 8 14.4 9.2 13 9.5V3C13 2.5 12.6 2 12 2Z" fill="#1abc9c"/>
        </svg>
      );
    }
    if (t.includes('maternal') || t.includes('ob') || t.includes('perinatal') || t.includes('newborn')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 2C9.79 2 8 3.79 8 6C8 8.21 9.79 10 12 10C14.21 10 16 8.21 16 6C16 3.79 14.21 2 12 2ZM12 7C11.45 7 11 6.55 11 6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6C13 6.55 12.55 7 12 7ZM8 22V13H10L11 22H13L14 13H16V22H8Z" fill="#f39c12"/>
        </svg>
      );
    }
    if (t.includes('pedia') || t.includes('child') || t.includes('infant')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 3C10.07 3 8.5 4.57 8.5 6.5C8.5 8.43 10.07 10 12 10C13.93 10 15.5 8.43 15.5 6.5C15.5 4.57 13.93 3 12 3ZM5 22V17C5 15.35 5.77 13.9 6.95 12.95L8.5 17H15.5L17.05 12.95C18.23 13.9 19 15.35 19 17V22H5Z" fill="#e67e22"/>
        </svg>
      );
    }
    if (t.includes('safe') || t.includes('quality') || t.includes('risk')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 2L3 7V12C3 16.55 7.16 20.74 12 22C16.84 20.74 21 16.55 21 12V7L12 2ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#27ae60"/>
        </svg>
      );
    }
    if (t.includes('fluid') || t.includes('electro') || t.includes('renal') || t.includes('kidney')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
          <path d="M12 2C12 2 5 9.5 5 14C5 17.87 8.13 21 12 21C15.87 21 19 17.87 19 14C19 9.5 12 2 12 2Z" fill="#2980b9"/>
        </svg>
      );
    }
    // Default: book/study icon
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, flexShrink: 0}}>
        <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="#00A5B7"/>
      </svg>
    );
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      if (!audioUrl) {
        // Fetch a valid production audio track from subliminal audios
        const res = await api.get('/user/StudyMode/getRandomAudio');
        if (res.data?.data?.url) {
          let rawUrl = res.data.data.url;
          if (rawUrl.startsWith('/')) rawUrl = rawUrl.substring(1);
          const fetchedUrl = rawUrl.startsWith('http') ? rawUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${rawUrl}`;
          setAudioUrl(fetchedUrl);
          audioRef.current.src = fetchedUrl;
          await audioRef.current.play();
          setIsPlaying(true);
        } else {
            toast.error("No audio found in database.");
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      toast.error("Failed to play audio.");
    }
  };

  const handleAudioEnded = () => {
      setIsPlaying(false);
  };

  const handleStartDailyDose = async () => {
    if (!userTopics || userTopics.length === 0) {
      toast.error("Please add at least one topic first.");
      navigate("/growth-zones");
      return;
    }

    try {
      setIsGenerating(true);
      
      const payload = {
        titles: userTopics.map(t => t.title),
        difficulty: "Moderate",
        nofQuest: 25,
        isDailyDose: true
      };

      const response = await api.post('/user/CreateCustomQuiz', payload);
      
      if (response.data.success && response.data.questions && response.data.questions.length > 0) {
        navigate("/study-zone/quiz", {
          state: {
            questions: response.data.questions,
            topics: payload.titles,
            difficulty: 2,
            timeMode: false,
            time: 0,
            questionCount: response.data.questions.length
          }
        });
      } else {
        toast.error("Failed to generate Daily Dose questions. Please try again.");
      }
    } catch (error) {
      console.error("Daily Dose Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate Daily Dose.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles["home-layout"]}>
      <GeneratingModal isOpen={isGenerating} message="AI is building your personalized Daily Dose. This may take up to 45 seconds." />

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["home-main"]}>
        <Topbar pageTitle="Home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* UPPER WHITE CARD */}
        <section className={styles["main-progress-card"]}>
          
          {/* Left: Greeting & Stats */}
          <div className={styles["mpc-left"]}>
            <h3>Hi, {user?.username || "Guest"} 👋</h3>
            <p className={styles["greeting-sub"]}>Good morning! Ready to ace today?</p>
            
            <div className={styles["stats-row"]}>
              <div className={styles["stat-box"]}>
                <div className={styles["stat-icon-wrap"]} style={{backgroundColor: doseCompleted ? '#00A5B7' : '#94a3b8', borderRadius: '10px'}}>
                  {/* Pill icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM11 17H9V13H7V11H9V7H11V11H13V13H11V17Z" fill="white"/>
                  </svg>
                </div>
                <div className={styles["stat-texts"]}>
                  <span style={{color: '#4a5568', fontWeight: 500}}>1st dose</span>
                  <span style={{color: '#1a202c', fontWeight: 600}}>{doseCompleted ? 'completed' : 'pending'}</span>
                </div>
              </div>

              <div className={styles["stat-divider"]}></div>

              <div className={styles["stat-box"]}>
                <div className={styles["stat-icon-wrap"]} style={{backgroundColor: '#3b82f6', borderRadius: '10px'}}>
                  {/* Calendar icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="7" y="14" width="2" height="2" fill="white"/>
                    <rect x="11" y="14" width="2" height="2" fill="white"/>
                    <rect x="15" y="14" width="2" height="2" fill="white"/>
                  </svg>
                </div>
                <div className={styles["stat-texts"]}>
                  <span style={{color: '#4a5568', fontWeight: 500}}>Keep the streak!</span>
                  <span className={styles["streak-count"]}>{streak} days</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles["mpc-divider"]}></div>

          {/* Middle: Progress */}
          <div className={styles["mpc-middle"]}>
            <div className={styles["progress-header"]}>
              <span>{progressValue}% to full confidence</span>
              <span className={styles["progress-pct"]}>{progressValue}%</span>
            </div>
            
            <div className={styles["progress-track"]}>
              <div className={styles["progress-fill"]} style={{ width: `${progressValue}%` }} />
            </div>

            <p className={styles["progress-footer"]}>
              You're making progress. Keep going!
            </p>
          </div>

          {/* Right: Illustration */}
          <div className={styles["mpc-right"]}>
            <svg width="150" height="120" viewBox="0 0 150 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Leaves Background */}
              <path d="M20 70C20 70 5 50 25 40C45 30 35 60 35 60" fill="#6993FF" opacity="0.8"/>
              <path d="M130 80C130 80 145 60 125 50C105 40 115 70 115 70" fill="#6993FF" opacity="0.8"/>
              <path d="M30 90C30 90 10 80 15 65C20 50 40 70 40 70" fill="#4B7BFF"/>
              <path d="M120 100C120 100 140 90 135 75C130 60 110 80 110 80" fill="#4B7BFF"/>
              
              {/* Clipboard Body */}
              <rect x="45" y="20" width="60" height="75" rx="8" fill="#F0F5FF" stroke="#3A5ECC" strokeWidth="3"/>
              
              {/* Clip */}
              <rect x="65" y="10" width="20" height="15" rx="4" fill="#3A5ECC"/>
              <circle cx="75" cy="17" r="3" fill="#F0F5FF"/>
              
              {/* Checkmarks & Lines */}
              <path d="M55 45L60 50L68 40" stroke="#00A5B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="75" y="42" width="20" height="2" rx="1" fill="#B0C4DE"/>
              <rect x="75" y="47" width="12" height="2" rx="1" fill="#B0C4DE"/>

              <path d="M55 60L60 65L68 55" stroke="#00A5B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="75" y="57" width="18" height="2" rx="1" fill="#B0C4DE"/>
              <rect x="75" y="62" width="10" height="2" rx="1" fill="#B0C4DE"/>

              {/* Stethoscope */}
              <path d="M95 70C110 70 125 80 120 100C115 120 90 115 70 105C60 100 65 85 65 85" stroke="#0a2540" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="63" cy="83" r="8" fill="#F0F5FF" stroke="#0a2540" strokeWidth="3"/>
              <circle cx="63" cy="83" r="3" fill="#00A5B7"/>
            </svg>
          </div>
        </section>

        {/* 3 MINI CARDS */}
        <section className={styles["three-cards"]}>
          
          {/* Daily Dose */}
          <div className={styles["small-card"]}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>Daily Dose</h4>
              <span className={styles["add-topic-pill"]} onClick={() => navigate("/growth-zones")}>
                + Add Topic
              </span>
            </div>
            <p className={styles["card-subtext"]}>25 NCLEX questions today</p>

            <div className={styles["pill-box"]}>
              {userTopics?.length > 0 ? (
                userTopics.map((topic, index) => (
                  <span key={index} className={styles["topic-pill"]}>
                    {getTopicIcon(topic.title?.replace(/ AI generated course/i, '').trim())}
                    {topic.title?.replace(/ AI generated course/i, '').trim()}
                  </span>
                ))
              ) : (
                <span className={styles["topic-pill"]}>No topics selected</span>
              )}
            </div>

            <button className={styles["gradient-btn"]} onClick={handleStartDailyDose} disabled={isGenerating}>
              <span>{isGenerating ? "Generating..." : "Start Daily Dose"}</span>
              {!isGenerating && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          {/* Mind Set */}
          <div className={styles["small-card"]}>
            <div className={styles["card-header-icon"]}>
              {/* Brain icon for Mind Set Moment */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5V20M12 4.5C12 4.5 9 2 6 3.5C3.5 4.75 3 8.5 4.5 10C3 11 3 14 4.5 15C3.5 16.5 4 19.5 6 20.5C8 21.5 11 20 12 20M12 4.5C12 4.5 15 2 18 3.5C20.5 4.75 21 8.5 19.5 10C21 11 21 14 19.5 15C20.5 16.5 20 19.5 18 20.5C16 21.5 13 20 12 20" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 6C7 6 8.5 6 9 7.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 6C17 6 15.5 6 15 7.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10C6 10 7.5 10 8 11.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 10C18 10 16.5 10 16 11.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 14C6 14 7.5 14 8 15.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 14C18 14 16.5 14 16 15.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 18C7 18 8.5 18 9 16.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 18C17 18 15.5 18 15 16.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h4>Mind Set Moment</h4>
            </div>
            
            <div className={styles["quote-section"]}>
              <span className={styles["quote-mark"]}>“</span>
              <p className={styles["quote-text"]}>{affirmation}</p>
            </div>

            <div className={styles["audio-player-wrapper"]}>
              <div className={styles["audio-play-btn"]} onClick={handlePlayAudio}>
                {isPlaying ? (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="12" cy="12" r="12" fill="#00A5B7"/>
                     <rect x="9" y="8" width="2" height="8" fill="white"/>
                     <rect x="13" y="8" width="2" height="8" fill="white"/>
                   </svg>
                ) : (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="12" cy="12" r="12" fill="#00A5B7"/>
                     <path d="M10 8L16 12L10 16V8Z" fill="white"/>
                   </svg>
                )}
              </div>
              <span className={styles["audio-label"]}>
                {isPlaying ? "Playing morning affirmation..." : "Play 30 sec. morning affirmation"}
              </span>
              <audio ref={audioRef} onEnded={handleAudioEnded} />
            </div>
            
            {/* Waveform SVG graphic */}
            <div className={styles["waveform-graphic"]}>
               <svg width="100%" height="30" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                 <rect x="5" y="10" width="2" height="10" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="10" y="5" width="2" height="20" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="15" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.4"/>
                 <rect x="20" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.8"/>
                 <rect x="25" y="8" width="2" height="14" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="30" y="4" width="2" height="22" rx="1" fill="#00A5B7" opacity="0.7"/>
                 <rect x="35" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="40" y="6" width="2" height="18" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="45" y="1" width="2" height="28" rx="1" fill="#00A5B7"/>
                 <rect x="50" y="9" width="2" height="12" rx="1" fill="#00A5B7" opacity="0.4"/>
                 
                 <rect x="55" y="7" width="2" height="16" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="60" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.9"/>
                 <rect x="65" y="10" width="2" height="10" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="70" y="4" width="2" height="22" rx="1" fill="#00A5B7" opacity="0.7"/>
                 <rect x="75" y="8" width="2" height="14" rx="1" fill="#00A5B7" opacity="0.4"/>
                 
                 {/* Repeat pattern or random distribution */}
                 <rect x="80" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.8"/>
                 <rect x="85" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="90" y="5" width="2" height="20" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="95" y="9" width="2" height="12" rx="1" fill="#00A5B7" opacity="0.4"/>
                 <rect x="100" y="1" width="2" height="28" rx="1" fill="#00A5B7"/>

                 <rect x="105" y="10" width="2" height="10" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="110" y="5" width="2" height="20" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="115" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.4"/>
                 <rect x="120" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.8"/>
                 <rect x="125" y="8" width="2" height="14" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="130" y="4" width="2" height="22" rx="1" fill="#00A5B7" opacity="0.7"/>
                 <rect x="135" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="140" y="6" width="2" height="18" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="145" y="1" width="2" height="28" rx="1" fill="#00A5B7"/>
                 <rect x="150" y="9" width="2" height="12" rx="1" fill="#00A5B7" opacity="0.4"/>

                 <rect x="155" y="7" width="2" height="16" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="160" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.9"/>
                 <rect x="165" y="10" width="2" height="10" rx="1" fill="#00A5B7" opacity="0.5"/>
                 <rect x="170" y="4" width="2" height="22" rx="1" fill="#00A5B7" opacity="0.7"/>
                 <rect x="175" y="8" width="2" height="14" rx="1" fill="#00A5B7" opacity="0.4"/>

                 <rect x="180" y="2" width="2" height="26" rx="1" fill="#00A5B7" opacity="0.8"/>
                 <rect x="185" y="12" width="2" height="6" rx="1" fill="#00A5B7" opacity="0.3"/>
                 <rect x="190" y="5" width="2" height="20" rx="1" fill="#00A5B7" opacity="0.6"/>
                 <rect x="195" y="9" width="2" height="12" rx="1" fill="#00A5B7" opacity="0.4"/>
               </svg>
            </div>
          </div>

          {/* Quick Tip */}
          <div className={styles["small-card"]}>
            <div className={styles["card-header-icon"]}>
              {/* Proper lightbulb icon matching line art */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H15M10.5 18V21M13.5 18V21M10 15H14C15 15 16 14 16 13C16 12.33 15.65 11.75 15.15 11.4C16.3 10.25 17 8.7 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 8.7 7.7 10.25 8.85 11.4C8.35 11.75 8 12.33 8 13C8 14 9 15 10 15Z" stroke="#f6a623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5V9M10.5 6L13.5 8" stroke="#f6a623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h4>Quick Tip</h4>
            </div>
            
            <p className={styles["tip-title"]}>{dailyTip.title}</p>

            <div className={styles["tip-desc-wrapper"]}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0, marginTop: '2px'}}>
                <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.25 9L7.5 11.25L12.75 6" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className={styles["tip-desc"]}>{dailyTip.desc}</p>
            </div>

            <button className={styles["solid-teal-btn"]} onClick={() => navigate('/community/psych-nursing-tips')}>
              <span>View More Tips</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Weak Area */}
          <div className={styles["small-card"]}>
            <div className={styles["card-header-icon"]}>
              {/* Target / Chart icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M16 11L18 9M21 9L18 6L14 10.5L10 7.5L3.5 14" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h4>Needs Review</h4>
            </div>
            
            <p className={styles["tip-title"]} style={{marginTop: "15px", marginBottom: "5px", color: "#e74c3c"}}>
              {weakArea?.topicTitle || "No weak area yet"}
            </p>
            
            <div className={styles["tip-desc-wrapper"]} style={{marginBottom: "15px"}}>
              <p className={styles["tip-desc"]}>
                {weakArea ? `Accuracy: ${weakArea.mastery}%` : "Keep practicing to identify areas for improvement."}
              </p>
            </div>

            <button 
                className={styles["solid-teal-btn"]} 
                style={{marginTop: "auto"}}
                onClick={() => {
                    if (weakArea && weakArea.topicTitle && weakArea.topicTitle !== "Unknown Topic") {
                        const formattedTitle = weakArea.topicTitle.toLowerCase().replace(/[\s/]+/g, '-');
                        navigate(`/study-zone/topic/${formattedTitle}`, {
                            state: { topicId: weakArea.topicId, title: weakArea.topicTitle }
                        });
                    } else {
                        navigate('/study-zone/all-topics');
                    }
                }}
            >
              <span>{weakArea ? "Practice Now" : "Practice"}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* Treatment Plan Button
        <div className={styles["center-btn"]}>
          <button className={styles["treatment-btn"]} onClick={() => navigate("/progress/view-treatment-plan")}>View Treatment Plan</button>
        </div> */}

      </main>
    </div>
  );
};

