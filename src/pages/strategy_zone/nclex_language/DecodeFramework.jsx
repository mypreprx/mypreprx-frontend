import React, { useState } from 'react';
import './DecodeFramework.css';

// Exact SVG Icons extracted from target design
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LightningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CrossCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const PillIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#009cbf">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
  </svg>
);

const SlidersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const QuestionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const navItems = [
  { id: 'detect', letter: 'D', label: 'Detect' },
  { id: 'explain', letter: 'E', label: 'Explain' },
  { id: 'categorize', letter: 'C', label: 'Categorize' },
  { id: 'order', letter: 'O', label: 'Order' },
  { id: 'delete', letter: 'D', label: 'Delete' },
  { id: 'execute', letter: 'E', label: 'Execute' },
  { id: 'stack', letter: '+', label: 'Stack' },
];

export default function DecodeFramework() {
  const [activeTab, setActiveTab] = useState('detect');

  return (
    <div className="decode-wrapper">
      {/* Horizontal Nav Pill Bar */}
      <div className="nav-pill-bar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-letter">{item.letter}</span>
              <span className="nav-label">{item.label}</span>
              {isActive && <div className="nav-pointer" />}
            </button>
          );
        })}
      </div>

      {/* Main Content Card Container */}
      <div className="card-container">
        {activeTab === 'detect' && <DetectContent />}
        {activeTab === 'explain' && <ExplainContent />}
        {activeTab === 'categorize' && <CategorizeContent />}
        {activeTab === 'order' && <OrderContent />}
        {activeTab === 'delete' && <DeleteContent />}
        {activeTab === 'execute' && <ExecuteContent />}
        {activeTab === 'stack' && <StackContent />}
      </div>
    </div>
  );
}

// Header layout matching reference images
function SectionHeader({ letter, title, subtitle, showBadge = false }) {
  return (
    <div className="header-wrapper">
      {showBadge && (
        <div className="badge-side">
          <div className="letter-circle">{letter}</div>
          <div className="vertical-divider" />
        </div>
      )}
      <div className="header-text-container">
        <h2 className="header-title">
          <span className="header-letter">{letter}</span>
          <span className="header-dash">&mdash;</span>
          <span className="header-text">{title}</span>
        </h2>
        <p className="header-subtitle">{subtitle}</p>
        <div className="teal-accent-line" />
      </div>
    </div>
  );
}

