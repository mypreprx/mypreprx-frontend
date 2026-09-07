import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./CriticalThinking.module.css";
import "./CriticalThinkingFramework.css";
import criticalThinkingImg from "../../../assets/criticalthinking.png";

const frameworkSteps = [
  {
    letter: "T",
    title: "T \u2014 Trend the data",
    subtitle: "Do not look only at today's number. Compare:",
    bullets: [
      "previous value",
      "baseline",
      "post-treatment response",
      "direction of change.",
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
  {
    letter: "H",
    title: "H \u2014 Highlight the highest-risk cues",
    subtitle: "Look for:",
    bullets: [
      "ABC compromise",
      "neurologic deterioration",
      "shock",
      "uncontrolled bleeding",
      "medication toxicity",
      "irreversible organ threat",
      "imminent safety risk.",
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
  },
  {
    letter: "I",
    title: "I \u2014 Interpret the pattern",
    subtitle: "Do the cues fit together?",
    footer: "Avoid treating each finding in isolation.",
    bullets: [],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    letter: "N",
    title: "N \u2014 Notice contradictions",
    subtitle: "Ask:",
    bullets: [
      "Does one piece of data conflict with the others?",
      "Is the device malfunctioning?",
      "Is the machine wrong?",
      "Is my original diagnosis incomplete?",
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18"></path>
        <path d="M3 7l9-4 9 4"></path>
        <path d="M3 7l3 9a3 3 0 0 0 6 0L9 7"></path>
        <path d="M15 7l3 9a3 3 0 0 0 6 0l-3-9"></path>
      </svg>
    ),
  },
  {
    letter: "K",
    title: "K \u2014 Know what changes the next action",
    subtitle: "Ask:",
    quote: "\u201cWhat piece of information or intervention matters most right now?\u201d",
    bullets: [],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
  },
];

export const CriticalThinking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartDrill = () => {
    const prompt = strategyPrompts["Critical Thinking Drills"];
    navigate("/strategy-zone/drill", {
      state: {
        strategyTab: "Critical Thinking Drills",
        subCategory: "Critical Thinking Drills",
        promptInstructions: prompt,
        isDynamic: true,
      },
    });
  };

  return (
    <div className={styles["ct-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["ct-main-area"]}>
        <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON + START PRACTICE DRILL */}
        <div className={styles["ct-back-btn-container"]}>
          <BackButton to="/strategy-zone" />
          <button className="think-btn" onClick={handleStartDrill} style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* CRITICAL THINKING FRAMEWORK CONTENT */}
        <div className="think-container">
          {/* Left Card: Framework Breakdown */}
          <div className="think-card think-left-card">
            <div className="think-header">
              <div className="think-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"></path>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"></path>
                </svg>
              </div>
              <div>
                <h2 className="think-title">PrepRX Critical Thinking Master Framework</h2>
                <p className="think-subtitle">THINK+</p>
              </div>
            </div>

            <div className="think-divider"></div>

            <div className="think-list">
              {frameworkSteps.map((step, idx) => (
                <div className="think-item" key={idx}>
                  <div className="think-letter-badge">{step.letter}</div>
                  <div className="think-item-icon">{step.icon}</div>
                  <div className="think-item-content">
                    <h4 className="think-item-title">{step.title}</h4>
                    {step.subtitle && <p className="think-item-sub">{step.subtitle}</p>}

                    {step.bullets.length > 0 && (
                      <ul className="think-bullets">
                        {step.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {step.footer && <p className="think-item-footer">{step.footer}</p>}
                    {step.quote && <p className="think-item-quote">{step.quote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Action CTA */}
          <div className="think-card think-right-card">
            <div className="think-image-container">
              <img src={criticalThinkingImg} alt="Critical Thinking Illustration" className="think-image" />
            </div>

            <h3 className="think-cta-title">
              Ready to put your<br />critical thinking<br />into action?
            </h3>

            <p className="think-cta-desc">
              Apply the THINK+ framework in real NCLEX-style questions and build unshakable clinical judgment.
            </p>

            <button className="think-btn" onClick={handleStartDrill}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
              Start Practice Drill
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
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