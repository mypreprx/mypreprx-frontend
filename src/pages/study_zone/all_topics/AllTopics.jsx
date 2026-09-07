import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axiosInstance"; // Make sure this path is correct

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { TopicCard } from "../../../components/common/topic_card/TopicCard";
import { CardIcon } from "../../../components/common/topic_card/CardIcon";
import {
  MedSurgIcon,
  PediatricsIcon,
  PharmacologyIcon,
  MaternityIcon,
  PsychNursingIcon,
  DelegationIcon
} from "../../../components/common/Icons";

import styles from "./AllTopics.module.css";
import { BackButton } from "../../../components/common/BackButton";

// Helper function to match the database title to the correct icon
const getTopicIcon = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("med") && lowerTitle.includes("surg")) return <MedSurgIcon />;
  if (lowerTitle.includes("pediatric")) return <PediatricsIcon />;
  if (lowerTitle.includes("pharma")) return <PharmacologyIcon />;
  if (lowerTitle.includes("matern")) return <MaternityIcon />;
  if (lowerTitle.includes("psych")) return <PsychNursingIcon />;
  if (lowerTitle.includes("delegation") || lowerTitle.includes("priority")) return <DelegationIcon />;

  // Default icon if none of the above match
  return <MedSurgIcon />;
};

export const AllTopics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchTopics = async () => {
      try {
        setLoading(true);
        // Call your backend route
        const res = await api.get('/user/getAllTopics');

        if (!mounted) return;

        if (res.data && res.data.success) {
          const filteredTopics = res.data.data.filter(topic => topic.title !== "Medical Surgery");
          setTopics(filteredTopics);
        } else {
          setError("Failed to load topics.");
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
        if (mounted) setError(err.message || "Failed to load topics");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTopics();

    return () => { mounted = false; };
  }, []);

  const handleTopicClick = (topic) => {
    const lowerTitle = topic.title.toLowerCase();
    // Seeded question topics show all questions in a paginated drill instead of a subtopic chooser.
    if (lowerTitle.includes('pediatric') || lowerTitle.includes('med-surg') || lowerTitle.includes('management of care') || lowerTitle.includes('basic care') || lowerTitle.includes('reduction of risk') || lowerTitle.includes('physiological adaptation') || lowerTitle.includes('pharmacological') || lowerTitle.includes('pharmacology') || lowerTitle.includes('safety') || lowerTitle.includes('psychosocial') || lowerTitle.includes('health promotion') || lowerTitle.includes('nclex language')) {
      navigate(`/study-zone/topic-drill`, {
        state: { topicId: topic._id, title: topic.title }
      });
      return;
    }

    const formattedTitle = topic.title.toLowerCase().replace(/[\s/]+/g, '-');

    // Navigate with the pretty URL, but pass the actual database _id in the state
    // so the next page can use it to fetch subtopics!
    navigate(`/study-zone/topic/${formattedTitle}`, {
      state: { topicId: topic._id, title: topic.title }
    });
  };

  return (
    <div className={styles['alltopics-container']}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles['content-area']}>
        {/* TOPBAR */}
        <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles['back-btn-container']}><BackButton to="/study-zone" /></div>

        {/* HEADER */}
        <HeaderCard
          title="All Topics"
          subtitle="Browse major NCLEX domains"
          className={styles['topics-header']}
        />

        {/* CARDS */}
        <div className={styles['topics-grid']}>
          {loading && <div className={styles['loading-text']}>Loading Topics...</div>}

          {error && <div className={styles['error-text']}>Error: {error}</div>}

          {!loading && !error && topics.length === 0 && (
            <div className={styles['no-data-text']}>No topics available yet.</div>
          )}

          {!loading && !error && topics.map((topic) => (
            <TopicCard
              key={topic._id}
              title={topic.title}
              icon={<CardIcon>{getTopicIcon(topic.title)}</CardIcon>}
              onClick={() => handleTopicClick(topic)}
              showTick={true}
            />
          ))}
        </div>
      </main>
    </div>
  );
};