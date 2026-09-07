import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { TopicCard } from "../../../components/common/topic_card/TopicCard";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { CardIcon } from "../../../components/common/topic_card/CardIcon";
import {
    CaseStudiesIcon,
    PsychMedicationIcon,
    CulturalSensitivityIcon,
    TherapeuticCommunicationIcon
} from "../../../components/common/Icons";

import styles from "./BehavioralHealth.module.css";
import { BackButton } from "../../../components/common/BackButton";
import api from "../../../config/axiosInstance";



const BH_CARDS = [
    {
        id: 1,
        title: "Case Studies",
        subtitle: "151 Lessons",
        icon: <CaseStudiesIcon />
    },
    {
        id: 2,
        title: "Psych Medication",
        subtitle: "85 Lessons",
        icon: <PsychMedicationIcon />
    },
    {
        id: 3,
        title: "Psych Med, Cultural Sensitivity",
        subtitle: "100 Lessons",
        icon: <CulturalSensitivityIcon />
    },
    {
        id: 4,
        title: "Therapeutic Communication",
        subtitle: "72 Lessons",
        icon: <TherapeuticCommunicationIcon />
    }
];

export const BehavioralHealth = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [counts, setCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await api.get('/user/behavioral/counts');
                if (res.data.success) {
                    const map = {};
                    res.data.data.forEach((c) => { map[c.topic] = c.questions; });
                    setCounts(map);
                }
            } catch (error) {
                console.error('Failed to load behavioral counts', error);
            }
        };
        fetchCounts();
    }, []);

    const handleCardClick = (cardId) => {
        setSelectedCard(cardId);
    };

    return (
        <div className={styles['bh-layout']}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles['bh-main']}>
                {/* TOPBAR */}
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* BACK BUTTON */}
                <div className={styles['back-btn-container']}>
                    <BackButton to="/study-zone" />
                </div>

                {/* HEADER */}
                <div className={styles['bh-horizontal-card-wrapper']}>
                    <HeaderCard
                        title="Behavioral Health Rx"
                        subtitle="Case-based scenarios, therapeutic communication, psych meds, and culturally sensitive care."
                        className={styles['bh-horizontal-card']}
                    />
                </div>

                {/* CARDS */}
                <div className={styles['bh-rectangle-cards']}>
                    {BH_CARDS.map((card) => (
                        <TopicCard
                            key={card.id}
                            title={card.title}
                            subtitle={counts[card.title] != null ? `${counts[card.title]} Lessons` : card.subtitle}
                            icon={<CardIcon>{card.icon}</CardIcon>}
                            isSelected={selectedCard === card.id}
                            onClick={() => handleCardClick(card.id)}
                        />
                    ))}
                </div>

                {selectedCard && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                        <button 
                            onClick={() => navigate(`/study-zone/behavioral-health/drill?topic=${encodeURIComponent(BH_CARDS.find(c => c.id === selectedCard).title)}`)}
                            style={{
                                background: '#0c4866',
                                color: 'white',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Start Selected Scenario
                        </button>
                    </div>
                )}
            </main>
        </div >
    );
};