import React, { useEffect, useState } from 'react';
import useAdminStore from '../../../store/adminStore';
import styles from './AdminUsers.module.css';

const AdminUsers = () => {
    const { users, isLoading, error, fetchUsers, cancelUserSubscription } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [joinedFilter, setJoinedFilter] = useState('all');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCancelSubscription = async (userId) => {
        const ok = window.confirm('Immediately cancel this user\'s subscription? Premium access will end now. The account will not be deleted.');
        if (!ok) return;
        setCancellingId(userId);
        await cancelUserSubscription(userId);
        setCancellingId(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'online' && user.isOnline) ||
            (statusFilter === 'offline' && !user.isOnline);

        let matchesJoined = true;
        if (joinedFilter !== 'all') {
            const joinedDate = new Date(user.createdAt);
            const now = new Date();
            if (joinedFilter === 'today') {
                matchesJoined = joinedDate.toDateString() === now.toDateString();
            } else if (joinedFilter === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesJoined = joinedDate >= weekAgo;
            } else if (joinedFilter === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                matchesJoined = joinedDate >= monthAgo;
            }
        }

        return matchesSearch && matchesRole && matchesStatus && matchesJoined;
    });


    if (isLoading && users.length === 0) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    if (error && users.length === 0) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Users Management</h2>
                    <p className={styles.description}>View and manage all registered users and admins.</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterWrapper}>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="user">Users</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Status</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>
                    <select
                        value={joinedFilter}
                        onChange={(e) => setJoinedFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Joined Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Subscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.noData}>No accounts found</td>
                            </tr>
                        ) : (
                            filteredUsers.reverse().map((user, index) => (
                                <tr key={user._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span>{user.username}</span>
                                        </div>
                                    </td>

                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`${styles.badge} ${user.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${user.isOnline ? styles.onlineBadge : styles.offlineBadge}`}>
                                            {user.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.badge} ${user.subscription?.premium ? styles.onlineBadge : styles.offlineBadge}`}>
                                            {user.subscription?.status && user.subscription.status !== 'none'
                                                ? user.subscription.status
                                                : 'none'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.subscription?.stripeSubscriptionId &&
                                        !['none', 'canceled'].includes(user.subscription?.status) ? (
                                            <button
                                                type="button"
                                                className={styles.cancelSubBtn}
                                                onClick={() => handleCancelSubscription(user._id)}
                                                disabled={cancellingId === user._id}
                                            >
                                                {cancellingId === user._id ? 'Canceling…' : 'Cancel sub'}
                                            </button>
                                        ) : (
                                            <span className={styles.noData}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;

