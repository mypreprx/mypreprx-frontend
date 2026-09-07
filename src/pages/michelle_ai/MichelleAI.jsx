import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { BackButton } from "../../components/common/BackButton";
import { ChatInterface } from "./ChatInterface";

import styles from "./MichelleAI.module.css";
import useMichelleStore from "../../store/michelleStore";
import useAuthStore from "../../store/authStore";

import logo from "../../assets/logo.png";

export const MichelleAI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const { user } = useAuthStore();
  const { sessions, fetchHistory, startNewChat } = useMichelleStore();
  const location = useLocation();

  // Check if navigated here with a pre-filled question from Quiz
  const prefillMessage = location.state?.prefillMessage || "";

  useEffect(() => {
    if (user?._id) {
      fetchHistory(user._id);
    }
  }, [user, fetchHistory]);

  // If a prefill message is passed (e.g. from Quiz "Ask Michelle"), auto-start chat
  useEffect(() => {
    if (prefillMessage) {
      startNewChat();
      setIsChatting(true);
    }
  }, [prefillMessage]);

  const handleStartChat = () => {
    startNewChat();
    setIsChatting(true);
  };

  return (
    <div className={styles["sz-wrapper"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* Main content */}
      <main className={styles["sz-main"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Michelle AI" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className={styles.backBtnContainer}>
          <BackButton to="/home" />
        </div>

        {!isChatting ? (
          <div className={styles["sz-center"]}>
            <img src={logo} alt="PrepRX Logo" className={styles["sz-center-logo"]} />
            <h1>Hello!</h1>
            <p>My name is Michelle and I am <br /> here to help you!</p>
            <button className={styles["sz-ask-btn"]} onClick={handleStartChat}>
              Ask Michelle
            </button>
          </div>
        ) : (
          <ChatInterface chatHistory={sessions} initialMessage={prefillMessage} />
        )}
      </main>
    </div>
  );
};
