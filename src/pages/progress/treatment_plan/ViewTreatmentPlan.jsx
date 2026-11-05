import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import api from "../../../config/axiosInstance";
import useAuthStore from "../../../store/authStore";

import styles from "./ViewTreatmentPlan.module.css";

const ARC_LENGTH = 251.3; // π * 80

const ArrowLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const FlameIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E56B26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
    </svg>
);

const ListIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ClockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const BarChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

const TargetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const getCurrentWeekDays = () => {
    const now = new Date();
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + mondayOffset);

    return DAY_LABELS.map((label, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return { label, key: toDateKey(date) };
    });
};

export const ViewTreatmentPlan = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

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
                setError(err.response?.data?.message || "Unable to load treatment plan data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    // Lifetime stats only (all-time, not weekly/monthly)
    const progressPercent = analytics?.overallProgress ?? 0;
    const subjectMastery = analytics?.subjectMastery || [];
    const weakAreas = (analytics?.weakAreas || []).filter(
        (area) => typeof area.mastery === "number" && area.mastery < 60
    );
    const totalQuestions = analytics?.lifetimeTotalQuestions ?? 0;
    const accuracy =
        analytics?.questionAnalytics?.accuracy ??
        progressPercent;
    const averageTime = analytics?.averageTimePerQuestion ?? analytics?.questionAnalytics?.averageTimePerQuestion;
    const averageTimeDisplay = averageTime ? `${averageTime} sec` : "—";
    const streak = analytics?.streak ?? 0;
    const hasQuizActivity = totalQuestions > 0;
    const arcOffset = ARC_LENGTH * (1 - Math.min(Math.max(progressPercent, 0), 100) / 100);

    const moodByDate = useMemo(() => {
        const map = {};
        (analytics?.moodGraph || []).forEach((entry) => {
            if (!entry?.date) return;
            const key = String(entry.date).slice(0, 10);
            map[key] = typeof entry.value === "number" ? entry.value : Number(entry.value || 0);
        });
        return map;
    }, [analytics?.moodGraph]);

    const weekDays = useMemo(() => getCurrentWeekDays(), []);

    const openTopicReview = (area) => {
        if (area?.topicTitle && area.topicTitle !== "Unknown Topic") {
            const formattedTitle = area.topicTitle.toLowerCase().replace(/[\s/]+/g, "-");
            navigate(`/study-zone/topic/${formattedTitle}`, {
                state: { topicId: area.topicId, title: area.topicTitle },
            });
            return;
        }
        navigate("/study-zone/all-topics");
    };

    return (
        <div className={styles["vtp-layout"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["vtp-main"]}>
                <Topbar pageTitle="Progress" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["treatment-container"]}>
                    <button
                        type="button"
                        className={styles["back-link"]}
                        onClick={() => navigate("/progress")}
                    >
                        <ArrowLeftIcon />
                        Back to progress
                    </button>

                    <header className={styles["treatment-header"]}>
                        <h1>Treatment plan</h1>
                        <p>Every dose brings you closer. Here’s where you stand and what to focus on next.</p>
                    </header>

                    {loading ? (
                        <div className={styles.card}>
                            <p className={styles["status-text"]}>Loading your progress...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.card}>
                            <p className={styles["status-text"]} style={{ color: "#d32f2f" }}>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles["grid-2x2"]}>
                                <div className={`${styles.card} ${styles["confidence-card"]}`}>
                                    <div className={styles["card-top-bar"]}>
                                        <h2>Confidence over time</h2>
                                        <span className={styles["pill-tag"]}>
                                            {hasQuizActivity ? "From your quizzes" : "Not enough data"}
                                        </span>
                                    </div>

                                    <div className={styles["arc-gauge-container"]}>
                                        <div className={styles["arc-gauge"]}>
                                            {/* Extra viewBox padding so round stroke caps are not clipped */}
                                            <svg viewBox="0 0 220 130" className={styles["arc-svg"]}>
                                                <path d="M 30 100 A 80 80 0 0 1 190 100" className={styles["arc-bg"]} />
                                                <path
                                                    d="M 30 100 A 80 80 0 0 1 190 100"
                                                    className={styles["arc-fill"]}
                                                    style={{
                                                        strokeDasharray: String(ARC_LENGTH),
                                                        strokeDashoffset: String(arcOffset),
                                                    }}
                                                />
                                            </svg>
                                            <div className={styles["arc-content"]}>
                                                <span className={styles["arc-value"]}>{progressPercent}%</span>
                                                <span className={styles["arc-subtext"]}>across completed topics</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${styles.card} ${styles["snapshot-card"]}`}>
                                    <h2>Study snapshot</h2>
                                    <div className={styles["snapshot-grid"]}>
                                        <div className={styles["snapshot-box"]}>
                                            <div className={styles["snapshot-header"]}>
                                                <FlameIcon />
                                                <span>Day streak</span>
                                            </div>
                                            <div className={styles["snapshot-value"]}>{streak}</div>
                                        </div>

                                        <div className={styles["snapshot-box"]}>
                                            <div className={styles["snapshot-header"]}>
                                                <ListIcon />
                                                <span>Questions answered</span>
                                            </div>
                                            <div className={styles["snapshot-value"]}>{totalQuestions}</div>
                                        </div>

                                        <div className={styles["snapshot-box"]}>
                                            <div className={styles["snapshot-header"]}>
                                                <CheckCircleIcon />
                                                <span>Accuracy</span>
                                            </div>
                                            <div className={styles["snapshot-value"]}>{accuracy}%</div>
                                        </div>

                                        <div className={styles["snapshot-box"]}>
                                            <div className={styles["snapshot-header"]}>
                                                <ClockIcon />
                                                <span>Avg time / Q</span>
                                            </div>
                                            <div className={styles["snapshot-value"]}>{averageTimeDisplay}</div>
                                        </div>
                                    </div>
                                </div>

                                {subjectMastery.length > 0 ? (
                                    <div className={`${styles.card} ${styles["data-card"]}`}>
                                        <h2>Subject mastery</h2>
                                        <div className={styles["mastery-list"]}>
                                            {subjectMastery.map((item, index) => (
                                                <div key={item.topicId || index} className={styles["mastery-row"]}>
                                                    <div className={styles["mastery-meta"]}>
                                                        <span className={styles["mastery-title"]}>
                                                            {item.topicTitle || "Topic"}
                                                        </span>
                                                        <strong>{item.mastery}%</strong>
                                                    </div>
                                                    <div className={styles["mastery-bar"]}>
                                                        <div
                                                            className={styles["mastery-fill"]}
                                                            style={{ width: `${Math.min(Math.max(item.mastery, 0), 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${styles.card} ${styles["empty-state-card"]}`}>
                                        <div className={`${styles["icon-wrapper"]} ${styles["cyan-bg"]}`}>
                                            <BarChartIcon />
                                        </div>
                                        <h3>No mastery data yet</h3>
                                        <p>Finish a quiz and we’ll break down your strength in each subject.</p>
                                        <button
                                            type="button"
                                            className={styles["btn-action"]}
                                            onClick={() => navigate("/study-zone")}
                                        >
                                            Take a quiz
                                        </button>
                                    </div>
                                )}

                                {weakAreas.length > 0 ? (
                                    <div className={`${styles.card} ${styles["data-card"]}`}>
                                        <h2>Weak areas</h2>
                                        <div className={styles["weak-list"]}>
                                            {weakAreas.map((area, index) => (
                                                <div key={area.topicId || index} className={styles["weak-row"]}>
                                                    <div className={styles["weak-meta"]}>
                                                        <span className={styles["weak-title"]}>
                                                            {area.topicTitle || "Topic"}
                                                        </span>
                                                        <strong>{area.mastery}%</strong>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles["btn-review"]}
                                                        onClick={() => openTopicReview(area)}
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${styles.card} ${styles["empty-state-card"]}`}>
                                        <div className={styles["card-title-absolute"]}>
                                            <h2>Weak areas</h2>
                                        </div>
                                        <div className={`${styles["icon-wrapper"]} ${styles["pink-bg"]}`}>
                                            <TargetIcon />
                                        </div>
                                        <h3>No weak areas found</h3>
                                        <p>Topics where your accuracy drops below 60% will show up here for review.</p>
                                    </div>
                                )}
                            </div>

                            <div className={`${styles.card} ${styles["mood-card"]}`}>
                                <div className={styles["mood-header"]}>
                                    <div className={styles["mood-title-group"]}>
                                        <h2>Mind Rx mood tracker</h2>
                                        <p>How you feel affects how you learn. Check in daily.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles["btn-outline"]}
                                        onClick={() => navigate("/mind-rx")}
                                    >
                                        <PlusIcon />
                                        Log today’s mood
                                    </button>
                                </div>

                                <div className={styles["mood-days-row"]}>
                                    {weekDays.map((day) => {
                                        const value = moodByDate[day.key];
                                        const hasMood = typeof value === "number" && !Number.isNaN(value);
                                        const barHeight = hasMood ? Math.max(6, Math.round((value / 100) * 48)) : 6;

                                        return (
                                            <div key={day.key} className={styles["mood-day-col"]}>
                                                <div
                                                    className={hasMood ? styles["mood-bar"] : styles["mood-placeholder-bar"]}
                                                    style={hasMood ? { height: `${barHeight}px` } : undefined}
                                                    title={hasMood ? `${value}` : undefined}
                                                />
                                                <span className={styles["mood-day-label"]}>{day.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
