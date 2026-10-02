import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAN_LIST, TRIAL_DAYS } from '../../config/plans';
import useAuthStore from '../../store/authStore';
import { savePendingPromo, clearPendingPromo } from '../../utils/promoStorage';
import './PricingPlan.css';

const features = [
  `${TRIAL_DAYS}-day free trial`,
  'Auto-renews until canceled',
  'Access to all premium features',
];

export default function PricingPlan() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState('');
  const { redeemPromo } = useAuthStore();
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    navigate('/secure-payment', { state: { planId } });
  };

  const openPromo = () => {
    setPromoOpen(true);
    setPromoError('');
  };

  const closePromo = () => {
    if (promoBusy) return;
    setPromoOpen(false);
    setPromoCode('');
    setPromoError('');
  };

  const handlePromoSubmit = async (event) => {
    event.preventDefault();

    const code = promoCode.trim();
    if (!code) {
      setPromoError('Enter your promo code.');
      return;
    }

    setPromoBusy(true);
    setPromoError('');

    // Store it first so a page reload mid-request does not lose the code.
    savePendingPromo(code);

    try {
      await redeemPromo(code);
      navigate('/redeem-promo');
    } catch (error) {
      setPromoError(
        error.response?.data?.message || 'We could not apply this promo code. Please try again.'
      );
      clearPendingPromo();
    } finally {
      setPromoBusy(false);
    }
  };

  return (
    <div className="pricing-container">
      {/* Header */}
      <div className="pricing-header">
        <h2 className="pricing-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">Start your {TRIAL_DAYS}-day free trial. Cancel anytime.</p>
      </div>

      {/* Promo code entry — for anyone who already has a code */}
      <div className="promo-entry">
        <p className="promo-entry-text">Already have a promo code?</p>
        <button type="button" className="promo-entry-btn" onClick={openPromo}>
          I have a promo code
        </button>
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

      {/* Promo code modal */}
      {promoOpen && (
        <div
          className="promo-modal-backdrop"
          onClick={closePromo}
          role="presentation"
        >
          <div
            className="promo-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-modal-title"
          >
            <h3 className="promo-modal-title" id="promo-modal-title">
              Redeem a promo code
            </h3>
            <p className="promo-modal-subtitle">
              Enter your code to unlock 6 months of free premium access.
            </p>

            <form onSubmit={handlePromoSubmit}>
              <label className="promo-modal-label" htmlFor="promo-code-input">
                Promo code
              </label>
              <input
                id="promo-code-input"
                type="text"
                className="promo-modal-input"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                placeholder="e.g. K7M2P9XB"
                autoComplete="off"
                autoFocus
                disabled={promoBusy}
              />

              {promoError && (
                <p className="promo-modal-error" role="alert">
                  {promoError}
                </p>
              )}

              <div className="promo-modal-actions">
                <button
                  type="button"
                  className="promo-modal-cancel"
                  onClick={closePromo}
                  disabled={promoBusy}
                >
                  Cancel
                </button>
                <button type="submit" className="promo-modal-submit" disabled={promoBusy}>
                  {promoBusy ? 'Applying…' : 'Apply code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}