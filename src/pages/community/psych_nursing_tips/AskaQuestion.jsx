import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import { BackButton } from "../../../components/common/BackButton";

import styles from "./AskaQuestion.module.css";
import useQuestionStore from "../../../store/questionStore";
import useGrowthZoneStore from "../../../store/growthZoneStore";

export const AskaQuestion = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Form State
    const [topicId, setTopicId] = useState("");
    const [questionText, setQuestionText] = useState("");

    // Store Actions
    const { createQuestion, isCreatingQuestion } = useQuestionStore();
    const { allTopics, fetchAllTopics } = useGrowthZoneStore();

    // Fetch topics on mount
    useEffect(() => {
        fetchAllTopics();
    }, [fetchAllTopics]);

    const handlePostQuestion = async () => {
        if (!questionText.trim() || !topicId) return;

        try {
            await createQuestion(questionText, topicId);
            // Navigate back to tips page on success
            navigate("/community/psych-nursing-tips");
        } catch (error) {
            // Error handled in store
            console.error(error);
        }
    };

    return (
        <div className={styles["ask-container"]}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles["ask-content-area"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* BACK BUTTON */}
                <div className={styles["ask-back-btn-container"]}>
                    <BackButton to="/community/psych-nursing-tips" />
                </div>

                {/*HEADER */}
                <HeaderCard
                    title="Ask a Question"
                    subtitle="Share your query with community."
                    className={styles["ask-topics-header"]}
                />

                {/* STUDY REQUEST CARD */}
                <div className={styles["ask-request-card"]}>
                    {/* Looking for help with */}
                    <div className={styles["ask-input-card"]}>
                        <label>Select Topic</label>
                        <select
                            value={topicId}
                            onChange={(e) => setTopicId(e.target.value)}
                        >
                            <option value="">Select a topic</option>
                            {allTopics.map((topic) => (
                                <option key={topic._id} value={topic._id}>
                                    {topic.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div className={styles["ask-input-card"]}>
                        <label>Your Question</label>
                        <textarea
                            placeholder="Type your question here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                minHeight: '100px',
                                fontFamily: 'inherit',
                                resize: 'none',
                                color: '#0C4866',
                                fontWeight: '400',
                                outline: 'none',
                                background: '#fff',
                                fontSize: '15px',
                            }}
                        />
                    </div>


                    <div className={styles["ask-post-btn-container"]}>
                        <Button
                            className={styles["ask-post-btn"]}
                            onClick={handlePostQuestion}
                            disabled={isCreatingQuestion || !questionText.trim() || !topicId}
                        >
                            {isCreatingQuestion ? "Posting..." : "Post Question"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};