import React, { useEffect, useState } from 'react';
import useAdminStore from '../../../store/adminStore';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AdminUsersIcon, AdminCoursesIcon, AdminVideosIcon, AdminPDFIcon, AdminAudiosIcon } from '../../../components/common/Icons';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const COLORS = ['#083862', '#0a4f8a', '#1565c0', '#42a5f5', '#90caf9', '#fb8c00', '#f4511e'];

const AdminDashboard = () => {
    const { stats, isLoading, fetchDashboardData } = useAdminStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statsData = [
        {
            key: 'users',
            icon: AdminUsersIcon,
            iconProps: { active: true, width: 36, height: 36 },
            value: stats.totalUsers,
            label: 'Total Users',
        },
        {
            key: 'courses',
            icon: AdminCoursesIcon,
            iconProps: { active: true, width: 33, height: 33 },
            value: stats.totalCourses,
            label: 'Crash Courses',
        },
        {
            key: 'subliminals',
            icon: AdminAudiosIcon,
            iconProps: { active: true, width: 33, height: 33 },
            value: stats.totalSubliminals,
            label: 'Subliminal Audios',
        },
        {
            key: 'videos',
            icon: AdminVideosIcon,
            iconProps: {},
            value: stats.coursesByType?.find(t => t.name === 'Video')?.value || 0,
            label: 'Videos',
        }
    ];

    // if (isLoading && stats.totalUsers === 0) {
    //     return <div className={styles.loading}>Loading dashboard...</div>;
    // }

    // In AdminDashboard.js - update the loading condition
    if (isLoading && Object.keys(stats).length === 0) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2 className={styles.title}>Dashboard</h2>
                <p className={styles.subtitle}>Overview of your admin panel statistics</p>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                {statsData.map((statItem) => {
                    const IconComponent = statItem.icon;
                    return (
                        <div key={statItem.key} className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <IconComponent {...statItem.iconProps} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{statItem.value}</span>
                                <span className={styles.statLabel}>{statItem.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section 1 */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Courses by Topic</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.coursesByTopic}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#083862" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Courses by Type</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.coursesByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats.coursesByType?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section 2 - Subliminals */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Subliminals by Category</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.subliminalsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats.subliminalsByCategory?.map((entry, index) => (
                                        <Cell key={`cell-sub-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Summary</h3>
                    <div className={styles.summaryInfo}>
                        <div className={styles.summaryItem}>
                            <span>Total Users:</span>
                            <strong>{stats.totalUsers}</strong>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Active Courses:</span>
                            <strong>{stats.totalCourses}</strong>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Subliminal Tracks:</span>
                            <strong>{stats.totalSubliminals}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recent Users</h3>
                    <Link to="/admin/users" className={styles.seeAllBtn}>See All</Link>
                </div>
                <div className={styles.recentList}>
                    {stats.recentUsers && stats.recentUsers.length === 0 ? (
                        <p className={styles.noData}>No users found</p>
                    ) : (
                        stats.recentUsers?.map(user => (
                            <div key={user._id} className={styles.recentItem}>
                                <div className={styles.avatar}>
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user.username}</span>
                                    <span className={styles.userEmail}>{user.email}</span>
                                </div>
                                <span className={styles.userDate}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;