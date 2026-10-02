import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAdminAuthStore from '../../store/adminAuthStore';
import { AdminUsersIcon, AdminCoursesIcon, AdminDashboardIcon, AdminLogoutIcon, AdminAudiosIcon, AdminVideosIcon, AdminPromoIcon } from '../../components/common/Icons';
import styles from './AdminLayout.module.css';



const AdminLayout = () => {
    const { logout, admin } = useAdminAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: AdminDashboardIcon, iconProps: { width: 22, height: 22 } },
        { label: 'Analytics', path: '/admin/analytics', icon: AdminDashboardIcon, iconProps: { width: 22, height: 22 } },
        { label: 'Users', path: '/admin/users', icon: AdminUsersIcon, iconProps: { width: 22, height: 22 } },
        { label: 'Promo Codes', path: '/admin/promo-codes', icon: AdminPromoIcon, iconProps: { width: 20, height: 20 } },
        { label: 'Crash Courses', path: '/admin/crash-courses', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'Visualization Room', path: '/admin/visualizations', icon: AdminVideosIcon, iconProps: { width: 20, height: 20 } },
        { label: 'Subliminal Audios', path: '/admin/subliminal-audio', icon: AdminAudiosIcon, iconProps: { width: 20, height: 20 } },
        { label: 'Priority Practice', path: '/admin/priority-practice', icon: AdminAudiosIcon, iconProps: { width: 20, height: 20 } },
        { label: 'Generate Cases', path: '/admin/priority-practice/generate', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'AI Topics', path: '/admin/topics', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'BehaviorRx - Case Studies', path: '/admin/behavioral-health?category=Case Studies', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'BehaviorRx - Psych Medication', path: '/admin/behavioral-health?category=Psych Medication', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'BehaviorRx - Cultural Sensitivity', path: '/admin/behavioral-health?category=Psych Med, Cultural Sensitivity', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
        { label: 'BehaviorRx - Therapeutic', path: '/admin/behavioral-health?category=Therapeutic Communication', icon: AdminCoursesIcon, iconProps: { width: 20, height: 20 } },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className={styles.adminContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    {/* Hamburger Icon */}
                    <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className={styles.headerRight}>
                    {admin && <span className={styles.adminName}>{admin.username}</span>}
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                        <AdminLogoutIcon />
                    </button>
                </div>
            </header>

            {/* Sidebar Overlay/Backdrop (Click outside to close) */}
            {isSidebarOpen && (
                <div className={styles.backdrop} onClick={closeSidebar}></div>
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.logo}>Admin Panel</h2>
                    {/* Close Icon */}
                    <button className={styles.closeBtn} onClick={closeSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        const currentFullPath = location.pathname + location.search;
                        const isActiveCustom = currentFullPath === item.path || location.pathname === item.path;
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                onClick={closeSidebar} // Optional: Close sidebar when a link is clicked
                                className={({ isActive }) => `${styles.navItem} ${isActiveCustom || isActive ? styles.activeNavItem : ''}`}
                            >
                                <span className={styles.navIcon}>
                                    <IconComponent active={isActiveCustom || (location.pathname === item.path)} {...item.iconProps} />
                                </span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;