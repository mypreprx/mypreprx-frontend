import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import { TopicCard } from "../../components/common/topic_card/TopicCard";
import { CardIcon } from "../../components/common/topic_card/CardIcon";
import {
  StrategyZoneHeaderIcon,
  PriorityFrameworkIcon,
  EliminationTechniquesIcon,
  NclexLanguageDecoderIcon,
  SataBootCampIcon,
  CriticalThinkingDrillsIcon,
  PriorityPatientsIcon,
  PharmShortcutsIcon,
  TestDayMindsetIcon
} from "../../components/common/Icons";

import styles from "./StrategyZone.module.css";



const STRATEGY_CARDS = [
  {
    id: "priority-framework",
    title: "Priority Framework",
    icon: <PriorityFrameworkIcon />,
    path: "/strategy-zone/periority-framworks",
  },
  {
    id: "elimination-techniques",
    title: "Elimination Techniques",
    icon: <EliminationTechniquesIcon />,
    path: "/strategy-zone/elimination-techniques",
  },
  {
    id: "nclex-decoder",
    title: "NCLEX Language Decoder",
    icon: <NclexLanguageDecoderIcon />,
    path: "/strategy-zone/neclex-language",
  },
  {
    id: "sata-boot-camp",
    title: "SATA Boot Camp",
    icon: <SataBootCampIcon />,
    path: "/strategy-zone/sata-boot-camp",
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking Drills",
    icon: <CriticalThinkingDrillsIcon />,
    path: "/strategy-zone/critical-thinking",
  },
  {
    id: "priority-patients",
    title: "Priority Patients",
    icon: <PriorityPatientsIcon />,
    path: "/strategy-zone/periority-patients",
  },
  {
    id: "pharm-shortcuts",
    title: "Pharm Shortcuts",
    icon: <PharmShortcutsIcon />,
    path: "/strategy-zone/pharma-hacks",
  },
  {
    id: "test-day-mindset",
    title: "Test Day Mindset",
    icon: <TestDayMindsetIcon />,
    path: "/strategy-zone/test-day-mindset",
  },
];

export const StrategyZone = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles["sz-container"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["sz-content-area"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* HEADER */}
        <HeaderCard
          icon={<CardIcon>{<StrategyZoneHeaderIcon />}</CardIcon>}
          title="Strategy Zone"
          subtitle="Quick, powerful techniques to raise your score instantly"
          className={styles["sz-topics-header"]}
          titleClassName={styles["sz-title"]}
        />

        {/* STRATEGY CARDS */}
        <div className={styles["sz-topics-grid"]}>
          {STRATEGY_CARDS.map((card) => (
            <TopicCard
              key={card.id}
              title={card.title}
              icon={<CardIcon>{card.icon}</CardIcon>}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};