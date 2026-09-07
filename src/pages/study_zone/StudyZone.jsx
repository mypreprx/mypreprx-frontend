import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Topbar } from "../../components/common/topbar/Topbar";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { TopicCard } from "../../components/common/topic_card/TopicCard";
import { HeaderCard } from "../../components/common/HeaderCard";
import { CardIcon } from "../../components/common/topic_card/CardIcon";
import {
    CrashCoursesIcon,
    AllTopicsGridIcon,
    PriorityIcon,
    BehavioralHealthIcon,
    CustomQuizzesIcon,
    CaseStudiesIcon
} from "../../components/common/Icons";

import styles from "./StudyZone.module.css";



const RECT_CARDS = [
    {
        id: "all-topics",
        title: "All topics",
        icon: <AllTopicsGridIcon />,
        path: "/study-zone/all-topics"
    },
    {
        id: "priority-practice",
        title: "Priority Practice",
        icon: <PriorityIcon />,
        path: "/study-zone/periority-practice"
    },
    {
        id: "behavioral-health",
        title: "Behavioral Health RX",
        icon: <BehavioralHealthIcon />,
        path: "/study-zone/behavioral-health"
    },
    {
        id: "custom-quizzes",
        title: "Custom Quizzes",
        icon: <CustomQuizzesIcon />,
        path: "/study-zone/custom-quizzes"
    },
    {
        id: "nclex-simulator",
        title: "NCLEX Simulator",
        icon: <CaseStudiesIcon />,
        path: "/study-zone/nclex-simulator",
        isSpecial: true
    }
];

export const StudyZone = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className={styles["study-layout"]}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles["study-main"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* HORIZONTAL CARDS */}
                <section className={styles["horizontal-cards"]}>
                    {/* HEADER */}
                    <HeaderCard
                        title="Study Zone"
                        subtitle="Pharmacy of knowledge"
                        className={styles["sz-header"]}
                    />

                    <div
                        className={styles["h-card"]}
                        onClick={() => navigate("/study-zone/crash-courses")}
                        style={{ cursor: "pointer" }}
                    >
                        <h3 className={styles["crash-title"]}>
                            <CardIcon>
                                <CrashCoursesIcon />
                            </CardIcon>
                            <span>Crash Courses</span>
                        </h3>
                        <p>Short, sharp videos for fast NCLEX wins.</p>
                    </div>
                </section>

                {/* CARDS */}
                <div className={styles["rectangle-cards"]}>
                    {RECT_CARDS.map((card) => (
                        <TopicCard
                            key={card.id}
                            title={card.title}
                            icon={<CardIcon>{card.icon}</CardIcon>}
                            onClick={() => navigate(card.path)}
                            className={`${styles["sz-card-padding"]} ${card.isSpecial ? styles["sz-simulator-card"] : ""}`}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};