import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/common/sidebar/Sidebar';
import { Topbar } from '../../../components/common/topbar/Topbar';
import styles from './VideoPlayerPage.module.css';



export const VideoPlayerPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { videoUrl, title } = location.state || {}; // Expect videoUrl and title from state

    useEffect(() => {
        if (!videoUrl) {
            navigate('/study-zone/crash-courses');
        }
    }, [videoUrl, navigate]);

    // Guard clause: Return null only after hooks are declared
    if (!videoUrl) return null;


    return (
        <div className={styles['video-page']}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles['main-area']}>
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles['content']}>
                    <button className={styles['back-btn']} onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#072445" stroke="#072445"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#072445" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path fill="#072445" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></g></svg>
                        Back to Crash Courses
                    </button>

                    {title && <h2 className={styles['video-title']}>{title}</h2>}
                    <div className={styles['video-container']}>
                        <video
                            className={styles['video-player']}
                            src={videoUrl}
                            controls
                            // controlsList="nodownload"
                            preload="metadata"
                            playsInline
                            title={title || "Crash Course Video"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></video>
                    </div>
                </div>
            </main>
        </div>
    );
};
