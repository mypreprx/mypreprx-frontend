import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import "../../components/FlashCard.css";

export const ReviewQuestion = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [flipped, setFlipped] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const fq = location.state?.question;

    if (!fq) {
        return (
            <div className="fc-page">
                <Sidebar sidebarOpen={sidebarOpen} />
                <div className="fc-main">
                    <Topbar pageTitle="Review Question" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="fc-content" style={{ textAlign: "center", padding: "4rem" }}>
                        <h2>No question found to review.</h2>
                        <button
                            className="fc-filter-btn active"
                            style={{ marginTop: "1rem" }}
                            onClick={() => navigate('/flagged-questions')}
                        >
                            Go Back to Flagged Questions
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const cardCategory = fq.topic?.title || "Study Zone";
    const cardQuestion = fq.questionText;
    const cardAnswer = fq.answerText || "No answer provided.";
    const cardRationale = fq.rationale || "No rationale provided.";

    return (
        <div className="fc-page">
            <Sidebar sidebarOpen={sidebarOpen} />
            <div className="fc-main">
                <Topbar
                    pageTitle="Review Flagged Question"
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="fc-content">

                    {/* Header with back button */}
                    <div className="fc-header-card">
                        <div className="fc-header-left">
                            <h3 className="fc-header-title">Question Review Mode</h3>
                            <p className="fc-header-sub">Dive deeper into the rationale</p>
                        </div>
                    </div>

                    {/* ── 3-D Flip Card ── */}
                    <div
                        className="fc-scene"
                        onClick={() => setFlipped((v) => !v)}
                        title="Click to flip"
                        style={{ margin: "2rem auto 0", width: "100%" }}
                    >
                        <div className={`fc-inner${flipped ? " flipped" : ""}`}>
                            {/* FRONT */}
                            <div className="fc-face fc-front">
                                <span className="fc-badge">{cardCategory}</span>
                                <p className="fc-question">{cardQuestion}</p>
                                <p className="fc-hint">↻ Tap to reveal answer</p>
                            </div>

                            {/* BACK */}
                            <div className="fc-face fc-back">
                                <span className="fc-badge fc-badge-back">{cardCategory}</span>
                                <div className="fc-answer-section">
                                    <p className="fc-ans-label">Answer</p>
                                    <p className="fc-ans-text">{cardAnswer}</p>
                                </div>
                                <div className="fc-rationale-section">
                                    <p className="fc-rat-label">Rationale</p>
                                    <p className="fc-rat-text">{cardRationale}</p>
                                </div>
                                <p className="fc-hint fc-hint-back">↻ Tap to see question</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReviewQuestion;
