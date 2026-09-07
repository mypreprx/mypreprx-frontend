import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./PharmaHacks.module.css";
import "./PharmShortcutsFramework.css";
import pharmImg from "../../../assets/pharmshortcuts.png";

const drugFastSteps = [
  {
    letter: 'D',
    title: 'D — Drug name clue',
    desc: 'Recognize the stem, suffix, or familiar drug—but verify it.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    letter: 'R',
    title: 'R — Reason prescribed',
    desc: 'Know what therapeutic effect you expect.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
  },
  {
    letter: 'U',
    title: 'U — Unsafe effects',
    desc: 'Know the toxicity pattern that changes the plan.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
  },
  {
    letter: 'G',
    title: 'G — Get the key data',
    isGrouped: true,
    leftColumn: [
      'beta blocker → HR/BP',
      'insulin → glucose + food',
      'spironolactone → potassium/renal function',
      'digoxin → pulse, renal function, toxicity cues',
    ],
    rightColumnTitle: 'Examples:',
    rightColumn: [
      'loop diuretic → BP, volume, potassium, renal function',
      'anticoagulant → bleeding',
      'vancomycin → renal function/exposure',
      'thyroid replacement → HR and hyperthyroid symptoms',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    letter: 'F',
    title: 'F — Food, fluids, and interactions',
    subtitle: 'Ask about:',
    bullets: [
      'meal timing',
      'dehydration',
      'supplements',
      'salt substitutes',
      'alcohol',
      'OTC medications',
      'duplicate products',
      'other CNS depressants',
      'interacting cardiac drugs.',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path>
        <path d="M15 2v16"></path>
        <path d="M8 2v4a2 2 0 0 1-2 2 2 2 0 0 1-2-2V2"></path>
        <path d="M6 2v16"></path>
      </svg>
    ),
  },
  {
    letter: 'A',
    title: 'A — Antidote / acute response',
    desc: 'Pair the emergency treatment with the mechanism when appropriate.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    ),
  },
  {
    letter: 'S',
    title: 'S — Stop / hold / clarify clues',
    desc: 'Scheduled does not equal automatic.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    ),
  },
  {
    letter: 'T',
    title: 'T — Therapeutic response',
    subtitle: 'Always ask:',
    bullets: ['Did it work?', 'Did it cause harm?'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
];

export const PharmaHacks = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartDrill = () => {
    const prompt = strategyPrompts["Pharm Shortcuts"];
    navigate("/strategy-zone/drill", {
      state: {
        strategyTab: "Pharm Shortcuts",
        subCategory: "Pharm Shortcuts",
        promptInstructions: prompt,
        isDynamic: true,
      },
    });
  };

  return (
    <div className={styles["phm-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["phm-main-area"]}>
        <Topbar
          pageTitle="Strategy Zone"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* BACK BUTTON + NEXT + START PRACTICE DRILL */}
        <div className={styles["phm-back-btn-container"]}>
          <div className={styles["phm-back-row"]}>
            <BackButton to="/strategy-zone" />
            <button
              className={styles["phm-next-btn"]}
              onClick={() => navigate("/strategy-zone/five-pharm-shortcut-rules")}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button
            className="pharm-btn"
            onClick={handleStartDrill}
            style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* DRUG FAST+ FRAMEWORK CONTENT */}
        <div className="pharm-container">
          {/* Left Card: Framework Breakdown */}
          <div className="pharm-card pharm-left-card">
            <div className="pharm-header">
              <div className="pharm-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                  <path d="m8.5 8.5 7 7"></path>
                </svg>
              </div>
              <div>
                <h2 className="pharm-title">PrepRX Pharm Shortcuts Master Framework</h2>
                <p className="pharm-subtitle">DRUG FAST+</p>
              </div>
            </div>

            <div className="pharm-divider"></div>

            <div className="pharm-list">
              {drugFastSteps.map((step, idx) => (
                <div className="pharm-item" key={idx}>
                  <div className="pharm-item-icon">{step.icon}</div>
                  <div className="pharm-item-content">
                    <h4 className="pharm-item-title">{step.title}</h4>
                    {step.desc && <p className="pharm-item-desc">{step.desc}</p>}
                    {step.subtitle && <p className="pharm-item-sub">{step.subtitle}</p>}

                    {step.isGrouped ? (
                      <div className="pharm-grouped-container">
                        {step.rightColumnTitle && (
                          <p className="pharm-examples-title">{step.rightColumnTitle}</p>
                        )}
                        <div className="pharm-grouped-cols">
                          <div className="pharm-grouped-col">
                            <ul>
                              {step.leftColumn.map((item, colIdx) => (
                                <li key={colIdx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="pharm-grouped-col">
                            <ul>
                              {step.rightColumn.map((item, colIdx) => (
                                <li key={colIdx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      step.bullets &&
                      step.bullets.length > 0 && (
                        <ul className="pharm-bullets">
                          {step.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Action CTA */}
          <div className="pharm-card pharm-right-card">
            <div className="pharm-image-container">
              <img src={pharmImg} alt="Pharm Shortcuts Illustration" className="pharm-image" />
            </div>

            <h3 className="pharm-cta-title">
              Pharmacology<br />made simple.<br />Practice with purpose.
            </h3>

            <p className="pharm-cta-desc">
              Use the DRUG FAST+ framework and master medication safety, monitoring, and clinical judgment the NCLEX way.
            </p>

            <button className="pharm-btn" onClick={handleStartDrill}>
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