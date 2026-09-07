import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../config/axiosInstance";

import { Topbar } from "../../../components/common/topbar/Topbar";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import GeneratingModal from "../../../components/common/GeneratingModal";
import ConfirmationModal from "../../../components/common/modal/ConfirmationModal";

import styles from "./NclexSimulatorDashboard.module.css";

function ftime(s) {
    s = Math.max(0, Math.round(s));
    let h = Math.floor(s / 3600);
    let m = Math.floor((s % 3600) / 60);
    let x = s % 60;
    return (h ? h + " hr " : "") + (m ? m + " min " : "") + x + " sec";
}

export const NclexSimulatorDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [progress, setProgress] = useState({started:0,completed:0,passes:0,fails:0,abandoned:0,qrecv:0,qans:0,testsec:0,actsec:0,hist:[]});
    const navigate = useNavigate();

    useEffect(() => {
        const storedProg = JSON.parse(localStorage.getItem("prx") || 'null');
        if (storedProg) {
            setProgress(storedProg);
        }
    }, []);

    const rate = progress.completed ? (progress.passes / progress.completed * 100).toFixed(1) + "%" : "—";
    const avgq = progress.completed ? Math.round(progress.hist.filter(x => x.result !== "ABANDONED").reduce((a, x) => a + x.q, 0) / progress.completed) : "—";
    const avgt = progress.completed ? ftime(progress.testsec / progress.completed) : "—";
    const avgr = progress.qans ? ftime(progress.actsec / progress.qans) : "—";

    const handleStartSimulator = async () => {
        try {
            setIsGenerating(true);
            const response = await api.post('/user/start-nclex-simulation');
            
            if (response.data.success) {
                // Update started count
                const newProg = { ...progress, started: progress.started + 1 };
                localStorage.setItem("prx", JSON.stringify(newProg));
                
                navigate('/study-zone/nclex-simulator/exam', {
                    state: {
                        attemptId: response.data.attemptId,
                        nextItem: response.data.nextItem,
                        currentQuestionNumber: response.data.currentQuestionNumber
                    }
                });
            }
        } catch (error) {
            console.error("Failed to start simulator", error);
            toast.error(error.response?.data?.message || "Failed to start simulation. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        localStorage.removeItem("prx");
        setProgress({started:0,completed:0,passes:0,fails:0,abandoned:0,qrecv:0,qans:0,testsec:0,actsec:0,hist:[]});
        setIsResetModalOpen(false);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }} className={styles.app}>
                <header className={styles.topbar}>
                    <div className={styles.brand}>PrepRX NCLEX-RN Simulator</div>
                    <div className={styles.topmeta}>
                        <span>Dashboard</span>
                    </div>
                </header>

                <main className={styles.container}>
                    <div className={styles.card}>
                        <h1>NCLEX-RN Simulator</h1>
                        <p className={styles.sub}>
                            A scored, NCLEX-style computerized adaptive practice exam. Each test contains 85–150 scored questions, 
                            three six-question clinical judgment case studies, and a five-hour time limit.
                        </p>
                        <div className={styles.notice}>
                            This PrepRX simulator is not an official NCLEX examination and does not guarantee licensure results.
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.primary} onClick={handleStartSimulator} disabled={isGenerating}>
                                {isGenerating ? "Initializing AI Engine..." : "Start New Simulator"}
                            </button>
                            <button className={styles.secondary} onClick={handleReset}>
                                Reset Local Progress
                            </button>
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.stat}>
                            <div className={styles.n}>{progress.completed}</div>
                            <div className={styles.l}>Completed Tests</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{progress.passes}</div>
                            <div className={styles.l}>Passes</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{progress.fails}</div>
                            <div className={styles.l}>Fails</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{rate}</div>
                            <div className={styles.l}>PrepRX Pass Rate</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{progress.qrecv}</div>
                            <div className={styles.l}>Total Questions</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{avgq}</div>
                            <div className={styles.l}>Avg. Questions/Test</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{avgt}</div>
                            <div className={styles.l}>Avg. Test Duration</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.n}>{avgr}</div>
                            <div className={styles.l}>Avg. Time/Question</div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2>Test History</h2>
                        <div className={styles.tableWrap}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Result</th>
                                        <th>Questions</th>
                                        <th>Testing Time</th>
                                        <th>Avg./Question</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {progress.hist.length > 0 ? (
                                        [...progress.hist].reverse().map((x, i) => (
                                            <tr key={i}>
                                                <td>{x.date}</td>
                                                <td>
                                                    <span className={`${styles.pill} ${x.result === 'PASS' ? styles.pass : (x.result === 'FAIL' ? styles.fail : styles.abandoned)}`}>
                                                        {x.result}
                                                    </span>
                                                </td>
                                                <td>{x.q}</td>
                                                <td>{ftime(x.sec)}</td>
                                                <td>{ftime(x.avg)}</td>
                                                <td>{x.decision}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">No history yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <GeneratingModal isOpen={isGenerating} />
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={confirmReset}
                title="Reset Local Progress"
                message="Are you sure you want to reset all your local progress? This action cannot be undone."
            />
        </div>
    );
};
