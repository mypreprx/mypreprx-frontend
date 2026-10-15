import { useState } from 'react';
import Modal from '../modal/Modal';
import styles from './NclexCountdownModal.module.css';

const NclexCountdownModal = ({ isOpen, onClose, onSave, onSkip }) => {
  const [days, setDays] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      const examDate = new Date(`${date}T12:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setDays(diffDays > 0 ? diffDays.toString() : '0');
    } else {
      setDays('');
    }
  };

  const handleDaysChange = (e) => {
    setDays(e.target.value);
    setSelectedDate('');
  };

  const handleSave = () => {
    let examDate;
    if (selectedDate) {
      // Anchor at local noon so the calendar day survives the UTC round-trip.
      examDate = new Date(`${selectedDate}T12:00:00`);
    } else if (days && Number(days) > 0) {
      const today = new Date();
      today.setDate(today.getDate() + parseInt(days, 10));
      examDate = today;
    } else {
      examDate = null;
    }
    onSave(examDate);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title="NCLEX Countdown" maxWidth="500px">
      <div className={styles.content}>
        <p className={styles.question}>How many days remaining until your NCLEX exam?</p>
        <p className={styles.subtitle}>This helps us show you a live countdown on your home page.</p>
        
        <div className={styles.formGroup}>
          <label htmlFor="examDate" className={styles.label}>Select your exam date</label>
          <input
            type="date"
            id="examDate"
            value={selectedDate}
            onChange={handleDateChange}
            className={styles.dateInput}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.or}>OR</div>

        <div className={styles.formGroup}>
          <label htmlFor="daysUntil" className={styles.label}>Enter days remaining</label>
          <input
            type="number"
            id="daysUntil"
            value={days}
            onChange={handleDaysChange}
            className={styles.daysInput}
            placeholder="e.g., 28"
            min="0"
          />
        </div>

        <div className={styles.buttons}>
          <button onClick={handleSkip} className={styles.skipButton}>
            Skip for now
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save & Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NclexCountdownModal;