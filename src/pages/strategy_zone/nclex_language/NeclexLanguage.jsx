import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import api from "../../../config/axiosInstance";

import DecodeFramework from "./DecodeFramework";

import styles from "./NeclexLanguage.module.css";

export const NeclexLanguage = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleStartPracticeDrill = async () => {
    try {
      const res = await api.get("/user/getAllTopics");
      const topics = res.data?.data || [];
      const topic = topics.find((t) => t.title.toLowerCase().includes("nclex language"));
      if (!topic) {
        toast.error("NCLEX Language Decoder bank not seeded yet.");
        return;
      }
      navigate("/study-zone/topic-drill", {
        state: { topicId: topic._id, title: topic.title }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load the practice drill.");
    }
  };

  return (
    <div className={styles["nxl-container"]}>
      {/* ========== SIDEBAR ========== */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* ========== MAIN CONTENT ========== */}
      <main className={styles["nxl-content-area"]}>

        {/* TOPBAR */}
        <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON + START PRACTICE DRILL */}
        <div className={styles["nxl-back-btn-container"]}>
            <BackButton to="/strategy-zone" />
            <button className={styles["nxl-practice-btn"]} onClick={handleStartPracticeDrill}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4L19 12L5 20V4Z" fill="white" />
                </svg>
                Start Practice Drill
            </button>
        </div>

        {/* DECODE FRAMEWORK */}
        <DecodeFramework />

      </main>
    </div>
  );
};