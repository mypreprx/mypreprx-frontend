import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VisualizationRoom.module.css";
import { BackButton } from "../../../components/common/BackButton";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import Modal from "../../../components/common/modal/Modal";
import api from "../../../config/axiosInstance";
import toast from "react-hot-toast";
import defaultThumb from '../../../assets/visual1.jpg';

const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" fill="white" />
    </svg>
);

const getFullMediaUrl = (path) => {
    // Fallback to default asset when thumbnail isn't provided
    if (!path || path === 'default_visualization.jpg') {
        return defaultThumb;
    }
    const cleanPath = path.replace(/['"`]/g, '').replace(/\\/g, '/');

    if (cleanPath.startsWith('http')) return cleanPath;

    const serverBaseUrl = import.meta.env.PROD
        ? 'https://api.mypreprx.com'
        : 'http://localhost:4001';

    const uploadIndex = cleanPath.indexOf('uploads/');
    if (uploadIndex !== -1) {
        const relativePath = cleanPath.substring(uploadIndex);
        return `${serverBaseUrl}/${relativePath}`;
    }

    const filename = cleanPath.split('/').pop();
    return `${serverBaseUrl}/uploads/${filename}`;
};

export const VisualizationRoom = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [visuals, setVisuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVisual, setSelectedVisual] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/user/getAllVisualization');
                if (res.data?.success) {
                    setVisuals(res.data.data || []);
                } else {
                    toast.error(res.data?.message || 'Failed to load visualizations');
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load visualizations');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const openPlayer = (visual) => {
        setSelectedVisual(visual);
    };

    const closePlayer = () => {
        setSelectedVisual(null);
    };

    const getCardImageUrl = (visual) => {
        const thumbUrl = getFullMediaUrl(visual.thumbnailUrl);
        return thumbUrl;
    };

    return (
        <div className={styles["vr-container"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className={styles["vr-main-area"]}>
                <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["vr-content"]}>
                    {/* BACK BUTTON */}
                    <div className={styles['back-btn-container']}>
                        <BackButton to="/mind-rx" />
                    </div>

                    <HeaderCard
                        title="Visualization Room"
                        subtitle="Short guided mental journeys to calm your mind."
                        className={styles["vr-header-card"]}
                    />

                    {loading ? (
                        <div className={styles.loadingMessage}>Loading visualizations...</div>
                    ) : visuals.length === 0 ? (
                        <div className={styles.loadingMessage}>No visualizations found. Check back later!</div>
                    ) : (
                        <div className={styles["vr-grid"]}>
                            {visuals.map((visual) => (
                                <div
                                    key={visual._id}
                                    className={styles["vr-card"]}
                                >
                                    <img
                                        src={getCardImageUrl(visual)}
                                        alt={visual.title}
                                        className={styles["vr-card-image"]}
                                    />
                                    <div className={styles["vr-card-overlay"]}></div>
                                    <div className={styles["vr-card-content"]}>
                                        <h4 className={styles["vr-card-title"]}>{visual.title}</h4>
                                        <p className={styles["vr-meta"]}>
                                            <span style={{ color: "#00A5B7" }}>{visual.subtitle}</span> &nbsp; Duration: {visual.duration}
                                        </p>
                                        <p className={styles["vr-desc"]}>{visual.description}</p>

                                        <div className={styles["vr-play-btn"]} onClick={() => openPlayer(visual)}>
                                            <PlayIcon />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Modal isOpen={!!selectedVisual} onClose={closePlayer} title={selectedVisual?.title} maxWidth="850px">
                        {selectedVisual && (
                            <div className={styles.playerWrapper}>
                                {(() => {
                                    const mediaUrl = getFullMediaUrl(selectedVisual.videoUrl);
                                    const isAudio = /\.(mp3|wav|m4a|aac|ogg|flac)(\?.*)?$/i.test(mediaUrl);
                                    return isAudio ? (
                                        <audio controls className={styles.videoPlayer}>
                                            <source src={mediaUrl} />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        <video
                                            controls
                                            src={mediaUrl}
                                            className={styles.videoPlayer}
                                            poster={selectedVisual.thumbnailUrl && !selectedVisual.thumbnailUrl.includes('default_visualization.jpg') ? getFullMediaUrl(selectedVisual.thumbnailUrl) : undefined}
                                        />
                                    );
                                })()}
                                <p className={styles.playerSubtitle}>{selectedVisual.subtitle}</p>
                                <p className={styles.playerDescription}>{selectedVisual.description}</p>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};
