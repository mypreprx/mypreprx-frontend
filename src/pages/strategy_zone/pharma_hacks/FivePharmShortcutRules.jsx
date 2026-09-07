import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { BackButton } from "../../../components/common/BackButton";

import { strategyPrompts } from "../strategyPrompts";

import styles from "./FivePharmShortcutRules.module.css";
import "./FivePharmShortcutRules.css";
import pharmImg from "../../../assets/pharmshortcuts.png";

const shortcutRules = [
  {
    id: 1,
    title: 'Suffix = clue, not guarantee.',
    desc: 'Verify the actual medication.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Mechanism predicts monitoring.',
    desc: 'Know what physiologic system the drug changes.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Shared mechanism predicts interaction.',
    desc: 'Two drugs pushing the same system can amplify harm.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <polyline points="17 11 19 13 23 9"></polyline>
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Organ failure predicts accumulation.',
    desc: 'Always ask how the drug is cleared.',
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
    id: 5,
    title: 'Toxicity beats trivia.',
    desc: 'NCLEX pharmacology is primarily about safe nursing care, not memorizing obscure chemical facts. The 2026 test plan explicitly places Pharmacological and Parenteral Therapies within Physiological Integrity and incorporates clinical judgment throughout the exam.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>
    ),
  },
];

export const FivePharmShortcutRules = () => {
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
    <div className={styles["rules-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={styles["rules-main-area"]}>
        <Topbar
          pageTitle="Strategy Zone"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* BACK BUTTON + START PRACTICE DRILL */}
        <div className={styles["rules-back-btn-container"]}>
          <BackButton to="/strategy-zone/pharma-hacks" />
          <button
            className="rules-btn"
            onClick={handleStartDrill}
            style={{ width: "auto", padding: "10px 18px", fontSize: "14px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4L19 12L5 20V4Z" fill="white" />
            </svg>
            Start Practice Drill
          </button>
        </div>

        {/* FIVE PHARM SHORTCUT RULES CONTENT */}
        <div className="rules-container">
          {/* Left Card: Framework Breakdown */}
          <div className="rules-card rules-left-card">
            <div className="rules-header">
              <div className="rules-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                  <path d="m8.5 8.5 7 7"></path>
                </svg>
              </div>
              <div>
                <h2 className="rules-title">PrepRX Pharm Shortcuts</h2>
                <h2 className="rules-title">Master Framework</h2>
                <p className="rules-subtitle">PLUS — Five Pharm Shortcut Rules</p>
              </div>
            </div>

            <div className="rules-divider"></div>

            <div className="rules-list">
              {shortcutRules.map((rule) => (
                <div className="rules-item" key={rule.id}>
                  <div className="rules-item-icon">{rule.icon}</div>
                  <div className="rules-item-content">
                    <h4 className="rules-item-title">{rule.title}</h4>
                    <p className="rules-item-desc">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Action CTA */}
          <div className="rules-card rules-right-card">
            <div className="rules-image-container">
              <img src={pharmImg} alt="Pharm Shortcuts Illustration" className="rules-image" />
            </div>

            <h3 className="rules-cta-title">
              Master the rules.<br />Deliver safe care.<br />Pass NCLEX.
            </h3>

            <p className="rules-cta-desc">
              Use the FIVE Pharm Shortcut Rules with DRUG FAST+ to think faster, prevent errors, and prioritize what matters most.
            </p>

            <button className="rules-btn" onClick={handleStartDrill}>
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