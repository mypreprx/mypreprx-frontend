import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../config/axiosInstance';
import styles from './AdminBehavioralHealth.module.css';

export const AdminBehavioralHealth = () => {
    const location = useLocation();
    
    // Parse category from URL query string
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');

    const [topic, setTopic] = useState(categoryParam || 'Medication');
    const [nofCases, setNofCases] = useState(5);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (categoryParam) {
            setTopic(categoryParam);
        }
    }, [categoryParam]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/admin/behavioral/generateBank', {
                topic,
                nofCases
            });
            if (response.data.success) {
                toast.success(`Successfully generated ${response.data.count} case studies for ${topic}!`);
            } else {
                toast.error(response.data.message || 'Generation failed');
            }
        } catch (error) {
            console.error('Error generating behavioral cases:', error);
            toast.error(error.response?.data?.message || 'Error generating cases');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>BehaviorRx (Clinical Reasoning)</h1>
                <p className={styles.subtitle}>Batch generate Unfolding Case Studies using OpenAI.</p>
            </div>

            <div className={styles.formCard}>
                <form onSubmit={handleGenerate} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="topic">Case Study Topic / Module</label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            className={styles.input}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="nofCases">Number of Cases to Generate</label>
                        <input
                            type="number"
                            id="nofCases"
                            value={nofCases}
                            onChange={(e) => setNofCases(Number(e.target.value))}
                            min="1"
                            max="20"
                            className={styles.input}
                            required
                        />
                        <span className={styles.helperText}>Each case includes a clinical scenario and 3-4 unfolding questions.</span>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn} 
                        disabled={loading}
                    >
                        {loading ? 'Generating Cases (This may take a minute)...' : 'Generate Case Studies'}
                    </button>
                </form>
            </div>
        </div>
    );
};
