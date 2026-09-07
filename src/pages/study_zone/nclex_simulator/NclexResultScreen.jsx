import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";

import styles from "./NclexSimulatorDashboard.module.css";

function ftime(s) {
    s = Math.max(0, Math.round(s));
    let h = Math.floor(s / 3600);
    let m = Math.floor((s % 3600) / 60);
    let x = s % 60;
    return (h ? h + " hr " : "") + (m ? m + " min " : "") + x + " sec";
}

export const NclexResultScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { status, decisionRule, questionsReceived, testingTime } = location.state || { status: 'UNKNOWN', decisionRule: '', questionsReceived: 0, testingTime: 0 };

    useEffect(() => {
        if (!location.state) {
            navigate('/study-zone/nclex-simulator');
        }
    }, [location.state, navigate]);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }} className={styles.app}>
                <header className={styles.topbar}>
                    <div className={styles.brand}>PrepRX NCLEX-RN Simulator</div>
                    <div className={styles.topmeta}>
                        <span>Complete</span>
                    </div>
                </header>

                <main className={styles.container}>
                    <section>
                        <div className={styles.card}>
                            <div className={status === 'PASS' ? styles.resultPass : (status === 'FAIL' ? styles.resultFail : styles.resultFail)}>
                                {status}
                            </div>
                            <h2 style={{ textAlign: 'center' }}>PrepRX NCLEX-RN Simulator Result</h2>
                            
                            <div className={styles.grid}>
                                <div className={styles.stat}>
                                    <div className={styles.n}>{questionsReceived}</div>
                                    <div className={styles.l}>Questions Received</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.n}>{ftime(testingTime)}</div>
                                    <div className={styles.l}>Testing Time</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.n}>{ftime(questionsReceived ? testingTime / questionsReceived : 0)}</div>
                                    <div className={styles.l}>Average per Question</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.n}>{decisionRule || 'Unknown'}</div>
                                    <div className={styles.l}>Decision</div>
                                </div>
                            </div>
                            
                            <p className={styles.footerNote}>
                                This is a PrepRX practice assessment. It is not an official NCLEX result and does not guarantee performance on the licensure examination.
                            </p>
                            <div className={styles.actions} style={{ justifyContent: 'center' }}>
                                <button className={styles.primary} onClick={() => navigate('/study-zone/nclex-simulator')}>
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};
