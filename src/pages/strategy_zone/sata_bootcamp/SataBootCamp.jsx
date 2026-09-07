import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./SataBootCamp.module.css";
import "./SataBootCamp.css";
import sataImg from "../../../assets/sata.png";

const strategySteps = [
  {
    id: 1,
    title: "Is this independently clinically correct?",
    description: "If yes \u2192 select it.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Does it answer the exact question asked?",
    description: "A medically true statement can still be incorrect for the stem.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="22" y1="12" x2="18" y2="12"></line>
        <line x1="6" y1="12" x2="2" y2="12"></line>
        <line x1="12" y1="6" x2="12" y2="2"></line>
        <line x1="12" y1="22" x2="12" y2="18"></line>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Is it safe for THIS client?",
    description: "Consider allergies, contraindications, route, level of consciousness, acuity, and patient-specific factors.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Is it appropriately timed?",
    description: "An action that happens later may not belong when the question asks what to do during an immediate emergency.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
  },
  {
    id: 5,
    title: "Never count your selections.",
    description: "The PrepRX bank deliberately varies between 3, 4, 5, and 6 correct choices.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    id: 6,
    title: "Never assume A or B is correct.",
    description: "Correct letters vary deliberately.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" stroke="none">AB</text>
      </svg>
    ),
  },
  {
    id: 7,
    title: "Re-read every unselected option.",
    description: "Ask: \u201cAm I rejecting this because it is false\u2014or because I already selected enough?\u201d\nIf the second reason applies, reassess it.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  },
];

export const SataBootCamp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartDrill = () => {
    const prompt = strategyPrompts["SATA Boot Camp"];
    navigate("/strategy-zone/drill", {
      state: {
        strategyTab: "SATA Boot Camp",
        subCategory: "SATA Boot Camp",
        promptInstructions: prompt,
        isDynamic: true,
      },
    });
  };

  return (
    <div className={styles["sata-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["sata-content-area"]}>
        <Topbar
          pageTitle="Strategy Zone"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* BACK BUTTON + START PRACTICE DRILL */}
        <div className={styles["sata-back-btn-container"]}>
          <BackButton to="/strategy-zone" />
          <button className="sata-drill-btn" onClick={handleStartDrill} style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* SATA STRATEGY CONTENT */}
        <div className="sata-container">
          {/* Left Card: Strategy List */}
          <div className="sata-card sata-left-card">
            <div className="sata-header">
              <div className="sata-header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M9 12h6"></path>
                  <path d="M9 16h6"></path>
                </svg>
              </div>
              <div>
                <h2 className="sata-title">PrepRX SATA Boot Camp Master Strategy</h2>
                <p className="sata-subtitle">TRUE / FALSE &mdash; NO PATTERN</p>
              </div>
            </div>

            <div className="sata-divider"></div>
            <p className="sata-instruction">For every answer choice:</p>

            <div className="sata-list">
              {strategySteps.map((step) => (
                <div className="sata-item" key={step.id}>
                  <div className="sata-item-icon">{step.icon}</div>
                  <div className="sata-item-content">
                    <h4 className="sata-item-title">{step.title}</h4>
                    <p className="sata-item-desc">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Call to Action */}
          <div className="sata-card sata-right-card">
            <div className="sata-image-container">
              <img src={sataImg} alt="SATA Illustration" className="sata-image" />
            </div>

            <h3 className="sata-cta-title">
              Ready to put your<br />strategy into action?
            </h3>

            <p className="sata-cta-desc">
              Practice SATA questions and strengthen your decision-making skills with timed drills.
            </p>

            <button className="sata-drill-btn" onClick={handleStartDrill}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
              Start Practice Drill
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};