import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../config/axiosInstance';
import './ConfirmationSuccess.css';

const featureList = [
  'Full access to premium content',
  'Practice questions',
  'Custom quizzes',
  'Track your progress',
  'Cancel anytime',
];

export default function ConfirmationSuccess({ onGoToDashboard }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [syncNote, setSyncNote] = useState(
    'Final status is confirmed by Stripe webhooks.'
  );

  useEffect(() => {
    if (!sessionId) return undefined;

    // Display-only sync from our API (which is itself webhook-fed).
    // This redirect/session_id is NOT treated as authoritative proof.
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await api.get('/billing/subscription');
        if (cancelled) return;
        const status = res.data?.data?.status;
        if (status === 'trialing') {
          setSyncNote('Your free trial is active (confirmed by Stripe).');
        } else if (status === 'active') {
          setSyncNote('Your subscription is active (confirmed by Stripe).');
        } else if (status === 'past_due') {
          setSyncNote('We’re processing your payment. Access remains active during grace.');
        }
      } catch {
        // Keep default note — webhook remains source of truth
      }
    };
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      navigate('/home');
    }
  };
  return (
    <div className="confirmation-card-container">
      {/* Celebration Illustration */}
      <div className="illustration-wrapper">
        <img
          src="/celebration.png"
          alt="Celebration"
          width="90"
          height="90"
        />
      </div>

      {/* Header Info */}
      <div className="confirmation-header">
        <h2 className="confirmation-title">You're In!</h2>
        <p className="confirmation-subtitle">
          Your 3-day free trial has started.
        </p>
      </div>

      {/* Checkmarks Feature List */}
      <div className="features-container">
        {featureList.map((item, index) => (
          <div key={index} className="feature-row">
            <div className="check-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="#319795" strokeWidth="2.2" fill="#E6FFFA" />
                <path
                  d="M8.5 12.5L10.8 14.8L15.5 9.5"
                  stroke="#319795"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="feature-label">{item}</span>
          </div>
        ))}
      </div>

      {/* Primary Call To Action */}
      <button
        type="button"
        className="dashboard-button"
        onClick={handleGoToDashboard}
      >
        Go to Dashboard
      </button>

      {/* Subtext Footer */}
      <p className="confirmation-footer-note">
        {syncNote} We'll notify you before the trial ends.
      </p>
    </div>
  );
}
