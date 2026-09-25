import { useState, Fragment } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

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
    SidebarIconSubscriptions,
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

const SUBSCRIPTION_ITEMS = [
    { path: "/subscriptions/manage", label: "Manage Subscription" },
    { path: "/subscriptions/invoices", label: "View Invoices" },
    { path: "/subscriptions/payment-method", label: "Update Payment Method" },
    { path: "/subscriptions/upgrade", label: "Upgrade Plan" },
    { path: "/subscriptions/cancel", label: "Cancel Subscription" },
];

export const Sidebar = ({ sidebarOpen }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);
    const [wasSubscriptionsActive, setWasSubscriptionsActive] = useState(
        SUBSCRIPTION_ITEMS.some((item) => location.pathname.startsWith(item.path))
    );

    const isSubscriptionsActive = SUBSCRIPTION_ITEMS.some((item) =>
        location.pathname.startsWith(item.path)
    );

    if (wasSubscriptionsActive !== isSubscriptionsActive) {
        setWasSubscriptionsActive(isSubscriptionsActive);
        if (isSubscriptionsActive) {
            setSubscriptionsOpen(true);
        }
    }

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
                    className={`${styles["menu-item"]} ${isSubscriptionsActive ? styles.active : ""}`}
                    onClick={() => setSubscriptionsOpen((open) => !open)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSubscriptionsOpen((open) => !open);
                        }
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <SidebarIconSubscriptions />
                    </svg>
                    <span>Subscriptions</span>
                    <svg
                        className={`${styles["dropdown-arrow"]} ${subscriptionsOpen ? styles["dropdown-arrow-open"] : ""}`}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {subscriptionsOpen && (
                    <div className={styles.submenu}>
                        {SUBSCRIPTION_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles["submenu-item"]} ${styles.active}`
                                        : styles["submenu-item"]
                                }
                            >
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                )}

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
