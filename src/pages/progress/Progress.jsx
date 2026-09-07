import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import api from "../../config/axiosInstance";
import useAuthStore from "../../store/authStore";

import styles from "./Progress.module.css";
import streak7Badge from "../../assets/badges/streak_7.png";
import streak30Badge from "../../assets/badges/streak_30.png";
import sataMasterBadge from "../../assets/badges/sata_master.png";
import streak3Badge from "../../assets/badges/streak_3.png";
import firstDoseBadge from "../../assets/badges/first_dose.png";
import correct10Badge from "../../assets/badges/correct_10.png";
import correct100Badge from "../../assets/badges/correct_100.png";

export const Progress = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [affirmation, setAffirmation] = useState("I am calm, capable and ready to succeed and step into my purpose");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.id && !user?._id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const userId = user._id || user.id;
                const response = await api.get(`/user/Analytics/${userId}`);
                setAnalytics(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load progress data.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAffirmation = async () => {
            try {
                const res = await api.get('/user/daily-affirmation', { params: { _t: Date.now() } });
                if (res.data?.data?.text) {
                    setAffirmation(res.data.data.text);
                }
            } catch (err) {
                console.error("Failed to fetch affirmation:", err);
            }
        };

        fetchAnalytics();
        fetchAffirmation();
    }, [user]);

    const progressValue = analytics?.overallProgress ?? 0;
    const accuracyValue = analytics?.questionAnalytics?.accuracy ?? 0;
    const totalCorrect = analytics?.questionAnalytics?.lifetimeCorrectAnswers ?? analytics?.questionAnalytics?.correctAnswers ?? 0;
    const averageTime = analytics?.averageTimePerQuestion 
        ? `${analytics.averageTimePerQuestion} sec` 
        : "N/A";
    const totalQuestions = analytics?.lifetimeTotalQuestions ?? analytics?.totalQuestions ?? 0;
    const streak = analytics?.streak ?? 0;

    const statCards = [
        { label: "Total Questions", value: totalQuestions, detail: "completed" },
        { label: "Accuracy", value: `${accuracyValue}%`, detail: "overall" },
        { label: "Study Streak", value: `${streak} days`, detail: "current" },
        { label: "Avg Time/Q", value: averageTime, detail: averageTime === "N/A" ? "not tracked yet" : "per question" }
    ];

    return (
        <div className={styles["pr-layout"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["pr-main"]}>
                <Topbar pageTitle="Progress" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <section className={styles["pr-content-container"]}>
                    <HeaderCard
                        title="Your Progress Summary"
                        subtitle="See how your study performance is improving over time"
                        className={styles["pr-main-header-card"]}
                    >
                        {loading ? (
                            <p>Loading analytics...</p>
                        ) : error ? (
                            <p style={{ color: "#d32f2f" }}>{error}</p>
                        ) : (
                            <div className={styles["pr-progress-text"]}>
                                <span>Overall confidence</span>
                                <strong>{progressValue}%</strong>
                            </div>
                        )}
                    </HeaderCard>

                    <div className={styles["pr-stats-row"]}>
                        {statCards.map((card, index) => (
                            <div key={index} className={styles["pr-stat-card"]}>
                                <p>{card.label}</p>
                                <strong>{card.value}</strong>
                                <span>{card.detail}</span>
                            </div>
                        ))}
                    </div>

                    <HeaderCard title="Morning Affirmation" className={styles["pr-header-card"]}>
                        <div className={styles["h-card-content"]}>
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#00A5B7" />
                                <path d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z" stroke="white" strokeWidth="2" />
                                <path d="M18 17L24 20L18 23V17Z" fill="white" />
                            </svg>
                            <p className={styles["affirmation-text"]}>
                                {affirmation}
                            </p>
                        </div>
                    </HeaderCard>

                    <div className={styles["pr-badges-section"]}>
                        <h3 className={styles["pr-badges-title"]}>Your Earned Badges</h3>
                        <div className={styles["pr-badges-grid"]}>
                            <div className={`${styles["pr-badge-card"]} ${streak >= 3 ? styles.earned : styles.locked}`}>
                                <img src={streak3Badge} alt="3-Day Streak Badge" className={styles["pr-badge-img"]} />
                                <h4>3-Day Streak</h4>
                                <p>{streak >= 3 ? "Achieved!" : "Study for 3 consecutive days"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${streak >= 7 ? styles.earned : styles.locked}`}>
                                <img src={streak7Badge} alt="7-Day Streak Badge" className={styles["pr-badge-img"]} />
                                <h4>7-Day Streak</h4>
                                <p>{streak >= 7 ? "Achieved!" : "Study for 7 consecutive days"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${streak >= 30 ? styles.earned : styles.locked}`}>
                                <img src={streak30Badge} alt="30-Day Streak Badge" className={styles["pr-badge-img"]} />
                                <h4>30-Day Streak</h4>
                                <p>{streak >= 30 ? "Achieved!" : "Study for 30 consecutive days"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${totalQuestions > 0 ? styles.earned : styles.locked}`}>
                                <img src={firstDoseBadge} alt="First Dose Complete Badge" className={styles["pr-badge-img"]} />
                                <h4>First Dose Complete</h4>
                                <p>{totalQuestions > 0 ? "Achieved!" : "Complete your first quiz"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${totalCorrect >= 10 ? styles.earned : styles.locked}`}>
                                <img src={correct10Badge} alt="10 Questions Correct Badge" className={styles["pr-badge-img"]} />
                                <h4>10 Questions Correct</h4>
                                <p>{totalCorrect >= 10 ? "Achieved!" : "Answer 10 questions correctly"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${totalQuestions >= 50 ? styles.earned : styles.locked}`}>
                                <img src={sataMasterBadge} alt="Master of SATA Badge" className={styles["pr-badge-img"]} />
                                <h4>Master of SATA</h4>
                                <p>{totalQuestions >= 50 ? "Achieved!" : "Complete 50 practice questions"}</p>
                            </div>
                            <div className={`${styles["pr-badge-card"]} ${totalCorrect >= 100 ? styles.earned : styles.locked}`}>
                                <img src={correct100Badge} alt="100 Questions Correct Badge" className={styles["pr-badge-img"]} />
                                <h4>100 Questions Correct</h4>
                                <p>{totalCorrect >= 100 ? "Achieved!" : "Answer 100 questions correctly"}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles["pr-button-wrapper"]}>
                        <button
                            className={styles["pr-viewtr-btn"]}
                            onClick={() => navigate("/progress/view-treatment-plan")}
                        >
                            View Treatment Plan
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};