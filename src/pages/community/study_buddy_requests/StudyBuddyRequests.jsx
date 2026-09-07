import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import { BackButton } from "../../../components/common/BackButton";

import useStudyBuddyStore from "../../../store/studyBuddyStore";

import styles from "./StudyBuddyRequests.module.css";

export const StudyBuddyRequests = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const navigate = useNavigate();

  // 1. Get state and actions from the store
  // Added default values [] to prevent "map of undefined" errors
  const {
    requests = [],
    topics = [],
    isLoading,
    fetchRequests,
    fetchTopics
  } = useStudyBuddyStore();

  // 2. Fetch data on mount
  useEffect(() => {
    fetchRequests();
    fetchTopics();
    // Removed dependencies to prevent infinite loops if the store isn't memoized
  }, []);

  // 3. Handle topic filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === "All") {
      fetchRequests();
    } else {
      const topic = topics.find((t) => t.title === filter);
      if (topic) {
        fetchRequests(topic._id);
      }
    }
  };

  const handleMessageClick = (request) => {
    if (request.isCreator) {
      navigate(`/community/study-buddy-requests/inbox/${request._id}`);
    } else {
      navigate(`/community/study-buddy-requests/chat/${request._id}`);
    }
  };

  // 4. Safe Filter Options (Prevents crash if topics is empty)
  const filterOptions = ["All", ...(topics?.map((t) => t.title) || [])];

  return (
    <div className={styles["sb-requests-page"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["sb-main-area"]}>
        <Topbar 
            pageTitle="Community" 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
        />

        {/* BACK BUTTON */}
        <div className={styles["sb-back-btn-container"]}>
            <BackButton to="/community" />
        </div>

        <HeaderCard
          title="Study Buddy Requests"
          subtitle="Connect, learn and grow together"
          className={styles["sb-header-card"]}
        />

        <div className={styles["sb-request-btn-container"]}>
          <Button
            className={styles["sb-request-btn"]}
            onClick={() => navigate("/community/study-buddy-requests/create-study-request")}
          >
            Create Own Request
          </Button>
        </div>

        {/* Filters */}
        <div className={styles["sb-filters"]}>
          {filterOptions.map((f) => (
            <button
              key={f}
              className={activeFilter === f ? styles["active"] : ""}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Requests Grid */}
        <div className={styles["sb-video-grid"]}>
          {isLoading ? (
            <div className={styles["sb-loading-state"]}>
              <div className={styles["loading-spinner"]}></div>
              <p>Loading study requests...</p>
            </div>
          ) : requests && requests.length > 0 ? (
            requests.map((request) => (
              <div key={request._id} className={styles["sb-video-card"]}>
                {/* Fixed reference to availableTime from your schema */}
                <span className={styles["sb-time-label"]}>
                    Available at {request.availableTime || "N/A"}
                </span>
                
                <div className={styles["sb-card-body"]}>
                  {/* Using topic.title if topic is populated, or topicName if passed from backend */}
                  <h4>{request.topic?.title || request.topicName || "Study Session"}</h4>
                  <p>{request.goal}</p>
                </div>

                <div className={styles["sb-card-footer"]}>
                  <Button
                    className={styles["sb-message-btn"]}
                    onClick={() => handleMessageClick(request)}
                  >
                    {request.isCreator ? "View Chat" : "Message"}
                  </Button>
                  <p>
                    {/* Safely calculate unique response count */}
                    {(request.replies?.length || 0)} Responses
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className={styles["sb-empty-state"]}>
              <p>No study requests found. Be the first to create one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};