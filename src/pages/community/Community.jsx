import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import { TopicCard } from "../../components/common/topic_card/TopicCard";
import { CardIcon } from "../../components/common/topic_card/CardIcon";
import { MotivationMondayIcon, StudyBuddyRequestsIcon, PsychNursingTipsIcon } from "../../components/common/Icons";

import styles from "./Community.module.css";



export const Community = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const cardsData = [
    {
      title: "Motivation Monday",
      subtitle: "Start your week with wins, positivity, and encouragement",
      icon: <CardIcon><MotivationMondayIcon /></CardIcon>,
      onClick: () => navigate("/community/motivation-monday")
    },
    {
      title: "Study Buddy Requests",
      subtitle: "Find a partner for daily accountability or exam prep.",
      icon: <CardIcon><StudyBuddyRequestsIcon /></CardIcon>,
      onClick: () => navigate("/community/study-buddy-requests")
    },
    {
      title: "Psych Nursing Tips",
      subtitle: "Therapeutic communication, psych meds, and case insights",
      icon: <CardIcon><PsychNursingTipsIcon /></CardIcon>,
      onClick: () => navigate("/community/psych-nursing-tips")
    }
  ];


  return (
    <div className={styles["cm-container"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["cm-content-area"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* HEADER */}
        <HeaderCard
          title="Community Lounge"
          subtitle="Your Nurse Network, Explore supportive spaces curated for your nursing journey."
          className={styles['cm-topics-header']}
        />

        {/* TOPICS GRID */}
        <div className={styles["cm-topics-grid"]}>
          {cardsData.map((card, index) => (
            <TopicCard
              key={index}
              title={card.title}
              subtitle={card.subtitle}
              icon={card.icon}
              align={"start"}
              onClick={card.onClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
