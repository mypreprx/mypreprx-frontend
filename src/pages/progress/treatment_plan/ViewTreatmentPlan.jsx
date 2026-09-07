import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import {
    TrPlanMilestoneIcon,
    TrPlanStreakIcon,
    TrPlanQuestionsIcon,
    TrPlanMedSurgIcon,
    TrPlanPharmaIcon,
    TrPlanPediatricsIcon,
    TrPlanPsychIcon
} from "../../../components/common/Icons";
import api from "../../../config/axiosInstance";
import useAuthStore from "../../../store/authStore";

import styles from "./ViewTreatmentPlan.module.css";

const mapTopicIcon = (index) => {
    const icons = [TrPlanMedSurgIcon, TrPlanPharmaIcon, TrPlanPediatricsIcon, TrPlanPsychIcon];
    return icons[index] || TrPlanMedSurgIcon;
};

const getGaugeIndicatorPosition = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    const angle = Math.PI * (1 - clamped / 100);
    const radius = 80;
    const centerX = 100;
    const centerY = 120;
    return {
        cx: centerX + Math.cos(angle) * radius,
        cy: centerY - Math.sin(angle) * radius
    };
};

const buildMoodPath = (moodGraph = []) => {
    if (!moodGraph.length) return "";

    const width = 260;
    const height = 120;
    const leftPadding = 20;
    const rightPadding = 20;
    const availableWidth = width - leftPadding - rightPadding;
    const maxValue = 100;
    const minValue = 0;
    const points = moodGraph.map((entry, index) => {
        const x = leftPadding + (availableWidth * index) / Math.max(1, moodGraph.length - 1);
        const value = typeof entry.value === "number" ? entry.value : Number(entry.value || 0);
        const normalized = 1 - (value - minValue) / (maxValue - minValue || 1);
        const y = 20 + normalized * (height - 40);
        return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
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

    const progressPercent = analytics?.overallProgress ?? 0;
    const indicator = getGaugeIndicatorPosition(progressPercent);
    const moodPath = useMemo(() => buildMoodPath(analytics?.moodGraph || []), [analytics?.moodGraph]);
    const weakArea = analytics?.weakAreas?.[0] || null;
    const subjectMastery = analytics?.subjectMastery || [];
    const totalQuestions = analytics?.totalQuestions ?? 0;
    const questionAnalytics = analytics?.questionAnalytics || {};
    const accuracy = questionAnalytics.accuracy ?? 0;
    const averageTime = questionAnalytics.averageTimePerQuestion
        ? `${questionAnalytics.averageTimePerQuestion} sec`
        : "N/A";
    const streak = analytics?.streak ?? 0;

    const studyProgressData = [
        { icon: TrPlanMilestoneIcon, text: `${streak} day streak` },
        { icon: TrPlanQuestionsIcon, text: `${totalQuestions} questions completed` },
        { icon: TrPlanStreakIcon, text: `${accuracy}% accuracy` }
    ];

    const moodLabels = analytics?.moodGraph?.slice(-7).map((item) => {
        const date = item.date ? new Date(item.date) : null;
        return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-";
    }) || [];

    return (
        <div className={styles["vtp-wrapper"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["vtp-main"]}>
                <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["vtp-header-pill"]}>Treatment plan progress</div>

                {loading ? (
                    <div className={styles["vtp-loading"]}>Loading your progress...</div>
                ) : error ? (
                    <div className={styles["vtp-loading"]} style={{ color: "#d32f2f" }}>{error}</div>
                ) : (
                    <>
                        <div className={styles["vtp-top-row"]}>
                            <div className={`${styles["vtp-card"]} ${styles["vtp-progress-card"]}`}>
                                <div className={styles["vtp-card-header"]}>
                                    <span>Progress Over Time</span>
                                    <span className={styles["vtp-increasing"]}>▲ Increasing</span>
                                </div>

                                <div className={styles["vtp-gauge-container"]}>
                                    <svg viewBox="0 0 200 150" className={styles["vtp-gauge"]}>
                                        <path d="M 20 120 A 80 80 0 0 1 180 120" className={styles["vtp-gauge-path-bg"]} />
                                        <path d="M 20 120 A 80 80 0 0 1 180 120" className={styles["vtp-gauge-path-bg-light"]} />
                                        <circle cx={indicator.cx} cy={indicator.cy} r="12" className={styles["vtp-gauge-circle"]} />
                                    </svg>
                                    <div className={styles["vtp-gauge-text"]}>
                                        <span className={styles["vtp-gauge-label"]}>Your confidence</span>
                                        <strong className={styles["vtp-gauge-value"]}>{progressPercent}%</strong>
                                        <span className={styles["vtp-gauge-sub"]}>Across completed topics</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles["vtp-card"]} ${styles["vtp-study-card"]}`}>
                                <div className={styles["vtp-study-header-card"]}>
                                    Study progress – every dose brings you closer
                                </div>

                                <div className={styles["vtp-study-list-card"]}>
                                    {studyProgressData.map((item, index) => (
                                        <div key={index} className={styles["vtp-study-item"]}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <item.icon />
                                                {item.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles["vtp-subject-section"]}>
                            <h4>Subject Mastery</h4>
                            <div className={styles["vtp-subject-grid"]}>
                                {subjectMastery.length ? subjectMastery.map((item, index) => {
                                    const Icon = mapTopicIcon(index);
                                    return (
                                        <div key={item.topicId || index} className={styles["vtp-sub-card"]}>
                                            <Icon />
                                            <p>{item.topicTitle}</p>
                                            <strong>{item.mastery}%</strong>
                                        </div>
                                    );
                                }) : (
                                    <div className={styles["vtp-sub-card"]}>
                                        <p>No subject mastery data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles["vtp-bottom-row"]}>
                            <div className={`${styles["vtp-card"]} ${styles["vtp-tracker-card"]}`}>
                                <div className={styles["vtp-card-header"]}>Mind Rx Tracker</div>

                                <div className={styles["vtp-legend"]}>
                                    <span className={styles["blue"]} /> Mood
                                </div>

                                <svg viewBox="0 0 300 160" className={styles["vtp-line-chart"]}>
                                    {moodPath ? (
                                        <path d={moodPath} />
                                    ) : (
                                        <path d="M10 120 L290 120" />
                                    )}
                                </svg>

                                <div className={styles["vtp-days"]}>
                                    {moodLabels.length ? moodLabels.map((label, index) => (
                                        <span key={index}>{label}</span>
                                    )) : <span>No mood data</span>}
                                </div>
                            </div>

                            <div className={styles["vtp-right-column"]}>
                                <div className={styles["vtp-card"]}>
                                    <div className={styles["vtp-card-header"]} style={{ justifyContent: 'center', marginBottom: '8px' }}>
                                        Weak area tracker
                                    </div>
                                    <p className={styles["vtp-weak"]}>{weakArea?.topicTitle || "No weak area yet"}</p>
                                    <div className={styles["vtp-accuracy-row"]}>
                                        <span>Accuracy</span>
                                        <strong>{weakArea ? `${weakArea.mastery}%` : "N/A"}</strong>
                                    </div>
                                    <button 
                                        className={styles["vtp-btn"]}
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
                                        Review
                                    </button>
                                </div>

                                <div className={styles["vtp-card"]}>
                                    <div className={styles["vtp-card-header"]}>Question Analytics</div>
                                    <div className={styles["vtp-qa"]}><span>Answered</span><strong>{questionAnalytics.totalQuestions || 0}</strong></div>
                                    <div className={styles["vtp-qa"]}><span>Accuracy</span><strong>{accuracy}%</strong></div>
                                    <div className={styles["vtp-qa"]}><span>Average time/Q</span><strong>{averageTime}</strong></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};
