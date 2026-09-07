import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import useSubliminalStore from "../../../store/subliminalStore";
import styles from "./SubliminalStudy.module.css";
import toast from 'react-hot-toast';
import { BackButton } from "../../../components/common/BackButton";
export const SubliminalStudy = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const {
    fetchCategories,
    categories,
    fetchAudioByCategory,
    currentAudio,
    isPlaying,
    togglePlay,
    playAudioUrl,
    stopAudio,
    isLoading
  } = useSubliminalStore();

  const serverBaseUrl = import.meta.env.PROD
    ? 'https://api.mypreprx.com'
    : 'http://localhost:4001';
  // const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4001';
  const baseURL = serverBaseUrl;

  const getFullAudioUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.replace(/['"`]/g, '').replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    const trimmed = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    return `${baseURL}/${trimmed}`;
  };

  // Initial Fetch: Categories
  useEffect(() => {
    const init = async () => {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        setActiveCategory(cats[0]);
        // Also fetch the audio for the first category immediately
        await fetchAudioByCategory(cats[0]);
      }
    };
    init();
  }, [fetchCategories, fetchAudioByCategory]);

  const handleCategoryClick = async (cat) => {
    setActiveCategory(cat);
    const audioData = await fetchAudioByCategory(cat);

    if (isPlaying) {
      let selectedAudio = null;
      if (Array.isArray(audioData) && audioData.length > 0) {
        selectedAudio = audioData[Math.floor(Math.random() * audioData.length)];
      } else {
        selectedAudio = audioData;
      }

      if (selectedAudio && selectedAudio.url) {
        playAudioUrl(getFullAudioUrl(selectedAudio.url));
      }
    }
  };

  const handlePlay = async () => {
    // Always reset existing audio when the user presses "On"
    stopAudio();

    if (activeCategory) {
      // Fetch all audios for this category
      const audioData = await fetchAudioByCategory(activeCategory);

      // If audioData is an array, pick a random index
      if (Array.isArray(audioData) && audioData.length > 0) {
        const randomIndex = Math.floor(Math.random() * audioData.length);
        const selectedAudio = audioData[randomIndex];
        if (selectedAudio?.url) {
          playAudioUrl(getFullAudioUrl(selectedAudio.url));
        }
      }
      // Fallback if audioData is a single object
      else if (audioData && audioData.url) {
        playAudioUrl(getFullAudioUrl(audioData.url));
      }
    }
  };

  const handleStop = () => {
    stopAudio();
  };

  // We no longer pause on unmount to allow continuous playback

  return (
    <div className={styles["ssm-study-page"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={styles["ssm-main-content"]}>
        <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles['back-btn-container']}>
          <BackButton to="/mind-rx" />
        </div>

        <HeaderCard
          title="Subliminal Study Mode"
          subtitle="Quiet affirmations to boost focus while you review."
          className={styles["ssm-study-header"]}
        ></HeaderCard>

        <div className={styles["ssm-categories"]}>
          {isLoading && categories.length === 0 ? (
            <p>Loading categories...</p>
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? styles["active"] : ""}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))
          ) : (
            <p>No categories available. Please add some from Admin Panel.</p>
          )}
        </div>

        <div className={styles["ssm-card"]}>
          <h3>Play Subliminals During Study</h3>
          <p>Soft, barely-audible affirmations run under your study session.</p>
          <div className={styles["ssm-toggle-btn"]}>
            <button
              className={isPlaying ? styles["on"] : styles["off"]}
              onClick={handlePlay}
              disabled={isLoading || categories.length === 0}
            >
              On
            </button>
            <button
              className={!isPlaying ? styles["on"] : styles["off"]}
              onClick={handleStop}
              disabled={isLoading || categories.length === 0}
            >
              Off
            </button>
          </div>

          {isPlaying && currentAudio && (
            <div className={styles["ssm-now-playing"]}>
              Currently Playing: <span>{currentAudio.title}</span>
            </div>
          )}

          {!isPlaying && !isLoading && categories.length > 0 && !currentAudio && (
            <p className={styles["ssm-hint"]}>Select a category and press ON to start.</p>
          )}
        </div>
      </div>
    </div>
  );
};
