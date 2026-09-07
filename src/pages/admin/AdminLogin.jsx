import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminAuthStore from '../../store/adminAuthStore';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { login, isLoading, isAuthenticated } = useAdminAuthStore();

    // If already authenticated (App.jsx verified it), redirect away
    if (isAuthenticated) {
        navigate('/admin/dashboard');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/admin/dashboard');
        } catch {
            // Error handled in store
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Admin Panel</h1>
                    <p className={styles.subtitle}>Sign in to access the dashboard</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
