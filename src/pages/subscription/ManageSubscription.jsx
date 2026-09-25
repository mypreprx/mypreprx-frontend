import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#319795" strokeWidth="2" fill="#E6FFFA" />
    <path d="M8.5 12.5L10.8 14.8L15.5 9.5" stroke="#319795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLAN_LABELS = {
  monthly: { name: "Monthly", price: "$29.99", cycle: "Monthly" },
  "three-month": { name: "3-Month", price: "$79.99", cycle: "Every 3 months" },
  annual: { name: "Annual", price: "$259.00", cycle: "Yearly" },
};

const STATUS_LABELS = {
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

  const plan = sub?.planId ? PLAN_LABELS[sub.planId] : null;
  const status = sub?.status || "none";

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
            <p className="sub-plan-name">{plan?.name || "No active plan"}</p>
            <p className="sub-plan-price">
              {plan?.price || "—"} {plan ? <span>/ {plan.cycle}</span> : null}
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

        <div className="sub-actions" style={{ marginTop: "24px" }}>
          <button type="button" className="sub-btn sub-btn-primary" onClick={() => (window.location.href = "/subscriptions/upgrade")}>
            Upgrade Plan
          </button>
          <button type="button" className="sub-btn sub-btn-outline" onClick={openPortal}>
            Update Payment Method
          </button>
          <button type="button" className="sub-btn sub-btn-outline" onClick={openPortal}>
            View Invoices
          </button>
        </div>
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

        {status !== "none" && status !== "canceled" && !sub?.cancelAtPeriodEnd && (
          <div className="sub-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="sub-btn sub-btn-danger"
              onClick={() => (window.location.href = "/subscriptions/cancel")}
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </SubscriptionPageLayout>
  );
};
