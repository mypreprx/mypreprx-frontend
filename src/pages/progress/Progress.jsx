import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import api from "../../config/axiosInstance";
import useAuthStore from "../../store/authStore";

import styles from "./Progress.module.css";

const GAUGE_CIRCUMFERENCE = 264; // 2 * π * 42

const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const ListIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const FlameIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F6A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C4866" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const clampProgress = (current, total) => Math.min(Math.max(current, 0), total);

const BADGE_FILTERS = [
    { id: "all", label: "All" },
    { id: "earned", label: "Earned" },
    { id: "progress", label: "In progress" },
];

export const Progress = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [affirmation, setAffirmation] = useState("I am calm, capable and ready to succeed and step into my purpose");
    const [loading, setLoading] = useState(true);
    const [affirmationRefreshing, setAffirmationRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [badgeFilter, setBadgeFilter] = useState("all");
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const fetchAffirmation = useCallback(async () => {
        try {
            const res = await api.get("/user/daily-affirmation", { params: { _t: Date.now() } });
            if (res.data?.data?.text) {
                setAffirmation(res.data.data.text);
            }
        } catch (err) {
            console.error("Failed to fetch affirmation:", err);
        }
    }, []);

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

        fetchAnalytics();
        fetchAffirmation();
    }, [user, fetchAffirmation]);

    // Lifetime stats only
    const lifetimeQuestions = analytics?.lifetimeTotalQuestions ?? 0;
    const lifetimeCorrect =
        analytics?.lifetimeCorrectAnswers ??
        analytics?.questionAnalytics?.lifetimeCorrectAnswers ??
        0;
    const progressValue = analytics?.overallProgress ?? 0;
    const accuracyValue = analytics?.questionAnalytics?.accuracy ?? progressValue;
    const streak = analytics?.streak ?? 0;
    const averageTimeDisplay = analytics?.averageTimePerQuestion
        ? `${analytics.averageTimePerQuestion} sec`
        : "—";

    const gaugeOffset = GAUGE_CIRCUMFERENCE * (1 - Math.min(Math.max(progressValue, 0), 100) / 100);

    const badgesData = useMemo(
        () => [
            {
                id: "3-day-streak",
                type: "STREAK",
                title: "3-Day Streak",
                desc: "Study 3 days in a row",
                current: clampProgress(streak, 3),
                total: 3,
                unit: "days",
                accent: "#F97316",
            },
            {
                id: "7-day-streak",
                type: "STREAK",
                title: "7-Day Streak",
                desc: "Study 7 days in a row",
                current: clampProgress(streak, 7),
                total: 7,
                unit: "days",
                accent: "#F97316",
            },
            {
                id: "30-day-streak",
                type: "STREAK",
                title: "30-Day Streak",
                desc: "Study 30 days in a row",
                current: clampProgress(streak, 30),
                total: 30,
                unit: "days",
                accent: "#F97316",
            },
            {
                id: "first-dose-complete",
                type: "MILESTONE",
                title: "First Dose Complete",
                desc: "Complete your first quiz",
                current: lifetimeQuestions > 0 ? 1 : 0,
                total: 1,
                unit: "quiz",
                accent: "#3B82F6",
            },
            {
                id: "10-questions-correct",
                type: "MILESTONE",
                title: "10 Questions Correct",
                desc: "Answer 10 questions correctly",
                current: clampProgress(lifetimeCorrect, 10),
                total: 10,
                unit: "correct",
                accent: "#14B8A6",
            },
            {
                id: "100-questions-correct",
                type: "MILESTONE",
                title: "100 Questions Correct",
                desc: "Answer 100 questions correctly",
                current: clampProgress(lifetimeCorrect, 100),
                total: 100,
                unit: "correct",
                accent: "#14B8A6",
            },
            {
                id: "master-of-sata",
                type: "MASTERY",
                title: "Master of SATA",
                desc: "Complete 50 practice questions",
                current: clampProgress(lifetimeQuestions, 50),
                total: 50,
                unit: "SATA",
                accent: "#00A5B7",
            },
        ],
        [streak, lifetimeCorrect, lifetimeQuestions]
    );

    const earnedCount = badgesData.filter((badge) => badge.current >= badge.total).length;

    const filteredBadges = useMemo(() => {
        if (badgeFilter === "earned") {
            return badgesData.filter((badge) => badge.current >= badge.total);
        }
        if (badgeFilter === "progress") {
            return badgesData.filter((badge) => badge.current < badge.total);
        }
        return badgesData;
    }, [badgesData, badgeFilter]);

    const hasActivity = lifetimeQuestions > 0;

    const handleRefreshAffirmation = async () => {
        setAffirmationRefreshing(true);
        await fetchAffirmation();
        setAffirmationRefreshing(false);
    };

    return (
        <div className={styles["pr-layout"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["pr-main"]}>
                <Topbar pageTitle="Progress" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["dashboard-container"]}>
                    <header className={styles["dashboard-header"]}>
                        <div className={styles["header-text"]}>
                            <h1>Your progress</h1>
                            <p>See how your study performance improves over time.</p>
                        </div>
                        <button
                            type="button"
                            className={styles["btn-treatment"]}
                            onClick={() => navigate("/progress/view-treatment-plan")}
                        >
                            View treatment plan
                            <ArrowRightIcon />
                        </button>
                    </header>

                    <section className={`${styles.card} ${styles["main-stats-card"]}`}>
                        {loading ? (
                            <p className={styles["status-text"]}>Loading analytics...</p>
                        ) : error ? (
                            <p className={styles["status-text"]} style={{ color: "#d32f2f" }}>{error}</p>
                        ) : (
                            <>
                                <div className={styles["stats-grid"]}>
                                    <div className={styles["gauge-container"]}>
                                        <div className={styles["circular-gauge"]}>
                                            <svg viewBox="0 0 100 100" className={styles["gauge-svg"]}>
                                                <circle cx="50" cy="50" r="42" className={styles["gauge-bg"]} />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="42"
                                                    className={styles["gauge-fill"]}
                                                    style={{
                                                        strokeDasharray: String(GAUGE_CIRCUMFERENCE),
                                                        strokeDashoffset: String(gaugeOffset),
                                                    }}
                                                />
                                            </svg>
                                            <div className={styles["gauge-value"]}>{progressValue}%</div>
                                        </div>
                                        <span className={styles["gauge-label"]}>Overall confidence</span>
                                    </div>

                                    <div className={styles["metric-box"]}>
                                        <div className={styles["metric-header"]}>
                                            <ListIcon />
                                            <span>Questions</span>
                                        </div>
                                        <div className={styles["metric-value"]}>{lifetimeQuestions}</div>
                                    </div>

                                    <div className={styles["metric-box"]}>
                                        <div className={styles["metric-header"]}>
                                            <CheckCircleIcon />
                                            <span>Accuracy</span>
                                        </div>
                                        <div className={styles["metric-value"]}>{accuracyValue}%</div>
                                    </div>

                                    <div className={styles["metric-box"]}>
                                        <div className={styles["metric-header"]}>
                                            <FlameIcon />
                                            <span>Study streak</span>
                                        </div>
                                        <div className={styles["metric-value"]}>{streak} days</div>
                                    </div>

                                    <div className={styles["metric-box"]}>
                                        <div className={styles["metric-header"]}>
                                            <ClockIcon />
                                            <span>Avg time / Q</span>
                                        </div>
                                        <div className={styles["metric-value"]}>{averageTimeDisplay}</div>
                                    </div>
                                </div>

                                {!hasActivity && (
                                    <div className={styles["cta-banner"]}>
                                        <p className={styles["cta-text"]}>
                                            No activity yet. Answer your first question to start tracking your progress.
                                        </p>
                                        <button
                                            type="button"
                                            className={styles["btn-start"]}
                                            onClick={() => navigate("/study-zone")}
                                        >
                                            Start practice
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    <section className={`${styles.card} ${styles["affirmation-card"]}`}>
                        <div className={styles["affirmation-icon-box"]}>
                            <SunIcon />
                        </div>
                        <div className={styles["affirmation-content"]}>
                            <span className={styles["affirmation-title"]}>MORNING AFFIRMATION</span>
                            <p className={styles["affirmation-text"]}>{affirmation}</p>
                        </div>
                        <button
                            type="button"
                            className={styles["btn-refresh"]}
                            aria-label="Refresh affirmation"
                            onClick={handleRefreshAffirmation}
                            disabled={affirmationRefreshing}
                        >
                            <RefreshIcon />
                        </button>
                    </section>

                    <section className={styles.card}>
                        <div className={styles["badges-header"]}>
                            <div className={styles["badges-title-row"]}>
                                <h2>Badges</h2>
                                <span className={styles["badges-count"]}>
                                    <strong>{earnedCount}</strong> of {badgesData.length} earned
                                </span>
                            </div>
                            <div className={styles["badges-filters"]} role="tablist" aria-label="Badge filters">
                                {BADGE_FILTERS.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={badgeFilter === filter.id}
                                        className={`${styles["badge-filter-btn"]} ${
                                            badgeFilter === filter.id ? styles["badge-filter-btn--active"] : ""
                                        }`}
                                        onClick={() => setBadgeFilter(filter.id)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles["badges-grid"]}>
                            {filteredBadges.map((badge) => {
                                const earned = badge.current >= badge.total;
                                const fillPercent = badge.total > 0 ? (badge.current / badge.total) * 100 : 0;
                                const iconSrc = earned
                                    ? `/badgesafter/${badge.id}.svg`
                                    : `/badgesbefore/${badge.id}.svg`;

                                return (
                                    <div
                                        key={badge.id}
                                        className={`${styles["badge-item"]} ${earned ? styles["badge-item--earned"] : ""}`}
                                    >
                                        {earned ? (
                                            <span className={styles["badge-status-earned"]}>Earned</span>
                                        ) : (
                                            <span className={styles["badge-status-lock"]} aria-label="Locked">
                                                <LockIcon />
                                            </span>
                                        )}

                                        <img
                                            src={iconSrc}
                                            alt=""
                                            className={styles["badge-img"]}
                                        />

                                        <div className={styles["badge-details"]}>
                                            <span className={styles["badge-type"]}>{badge.type}</span>
                                            <h3 className={styles["badge-title"]}>{badge.title}</h3>
                                            <p className={styles["badge-desc"]}>{badge.desc}</p>

                                            {earned ? (
                                                <div className={styles["badge-earned-footer"]}>
                                                    <span className={styles["badge-earned-text"]}>Earned</span>
                                                    <span
                                                        className={styles["badge-earned-underline"]}
                                                        style={{ backgroundColor: badge.accent }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={styles["badge-progress-bar"]}>
                                                        <div
                                                            className={styles["badge-progress-fill"]}
                                                            style={{ width: `${fillPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className={styles["badge-progress-text"]}>
                                                        {badge.current} / {badge.total} {badge.unit}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredBadges.length === 0 && (
                            <p className={styles["badges-empty"]}>
                                {badgeFilter === "earned"
                                    ? "No badges earned yet. Keep studying to unlock your first one."
                                    : "No badges in progress."}
                            </p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};
