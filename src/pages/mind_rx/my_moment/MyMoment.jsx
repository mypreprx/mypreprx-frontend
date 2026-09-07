import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { BackButton } from "../../../components/common/BackButton";
import { CardIcon } from "../../../components/common/topic_card/CardIcon";
import { LotusIcon, AudioIcon, BrainIcon, BehavioralHealthIcon } from "../../../components/common/Icons";
import api from "../../../config/axiosInstance";
import toast from "react-hot-toast";
import styles from "./MyMoment.module.css";

const BREATHING_STEPS = [
    { label: "Inhale", duration: 4 },
    { label: "Hold", duration: 4 },
    { label: "Exhale", duration: 4 },
    { label: "Hold", duration: 4 },
];

const MANTRAS = [
    "I don't have to be perfect. I just have to be prepared.",
    "Assess first. Act second. Save the patient.",
    "The answer is in the question — read slowly.",
    "ABCs first. Every single time.",
    "Safe nurse. Critical thinker. That's me.",
];

export const MyMoment = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [affirmation, setAffirmation] = useState("");
    const [affirmationLoading, setAffirmationLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [breathingActive, setBreathingActive] = useState(false);
    const [breathStep, setBreathStep] = useState(0);
    const [breathTimer, setBreathTimer] = useState(BREATHING_STEPS[0].duration);
    const [currentAudioTitle, setCurrentAudioTitle] = useState("");

    const audioRef = useRef(null);
    const breathIntervalRef = useRef(null);
    const breathStepRef = useRef(0);
    const breathTimerRef = useRef(BREATHING_STEPS[0].duration);

    const serverBaseUrl = import.meta.env.PROD
        ? 'https://api.mypreprx.com'
        : 'http://localhost:4001';

    // Fetch AI affirmation
    useEffect(() => {
        const fetch = async () => {
            setAffirmationLoading(true);
            try {
                const res = await api.get('/user/daily-affirmation', { params: { _t: Date.now() } });
                if (res.data?.data?.text) setAffirmation(res.data.data.text);
                else setAffirmation("I am calm, capable and ready to succeed.");
            } catch {
                setAffirmation("I am calm, capable and ready to succeed.");
            } finally {
                setAffirmationLoading(false);
            }
        };
        fetch();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudio();
            stopBreathing();
        };
    }, []);

    // ── AUDIO ──────────────────────────────────────────────
    const getFullAudioUrl = (path) => {
        if (!path) return '';
        const clean = path.replace(/['\"`]/g, '').replace(/\\/g, '/');
        if (clean.startsWith('http')) return clean;
        const trimmed = clean.startsWith('/') ? clean.substring(1) : clean;
        return `${serverBaseUrl}/${trimmed}`;
    };

    const handleToggleAudio = async () => {
        if (isPlaying) { stopAudio(); return; }
        setAudioLoading(true);
        try {
            const res = await api.get('/user/StudyMode/getRandomAudio');
            if (res.data?.data?.url) {
                playAudio(getFullAudioUrl(res.data.data.url), res.data.data.title || "Calming Audio");
            } else {
                toast.error("No audio available. Please add some via the Admin Panel.");
            }
        } catch {
            toast.error("Failed to load audio. Please try again.");
        } finally {
            setAudioLoading(false);
        }
    };

    const playAudio = (url, title) => {
        stopAudio();
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.6;
        audio.play()
            .then(() => { audioRef.current = audio; setIsPlaying(true); setCurrentAudioTitle(title); })
            .catch(() => toast.error("Playback failed. Please interact with the page first."));
    };

    const stopAudio = () => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsPlaying(false);
        setCurrentAudioTitle("");
    };

    // ── BOX BREATHING ───────────────────────────────────────
    const startBreathing = () => {
        breathStepRef.current = 0;
        breathTimerRef.current = BREATHING_STEPS[0].duration;
        setBreathStep(0);
        setBreathTimer(BREATHING_STEPS[0].duration);
        setBreathingActive(true);
        breathIntervalRef.current = setInterval(() => {
            breathTimerRef.current -= 1;
            if (breathTimerRef.current <= 0) {
                const next = (breathStepRef.current + 1) % BREATHING_STEPS.length;
                breathStepRef.current = next;
                breathTimerRef.current = BREATHING_STEPS[next].duration;
                setBreathStep(next);
            }
            setBreathTimer(breathTimerRef.current);
        }, 1000);
    };

    const stopBreathing = () => {
        if (breathIntervalRef.current) { clearInterval(breathIntervalRef.current); breathIntervalRef.current = null; }
        setBreathingActive(false);
        setBreathStep(0);
        setBreathTimer(BREATHING_STEPS[0].duration);
    };

    const currentStep = BREATHING_STEPS[breathStep];

    return (
        <div className={styles["mm-container"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className={styles["mm-main-area"]}>
                <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["mm-content"]}>
                    <div className={styles["mm-back-btn-container"]}>
                        <BackButton to="/mind-rx" />
                    </div>

                    <HeaderCard
                        title="My Moment"
                        subtitle="A quiet space just for you. Breathe, listen, and reset before your session."
                        className={styles["mm-header-card"]}
                    />

                    <div className={styles["mm-grid"]}>
                        {/* AFFIRMATION CARD */}
                        <div className={styles["mm-card"]}>
                            <div className={styles["mm-card-icon-row"]}>
                                <CardIcon><LotusIcon /></CardIcon>
                                <h4 className={styles["mm-card-title"]}>Today's Affirmation</h4>
                            </div>
                            {affirmationLoading ? (
                                <div className={styles["mm-loading"]}>
                                    <div className={styles["mm-dot"]}></div>
                                    <div className={styles["mm-dot"]}></div>
                                    <div className={styles["mm-dot"]}></div>
                                </div>
                            ) : (
                                <p className={styles["mm-affirmation-text"]}>"{affirmation}"</p>
                            )}
                            <span className={styles["mm-hint"]}>AI-generated and refreshed every morning</span>
                        </div>

                        {/* AUDIO CARD */}
                        <div className={styles["mm-card"]}>
                            <div className={styles["mm-card-icon-row"]}>
                                <CardIcon><AudioIcon /></CardIcon>
                                <h4 className={styles["mm-card-title"]}>Calming Audio</h4>
                            </div>
                            <p className={styles["mm-card-desc"]}>
                                Play a soothing subliminal track to relax and reset your mind before or during study.
                            </p>

                            <button
                                className={`${styles["mm-btn"]} ${isPlaying ? styles["mm-btn--stop"] : ""}`}
                                onClick={handleToggleAudio}
                                disabled={audioLoading}
                            >
                                {audioLoading ? (
                                    "Loading..."
                                ) : isPlaying ? (
                                    <>
                                        <PauseIcon /> Pause Audio
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon /> Play Affirmation
                                    </>
                                )}
                            </button>

                            {isPlaying && currentAudioTitle && (
                                <div className={styles["mm-now-playing"]}>
                                    <span className={styles["mm-eq"]}><span></span><span></span><span></span></span>
                                    Now playing: <strong>{currentAudioTitle}</strong>
                                </div>
                            )}
                        </div>

                        {/* BREATHING CARD */}
                        <div className={styles["mm-card"]}>
                            <div className={styles["mm-card-icon-row"]}>
                                <CardIcon><BrainIcon /></CardIcon>
                                <h4 className={styles["mm-card-title"]}>Box Breathing</h4>
                            </div>
                            <p className={styles["mm-card-desc"]}>
                                4-4-4-4 breathing reduces cortisol and sharpens focus in under 60 seconds.
                            </p>

                            {breathingActive && (
                                <div className={styles["mm-breath-wrap"]}>
                                    <div className={`${styles["mm-breath-circle"]} ${styles[`mm-breath--${breathStep}`]}`}>
                                        <span className={styles["mm-breath-label"]}>{currentStep.label}</span>
                                        <span className={styles["mm-breath-count"]}>{breathTimer}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                className={`${styles["mm-btn"]} ${breathingActive ? styles["mm-btn--stop"] : ""}`}
                                onClick={breathingActive ? stopBreathing : startBreathing}
                            >
                                {breathingActive ? (
                                    <><StopIcon /> Stop</>
                                ) : (
                                    <><PlayIcon /> Start Breathing</>
                                )}
                            </button>
                        </div>

                        {/* MANTRAS CARD */}
                        <div className={styles["mm-card"]}>
                            <div className={styles["mm-card-icon-row"]}>
                                <CardIcon><BehavioralHealthIcon /></CardIcon>
                                <h4 className={styles["mm-card-title"]}>Mindset Mantras</h4>
                            </div>
                            <ul className={styles["mm-mantras"]}>
                                {MANTRAS.map((m, i) => (
                                    <li key={i} className={styles["mm-mantra-item"]}>{m}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── LOCAL ICON COMPONENTS ───────────────────────────────────
const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
    </svg>
);

const PauseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
    </svg>
);

const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
    </svg>
);
