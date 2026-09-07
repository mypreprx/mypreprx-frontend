import React, { useState, useEffect } from "react";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";

import useAffirmationStore from "../../../store/affirmationStore";

import styles from "./ManifestationCalendar.module.css";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../../components/common/BackButton";


export const ManifestationCalendar = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const {
    allAffirmations,
    isLoadingAll,
    fetchAllAffirmations,
    deleteAffirmation,
    isDeleting
  } = useAffirmationStore();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build a YYYY-MM-DD string for the selected date
  const selectedDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

  // Fetch ALL affirmations once on mount
  useEffect(() => {
    fetchAllAffirmations();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDate(1);
  };

  const handleAddAffirmation = () => {
    navigate("/mind-rx/manifestation-calendar/add-affirmation", {
      state: { date: selectedDateString }
    });
  };

  // Format a date safely — handles both bare "YYYY-MM-DD" and full MongoDB ISO strings
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const datePart = String(dateStr).split("T")[0]; // strip any time component
    const [y, m, d] = datePart.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={styles["mc-wrapper"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={styles["mc-main"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles['back-btn-container']}>
          <BackButton to="/mind-rx" />
        </div>

        {/* HEADER  */}
        <HeaderCard
          title="Manifestation Calendar"
          subtitle="Small daily moments that shift your mindset."
          className={styles["mc-header-card"]}
        ></HeaderCard>

        {/* CALENDAR */}
        <div className={styles["mc-calendar-card"]}>

          <div className={styles["mc-calendar-header"]}>
            <span className={styles["arrow"]} onClick={handlePrevMonth}>‹</span>

            <div>
              <h4>{monthNames[currentMonth]} {currentYear}</h4>
              <p>{new Date(currentYear, currentMonth, selectedDate).toLocaleDateString("en-US", { weekday: "long" })}</p>
            </div>

            <span className={styles["arrow"]} onClick={handleNextMonth}>›</span>
          </div>

          <div className={styles["mc-calendar-grid"]}>

            {/* Day Names */}
            {daysOfWeek.map((day, idx) => (
              <div key={`day-${idx}`} className={styles["day-name"]}>{day}</div>
            ))}

            {/* Empty cells */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Dates */}
            {[...Array(daysInMonth)].map((_, i) => {
              const date = i + 1;
              return (
                <div
                  key={date}
                  className={`${styles["date-cell"]} ${date === selectedDate ? styles["active"] : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>

        {/* ALL AFFIRMATIONS SECTION */}
        <div className={styles["mc-affirmation-card"]}>
          <h4>All My Affirmations</h4>

          {isLoadingAll ? (
            <p className={styles["mc-affirmation-empty"]}>Loading...</p>
          ) : allAffirmations.length === 0 ? (
            <p className={styles["mc-affirmation-empty"]}>No affirmations yet. Tap "Add Affirmation" to write your first one!</p>
          ) : (
            <ul className={styles["mc-affirmation-list"]}>
              {allAffirmations.map((affirmation) => (
                <li key={affirmation._id} className={styles["mc-affirmation-item"]}>
                  <div className={styles["mc-affirmation-content"]}>
                    <span className={styles["mc-affirmation-date"]}>{formatDate(affirmation.date)}</span>
                    <span className={styles["mc-affirmation-text"]}>{affirmation.text}</span>
                  </div>
                  <button
                    className={styles["mc-delete-btn"]}
                    onClick={() => deleteAffirmation(affirmation._id)}
                    disabled={isDeleting}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles["mc-add-btn"]} onClick={handleAddAffirmation}>Add Affirmation</button>
      </div>
    </div>
  );
};
