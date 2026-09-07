import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import styles from "./QuizResult.module.css";

export const QuizResult = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);


    const location = useLocation();
    const navigate = useNavigate();

    const { results, stats } = location.state || {};

    // Prevent accessing this page without results
    useEffect(() => {
        if (!results || !stats) {
            navigate("/study-zone");
        }
    }, [results, stats, navigate]);


    if (!results || !stats) return null;

    return (
        <div className={styles["result-container"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["main-area"]}>
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["result-card"]}>
                    <div className={styles["result-header"]}>
                        <h1>Quiz Summary</h1>
                        <p>Here's how you performed on this session</p>
                    </div>

                    <div className={styles["stats-grid"]}>
                        <div className={`${styles["stat-item"]} ${styles["stat-item--correct"]}`}>
                            <span className={styles["stat-label"]}>Correct</span>
                            <span className={styles["stat-value"]}>{stats.correct}</span>
                        </div>
                        <div className={`${styles["stat-item"]} ${styles["stat-item--incorrect"]}`}>
                            <span className={styles["stat-label"]}>Incorrect</span>
                            <span className={styles["stat-value"]}>{stats.incorrect}</span>
                        </div>
                        <div className={`${styles["stat-item"]} ${styles["stat-item--missed"]}`}>
                            <span className={styles["stat-label"]}>Missed</span>
                            <span className={styles["stat-value"]}>{stats.missed}</span>
                        </div>
                        <div className={styles["stat-item"]}>
                            <span className={styles["stat-label"]}>Total Score</span>
                            <span className={styles["stat-value"]}>{stats.score}%</span>
                        </div>
                    </div>

                    <div className={styles["question-list"]}>
                        <h2>Detailed Review</h2>
                        {results.map((item, idx) => (
                            <div key={idx} className={styles["question-item"]}>
                                <p className={styles["question-text"]}>
                                    {idx + 1}. {item.question}
                                </p>
                                <div className={styles["answer-info"]}>
                                    <span className={styles["user-answer"]}>
                                        <strong>Your Answer:</strong> {item.userAnswer || "None"}
                                    </span>
                                    <br />
                                    <span>
                                        <strong>Correct Answer:</strong> {item.correctAnswer}
                                    </span>
                                </div>
                                <div style={{ marginTop: "0.5rem" }}>
                                    <span className={`${styles["status-tag"]} ${styles[`status--${item.status}`]}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles["actions"]}>
                        <button
                            className={styles["home-btn"]}
                            onClick={() => navigate("/home")}
                        >
                            Go to Home
                        </button>
                        <button
                            className={styles["again-btn"]}
                            onClick={() => navigate("/study-zone/custom-quizzes")}
                        >
                            Take another Quiz
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
