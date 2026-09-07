import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Topbar.module.css";
import userPic from "../../../assets/user.png";
import useAuthStore from "../../../store/authStore";
import ConfirmationModal from "../modal/ConfirmationModal";
import { getAvatarUrl } from "../../../config/avatarUrl";
import { searchableItems } from "../../../data/searchableItems";
import {
    SidebarIconHome,
    SidebarIconStudyZone,
    SidebarIconStrategyZone,
    SidebarIconCommunity,
    SidebarIconMindRx,
    SidebarIconProgress
} from "../Icons";

export const Topbar = ({ pageTitle, setSidebarOpen, sidebarOpen }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuthStore();

    const [panelOpen, setPanelOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const panelRef = useRef(null);
    const closeTimerRef = useRef(null);
    const suggestionsCloseTimerRef = useRef(null);

    const ANIM_MS = 280; // must match CSS animation duration

    const closePanel = () => {
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
            setPanelOpen(false);
            setIsClosing(false);
        }, ANIM_MS);
    };

    const suggestions = useMemo(() => {
        const term = searchQuery.trim().toLowerCase();
        if (!term) return [];

        return searchableItems
            .filter((item) => {
                const titleMatch = item.title.toLowerCase().includes(term);
                const descMatch = item.description.toLowerCase().includes(term);
                const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(term));
                return titleMatch || descMatch || tagMatch;
            })
            .slice(0, 6);
    }, [searchQuery]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(true);
    };

    const handleSearchInputFocus = () => {
        clearTimeout(suggestionsCloseTimerRef.current);
        setShowSuggestions(true);
    };

    const handleSearchInputBlur = () => {
        suggestionsCloseTimerRef.current = setTimeout(() => {
            setShowSuggestions(false);
        }, 150);
    };

    const selectSuggestion = (item) => {
        setSearchQuery(item.title);
        setShowSuggestions(false);
        navigate(item.path);
    };

    const togglePanel = () => {
        if (panelOpen) {
            closePanel();
        } else {
            setPanelOpen(true);
        }
    };

    /* Close panel on outside click */
    useEffect(() => {
        if (!panelOpen) return;
        const onDown = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                closePanel();
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => {
            document.removeEventListener("mousedown", onDown);
            clearTimeout(closeTimerRef.current);
            clearTimeout(suggestionsCloseTimerRef.current);
        };
    }, [panelOpen]);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        await logout();
        setIsLogoutModalOpen(false);
        window.location.href = "/login";
    };

    const avatarSrc = getAvatarUrl(user, userPic);

    return (
        <>
            {/* ─────────── TOPBAR ─────────── */}
            <header className={styles.topbar}>
                {/* LEFT */}
                <div className={styles["topbar-left"]}>
                    {/* HAMBURGER */}
                    <span className={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        ☰
                    </span>
                    {pageTitle === "Home" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconHome />
                        </svg>
                    )}
                    {pageTitle === "Study Zone" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconStudyZone />
                        </svg>
                    )}
                    {pageTitle === "Strategy Zone" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconStrategyZone />
                        </svg>
                    )}
                    {pageTitle === "Community" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconCommunity />
                        </svg>
                    )}
                    {pageTitle === "Mind RX" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconMindRx />
                        </svg>
                    )}
                    {pageTitle === "Progress" && (
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <SidebarIconProgress />
                        </svg>
                    )}
                    <h2>{pageTitle}</h2>
                </div>

                {/* RIGHT */}
                <div className={styles["topbar-right"]}>
                    <div className={styles["search-box"]}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchQuery.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                }
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search topics, courses..."
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onFocus={handleSearchInputFocus}
                                onBlur={handleSearchInputBlur}
                            />
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className={styles.suggestions}>
                                {suggestions.map((item, index) => (
                                    <button
                                        key={`${item.title}-${index}`}
                                        type="button"
                                        className={styles["suggestion-item"]}
                                        onMouseDown={() => selectSuggestion(item)}
                                    >
                                        <span className={styles["suggestion-title"]}>{item.title}</span>
                                        <span className={styles["suggestion-subtitle"]}>{item.description}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div 
                        className={styles["profile-area"]} 
                        onClick={togglePanel}
                        title="Account options"
                    >
                        <img src={avatarSrc} className={styles["profile-img"]} alt="user" />
                        <span className={styles["profile-name"]}>{user?.username || "Guest"}</span>
                    </div>
                </div>

                {sidebarOpen && (
                    <div className={styles["sidebar-overlay"]} onClick={() => setSidebarOpen(false)} />
                )}
            </header>

            {/* ─────────── RIGHT PANEL ─────────── */}
            {panelOpen && (
                <div
                    className={`${styles["rp-overlay"]} ${isClosing ? styles["rp-overlay--closing"] : ""}`}
                    onClick={closePanel}
                >
                    <aside
                        ref={panelRef}
                        className={`${styles["rp-panel"]} ${isClosing ? styles["rp-panel--closing"] : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile close button — only visible when panel is full-width */}
                        <button
                            className={styles["rp-close-btn"]}
                            onClick={closePanel}
                            aria-label="Close panel"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* View Profile card */}
                        <div className={styles["rp-profile-card"]}>
                            <img src={avatarSrc} className={styles["rp-profile-card-avatar"]} alt="user" />
                            <div className={styles["rp-profile-card-info"]}>
                                <p className={styles["rp-profile-card-name"]}>{user?.username || "Guest"}</p>
                                <p className={styles["rp-profile-card-email"]}>{user?.email || ""}</p>
                            </div>
                            <button
                                className={styles["rp-view-profile-btn"]}
                                onClick={() => { closePanel(); navigate("/profile"); }}
                            >
                                View Profile
                            </button>
                        </div>

                        {/* Menu items — exact same as Profile rightbar */}
                        <div className={styles["rp-menu"]}>

                            <div className={styles["rp-item"]} onClick={() => { closePanel(); navigate("/mind-rx/manifestation-calendar"); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6 4.00012H18C19.0609 4.00012 20.0783 4.42155 20.8284 5.17169C21.5786 5.92184 22 6.93926 22 8.00012V18.0001C22 19.061 21.5786 20.0784 20.8284 20.8285C20.0783 21.5787 19.0609 22.0001 18 22.0001H6C4.93913 22.0001 3.92172 21.5787 3.17157 20.8285C2.42143 20.0784 2 19.061 2 18.0001V8.00012C2 6.93926 2.42143 5.92184 3.17157 5.17169C3.92172 4.42155 4.93913 4.00012 6 4.00012ZM6 6.00012C5.46957 6.00012 4.96086 6.21084 4.58579 6.58591C4.21071 6.96098 4 7.46969 4 8.00012V18.0001C4 18.5306 4.21071 19.0393 4.58579 19.4143C4.96086 19.7894 5.46957 20.0001 6 20.0001H18C18.5304 20.0001 19.0391 19.7894 19.4142 19.4143C19.7893 19.0393 20 18.5306 20 18.0001V8.00012C20 7.46969 19.7893 6.96098 19.4142 6.58591C19.0391 6.21084 18.5304 6.00012 18 6.00012H6Z" fill="white" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H20C20.2652 9 20.5196 9.10536 20.7071 9.29289C20.8946 9.48043 21 9.73478 21 10C21 10.2652 20.8946 10.5196 20.7071 10.7071C20.5196 10.8946 20.2652 11 20 11H4C3.73478 11 3.48043 10.8946 3.29289 10.7071C3.10536 10.5196 3 10.2652 3 10ZM8 2C8.26522 2 8.51957 2.10536 8.70711 2.29289C8.89464 2.48043 9 2.73478 9 3V7C9 7.26522 8.89464 7.51957 8.70711 7.70711C8.51957 7.89464 8.26522 8 8 8C7.73478 8 7.48043 7.89464 7.29289 7.70711C7.10536 7.51957 7 7.26522 7 7V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2ZM16 2C16.2652 2 16.5196 2.10536 16.7071 2.29289C16.8946 2.48043 17 2.73478 17 3V7C17 7.26522 16.8946 7.51957 16.7071 7.70711C16.5196 7.89464 16.2652 8 16 8C15.7348 8 15.4804 7.89464 15.2929 7.70711C15.1054 7.51957 15 7.26522 15 7V3C15 2.73478 15.1054 2.48043 15.2929 2.29289C15.4804 2.10536 15.7348 2 16 2Z" fill="white" />
                                    <path d="M8 13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13C6 12.7348 6.10536 12.4804 6.29289 12.2929C6.48043 12.1054 6.73478 12 7 12C7.26522 12 7.51957 12.1054 7.70711 12.2929C7.89464 12.4804 8 12.7348 8 13ZM8 17C8 17.2652 7.89464 17.5196 7.70711 17.7071C7.51957 17.8946 7.26522 18 7 18C6.73478 18 6.48043 17.8946 6.29289 17.7071C6.10536 17.5196 6 17.2652 6 17C6 16.7348 6.10536 16.4804 6.29289 16.2929C6.48043 16.1054 6.73478 16 7 16C7.26522 16 7.51957 16.1054 7.70711 16.2929C7.89464 16.4804 8 16.7348 8 17ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM18 13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14C16.7348 14 16.4804 13.8946 16.2929 13.7071C16.1054 13.5196 16 13.2652 16 13C16 12.7348 16.1054 12.4804 16.2929 12.2929C16.4804 12.1054 16.7348 12 17 12C17.2652 12 17.5196 12.1054 17.7071 12.2929C17.8946 12.4804 18 12.7348 18 13ZM18 17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18C16.7348 18 16.4804 17.8946 16.2929 17.7071C16.1054 17.5196 16 17.2652 16 17C16 16.7348 16.1054 16.4804 16.2929 16.2929C16.4804 16.1054 16.7348 16 17 16C17.2652 16 17.5196 16.1054 17.7071 16.2929C17.8946 16.4804 18 16.7348 18 17Z" fill="white" />
                                </svg>
                                Manifestation Calendar
                            </div>

                            <div className={styles["rp-item"]} onClick={() => { closePanel(); navigate("/study-zone"); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.75 2.25C18.5808 2.26359 16.2248 2.7 14.52 3.45422C13.2478 4.01672 12.75 4.44234 12.75 5.88422V21C14.6986 19.2422 16.4278 18.75 23.25 18.75V2.25H21.75ZM2.25 2.25C5.41922 2.26359 7.77516 2.7 9.48 3.45422C10.7522 4.01672 11.25 4.44234 11.25 5.88422V21C9.30141 19.2422 7.57219 18.75 0.75 18.75V2.25H2.25Z" fill="white" />
                                </svg>
                                Study Zone
                            </div>

                            <div className={styles["rp-item"]} onClick={() => { closePanel(); navigate("/flagged-questions"); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.5 22.5H3V1.5H21L16.65 8.25L21 15H4.5V22.5Z" fill="white" />
                                </svg>
                                Flagged Questions
                            </div>

                            <div className={styles["rp-item"]} onClick={() => { closePanel(); navigate("/flashcard"); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.6 21.2H2.4C1.76348 21.2 1.15303 20.9471 0.702944 20.4971C0.252856 20.047 0 19.4365 0 18.8V4.4C0 3.76348 0.252856 3.15303 0.702944 2.70294C1.15303 2.25286 1.76348 2 2.4 2H21.6C22.2365 2 22.847 2.25286 23.2971 2.70294C23.7471 3.15303 24 3.76348 24 4.4V18.8C24 19.4365 23.7471 20.047 23.2971 20.4971C22.847 20.9471 22.2365 21.2 21.6 21.2ZM3.6 12.8V15.2H16.8V12.8H3.6ZM3.6 8V10.4H20.4V8H3.6Z" fill="white" />
                                </svg>
                                Flash Cards
                            </div>

                            <div className={styles["rp-item"]} onClick={() => { closePanel(); navigate("/resources-rx"); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_tb_resources)">
                                        <path d="M16.409 0.751488C18.136 0.713988 19.828 1.38499 21.2215 2.77799C22.615 4.17099 23.2855 5.86299 23.248 7.59049C23.211 9.30949 22.4745 11.002 21.1655 12.425C19.937 13.7549 18.6834 15.0615 17.4055 16.344L7.65549 6.59399C9.20949 5.05149 10.5055 3.81749 11.5745 2.83399C12.9975 1.52499 14.69 0.788988 16.409 0.751488ZM6.59499 7.65499C5.3167 8.93781 4.06281 10.2447 2.83399 11.575C1.52499 12.9975 0.788988 14.69 0.751488 16.409C0.713988 18.136 1.38499 19.828 2.77799 21.2215C4.17099 22.615 5.86299 23.2855 7.59049 23.248C9.30949 23.211 11.002 22.4745 12.425 21.1655C13.7553 19.9367 15.0622 18.6828 16.345 17.4045L6.59499 7.65499Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_tb_resources">
                                            <rect width="24" height="24" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                Resources Rx
                            </div>

                            <div className={styles["rp-item"]}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.9996 17.4001C11.3962 17.4002 10.815 17.1731 10.3715 16.7639C9.92811 16.3547 9.65508 15.7935 9.60681 15.1921C8.00623 14.6255 6.65727 13.5117 5.79804 12.0473C4.93881 10.5829 4.62456 8.86199 4.91076 7.18839C5.19696 5.5148 6.06522 3.99613 7.36226 2.90045C8.6593 1.80477 10.3017 1.20255 11.9996 1.20007C13.8055 1.19981 15.5455 1.87818 16.8747 3.10066C18.2039 4.32315 19.0251 6.00048 19.1756 7.80007C19.1806 7.87813 19.1693 7.95638 19.1425 8.02985C19.1156 8.10331 19.0738 8.17039 19.0196 8.22682C18.9655 8.28324 18.9001 8.32778 18.8278 8.35761C18.7555 8.38744 18.6778 8.4019 18.5996 8.40007C18.4389 8.39605 18.2854 8.3324 18.1689 8.22152C18.0525 8.11063 17.9815 7.96042 17.9696 7.80007C17.8627 6.73908 17.475 5.72573 16.8464 4.86436C16.2178 4.00299 15.3709 3.32472 14.393 2.89938C13.4152 2.47404 12.3416 2.31699 11.2829 2.44441C10.2242 2.57182 9.21852 2.9791 8.3695 3.62431C7.52047 4.26952 6.85874 5.12935 6.45243 6.11527C6.04612 7.1012 5.90991 8.1776 6.05782 9.23366C6.20573 10.2897 6.63242 11.2873 7.29396 12.1236C7.9555 12.96 8.82799 13.6049 9.82161 13.9921C10.0024 13.6014 10.2849 13.2666 10.6396 13.0226C10.9943 12.7787 11.408 12.6346 11.8375 12.6056C12.267 12.5765 12.6964 12.6634 13.0807 12.8573C13.4651 13.0512 13.7901 13.3449 14.022 13.7077C14.2538 14.0704 14.3838 14.4888 14.3983 14.919C14.4128 15.3492 14.3114 15.7754 14.1046 16.153C13.8978 16.5305 13.5933 16.8455 13.223 17.0649C12.8526 17.2843 12.4301 17.4001 11.9996 17.4001ZM6.01041 14.4001H6.11961C6.82804 15.095 7.65401 15.6589 8.55921 16.0657C8.82524 16.9434 9.41624 17.6865 10.2116 18.1433C11.0069 18.6 11.9466 18.736 12.8388 18.5235C13.731 18.3109 14.5084 17.7658 15.0123 16.9995C15.5163 16.2332 15.7087 15.3035 15.5504 14.4001H17.9996C18.6361 14.4001 19.2466 14.6529 19.6967 15.103C20.1468 15.5531 20.3996 16.1636 20.3996 16.8001C20.3996 18.8293 19.4 20.3593 17.8376 21.3565C16.2992 22.3369 14.2256 22.8001 11.9996 22.8001C9.77361 22.8001 7.70001 22.3369 6.16161 21.3565C4.59921 20.3605 3.59961 18.8281 3.59961 16.8001C3.59961 15.4645 4.68321 14.4001 6.01041 14.4001ZM16.7996 8.40007C16.7999 9.21204 16.5941 10.0108 16.2017 10.7216C15.8092 11.4325 15.2429 12.0321 14.5556 12.4645C14.2209 12.1271 13.8227 11.8594 13.384 11.6767C12.9453 11.494 12.4748 11.4 11.9996 11.4001C11.5244 11.4 11.0539 11.494 10.6152 11.6767C10.1765 11.8594 9.77831 12.1271 9.44361 12.4645C8.53211 11.8913 7.83982 11.0282 7.47801 10.0141C7.29343 9.496 7.19926 8.95005 7.19961 8.40007C7.19961 7.12703 7.70532 5.90614 8.6055 5.00596C9.50567 4.10579 10.7266 3.60007 11.9996 3.60007C13.2726 3.60007 14.4935 4.10579 15.3937 5.00596C16.2939 5.90614 16.7996 7.12703 16.7996 8.40007Z" fill="white" />
                                </svg>
                                Help &amp; Support
                            </div>

                            <div className={styles["rp-item"]}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M13.803 5.33307C13.803 3.49307 15.303 2.00007 17.151 2.00007C17.5898 1.99889 18.0245 2.08418 18.4303 2.25106C18.8361 2.41794 19.2051 2.66315 19.5161 2.97268C19.8271 3.2822 20.0741 3.64997 20.2429 4.05498C20.4117 4.45999 20.4991 4.89429 20.5 5.33307C20.5 7.17407 19 8.66707 17.151 8.66707C16.7076 8.6674 16.2686 8.5797 15.8593 8.40907C15.4501 8.23845 15.0788 7.98828 14.767 7.67307L10.132 10.8291C10.2608 11.4721 10.1975 12.1388 9.95 12.7461L15.032 16.0861C15.6307 15.5982 16.3797 15.3322 17.152 15.3331C17.5908 15.332 18.0255 15.4174 18.4312 15.5844C18.837 15.7514 19.2059 15.9968 19.5168 16.3064C19.8277 16.616 20.0746 16.9838 20.2433 17.3889C20.412 17.794 20.4992 18.2283 20.5 18.6671C20.5 20.5071 19 22.0001 17.151 22.0001C16.7123 22.0011 16.2777 21.9157 15.872 21.7488C15.4663 21.5819 15.0975 21.3366 14.7866 21.0271C14.4757 20.7176 14.2288 20.3499 14.06 19.9449C13.8913 19.54 13.8039 19.1058 13.803 18.6671C13.8022 18.1997 13.9007 17.7375 14.092 17.3111L9.05 14.0001C8.43922 14.5307 7.65706 14.8223 6.848 14.8211C6.40922 14.8221 5.97453 14.7367 5.56877 14.5697C5.16301 14.4027 4.79413 14.1574 4.48321 13.8478C4.17229 13.5381 3.92543 13.1703 3.75673 12.7652C3.58802 12.3602 3.50079 11.9259 3.5 11.4871C3.50092 11.0484 3.58825 10.6142 3.75701 10.2092C3.92578 9.80427 4.17266 9.43654 4.48356 9.12703C4.79447 8.81752 5.1633 8.57229 5.569 8.40535C5.97469 8.23841 6.4093 8.15302 6.848 8.15407C7.912 8.15407 8.858 8.64707 9.471 9.41507L13.964 6.35607C13.8568 6.02567 13.8025 5.68042 13.803 5.33307Z" fill="white" />
                                </svg>
                                Share App
                            </div>

                            <div className={`${styles["rp-item"]} ${styles["rp-item--logout"]}`} onClick={handleLogoutClick} style={{ cursor: "pointer" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.796 2.24393C12.653 1.82593 14 3.42193 14 4.99993V18.9999C14 20.5779 12.653 22.1739 10.796 21.7559C6.334 20.7519 3 16.7659 3 11.9999C3 7.23393 6.334 3.24793 10.796 2.24393ZM16.293 8.29293C16.4805 8.10546 16.7348 8.00014 17 8.00014C17.2652 8.00014 17.5195 8.10546 17.707 8.29293L20.707 11.2929C20.8945 11.4805 20.9998 11.7348 20.9998 11.9999C20.9998 12.2651 20.8945 12.5194 20.707 12.7069L17.707 15.7069C17.5184 15.8891 17.2658 15.9899 17.0036 15.9876C16.7414 15.9853 16.4906 15.8802 16.3052 15.6947C16.1198 15.5093 16.0146 15.2585 16.0123 14.9963C16.01 14.7341 16.1108 14.4815 16.293 14.2929L17.586 12.9999H9C8.73478 12.9999 8.48043 12.8946 8.29289 12.707C8.10536 12.5195 8 12.2651 8 11.9999C8 11.7347 8.10536 11.4804 8.29289 11.2928C8.48043 11.1053 8.73478 10.9999 9 10.9999H17.586L16.293 9.70693C16.1055 9.5194 16.0002 9.26509 16.0002 8.99993C16.0002 8.73476 16.1055 8.48046 16.293 8.29293Z" fill="white" />
                                </svg>
                                Log out
                            </div>
                        </div>

                        {/* Search history */}
                        <div className={styles["rp-search-history"]}>
                            <h4>search history</h4>
                            <div className={styles["rp-history-card"]}>
                                <p>Search history</p>
                                <span>Med Surg</span>
                                <span>Pediatrics</span>
                                <span>Pharmacology</span>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Logout confirmation modal */}
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                message="Are you sure you want to log out?"
            />
        </>
    );
};