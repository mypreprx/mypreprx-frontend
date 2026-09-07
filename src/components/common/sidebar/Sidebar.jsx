import { useState, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import ConfirmationModal from "../modal/ConfirmationModal";

import useAuthStore from "../../../store/authStore";

import styles from "./Sidebar.module.css";

import logo from "../../../assets/logo.png";
import {
    SidebarIconHome,
    SidebarIconStudyZone,
    SidebarIconStrategyZone,
    SidebarIconCommunity,
    SidebarIconMindRx,
    SidebarIconProgress,
    SidebarIconMichelleAI,
    SidebarIconLogout
} from "../Icons";

const MENU_ITEMS = [
    {
        path: "/home",
        label: "Home",
        icon: SidebarIconHome,
        end: true
    },
    {
        path: "/study-zone",
        label: "Study Zone",
        icon: SidebarIconStudyZone,
    },
    {
        path: "/strategy-zone",
        label: "Strategy Zone",
        icon: SidebarIconStrategyZone,
    },
    {
        path: "/community",
        label: "Community",
        icon: SidebarIconCommunity,
    },
    {
        path: "/mind-rx",
        label: "Mind Rx",
        icon: SidebarIconMindRx,
    },
    {
        path: "/progress",
        label: "Progress",
        icon: SidebarIconProgress,
    },
    {
        path: "/michelle-ai",
        label: "Michelle Chat",
        icon: SidebarIconMichelleAI,
    }
];

export const Sidebar = ({ sidebarOpen }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        await logout();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    return (
        <Fragment>
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
            <div className={styles["sidebar-header"]}>
                <img src={logo} className={styles["sidebar-logo"]} alt="logo" />
            </div>

            <nav className={styles["sidebar-menu"]}>
                {MENU_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? `${styles["menu-item"]} ${styles.active}`
                                : styles["menu-item"]
                        }
                        end={item.end}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <item.icon />
                        </svg>

                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div
                    className={styles["menu-item"]}
                    onClick={handleLogoutClick}
                    style={{ cursor: 'pointer', marginTop: 'auto' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <SidebarIconLogout />
                    </svg>
                    <span>Logout</span>
                </div>
            </nav>
            </aside>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                message="Are you sure you want to log out?"
            />
        </Fragment>
    );
};
