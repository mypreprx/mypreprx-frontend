import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../config/axiosInstance';
import './SecurePayment.css';

const PLAN_DETAILS = {
  monthly: { title: 'Monthly', price: '$29.99', period: '/month' },
  'three-month': { title: '3-Month', price: '$79.99', period: '/3 months' },
  annual: { title: 'Annual', price: '$259.00', period: '/year' },
};

export default function SecurePayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const planId = location.state?.planId || 'monthly';
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.monthly;

  const handleContinueToStripe = async () => {
    setLoading(true);
    try {
      const response = await api.post('/billing/checkout', { planId });
      const url = response.data?.data?.url;
      if (url) {
        // Hosted Stripe Checkout — subscription status comes only from webhooks
        window.location.href = url;
        return;
      }
      toast.error('Unable to start checkout. Please try again.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-card-container">
      {/* Top Header */}
      <div className="payment-header">
        <div className="header-title">
          {/* Padlock Icon */}
          <svg
            className="lock-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
              fill="#0B1938"
            />
            <path
              d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
              stroke="#0B1938"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
          <h2>Secure Payment</h2>
        </div>
        <p className="header-subtitle">
          You'll complete payment securely on Stripe.<br />Status is confirmed by Stripe webhooks.
        </p>
      </div>

      {/* Order summary — card details are entered on Stripe Checkout */}
      <div className="payment-form" style={{ gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#072445', fontSize: 16 }}>{plan.title} plan</div>
            <div style={{ fontSize: 13, color: '#555555', fontWeight: 500 }}>3-day free trial</div>
          </div>
          <div style={{ fontWeight: 700, color: '#072445', fontSize: 18 }}>
            {plan.price}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#555555' }}> {plan.period}</span>
          </div>
        </div>

        <button
          type="button"
          className="submit-button"
          onClick={handleContinueToStripe}
          disabled={loading}
        >
          {loading ? 'Redirecting…' : 'Continue to Stripe'}
        </button>

        <div className="payment-footer-text">
          <p>You won't be charged today.</p>
          <p>You can cancel anytime before the trial ends.</p>
          <p>
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00a5b7',
                fontWeight: 600,
                cursor: 'pointer',
                font: 'inherit',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Back to plans
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
