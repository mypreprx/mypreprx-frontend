import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { TopicCard } from "../../../components/common/topic_card/TopicCard";
import { BackButton } from "../../../components/common/BackButton";
import { CardIcon } from "../../../components/common/topic_card/CardIcon";
import {
    ABCIcon,
    MaslowHierarchyIcon,
    ADPIENursingProcessIcon,
    SafetyFirstIcon,
} from "../../../components/common/Icons";
import { strategyPrompts } from "../strategyPrompts";

import styles from "./PeriorityFramworks.module.css";



const NURSING_STRATEGY_CARDS = [
    {
        id: "abcs",
        title: "ABC(Airway, Breathing, Circulation)",
        description: "Choose the option that protects airway first, supports breathing second, and stabilizes circulation last when deciding between interventions.",
        subCategory: "ABC",
        icon: <ABCIcon />,
    },
    {
        id: "maslow",
        title: "Maslow’s Hierarchy",
        description: "Pick the answer that meets basic physiologicalneeds before psychological, social, or self-fulfillment needs.",
        subCategory: "Maslow",
        icon: <MaslowHierarchyIcon />,
    },
    {
        id: "adpie",
        title: "ADPIE Nursing Process",
        description: "Select the response that keeps you in the correct step—usually assess first—before jumping to implementation.",
        subCategory: "ADPIE",
        icon: <ADPIENursingProcessIcon />,
    },
    {
        id: "safety",
        title: "Saftey First",
        description: "Go with the choice that prevents the most harm, protects the patient, and reduces immediate risk before anything else.",
        subCategory: "Safety First",
        icon: <SafetyFirstIcon />,
    },
];

export const PeriorityFramworks = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (cardTitle) => {
        const prompt = strategyPrompts['Priority Framework'][cardTitle];
        navigate('/strategy-zone/drill', {
            state: {
                strategyTab: "Priority Framework",
                subCategory: cardTitle,
                promptInstructions: prompt,
                isDynamic: true
            }
        });
    };

    return (
        <div className={styles["pf-study-layout"]}>
            {/* SIDEBAE */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles["pf-study-main"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* BACK BUTTON */}
                <div className={styles["pf-back-btn-container"]}>
                    <BackButton to="/strategy-zone" />
                </div>

                {/* HEADER */}
                <HeaderCard
                    title="Priority frameworks"
                    subtitle="Use these formulas to quickly rank patient needs and choose the best action."
                    className={styles['pf-header']}
                />

                {/* RECTANGLE CARDS */}
                <section className={styles["pf-rectangle-cards"]}>
                    {NURSING_STRATEGY_CARDS.map((card) => (
                        <div key={card.id} onClick={() => handleCardClick(card.title)} style={{cursor: 'pointer'}}>
                            <TopicCard
                                title={card.title}
                                subtitle={card.description}
                                icon={<CardIcon>{card.icon}</CardIcon>}
                                align={"start"}
                            />
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};