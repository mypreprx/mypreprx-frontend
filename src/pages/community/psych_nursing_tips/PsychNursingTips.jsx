import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import { CommentsModal } from "../../../components/common/CommentsModal";
import { BackButton } from "../../../components/common/BackButton";

import styles from "./PsychNursingTips.module.css";

// Import stores
import useQuestionStore from "../../../store/questionStore";
import useAuthStore from "../../../store/authStore";
import useGrowthZoneStore from "../../../store/growthZoneStore";

export const PsychNursingTips = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Comments Modal state
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Store state
  const { questions, isLoading, fetchQuestions, toggleLike, addComment, deleteQuestion } = useQuestionStore();
  const { user } = useAuthStore();
  const { allTopics, fetchAllTopics } = useGrowthZoneStore();

  // FIX: Sync selectedQuestion with the latest data from the questions array
  // This ensures that when addComment updates the store, the modal sees it instantly.
  const activeQuestionData = questions.find(q => q._id === selectedQuestion?._id) || selectedQuestion;

  // Fetch questions and topics on mount
  useEffect(() => {
    fetchQuestions();
    fetchAllTopics();
  }, [fetchQuestions, fetchAllTopics]);

  // Handle filter click
  const handleFilterClick = (topicId) => {
    setActiveFilter(topicId);
    fetchQuestions(topicId);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  // Open modal handler
  const handleOpenCommentsModal = (question) => {
    setSelectedQuestion(question);
  };

  // Handle adding comment
  const handleAddComment = async (questionId, text) => {
    try {
      await addComment(questionId, text, user);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={styles["pnt-page"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["pnt-main-area"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* CONTENT */}
        <div className={styles["pnt-content"]}>
          {/* BACK BUTTON */}
          <div className={styles["pnt-back-btn-container"]}>
            <BackButton to="/community" />
          </div>

          {/* HEADER CARD */}
          <HeaderCard
            title="Psych Nursing Tips"
            subtitle="Share Knowledge, Gain insight"
            className={styles["pnt-header-card"]}
          />

          {/* Create Request Button */}
          <div className={styles["pnt-ask-btn-container"]}>
            <Button
              className={styles["pnt-ask-btn"]}
              onClick={() => navigate("/community/psych-nursing-tips/aska-question")}
            >
              Ask a Question
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className={styles["pnt-filters"]}>
            <button
              className={activeFilter === "All" ? styles["active"] : ""}
              onClick={() => handleFilterClick("All")}
            >
              All
            </button>
            {allTopics.map((topic) => (
              <button
                key={topic._id}
                className={activeFilter === topic._id ? styles["active"] : ""}
                onClick={() => handleFilterClick(topic._id)}
              >
                {topic.title?.replace(/ AI generated course/i, '').trim()}
              </button>
            ))}
          </div>

          {/* CONTENT CONTAINER */}
          <div className={styles["pnt-content-container"]}>

            {/* Loading State */}
            {isLoading && <div style={{ textAlign: 'center', padding: '20px', color: '#083862' }}>Loading questions...</div>}

            {/* Empty State */}
            {/* ISSUE 1 FIX: Dynamic Empty State */}
            {!isLoading && questions.length === 0 && (
              <div className={styles["mm-empty-state"]}>
                {activeFilter === "All"
                  ? "No questions yet. Be the first to ask!"
                  : `No questions found for this topic yet.`}
              </div>
            )}

            <div className={styles["pnt-posts-container"]}>
              {!isLoading && questions.map((question) => {
                if (!question) return null;
                return (
                  <div key={question._id} className={styles["pnt-post"]} style={{ position: 'relative' }}>
                    <div className={styles["pnt-post-user"]}>
                      <div className={styles["pnt-post-text"]}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 className={styles["pnt-post-username"]}>
                            {question.author?.username || "Anonymous"}
                          </h5>
                          {(user?.role === 'admin' || question.author?._id === user?._id) && (
                            <button 
                              onClick={() => deleteQuestion(question._id)}
                              style={{ position: 'absolute', top: '25px', right: '30px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        {/* Mapping topic title to heading */}
                        <h4 className={styles["pnt-post-heading"]}>{(question.topicId?.title || question.category || "General").replace(/ AI generated course/i, '').trim()}</h4>
                        <p className={styles["pnt-post-body-text"]}>{question.question || question.content}</p>
                      </div>
                    </div>
                    <div className={styles["pnt-post-footer"]}>
                      <div className={styles["pnt-footer-item"]}>

                        {/* LIKE BUTTON */}
                        <div
                          className={styles["pnt-icon pnt-like-icon"]}
                          onClick={() => toggleLike(question._id, user?._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="#00A5B7" />
                            <g transform="translate(16 16) scale(0.8) translate(-16 -16)">
                              <path
                                d="M10.9998 7.11108C7.62478 7.11108 4.88867 9.8472 4.88867 13.2222C4.88867 19.3333 12.1109 24.8889 15.9998 26.1811C19.8887 24.8889 27.1109 19.3333 27.1109 13.2222C27.1109 9.8472 24.3748 7.11108 20.9998 7.11108C18.9331 7.11108 17.1053 8.1372 15.9998 9.70775C15.4362 8.90519 14.6875 8.2502 13.8172 7.79821C12.9469 7.34622 11.9805 7.11053 10.9998 7.11108Z"
                                fill={question.likes?.includes(user?._id) ? "#ff6b6b" : "white"}
                                stroke="white"
                                strokeWidth="2.22222"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                          </svg>
                        </div>
                        <span>{question.likes?.length || 0} likes</span>
                      </div>

                      {/* COMMENT BUTTON */}
                      <div
                        className={styles["pnt-footer-item"]}
                        onClick={() => handleOpenCommentsModal(question)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles["pnt-icon pnt-comment-icon"]}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="#00A5B7" />
                            <g transform="translate(16 16) scale(0.8) translate(-16 -16)">
                              <path
                                d="M4.33398 10.1667C4.33398 9.0616 4.77297 8.00179 5.55437 7.22039C6.33577 6.43899 7.39558 6 8.50065 6H23.5007C24.6057 6 25.6655 6.43899 26.4469 7.22039C27.2283 8.00179 27.6673 9.0616 27.6673 10.1667V18.5C27.6673 19.0472 27.5595 19.589 27.3502 20.0945C27.1408 20.6 26.8338 21.0594 26.4469 21.4463C26.06 21.8332 25.6007 22.1401 25.0952 22.3495C24.5896 22.5589 24.0478 22.6667 23.5007 22.6667H17.1473L12.0423 27.1333C11.8061 27.3398 11.5154 27.4739 11.205 27.5196C10.8946 27.5652 10.5776 27.5205 10.2919 27.3908C10.0063 27.2611 9.76399 27.0518 9.59411 26.788C9.42424 26.5242 9.33393 26.2171 9.33398 25.9033V22.6667H8.50065C7.39558 22.6667 6.33577 22.2277 5.55437 21.4463C4.77297 20.6649 4.33398 19.6051 4.33398 18.5V10.1667ZM8.50065 7.66667C7.83761 7.66667 7.20173 7.93006 6.73288 8.3989C6.26404 8.86774 6.00065 9.50363 6.00065 10.1667V18.5C6.00065 19.163 6.26404 19.7989 6.73288 20.2678C7.20173 20.7366 7.83761 21 8.50065 21H11.0007V25.83L16.5207 21H23.5007C24.1637 21 24.7996 20.7366 25.2684 20.2678C25.7373 19.7989 26.0007 19.163 26.0007 18.5V10.1667C26.0007 9.50363 25.7373 8.86774 25.2684 8.3989C24.7996 7.93006 24.1637 7.66667 23.5007 7.66667H8.50065Z"
                                fill="white"
                              />
                            </g>
                          </svg>
                        </div>
                        <span>{question.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>

      {/* COMMENTS MODAL */}
      <CommentsModal
        isOpen={!!selectedQuestion}
        onClose={handleCloseModal}
        post={activeQuestionData} // The modal is generic, accepts 'post' prop
        onAddComment={handleAddComment}
        currentUser={user}
      />
    </div>
  );
};