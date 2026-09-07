import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./MindRx.module.css";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import { TopicCard } from "../../components/common/topic_card/TopicCard";
import { MindIcon, LotusIcon, BrainIcon, PenIcon, AudioIcon, CalendarIcon } from "../../components/common/Icons";
import smiley from "../../assets/smiley.svg?url";
import { CardIcon } from "../../components/common/topic_card/CardIcon";
import api from "../../config/axiosInstance";
import useAuthStore from "../../store/authStore";

const navigationCards = [
    {
        id: "visualization",
        title: "Visualization room",
        description: "Mini meditations for calm focus",
        icon: <BrainIcon />,
        path: "/mind-rx/visualization-room"
    },
    {
        id: "scripting",
        title: "Scripting space",
        description: "Journaling prompts for your journey",
        icon: <PenIcon />,
        path: "/mind-rx/scripting-space"
    },
    {
        id: "subliminal",
        title: "Subliminal Study Mode",
        description: "Background Music & Affirmations",
        icon: <AudioIcon />,
        path: "/mind-rx/subliminal-study"
    },
    {
        id: "manifestation",
        title: "Manifestation Calendar",
        description: "Gratitude, Reflection, Focus",
        icon: <CalendarIcon />,
        path: "/mind-rx/manifestation-calendar"
    },
    {
        id: "my-moment",
        title: "My Moment",
        description: "Breathe, listen & reset your mind",
        icon: <MindIcon />,
        path: "/mind-rx/my-moment"
    }
];

export const MindRx = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stressLevel, setStressLevel] = useState(50);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [affirmation, setAffirmation] = useState("I am calm, capable and ready to succeed and step into my purpose");
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchAffirmation = async () => {
            try {
                const res = await api.get('/user/daily-affirmation', { params: { _t: Date.now() } });
                if (res.data?.data?.text) {
                    setAffirmation(res.data.data.text);
                }
            } catch (err) {
                console.error("Failed to fetch affirmation:", err);
            }
        };

        if (user) {
            fetchAffirmation();
        }
    }, [user]);

    const handleSubmitMood = async () => {
        try {
            setIsSubmitting(true);
            const response = await api.post('/user/DailyFeeling/Check-in', {
                moodValue: stressLevel
            });
            
            if (response.status === 200 || response.status === 201) {
                setHasSubmitted(true);
                toast.success("Mood check-in recorded! Stay focused.", {
                    duration: 4000,
                    style: {
                        borderRadius: '12px',
                        background: '#155724',
                        color: '#fff',
                    },
                });
            }
        } catch (error) {
            console.error("Error submitting mood:", error);
            if (error.response?.status === 409) {
                setHasSubmitted(true);
                toast("You've already checked in today. See you tomorrow! ✨", {
                    icon: '📅',
                    style: {
                        borderRadius: '12px',
                        background: '#072445',
                        color: '#fff',
                    },
                });
            } else {
                toast.error("Failed to submit mood. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles["mr-container"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className={styles["mr-main-area"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["mr-content"]}>
                    <HeaderCard
                        title="Mind Rx"
                        subtitle="Manifestation and motivation hub."
                        className={styles["mr-header-card"]}
                        icon={<CardIcon>{<MindIcon />}</CardIcon>}
                    >
                        <div className={styles["mr-slider-section"]}>
                            <label>How are you feeling today</label>
                            <input
                                type="range"
                                className={styles["mr-slider"]}
                                min="0"
                                max="100"
                                value={stressLevel}
                                onChange={(e) => !hasSubmitted && setStressLevel(parseInt(e.target.value))}
                                disabled={hasSubmitted}
                                style={{
                                    '--thumb-icon': `url("${smiley}")`
                                }}
                            />
                            <div className={styles["mr-slider-labels"]}>
                                <span>Stressed</span>
                                <span>Relaxed ({stressLevel}%)</span>
                            </div>
                            {!hasSubmitted && (
                                <button 
                                    onClick={handleSubmitMood}
                                    disabled={isSubmitting}
                                    style={{
                                        marginTop: '15px',
                                        padding: '10px 20px',
                                        backgroundColor: '#00A5B7',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        opacity: isSubmitting ? 0.6 : 1
                                    }}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
                                </button>
                            )}
                        </div>
                    </HeaderCard>

                    <div className={styles["mr-affirmation-card"]} onClick={() => { }}>
                        <h4 className={styles["mr-affirmation-title"]}>Morning Affirmation</h4>
                        <div className={styles["mr-affirmation-content"]}>
                            <div className={styles["mr-icon-box"]}>
                                <CardIcon>{<LotusIcon />}</CardIcon>
                            </div>
                            <span className={styles["mr-affirmation-text"]}>
                                {affirmation}
                            </span>
                        </div>
                    </div>

                    <div className={styles["mr-grid"]}>
                        {navigationCards.map((card) => (
                            <TopicCard
                                key={card.id}
                                title={card.title}
                                subtitle={card.description}
                                icon={<CardIcon>{card.icon}</CardIcon>}
                                onClick={() => navigate(card.path)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};