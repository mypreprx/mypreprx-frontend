import React from 'react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title || 'Confirm Action'}</h3>
                <p className={styles.message}>{message || 'Are you sure you want to proceed?'}</p>
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
