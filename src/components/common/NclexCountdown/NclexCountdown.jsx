import { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../store/authStore';
import NclexCountdownModal from '../NclexCountdownModal/NclexCountdownModal';
import styles from './NclexCountdown.module.css';

const DAY_MS = 1000 * 60 * 60 * 24;

const NclexCountdown = () => {
  const user = useAuthStore((state) => state.user);
  const updateNclexExamDate = useAuthStore((state) => state.updateNclexExamDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const examDateValue = user?.nclexExamDate || null;
  const isPremium = Boolean(user?.subscription?.premium);

  // Re-derive the countdown on an hourly tick so it stays correct across days
  // without a synchronous state write inside the effect.
  useEffect(() => {
    if (!examDateValue) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 3600000);
    return () => clearInterval(interval);
  }, [examDateValue]);

  const daysRemaining = useMemo(() => {
    if (!examDateValue) return null;
    const exam = new Date(examDateValue);
    exam.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return Math.round((exam.getTime() - today.getTime()) / DAY_MS);
  }, [examDateValue, now]);

  const handleSave = async (examDate) => {
    try {
      await updateNclexExamDate(examDate ? examDate.toISOString() : null);
    } catch {
      // Countdown is a nice-to-have; a save failure should not break Home.
    }
    setIsModalOpen(false);
  };

  if (!isPremium) {
    return null;
  }

  const hasDate = Boolean(examDateValue) && daysRemaining !== null;
  const examPassed = hasDate && daysRemaining < 0;

  return (
    <>
      {hasDate && !examPassed && (
        <div className={styles.container}>
          <p className={styles.countdown}>
            <span className={styles.days}>{daysRemaining}</span> day{daysRemaining !== 1 ? 's' : ''} until
            your NCLEX exam
          </p>
          <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
            Edit
          </button>
        </div>
      )}

      {examPassed && (
        <div className={styles.container}>
          <p className={styles.past}>Your NCLEX exam date has passed. How did it go?</p>
          <button className={styles.updateBtn} onClick={() => setIsModalOpen(true)}>
            Update exam date
          </button>
        </div>
      )}

      {!hasDate && (
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <span className={styles.addIcon}>+</span> Add your NCLEX exam date
        </button>
      )}

      <NclexCountdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSkip={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default NclexCountdown;