import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";

import useAffirmationStore from "../../../store/affirmationStore";

import styles from "./AddAffirmation.module.css";


export const AddAffirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null); // scroll to top form on edit click

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Form state ──
  const [text, setText] = useState("");
  // When editingAffirmation is set → form is in UPDATE mode
  const [editingAffirmation, setEditingAffirmation] = useState(null);

  const today = new Date();
  const initDateStr = location.state?.date || today.toISOString().split("T")[0];
  const initParts = initDateStr.split("-");

  const [currentMonth, setCurrentMonth] = useState(parseInt(initParts[1]) - 1);
  const [currentYear, setCurrentYear]   = useState(parseInt(initParts[0]));
  const [selectedDay, setSelectedDay]   = useState(parseInt(initParts[2]));

  const {
    allAffirmations,
    isLoadingAll,
    isCreating,
    isUpdating,
    isDeleting,
    fetchAllAffirmations,
    createAffirmation,
    updateAffirmation,
    deleteAffirmation,
  } = useAffirmationStore();

  useEffect(() => {
    fetchAllAffirmations();
  }, []);

  // ── Calendar helpers ──
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const daysOfWeek = ["S","M","T","W","T","F","S"];
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();

  const selectedDateString = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(1);
  };

  // ── Safe date parser (handles MongoDB ISO strings) ──
  const parseDate = (dateStr) => {
    const datePart = String(dateStr).split("T")[0];
    const [y, m, d] = datePart.split("-").map(Number);
    return { y, m, d };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const { y, m, d } = parseDate(dateStr);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  // ── SAVE / UPDATE (single handler) ──
  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      if (editingAffirmation) {
        // UPDATE mode — send both new text AND currently-selected calendar date
        await updateAffirmation(editingAffirmation._id, text.trim(), selectedDateString);
        handleCancelEdit();
      } else {
        // CREATE mode
        await createAffirmation(selectedDateString, text.trim());
        setText("");
      }
    } catch {
      // errors handled via toast in store
    }
  };

  // ── Click ✎ → populate top form ──
  const handleEditStart = (affirmation) => {
    // Parse the affirmation's date and jump the calendar to it
    const { y, m, d } = parseDate(affirmation.date);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    setSelectedDay(d);

    // Fill the textarea with existing text
    setText(affirmation.text);

    // Track which affirmation we are editing
    setEditingAffirmation(affirmation);

    // Scroll the form into view smoothly
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Cancel edit → reset to add mode ──
  const handleCancelEdit = () => {
    setEditingAffirmation(null);
    setText("");
  };

  const isBusy = isCreating || isUpdating;

  return (
    <div className={styles["aa-container"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <div className={styles["aa-content"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* HEADER */}
        <HeaderCard
          title="Manifestation Calendar"
          subtitle="Small daily moments that shift your mindset."
          className={styles["aa-header-card"]}
        />

        {/* ── TOP SECTION: CALENDAR + FORM ── */}
        <div className={styles["aa-top-section"]} ref={formRef}>

          {/* CALENDAR */}
          <div className={styles["aa-calendar-card"]}>
            <div className={styles["aa-calendar-header"]}>
              <span className={styles["aa-arrow"]} onClick={handlePrevMonth}>‹</span>
              <div>
                <h4>{monthNames[currentMonth]} {currentYear}</h4>
                <p>{new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en-US", { weekday: "long" })}</p>
              </div>
              <span className={styles["aa-arrow"]} onClick={handleNextMonth}>›</span>
            </div>

            <div className={styles["aa-calendar-grid"]}>
              {daysOfWeek.map((day, idx) => (
                <div key={`d-${idx}`} className={styles["aa-day-name"]}>{day}</div>
              ))}
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const date = i + 1;
                return (
                  <div
                    key={date}
                    className={`${styles["aa-date-cell"]} ${date === selectedDay ? styles["aa-active"] : ""}`}
                    onClick={() => setSelectedDay(date)}
                  >
                    {date}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM */}
          <div className={`${styles["aa-form-card"]} ${editingAffirmation ? styles["aa-form-editing"] : ""}`}>

            {/* Mode banner */}
            {editingAffirmation ? (
              <div className={styles["aa-edit-banner"]}>
                <span>✎ Editing affirmation</span>
                <button className={styles["aa-cancel-inline"]} onClick={handleCancelEdit}>✕ Cancel</button>
              </div>
            ) : null}

            <p className={styles["aa-date-label"]}>
              {editingAffirmation ? "Updating for" : "Adding affirmation for"}&nbsp;
              <strong>
                {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                })}
              </strong>
            </p>

            <div className={styles["aa-textarea-card"]}>
              <textarea
                placeholder="Write your affirmation here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                autoFocus={!!editingAffirmation}
              />
              <span className={styles["aa-char-count"]}>{text.length}/500</span>
            </div>

            <button
              className={`${styles["aa-save-btn"]} ${editingAffirmation ? styles["aa-update-mode"] : ""}`}
              onClick={handleSubmit}
              disabled={isBusy || !text.trim()}
            >
              {isBusy
                ? (editingAffirmation ? "Updating..." : "Saving...")
                : (editingAffirmation ? "✓ Update Affirmation" : "Save Affirmation")
              }
            </button>
          </div>
        </div>

        {/* ── ALL AFFIRMATIONS LIST ── */}
        <div className={styles["aa-all-card"]}>
          <h4>All My Affirmations</h4>

          {isLoadingAll ? (
            <p className={styles["aa-empty"]}>Loading...</p>
          ) : allAffirmations.length === 0 ? (
            <p className={styles["aa-empty"]}>No affirmations yet. Add your first one above!</p>
          ) : (
            <ul className={styles["aa-affirmation-list"]}>
              {allAffirmations.map((affirmation) => (
                <li
                  key={affirmation._id}
                  className={`${styles["aa-affirmation-item"]} ${editingAffirmation?._id === affirmation._id ? styles["aa-item-active"] : ""}`}
                >
                  <div className={styles["aa-affirmation-content"]}>
                    <span className={styles["aa-affirmation-date"]}>{formatDate(affirmation.date)}</span>
                    <span className={styles["aa-affirmation-text"]}>{affirmation.text}</span>
                  </div>

                  <div className={styles["aa-item-actions"]}>
                    <button
                      className={styles["aa-edit-btn"]}
                      onClick={() => handleEditStart(affirmation)}
                      title="Edit"
                      disabled={isBusy}
                    >
                      ✎
                    </button>
                    <button
                      className={styles["aa-delete-btn"]}
                      onClick={() => {
                        // If deleting the one being edited, cancel edit too
                        if (editingAffirmation?._id === affirmation._id) handleCancelEdit();
                        deleteAffirmation(affirmation._id);
                      }}
                      disabled={isDeleting}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles["aa-back-btn"]} onClick={() => navigate("/mind-rx/manifestation-calendar")}>
          ← Back to Calendar
        </button>
      </div>
    </div>
  );
};