function DetectContent() {
  const leftWords = [
    'FIRST', 'INITIAL', 'PRIORITY', 'HIGHEST PRIORITY',
    'MOST CONCERNING', 'BEST', 'MOST APPROPRIATE', 'IMMEDIATE',
    'REQUIRES FOLLOW-UP', 'NEEDS FURTHER TEACHING', 'EXPECTED', 'UNEXPECTED'
  ];

  const rightWords = [
    'EFFECTIVE', 'IMPROVED', 'WORSENING', 'CONTRAINDICATED',
    'CLARIFY', 'VERIFY', 'HOLD', 'DELEGATE', 'ASSIGN',
    'LEAST RESTRICTIVE', 'MOST LIKELY', 'BEST EVIDENCE',
    'REQUIRES CORRECTION', 'LOWEST PRIORITY'
  ];

  return (
    <div>
      <SectionHeader
        letter="D"
        title="Detect the exact command word"
        subtitle="The first step is to identify the command word that tells you exactly what the question is asking."
        showBadge={true}
      />

      <div className="content-divider" />

      <h3 className="section-title">Look for:</h3>

      <div className="detect-grid">
        <ul className="bullet-column">
          {leftWords.map((word) => (
            <li key={word}><span className="teal-dot" />{word}</li>
          ))}
        </ul>
        <ul className="bullet-column">
          {rightWords.map((word) => (
            <li key={word}><span className="teal-dot" />{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExplainContent() {
  const mapping = [
    { term: 'FIRST', desc: 'What comes before the others?' },
    { term: 'INITIAL', desc: 'What starts the sequence?' },
    { term: 'PRIORITY', desc: 'Who or what ranks first?' },
    { term: 'MOST CONCERNING', desc: 'What is most dangerous?' },
    { term: 'IMMEDIATE', desc: 'What cannot safely wait?' },
    { term: 'REQUIRES FOLLOW-UP', desc: 'What finding needs nursing attention?' },
    { term: 'NEEDS FURTHER TEACHING', desc: 'Which statement is wrong?' },
    { term: 'INDICATES UNDERSTANDING', desc: 'Which statement is correct?' },
    { term: 'EFFECTIVE', desc: 'Did treatment work?' },
    { term: 'WORSENING', desc: 'What is moving in the wrong direction?' },
    { term: 'EXPECTED', desc: 'What fits the condition or therapy?' },
    { term: 'UNEXPECTED', desc: 'What suggests a complication?' },
    { term: 'CONTRAINDICATED', desc: 'What should not be done?' },
    { term: 'CLARIFY', desc: 'What conflicts with known safety information?' },
    { term: 'VERIFY', desc: 'What must be confirmed before proceeding?' },
    { term: 'HOLD', desc: 'Temporarily do not administer while reassessing/clarifying.' },
    { term: 'LEAST RESTRICTIVE', desc: 'What protects the client while preserving the most freedom?' },
    { term: 'MOST LIKELY', desc: 'What explanation best fits the clues?' },
    { term: 'BEST EVIDENCE', desc: 'What proves the outcome most strongly?' }
  ];

  return (
    <div>
      <SectionHeader
        letter="E"
        title="Explain the command in plain English"
        subtitle="Translate the command word into what it is really asking you to do."
        showBadge={true}
      />

      <div className="content-divider" />

      <ul className="explain-rows">
        {mapping.map((item) => (
          <li key={item.term} className="explain-item">
            <span className="teal-dot" />
            <span className="explain-term">{item.term}</span>
            <span className="arrow-right">&rarr;</span>
            <span className="explain-desc">{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategorizeContent() {
  const categories = [
    { icon: <ShieldIcon />, label: 'Stable / unstable' },
    { icon: <ShieldIcon />, label: 'Safe / unsafe' },
    { icon: <LightningIcon />, label: 'Acute / chronic' },
    { icon: <SlidersIcon />, label: 'Controlled / uncontrolled' },
    { icon: <TrendUpIcon />, label: 'Baseline / new' },
    { icon: <PillIcon />, label: 'Treated / untreated' },
    { icon: <CheckCircleIcon />, label: 'Expected / unexpected' },
    { icon: <CrossCircleIcon />, label: 'Correct / incorrect' }
  ];

  return (
    <div>
      <SectionHeader
        letter="C"
        title="Categorize the options"
        subtitle="Group the answer choices by comparing what they have in common."
        showBadge={true}
      />

      <div className="content-divider" />

      <h3 className="section-title">Label them:</h3>

      <div className="categorize-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="cat-card">
            <span className="teal-dot" />
            <div className="icon-badge">{cat.icon}</div>
            <span className="cat-label">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderContent() {
  const steps = [
    'Assess the patient.',
    'Analyze the data.',
    'Identify the problem.',
    'Plan desired outcomes.',
    'Implement nursing interventions.',
    'Evaluate the outcome.'
  ];

  return (
    <div>
      <SectionHeader
        letter="O"
        title="Put the steps in the right order"
        subtitle="Arrange the steps of the nursing process or priority actions in the correct sequence."
        showBadge={true}
      />

      <div className="content-divider" />

      <div className="steps-container">
        {steps.map((step, idx) => (
          <div key={idx} className="step-row">
            <div className="step-badge">{idx + 1}</div>
            <span className="step-text">{step}</span>
            <div className="drag-icon">:::</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeleteContent() {
  const questions = [
    { icon: <TargetIcon />, text: 'Does this choice answer what is being asked?' },
    { icon: <CrossCircleIcon />, text: 'Is it obviously wrong or unsafe?' },
    { icon: <QuestionIcon />, text: 'Is it missing important information?' },
    { icon: <CopyIcon />, text: 'Is it a duplicate of another choice?' },
    { icon: <WrenchIcon />, text: "Is it beyond the nurse's scope?" },
    { icon: <FlagIcon />, text: 'Is it extreme or not priority?' }
  ];

  return (
    <div>
      <SectionHeader
        letter="D"
        title="Eliminate the distractions"
        subtitle="Remove answer choices that are clearly wrong, off-topic, or outside the scope."
        showBadge={true}
      />

      <div className="content-divider" />

      <h3 className="section-title">Ask yourself:</h3>

      <div className="rows-container">
        {questions.map((q, idx) => (
          <div key={idx} className="bordered-row">
            <div className="icon-badge">{q.icon}</div>
            <span className="row-title-text">{q.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecuteContent() {
  const actions = [
    { icon: <TargetIcon />, title: 'Choose the best answer.', desc: 'Select the option that fits all the clues and priorities.' },
    { icon: <ShieldIcon />, title: 'Act with confidence.', desc: 'Trust your reasoning and commit to your decision.' },
    { icon: <ClipboardIcon />, title: 'Follow safety first.', desc: 'Apply standard precautions and protocols.' },
    { icon: <UsersIcon />, title: 'Communicate clearly.', desc: 'Report, document, and share important information.' },
    { icon: <RefreshIcon />, title: 'Reassess as needed.', desc: "Re-evaluate and adjust based on the patient's response." }
  ];

  return (
    <div>
      <SectionHeader
        letter="E"
        title="Execute the right action"
        subtitle="Carry out the best choice confidently and safely."
        showBadge={true}
      />

      <div className="content-divider" />

      <h3 className="section-title">Focus on:</h3>

      <div className="rows-container">
        {actions.map((act, idx) => (
          <div key={idx} className="bordered-row desc-row">
            <span className="teal-dot" />
            <div className="icon-badge">{act.icon}</div>
            <div className="desc-block">
              <strong className="row-title-text">{act.title}</strong>
              <p className="row-subtext">{act.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackContent() {
  const stackItems = [
    { icon: <BrainIcon />, title: 'Content Knowledge', desc: 'Strengthen your understanding of nursing concepts and topics.' },
    { icon: <ClipboardIcon />, title: 'Test-Taking Strategies', desc: 'Apply proven methods to approach every question with clarity.' },
    { icon: <TargetIcon />, title: 'Critical Thinking', desc: 'Analyze, prioritize, and make safe, patient-centered decisions.' },
    { icon: <BookIcon />, title: 'Practice & Review', desc: 'Reinforce learning with questions, rationales, and focused review.' },
    { icon: <TrendUpIcon />, title: 'Confidence & Mindset', desc: 'Stay positive, manage stress, and trust your preparation.' },
    { icon: <AwardIcon />, title: 'NCLEX Success', desc: 'Bring it all together and step into your exam with confidence.' }
  ];

  return (
    <div>
      <SectionHeader
        letter="+"
        title="Stack — Build your confidence"
        subtitle="Layer your knowledge and strategies for long-term success."
        showBadge={true}
      />

      <div className="content-divider" />

      <div className="rows-container">
        {stackItems.map((item, idx) => (
          <div key={idx} className="bordered-row stack-item">
            <div className="icon-badge">{item.icon}</div>
            <div className="stack-title-col">
              <strong className="row-title-text">{item.title}</strong>
            </div>
            <div className="vertical-light-divider" />
            <div className="stack-desc-col">
              <p className="row-subtext">{item.desc}</p>
            </div>
            <span className="arrow-right">&rarr;</span>
          </div>
        ))}
      </div>
    </div>
  );
}