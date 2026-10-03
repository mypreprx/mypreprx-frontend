import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { getPlan } from "../../config/plans";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#319795" strokeWidth="2" fill="#E6FFFA" />
    <path d="M8.5 12.5L10.8 14.8L15.5 9.5" stroke="#319795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A promo grant is not a Stripe subscription. Giving it its own label keeps
// "Active" reserved for paying customers, so nobody mistakes free access for a
// plan they can cancel or change in the Stripe portal.
const PROMO_LABEL = 'Free — promo code';

const STATUS_LABELS = {
  promo: PROMO_LABEL,
  none: "No subscription",
  trialing: "Free trial",
  active: "Active",
  past_due: "Grace period",
  suspended: "Suspended",
  canceled: "Canceled",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const badgeClass = (status) => {
  if (status === "active" || status === "trialing") return "sub-badge";
  if (status === "past_due") return "sub-badge";
  if (status === "suspended" || status === "canceled") return "sub-badge";
  return "sub-badge";
};

export const ManageSubscription = () => {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/billing/subscription");
      setSub(res.data?.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const plan = sub?.planId ? getPlan(sub.planId) : null;
  const status = sub?.status || "none";
  // A promo grant has no Stripe subscription, no plan and no billing history.
  // Show what it actually is instead of an empty plan and dead portal buttons.
  const isPromo = status === "promo";

  const openPortal = async () => {
    try {
      const res = await api.post("/billing/portal");
      const url = res.data?.data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to open billing portal");
    }
  };

  return (
    <SubscriptionPageLayout
      pageTitle="Manage Subscription"
      subtitle="View your current plan, billing details, and subscription status."
    >
      <div className="sub-card">
        <div className="sub-plan-row">
          <div>
            <p className="sub-plan-name">
              {isPromo ? "Free access" : plan?.name || "No active plan"}
            </p>
            <p className="sub-plan-price">
              {isPromo ? (
                PROMO_LABEL
              ) : (
                <>
                  {plan?.price || "—"}
                  {plan ? <span> / {plan.cycle}</span> : null}
                </>
              )}
            </p>
          </div>
          <span className={badgeClass(status)}>
            {STATUS_LABELS[status] || status}
            {sub?.cancelAtPeriodEnd ? " (ending)" : ""}
          </span>
        </div>

        <ul className="sub-feature-list">
          <li><CheckIcon /> Full access to premium content</li>
          <li><CheckIcon /> Unlimited practice questions</li>
          <li><CheckIcon /> Custom quizzes</li>
          <li><CheckIcon /> Progress tracking</li>
        </ul>

        {isPromo ? (
          <div className="sub-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="sub-btn sub-btn-primary"
              onClick={() => navigate("/subscriptions/upgrade")}
            >
              Choose a Plan
            </button>
          </div>
        ) : (
          <div className="sub-actions" style={{ marginTop: "24px" }}>
            <button type="button" className="sub-btn sub-btn-primary" onClick={() => navigate("/subscriptions/upgrade")}>
              Upgrade Plan
            </button>
            <button type="button" className="sub-btn sub-btn-outline" onClick={openPortal}>
              Update Payment Method
            </button>
            <button type="button" className="sub-btn sub-btn-outline" onClick={openPortal}>
              View Invoices
            </button>
          </div>
        )}
      </div>

      <div className="sub-card">
        <h3 className="sub-card-title">Billing Details</h3>
        {loading ? (
          <p className="sub-note">Loading subscription…</p>
        ) : (
          <div className="sub-info-list">
            <div className="sub-info-row">
              <span className="sub-info-label">Status</span>
              <span className="sub-info-value">
                {STATUS_LABELS[status] || status}
                {sub?.cancelAtPeriodEnd ? " (cancels at period end)" : ""}
              </span>
            </div>
            <div className="sub-info-row">
              <span className="sub-info-label">Premium Access</span>
              <span className="sub-info-value">{sub?.premium ? "Yes" : "No"}</span>
            </div>
            {isPromo && sub?.promo?.endsAt && (
              <div className="sub-info-row">
                <span className="sub-info-label">Free Access Ends</span>
                <span className="sub-info-value">{formatDate(sub.promo.endsAt)}</span>
              </div>
            )}
            <div className="sub-info-row">
              <span className="sub-info-label">Trial Ends</span>
              <span className="sub-info-value">{formatDate(sub?.trialEndsAt)}</span>
            </div>
            <div className="sub-info-row">
              <span className="sub-info-label">Paid Through</span>
              <span className="sub-info-value">{formatDate(sub?.paidThrough)}</span>
            </div>
            <div className="sub-info-row">
              <span className="sub-info-label">Next Renewal</span>
              <span className="sub-info-value">{formatDate(sub?.currentPeriodEnd)}</span>
            </div>
            <div className="sub-info-row">
              <span className="sub-info-label">Grace Period Ends</span>
              <span className="sub-info-value">{formatDate(sub?.graceEndsAt)}</span>
            </div>
          </div>
        )}

        {/* A promo grant has no Stripe subscription, so there is nothing to cancel. */}
        {status !== "none" && status !== "canceled" && !isPromo && !sub?.cancelAtPeriodEnd && (
          <div className="sub-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="sub-btn sub-btn-danger"
              onClick={() => navigate("/subscriptions/cancel")}
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </SubscriptionPageLayout>
  );
};
