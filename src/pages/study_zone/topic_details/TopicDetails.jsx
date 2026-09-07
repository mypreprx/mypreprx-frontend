import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import api from "../../../config/axiosInstance";
import styles from './TopicDetails.module.css';
import { BackButton } from "../../../components/common/BackButton";

export const TopicDetails = () => {
    const { topicSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Get topicId from navigation state
    const topicId = location.state?.topicId;
    const topicTitle = location.state?.title;

    useEffect(() => {
        if (!topicId) {
            setError("Topic ID not found");
            setLoading(false);
            return;
        }

        const fetchSubtopics = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/user/getAllTopics/${topicId}`);

                if (res.data && res.data.success) {
                    const { topic, subtopics } = res.data.data;
                    setData({
                        title: topic.title,
                        subtitle: "Study the topic you want to master",
                        subTopics: subtopics.map((sub) => ({
                            _id: sub._id,
                            title: sub.title,
                            content: sub.content, // <-- Added this so it passes to the next page!
                            qs: sub.questionCount || 0,
                            updated: new Date(sub.updatedAt).getFullYear()
                        }))
                    });
                } else {
                    setError("Failed to load subtopics");
                }
            } catch (err) {
                console.error("Error fetching subtopics:", err);
                setError(err.message || "Failed to load subtopics");
            } finally {
                setLoading(false);
            }
        };

        fetchSubtopics();
    }, [topicId]);

    const handleSubtopicClick = (subtopic) => {
        const formattedTitle = subtopic.title.toLowerCase().replace(/[\s/]+/g, '-');
        navigate(`/study-zone/subtopic/${formattedTitle}`, {
            state: { 
                subtopicId: subtopic._id, 
                subtopicTitle: subtopic.title, 
                subtopicContent: subtopic.content, 
                topicTitle: data.title 
            }
        });
    };

    return (
        <div className={styles.td_layout}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN */}
            <main className={styles["td-main"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Header Box */}
                {/* BACK BUTTON */}
                <div className={styles.backBtnContainer}>
                    <BackButton to="/study-zone/all-topics" />
                </div>

                {data && (
                    <HeaderCard
                        title={data.title}
                        subtitle={data.subtitle}
                        className={styles.headerBox}
                    />
                )}

                {/* Content Cards */}
                <div className={styles.cardsGrid}>
                    {loading && <div className={styles.loadingText}>Loading subtopics...</div>}

                    {error && <div className={styles.errorText}>Error: {error}</div>}

                    {!loading && !error && data && data.subTopics.length === 0 && (
                        <div className={styles.noDataText}>No subtopics available for this topic.</div>
                    )}

                    {!loading && !error && data && data.subTopics.map((item, index) => (
                        <div key={item._id || index} className={styles.card} onClick={() => handleSubtopicClick(item)} style={{ cursor: 'pointer' }}>
                            <div>
                                <h4>{item.title}</h4>
                                <div className={styles.meta}>
                                    <span className={styles.pinkText}>{item.qs} Qs</span>
                                    <span>Updated {item.updated}</span>
                                </div>
                            </div>
                            <div className={styles.arrow}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.025 15.6833C11.8667 15.6833 11.7083 15.625 11.5833 15.5C11.3417 15.2583 11.3417 14.8583 11.5833 14.6166L16.2 9.99998L11.5833 5.38331C11.3417 5.14164 11.3417 4.74164 11.5833 4.49998C11.825 4.25831 12.225 4.25831 12.4667 4.49998L17.525 9.55831C17.7667 9.79998 17.7667 10.2 17.525 10.4416L12.4667 15.5C12.3417 15.625 12.1834 15.6833 12.025 15.6833Z" fill="#D5308B" />
                                    <path d="M16.9417 10.625H2.91669C2.57502 10.625 2.29169 10.3417 2.29169 10C2.29169 9.65833 2.57502 9.375 2.91669 9.375H16.9417C17.2834 9.375 17.5667 9.65833 17.5667 10C17.5667 10.3417 17.2834 10.625 16.9417 10.625Z" fill="#D5308B" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};