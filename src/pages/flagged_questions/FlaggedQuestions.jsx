import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FlaggedQuestions.module.css";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import { BackButton } from "../../components/common/BackButton";
import api from "../../config/axiosInstance";
import toast from "react-hot-toast";

export const FlaggedQuestions = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlags = async () => {
            try {
                setLoading(true);
                const response = await api.get('/user/flashcards/get');
                if (response.data.success) {
                    setFlaggedQuestions(response.data.data);
                }
            } catch (error) {
                console.error("Failed to load flagged questions", error);
                toast.error("Error loading flagged questions");
            } finally {
                setLoading(false);
            }
        };
        fetchFlags();
    }, []);

    const handleUnflag = async (id) => {
        try {
            const response = await api.delete(`/user/flashcards/delete/${id}`);
            if (response.data.success) {
                toast.success("Question unflagged!");
                setFlaggedQuestions(prev => prev.filter(q => q._id !== id));
            }
        } catch (error) {
            toast.error("Failed to unflag question");
        }
    };

    return (
        <div className={styles["fq-container"]}>
            {/* ---------------- SIDEBAR ---------------- */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* ---------------- MAIN AREA ---------------- */}
            <main className={styles["fq-main-area"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* CONTENT */}
                <div className={styles["fq-content"]}>
                    {/* BACK BUTTON */}
                    <div className={styles["fq-back-btn-container"]}>
                        <BackButton to="/strategy-zone" />
                    </div>

                    {/* HEADER CARD */}
                    <HeaderCard
                        title="Flagged questions list for review"
                        subtitle="Here are all your flagged questions"
                        className={styles["fq-header-card"]}
                    />

                    {/* DRILL CARDS GRID */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#00A5B7', fontSize: '18px' }}>
                            Loading flagged questions...
                        </div>
                    ) : flaggedQuestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#6d839c' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#072445' }}>No flagged questions found.</h3>
                            <p>When you encounter a question you want to review later, click "Flag For Review".</p>
                        </div>
                    ) : (
                        <div className={styles["fq-video-grid"]}>
                            {flaggedQuestions.map((fq, idx) => (
                                <div key={fq._id} className={styles["fq-drill-card"]}>
                                    {/* Header */}
                                    <div className={styles["fq-drill-header"]}>
                                        <span className={styles["fq-drill-text"]}>Flagged / Q#{idx + 1}</span>
                                        <span className={styles["fq-drill-text"]}>{fq.topic?.title || "Study Zone"}</span>
                                    </div>

                                    {/* Question */}
                                    <p className={styles["fq-drill-question"]}>
                                        {fq.questionText}
                                    </p>

                                    {/* Actions */}
                                    <div className={styles["fq-drill-actions"]}>
                                        <button
                                            className={styles["fq-review-btn"]}
                                            onClick={() => navigate('/review-question', { state: { question: fq } })}
                                        >
                                            Review Question
                                        </button>
                                        <button
                                            className={styles["fq-unflag-btn"]}
                                            onClick={() => handleUnflag(fq._id)}
                                        >
                                            Unflag question
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FlaggedQuestions;
