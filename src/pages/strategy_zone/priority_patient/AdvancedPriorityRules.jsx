import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./AdvancedPriorityRules.module.css";
import "./AdvancedPriorityRules.css";
import priorityImg from "../../../assets/priority.png";

const plusRules = [
  {
    id: 1,
    title: 'Probability × Severity × Time',
    desc: 'A predictable catastrophic exposure—such as a major insulin overdose—can outrank a minor active complaint before symptoms occur.',
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
    id: 2,
    title: 'Lab + Organ Effect',
    desc: 'Potassium 6.8 plus QRS widening is more urgent than an isolated abnormal lab.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55A2 2 0 0 0 6.508 23h10.984a2 2 0 0 0 1.788-2.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path>
        <line x1="8.5" y1="2" x2="15.5" y2="2"></line>
        <line x1="7" y1="16" x2="17" y2="16"></line>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Medication Benefit + Medication Harm',
    desc: 'A drug can work and still create a new priority problem.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Baseline + Trend + Symptoms',
    desc: 'Never judge a number without context.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Irreversible Harm',
    desc: 'Stroke, compartment syndrome, airway obstruction, and other time-sensitive organ threats move upward even when full ABC collapse has not yet occurred.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"></path>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"></path>
      </svg>
    ),
  },
  {
    id: 6,
    title: 'High-Risk Population ≠ Automatically Highest Priority',
    desc: 'Neutropenia, anticoagulation, pregnancy, infancy, and older age change risk interpretation, but the current clinical condition still determines priority.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <polyline points="17 11 19 13 23 9"></polyline>
      </svg>
    ),
  },
];

export const AdvancedPriorityRules = () => {
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
    <div className={styles["apr-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["apr-main-area"]}>
        <Topbar
          pageTitle="Strategy Zone"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* BACK BUTTON + START PRACTICE DRILL */}
        <div className={styles["apr-back-btn-container"]}>
          <BackButton to="/strategy-zone/periority-patients" />
          <button
            className="plus-btn"
            onClick={handleStartDrill}
            style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* PLUS — ADVANCED PRIORITY RULES CONTENT */}
        <div className="plus-container">
          {/* Left Card: Advanced Rules List */}
          <div className="plus-card plus-left-card">
            <div className="plus-header">
              <div className="plus-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <div>
                <h2 className="plus-title">PrepRX Priority Patients</h2>
                <h2 className="plus-title">Master Framework</h2>
                <p className="plus-subtitle">PLUS — Advanced Priority Rules</p>
              </div>
            </div>

            <div className="plus-divider"></div>

            <div className="plus-list">
              {plusRules.map((rule) => (
                <div className="plus-item" key={rule.id}>
                  <div className="plus-item-icon">{rule.icon}</div>
                  <div className="plus-item-content">
                    <h4 className="plus-item-title">{rule.title}</h4>
                    <p className="plus-item-desc">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Action CTA */}
          <div className="plus-card plus-right-card">
            <div className="plus-image-container">
              <img src={priorityImg} alt="Priority Patients Illustration" className="plus-image" />
            </div>

            <h3 className="plus-cta-title">
              Apply advanced<br />priority rules to<br />think like a pro.
            </h3>

            <p className="plus-cta-desc">
              Use the PLUS rules with the RANK NOW+ framework to make faster, safer, and more confident decisions.
            </p>

            <button className="plus-btn" onClick={handleStartDrill}>
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