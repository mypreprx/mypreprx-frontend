import React from 'react';
import styles from './GeneratingModal.module.css';

/**
 * GeneratingModal — shown while AI is generating questions.
 * Props:
 *   isOpen     {boolean} — whether the modal is visible
 *   message    {string}  — optional custom subtitle (default: NCLEX questions)
 */
const GeneratingModal = ({ isOpen, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Animated brain / pulse icon */}
                <div className={styles.iconWrap}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 4.5V20M12 4.5C12 4.5 9 2 6 3.5C3.5 4.75 3 8.5 4.5 10C3 11 3 14 4.5 15C3.5 16.5 4 19.5 6 20.5C8 21.5 11 20 12 20M12 4.5C12 4.5 15 2 18 3.5C20.5 4.75 21 8.5 19.5 10C21 11 21 14 19.5 15C20.5 16.5 20 19.5 18 20.5C16 21.5 13 20 12 20"
                            stroke="#00A5B7"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path d="M7 6C7 6 8.5 6 9 7.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 6C17 6 15.5 6 15 7.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 10C6 10 7.5 10 8 11.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 10C18 10 16.5 10 16 11.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 14C6 14 7.5 14 8 15.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 14C18 14 16.5 14 16 15.5" stroke="#00A5B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className={styles.pulse} />
                </div>

                <h2 className={styles.title}>Generating Your Questions</h2>
                <p className={styles.subtitle}>
                    {message || 'AI is crafting personalized NCLEX questions just for you. This may take up to 30 seconds.'}
                </p>

                {/* Animated dots loader */}
                <div className={styles.dotsRow}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>

                {/* Warning bar */}
                <div className={styles.warningBar}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                        <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.31 1.55 18.67 1.56 19.03C1.57 19.39 1.69 19.74 1.9 20.04C2.11 20.34 2.4 20.57 2.74 20.72C3.08 20.86 3.45 20.91 3.82 20.86H20.18C20.55 20.91 20.92 20.86 21.26 20.72C21.6 20.57 21.89 20.34 22.1 20.04C22.31 19.74 22.43 19.39 22.44 19.03C22.45 18.67 22.36 18.31 22.18 18L13.71 3.86C13.52 3.56 13.26 3.31 12.95 3.14C12.64 2.97 12.29 2.88 11.93 2.88C11.57 2.88 11.22 2.97 10.91 3.14C10.6 3.31 10.34 3.56 10.15 3.86H10.29Z" stroke="#f6a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Please don't close or navigate away from this page while questions are being generated.</span>
                </div>
            </div>
        </div>
    );
};

export default GeneratingModal;
