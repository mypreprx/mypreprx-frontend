import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./PeriorityPatient.module.css";
import "./PriorityPatientsFramework.css";
import priorityImg from "../../../assets/priority.png";

const rankSteps = [
  {
    letter: 'R',
    title: 'R — Respiratory, circulatory, and acute neurologic threats',
    subtitle: 'Prioritize:',
    bullets: [
      'airway obstruction',
      'respiratory failure',
      'shock',
      'uncontrolled hemorrhage',
      'acute neurologic deterioration.',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12C6 8 8 4 12 4s6 4 6 8v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-7z"></path>
        <line x1="12" y1="4" x2="12" y2="2"></line>
        <path d="M8 12c-2.5 0-4 1.5-4 4s1.5 4 4 4"></path>
        <path d="M16 12c2.5 0 4 1.5 4 4s-1.5 4-4 4"></path>
      </svg>
    ),
  },
  {
    letter: 'A',
    title: 'A — Acute before chronic',
    desc: 'A new symptom generally outranks a stable chronic finding.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
  },
  {
    letter: 'N',
    title: 'N — New before baseline',
    subtitle: 'Always ask:',
    quote: '"Is this normal for this client?"',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    letter: 'K',
    title: 'K — Kill delays',
    subtitle: 'Move time-sensitive threats upward:',
    bullets: [
      'stroke',
      'compartment syndrome',
      'severe hypoglycemia',
      'anaphylaxis',
      'postpartum hemorrhage',
      'sepsis',
      'lethal electrolyte disturbances.',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 22h14"></path>
        <path d="M5 2h14"></path>
        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
      </svg>
    ),
  },
  {
    letter: 'N',
    title: 'N — Note treatment response',
    subtitle: 'Classify clients as:',
    bullets: [
      'untreated',
      'treated but worsening',
      'treated and improved',
      'recurrent after treatment.',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
  {
    letter: 'O',
    title: 'O — Observe controlled vs. uncontrolled risk',
    desc: 'A high-risk client with safeguards may rank below a client experiencing active physiologic deterioration.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <line x1="9" y1="9" x2="15" y2="15"></line>
        <line x1="15" y1="9" x2="9" y2="15"></line>
      </svg>
    ),
  },
  {
    letter: 'W',
    title: 'W — Who worsens fastest if you wait?',
    desc: 'Use this as the final tie-breaker.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
];

export const PeriorityPatient = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartDrill = () => {
    const prompt = strategyPrompts["Priority Patients"];
    navigate("/strategy-zone/drill", {
      state: {
        strategyTab: "Priority Patients",
        subCategory: "Priority Patients",
        promptInstructions: prompt,
        isDynamic: true,
      },
    });
  };

  return (
    <div className={styles["pp-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["pp-main-area"]}>
        <Topbar
          pageTitle="Strategy Zone"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* BACK BUTTON + NEXT + START PRACTICE DRILL */}
        <div className={styles["pp-back-btn-container"]}>
          <div className={styles["pp-back-row"]}>
            <BackButton to="/strategy-zone" />
            <button
              className={styles["pp-next-btn"]}
              onClick={() => navigate("/strategy-zone/advanced-priority-rules")}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button
            className="rank-btn"
            onClick={handleStartDrill}
            style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* RANK NOW+ FRAMEWORK CONTENT */}
        <div className="rank-container">
          {/* Left Card: Framework Breakdown */}
          <div className="rank-card rank-left-card">
            <div className="rank-header">
              <div className="rank-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <div>
                <h2 className="rank-title">PrepRX Priority Patients</h2>
                <h2 className="rank-title">Master Framework</h2>
                <p className="rank-subtitle">RANK NOW+</p>
              </div>
            </div>

            <div className="rank-divider"></div>

            <div className="rank-list">
              {rankSteps.map((step, idx) => (
                <div className="rank-item" key={idx}>
                  <div className="rank-item-icon">{step.icon}</div>
                  <div className="rank-item-content">
                    <h4 className="rank-item-title">{step.title}</h4>
                    {step.subtitle && <p className="rank-item-sub">{step.subtitle}</p>}
                    {step.desc && <p className="rank-item-desc">{step.desc}</p>}

                    {step.bullets && step.bullets.length > 0 && (
                      <ul className="rank-bullets">
                        {step.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {step.quote && <p className="rank-item-quote">{step.quote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Action CTA */}
          <div className="rank-card rank-right-card">
            <div className="rank-image-container">
              <img src={priorityImg} alt="Priority Patients Illustration" className="rank-image" />
            </div>

            <h3 className="rank-cta-title">
              Prioritize with<br />confidence.
            </h3>

            <p className="rank-cta-desc">
              Use the RANK NOW+ framework to identify and prioritize the patients who need you most.
            </p>

            <button className="rank-btn" onClick={handleStartDrill}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
              Start Practice Drill
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};