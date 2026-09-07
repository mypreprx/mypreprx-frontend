import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axiosInstance';

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { TopicCard } from "../../../components/common/topic_card/TopicCard";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { CardIcon } from "../../../components/common/topic_card/CardIcon";
import {
    DelegationIcon,
    InfectionControlIcon,
    SafetyIcon,
    ClinicalJudgmentCasesIcon
} from "../../../components/common/Icons";

import styles from "./PeriorityPractice.module.css";
import { BackButton } from "../../../components/common/BackButton";



// We'll fetch priority practices from the backend instead of using hardcoded cards

export const PeriorityPractice = () => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleCardClick = (cardId) => {
        setSelectedCard(cardId);
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res = await api.get('/user/getAllPriorityPractice');
                const data = res.data && (res.data.data || res.data);
                // console.log('Fetched Priority Practices:', data);

                if (!mounted) return;
                setPractices(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load priority practices', err);
                setError(err.message || 'Failed to load');
                setPractices([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handlePlay = (practice) => {
        navigate('/study-zone/priority-practice-player', { state: { caseStudy: practice, isPreview: false } });
    };

    const handlePreview = (practice) => {
        navigate('/study-zone/priority-practice-player', {
            state: {
                caseStudy: practice,
                isPreview: true
            }
        });
    };

    return (
        <div className={styles['pp-layout']}>
            <Sidebar sidebarOpen={sidebarOpen} />
            <main className={styles['pp-main']}>
                <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* BACK BUTTON */}
                <div className={styles['back-btn-container']}>
                    <BackButton to="/study-zone" />
                </div>

                <div className={styles['pp-horizontal-card-wrapper']}>
                    <HeaderCard
                        title="Priority Practice"
                        subtitle="These are the “high-yield NCLEX categories."
                        className={styles['pp-horizontal-card']}
                    />
                </div>

                <div className={styles['pp-rectangle-cards']}>
                    {loading && <div className={styles.loading}>Loading practices...</div>}
                    {error && <div className={styles.error}>Error: {error}</div>}
                    {!loading && !error && practices.length === 0 && (
                        <div className={styles.noData}>No priority practices available.</div>
                    )}

                    {!loading && practices.map((practice) => (
                        <div key={practice._id} className={styles.practiceWrap}>
                            <TopicCard
                                title={practice.title}
                                subtitle={`${practice.questions?.length || 0} Questions`}
                                icon={<CardIcon><DelegationIcon /></CardIcon>}
                                isSelected={selectedCard === practice._id}
                                onClick={() => handleCardClick(practice._id)}
                            />

                            <div className={styles.practiceActions}>
                                <button className={styles.playBtn} onClick={() => handlePlay(practice)}>Practice</button>
                                <button className={styles.previewBtn} onClick={() => handlePreview(practice)}>
                                    Preview
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

// const PreviewQuestion = ({ question, patientChart, scenarioNarrative }) => {
//     // In preview mode, we default these to true/selected
//     const correctOptionIndex = question.options?.findIndex(
//         (opt) => opt === question.correctAnswer
//     ) ?? -1;

//     return (
//         <div className={styles.previewContainer}>
//             <hr className={styles.previewDivider} />
//             <div className={styles.previewLabel}>PREVIEW MODE</div>

//             {/* Reusing Player Styles for Patient Chart */}
//             {patientChart && (
//                 <div className={styles['patient-chart-card']}>
//                     <h2 className={styles['section-title']}>Patient Chart</h2>
//                     <div className={styles['patient-grid']}>
//                         {Object.entries(patientChart).map(([key, value]) => (
//                             <div key={key} className={styles['patient-item']}>
//                                 <span className={styles['patient-label']}>
//                                     {key.replace(/([A-Z])/g, " $1").trim()}:
//                                 </span>
//                                 <span className={styles['patient-value']}>{value}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Question Card Look-alike */}
//             <div className={styles['question-card']}>
//                 <div className={styles['question-header']}>
//                     <div className={styles['question-meta']}>
//                         <span className={styles['cjm-badge']}>
//                             Step {question.step}: {question.cjmStage}
//                         </span>
//                     </div>
//                 </div>
//                 <p className={styles['question-text']}>{question.questionText}</p>
//             </div>

//             {/* Options Look-alike */}
//             <div className={styles['options-container']}>
//                 {question.options?.map((text, idx) => {
//                     const isCorrect = idx === correctOptionIndex;
//                     // Apply the 'correct' class immediately for preview
//                     let className = `${styles.option} ${isCorrect ? styles.correct : ''}`;

//                     return (
//                         <div key={idx} className={className}>
//                             <span className={styles.letter}>{String.fromCharCode(65 + idx)}.</span>
//                             <span className={styles['option-text']}>{text}</span>
//                             {isCorrect && (
//                                 <span className={`${styles["result-icon"]} ${styles["result-icon--correct"]}`}>
//                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                         <path d="M20 6L9 17L4 12" stroke="#0C4866" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//                                     </svg>
//                                 </span>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Rationale/Feedback Section always visible */}
//             <div className={styles['feedback-wrap']} style={{ marginTop: '20px', display: 'block' }}>
//                 <div className={styles['feedback-card']}>
//                     <h3 className={styles['feedback-title']}>Rationale</h3>
//                     <p>{question.rationale}</p>

//                     {question.distractorExplanation && (
//                         <>
//                             <hr />
//                             <p className={styles["feedback-subtitle"]}>Why other answers are incorrect</p>
//                             <p>{question.distractorExplanation}</p>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };




















{/* <div className={styles['bh-topbar']}>
    <h2>Behavioral Health</h2>
    <div className={styles['bh-topbar-right']}>
        <div className={styles['bh-search-box']}>
            <input type="text" placeholder="Search..." />
        </div>
        <div className={styles['bh-profile-area']}>
            <img src={userImg} alt="User" className={styles['bh-profile-img']} />
            <span className={styles['bh-profile-name']}>Anna</span>
            <div className="profile-menu-icon">•••</div>
        </div>
    </div>
    {/* Hamburger menu outside top-right 
    <div className={styles['bh-hamburger']} onClick={() => toggleSidebar()}>
        &#9776;
    </div>
</div>
*/}






// <div className={`${styles['bh-sidebar']} ${sidebarOpen ? styles.active : ""}`}>
//     <img src={logo} alt="Logo" className={styles['bh-sidebar-logo']} />

//     <div className={styles['bh-sidebar-menu']}>
//         < to="/home" className={({ isActive }) => isActive ? `${styles['bh-menu-item']} ${styles.active}` : styles['bh-menu-item']} end>
//             <div className={`${styles['bh-menu-icon']} bh-icon-home`}>
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M16.7 5.68324L11.9 2.32491C10.5917 1.40824 8.58334 1.45824 7.32501 2.43324L3.15001 5.69157C2.31667 6.34157 1.65834 7.67491 1.65834 8.72491V14.4749C1.65834 16.5999 3.38334 18.3332 5.50834 18.3332H14.4917C16.6167 18.3332 18.3417 16.6082 18.3417 14.4832V8.83324C18.3417 7.70824 17.6167 6.32491 16.7 5.68324ZM10.625 14.9999C10.625 15.3416 10.3417 15.6249 10 15.6249C9.65834 15.6249 9.37501 15.3416 9.37501 14.9999V12.4999C9.37501 12.1582 9.65834 11.8749 10 11.8749C10.3417 11.8749 10.625 12.1582 10.625 12.4999V14.9999Z" fill="#072445" />
//                 </svg>

//             </div>
//             <span>Home</span>
//         </NavLink>

//         {/* STUDY ZONE */}
//         <div className="menu-item active" onClick={() => navigate("/study-zone")}>
//             <div className="icon-container"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0833 13.72C17.0823 13.7599 17.0784 13.7998 17.0717 13.8392C17.0892 13.9296 17.0866 14.0229 17.0639 14.1122C17.0412 14.2015 16.999 14.2847 16.9404 14.3558C16.8818 14.4269 16.8082 14.4842 16.7249 14.5236C16.6415 14.5629 16.5505 14.5833 16.4583 14.5833H4.79167C4.65487 14.5833 4.51942 14.6103 4.39304 14.6626C4.26666 14.715 4.15182 14.7917 4.0551 14.8884C3.95837 14.9851 3.88164 15.1 3.82929 15.2264C3.77694 15.3527 3.75 15.4882 3.75 15.625C3.75 15.7618 3.77694 15.8972 3.82929 16.0236C3.88164 16.15 3.95837 16.2648 4.0551 16.3616C4.15182 16.4583 4.26666 16.535 4.39304 16.5874C4.51942 16.6397 4.65487 16.6667 4.79167 16.6667H16.4583C16.6241 16.6667 16.7831 16.7325 16.9003 16.8497C17.0175 16.9669 17.0833 17.1259 17.0833 17.2917C17.0833 17.4574 17.0175 17.6164 16.9003 17.7336C16.7831 17.8508 16.6241 17.9167 16.4583 17.9167H4.79167C4.18388 17.9167 3.60098 17.6752 3.17121 17.2454C2.74144 16.8157 2.5 16.2328 2.5 15.625V3.95832C2.5 3.35054 2.74144 2.76764 3.17121 2.33787C3.60098 1.9081 4.18388 1.66666 4.79167 1.66666H15.9583C16.58 1.66666 17.0833 2.16999 17.0833 2.79166V13.72ZM7.29167 4.99999C7.12591 4.99999 6.96694 5.06584 6.84973 5.18305C6.73251 5.30026 6.66667 5.45923 6.66667 5.62499C6.66667 5.79075 6.73251 5.94972 6.84973 6.06693C6.96694 6.18414 7.12591 6.24999 7.29167 6.24999H12.2917C12.4574 6.24999 12.6164 6.18414 12.7336 6.06693C12.8508 5.94972 12.9167 5.79075 12.9167 5.62499C12.9167 5.45923 12.8508 5.30026 12.7336 5.18305C12.6164 5.06584 12.4574 4.99999 12.2917 4.99999H7.29167Z" fill="#EFA930" />
//             </svg>
//             </div>
//             <span>Study Zone</span>
//         </div>

//         <NavLink to="/strategy-zone" className={({ isActive }) => isActive ? `${styles['bh-menu-item']} ${styles.active}` : styles['bh-menu-item']}>
//             <div className={`${styles['bh-menu-icon']} bh-icon-strategy`}>
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M9 4.75C9 4.37245 9.07436 3.9986 9.21885 3.64979C9.36333 3.30097 9.5751 2.98404 9.84207 2.71707C10.109 2.4501 10.426 2.23833 10.7748 2.09385C11.1236 1.94936 11.4974 1.875 11.875 1.875C12.2526 1.875 12.6264 1.94936 12.9752 2.09385C13.324 2.23833 13.641 2.4501 13.9079 2.71707C14.1749 2.98404 14.3867 3.30097 14.5312 3.64979C14.6756 3.9986 14.75 4.37245 14.75 4.75C14.75 4.81917 14.8058 4.875 14.875 4.875H16.1883C16.4033 4.875 16.6 4.875 16.765 4.88833C16.9425 4.90333 17.1367 4.93583 17.3292 5.03417C17.6033 5.17417 17.8258 5.39667 17.9658 5.67167C18.0642 5.86333 18.0967 6.0575 18.1117 6.235C18.125 6.4 18.125 6.59667 18.125 6.81167V8.68833C18.125 8.90333 18.125 9.1 18.1117 9.265C18.1003 9.4605 18.0508 9.65187 17.9658 9.82833C17.826 10.1028 17.6028 10.326 17.3283 10.4658C17.1367 10.5642 16.9425 10.5975 16.765 10.6117C16.6 10.625 16.4033 10.625 16.1883 10.625H16C15.7866 10.625 15.5753 10.667 15.3781 10.7487C15.181 10.8304 15.0018 10.9501 14.851 11.101C14.7001 11.2518 14.5804 11.431 14.4987 11.6281C14.417 11.8253 14.375 12.0366 14.375 12.25C14.375 12.4634 14.417 12.6747 14.4987 12.8719C14.5804 13.069 14.7001 13.2482 14.851 13.399C15.0018 13.5499 15.181 13.6696 15.3781 13.7513C15.5753 13.833 15.7866 13.875 16 13.875H16.1883C16.4033 13.875 16.6 13.875 16.765 13.8883C16.9425 13.9025 17.1367 13.9358 17.3292 14.0342C17.6033 14.1742 17.8258 14.3967 17.9658 14.6708C18.0642 14.8625 18.0967 15.0575 18.1117 15.235C18.125 15.4 18.125 15.5967 18.125 15.8117V16.1883C18.125 16.4033 18.125 16.6 18.1117 16.765C18.1004 16.9608 18.0509 17.1525 17.9658 17.3292C17.8259 17.6034 17.6027 17.8262 17.3283 17.9658C17.1519 18.0508 16.9605 18.1003 16.765 18.1117C16.6 18.125 16.4033 18.125 16.1883 18.125H7.56167C7.34667 18.125 7.15 18.125 6.985 18.1117C6.7895 18.1003 6.59812 18.0508 6.42167 17.9658C6.14717 17.826 5.924 17.6028 5.78417 17.3283C5.69925 17.1519 5.64971 16.9605 5.63833 16.765C5.625 16.6 5.625 16.4033 5.625 16.1883V15.8333C5.625 15.59 5.625 15.4442 5.61583 15.3367C5.61423 15.3029 5.6092 15.2694 5.60083 15.2367C5.58142 15.1994 5.55121 15.1689 5.51417 15.1492C5.48115 15.1407 5.44737 15.1357 5.41333 15.1342C5.24795 15.1249 5.08228 15.1219 4.91667 15.125H4.75C3.9875 15.125 3.25624 14.8221 2.71707 14.2829C2.1779 13.7438 1.875 13.0125 1.875 12.25C1.875 11.4875 2.1779 10.7562 2.71707 10.2171C3.25624 9.6779 3.9875 9.375 4.75 9.375H4.91667C5.16 9.375 5.30583 9.375 5.41333 9.36583C5.44709 9.36423 5.48059 9.3592 5.51333 9.35083C5.55057 9.33142 5.58107 9.30121 5.60083 9.26417C5.60926 9.23115 5.61428 9.19737 5.61583 9.16333C5.62417 9.055 5.625 8.91 5.625 8.66667V6.81167C5.625 6.59667 5.625 6.4 5.63833 6.235C5.64971 6.0395 5.69925 5.84812 5.78417 5.67167C5.924 5.39717 6.14717 5.174 6.42167 5.03417C6.59812 4.94925 6.7895 4.89971 6.985 4.88833C7.15 4.875 7.34667 4.875 7.56167 4.875H8.875C8.90815 4.875 8.93995 4.86183 8.96339 4.83839C8.98683 4.81495 9 4.78315 9 4.75Z" fill="#072445" />
//                 </svg>

//             </div>
//             <span>Strategy Zones</span>
//         </NavLink>

//         <NavLink to="/community" className={({ isActive }) => isActive ? `${styles['bh-menu-item']} ${styles.active}` : styles['bh-menu-item']}>
//             <div className={`${styles['bh-menu-icon']} bh-icon-community`}>
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M10 2.5C8.69882 2.49956 7.4199 2.83766 6.28892 3.48106C5.15794 4.12446 4.21381 5.05104 3.54929 6.16975C2.88477 7.28846 2.52274 8.5608 2.49876 9.86177C2.47477 11.1627 2.78967 12.4476 3.41251 13.59L2.52501 16.7025C2.49378 16.8118 2.49295 16.9275 2.5226 17.0373C2.55226 17.147 2.61127 17.2466 2.6933 17.3252C2.77533 17.4039 2.87726 17.4588 2.98813 17.4838C3.099 17.5089 3.21461 17.5032 3.32251 17.4675L6.24501 16.4937C7.24108 17.0693 8.35622 17.4081 9.50415 17.4838C10.6521 17.5594 11.802 17.37 12.8651 16.9302C13.9281 16.4903 14.8757 15.8118 15.6345 14.9472C16.3933 14.0825 16.9431 13.0549 17.2412 11.9437C17.5394 10.8326 17.5779 9.66782 17.3539 8.53942C17.1299 7.41102 16.6492 6.34929 15.9492 5.43635C15.2492 4.52342 14.3486 3.78375 13.317 3.27458C12.2853 2.76541 11.1504 2.50038 10 2.5ZM7.50001 8.75C7.50001 8.58424 7.56586 8.42527 7.68307 8.30806C7.80028 8.19085 7.95925 8.125 8.12501 8.125H11.875C12.0408 8.125 12.1997 8.19085 12.3169 8.30806C12.4342 8.42527 12.5 8.58424 12.5 8.75C12.5 8.91576 12.4342 9.07473 12.3169 9.19194C12.1997 9.30915 12.0408 9.375 11.875 9.375H8.12501C7.95925 9.375 7.80028 9.30915 7.68307 9.19194C7.56586 9.07473 7.50001 8.91576 7.50001 8.75ZM8.12501 10.625H10.625C10.7908 10.625 10.9497 10.6908 11.0669 10.8081C11.1842 10.9253 11.25 11.0842 11.25 11.25C11.25 11.4158 11.1842 11.5747 11.0669 11.6919C10.9497 11.8092 10.7908 11.875 10.625 11.875H8.12501C7.95925 11.875 7.80028 11.8092 7.68307 11.6919C7.56586 11.5747 7.50001 11.4158 7.50001 11.25C7.50001 11.0842 7.56586 10.9253 7.68307 10.8081C7.80028 10.6908 7.95925 10.625 8.12501 10.625Z" fill="#072445" />
//                 </svg>

//             </div>
//             <span>Community</span>
//         </NavLink>

//         <NavLink to="/mind-rx" className={({ isActive }) => isActive ? `${styles['bh-menu-item']} ${styles.active}` : styles['bh-menu-item']}>
//             <div className={`${styles['bh-menu-icon']} bh-icon-mind`}>
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19.2054 9.50234C19.1257 9.36228 19.0189 9.2395 18.8912 9.14118C18.7635 9.04285 18.6175 8.97096 18.4617 8.92969C17.8965 8.78431 17.3125 8.72583 16.7297 8.75625C17.0422 7.20547 16.8078 5.97891 16.5734 5.25156C16.4778 4.95283 16.2745 4.70034 16.003 4.54323C15.7315 4.38612 15.4113 4.33562 15.1047 4.40156C14.3097 4.57857 13.5537 4.89947 12.8742 5.34844C12.3764 4.33178 11.6518 3.44304 10.7562 2.75078C10.5392 2.588 10.2752 2.5 10.0039 2.5C9.73256 2.5 9.46857 2.588 9.25153 2.75078C8.3545 3.44261 7.62852 4.33138 7.12965 5.34844C6.45011 4.89947 5.69418 4.57857 4.89918 4.40156C4.59261 4.33529 4.27234 4.38565 4.0009 4.54282C3.72947 4.69999 3.52635 4.95268 3.43121 5.25156C3.19684 5.97891 2.96246 7.20469 3.27028 8.75625C2.68748 8.72583 2.10344 8.78431 1.53825 8.92969C1.38245 8.97096 1.23645 9.04285 1.10875 9.14118C0.981049 9.2395 0.874219 9.36228 0.794496 9.50234C0.711167 9.64572 0.6572 9.80425 0.63574 9.96869C0.614279 10.1331 0.625754 10.3002 0.669496 10.4602C0.934339 11.443 1.74762 13.3109 4.2109 14.7828C6.67418 16.2547 8.83825 16.25 10.0039 16.25C11.1695 16.25 13.3375 16.25 15.7851 14.7828C18.2484 13.3109 19.0617 11.443 19.3265 10.4602C19.3709 10.3004 19.383 10.1335 19.3622 9.96909C19.3414 9.80465 19.2881 9.64599 19.2054 9.50234ZM4.85153 13.7102C2.77106 12.4664 2.09528 10.9414 1.87496 10.1328C2.44976 9.99086 3.04636 9.95984 3.63278 10.0414C3.82853 10.5659 4.06764 11.0731 4.34762 11.5578C5.03504 12.7429 5.93558 13.7907 7.00387 14.6484C6.24847 14.4312 5.52484 14.1157 4.85153 13.7102ZM9.99996 14.875C9.27106 14.3328 7.49996 12.6695 7.49996 9.31016C7.49996 5.99219 9.2484 4.31562 9.99996 3.75C10.7515 4.31719 12.5 5.99375 12.5 9.31172C12.5 12.6695 10.7289 14.3328 9.99996 14.875ZM18.125 10.1344C17.9086 10.9344 17.2343 12.4633 15.1492 13.7102C14.4758 14.1155 13.7522 14.4306 12.9968 14.6477C14.0651 13.7899 14.9657 12.7421 15.6531 11.557C15.9331 11.0723 16.1722 10.5651 16.3679 10.0406C16.9542 9.95986 17.5505 9.99141 18.125 10.1336V10.1344Z" fill="#072445" />
//                 </svg>

//             </div>
//             <span>Mind Rx</span>
//         </NavLink>

//         <NavLink to="/progress" className={({ isActive }) => isActive ? `${styles['bh-menu-item']} ${styles.active}` : styles['bh-menu-item']}>
//             <div className={`${styles['bh-menu-icon']} bh-icon-progress`}>
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <g clip-path="url(#clip0_195_2321)">
//                         <path fill-rule="evenodd" clip-rule="evenodd" d="M8.55666 1.56992L7.81999 0.833252L7.08333 1.56992L0.833328 7.81992L2.30666 9.29325L7.81999 3.77992L12.5 8.45992L13.2367 9.19658L13.9733 8.45992L17.7233 4.70992L19.4867 6.47325L19.9033 6.05659V1.05659H14.9033L14.4867 1.47325L16.25 3.23659L13.2367 6.24992L8.55666 1.56992ZM3.86166 12.3066V19.8066H0.944995V12.3066H3.86166ZM6.22249 8.97325V19.8066H9.13916V8.97325H6.22249ZM11.5008 19.8066V13.9733H14.4175V19.8066H11.5008ZM16.7783 10.6399V19.8066H19.695V10.6399H16.7783Z" fill="#072445" />
//                     </g>
//                     <defs>
//                         <clipPath id="clip0_195_2321">
//                             <rect width="20" height="20" fill="white" />
//                         </clipPath>
//                     </defs>
//                 </svg>

//             </div>
//             <span>Progress</span>
//         </NavLink>
//     </div>
// </div>