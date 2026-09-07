import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { BackButton } from "../../../components/common/BackButton";
import { strategyPrompts } from "../strategyPrompts";

import styles from "./EliminationTechniques.module.css";


export const EliminationTechniques = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      title: "Avoid Absolute Words",
      examples: ["ALWAYS", "NEVER", "MUST", "ALL", "NONE"],
      points: [
        "Nursing care is rarely absolute or definitive.",
        "Ask yourself if exceptions are possible.",
        "If exceptions exist, the absolute option is likely incorrect."
      ]
    },
    {
      id: 2,
      title: "Don’t Add Extra Steps",
      examples: ["Calling the physician", "Ordering tests", "Waiting for approval"],
      points: [
        "Avoid answers that introduce unnecessary complexity.",
        "The correct option is usually a direct nursing action.",
        "Choose what you can do without waiting for an order."
      ]
    },
    {
      id: 3,
      title: "Pick the Action You Can Do Now",
      examples: ["Assess", "Monitor", "Ensure safety"],
      points: [
        "Focus on immediate nursing interventions.",
        "Assessment often comes before action.",
        "Do not delay care unless absolutely required."
      ]
    },
    {
      id: 4,
      title: "Spot Duplicate Choices",
      examples: ["Two options saying the same thing"],
      points: [
        "If two choices are almost identical, both are likely wrong.",
        "Test questions usually have one clearly correct answer.",
        "Eliminate similar options to narrow your choices."
      ]
    }
  ];

  const handleNext = () => {
    setActiveCard((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleStartDrill = () => {
      const prompt = strategyPrompts['Elimination Techniques'];
      navigate('/strategy-zone/drill', {
          state: {
              strategyTab: "Elimination Techniques",
              subCategory: "Elimination Techniques",
              promptInstructions: prompt,
              isDynamic: true
          }
      });
  };

  return (
    <div className={styles["elt-study-page"]}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <div className={styles["elt-main-content"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles["elt-back-btn-container"]}>
          <BackButton to="/strategy-zone" />
        </div>

        {/* HEADER */}
        <HeaderCard
          title="Elimination Techniques"
          subtitle="Use these formulas to quickly rank patient needs and choose the best action."
          className={styles["elt-study-header"]}
        />

        {/* Card Wrapper */}
        <div className={styles["elt-card"]}>
          <h3>{activeCard + 1}/{cards.length}: {cards[activeCard].title}</h3>
          <h4>{cards[activeCard].examples.map(ex => `"${ex}"`).join(" ")}</h4>
          {cards[activeCard].points.map((line, index) => (
            <p key={index}>{index + 1}. {line}</p>
          ))}
        </div>

        {/* Navigation Wrapper */}
        <div className={styles["elt-navigation-wrapper"]}>
          {/* Previous Arrow */}
          <button className={styles["elt-nav-arrow"]} onClick={handlePrev} aria-label="Previous card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#0a2140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Pagination Dots */}
          <div className={styles["elt-dots"]}>
            {cards.map((_, dot) => (
              <span
                key={dot}
                className={`${styles["elt-dot"]} ${activeCard === dot ? styles["active"] : ""}`}
                onClick={() => setActiveCard(dot)}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button className={styles["elt-nav-arrow"]} onClick={handleNext} aria-label="Next card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#0a2140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Practice Drill Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
            <button 
                onClick={handleStartDrill}
                style={{
                    background: '#0c4866',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                Start Practice Drill
            </button>
        </div>
      </div>
    </div>
  );
};