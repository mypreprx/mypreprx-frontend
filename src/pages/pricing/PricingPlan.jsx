import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAN_LIST, TRIAL_DAYS } from '../../config/plans';
import './PricingPlan.css';

const features = [
  `${TRIAL_DAYS}-day free trial`,
  'Auto-renews until canceled',
  'Access to all premium features',
];

export default function PricingPlan() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    navigate('/secure-payment', { state: { planId } });
  };

  return (
    <div className="pricing-container">
      {/* Header */}
      <div className="pricing-header">
        <h2 className="pricing-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">Start your {TRIAL_DAYS}-day free trial. Cancel anytime.</p>
      </div>

      {/* Plan Cards Grid / Container */}
      <div className="plans-wrapper">
        {PLAN_LIST.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`plan-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <div className="plan-info">
                <span className="plan-title">{plan.name}</span>
                <div className="plan-price-row">
                  <span className="plan-price">{plan.price}</span>
                  <span className="plan-period">{plan.period}</span>
                </div>
              </div>

              <div className="plan-action">
                <span className="trial-badge">{plan.badge}</span>
                <div className="chevron-icon">
                  <svg
                    width="10"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.5 1.5L8 8L1.5 14.5"
                      stroke={isSelected ? '#3182CE' : '#4A5568'}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Included Box */}
      <div className="features-box">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-item">
            <div className="check-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="#319795" strokeWidth="2" />
                <path
                  d="M8.5 12.5L10.5 14.5L15.5 9.5"
                  stroke="#319795"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="feature-text">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
