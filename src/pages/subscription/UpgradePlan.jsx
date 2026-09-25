import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$29.99",
    period: "/ month",
    description: "Full premium access billed monthly. 3-day free trial on first subscribe.",
    featured: true,
  },
  {
    id: "three-month",
    name: "3-Month",
    price: "$79.99",
    period: "/ 3 months",
    description: "Full premium access on a 3-month billing cycle.",
    featured: false,
  },
  {
    id: "annual",
    name: "Annual",
    price: "$259.00",
    period: "/ year",
    description: "Full premium access billed yearly.",
    featured: false,
  },
];

export const UpgradePlan = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId);
    try {
      const res = await api.post("/billing/plan", { planId });
      const data = res.data?.data;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.success(res.data?.message || "Plan updated");
      window.location.href = "/subscriptions/manage";
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to change plan");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SubscriptionPageLayout
      pageTitle="Upgrade Plan"
      subtitle="Choose the plan that fits your NCLEX prep journey. Stripe handles proration on upgrades."
    >
      <div className="sub-card">
        <h3 className="sub-card-title">Available Plans</h3>
        <div className="sub-plan-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`sub-plan-card ${plan.featured ? "featured" : ""}`}
            >
              <h4>{plan.name}</h4>
              <p className="price">
                {plan.price} <span>{plan.period}</span>
              </p>
              <p>{plan.description}</p>
              <button
                type="button"
                className={`sub-btn ${plan.featured ? "sub-btn-primary" : "sub-btn-outline"}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingPlan === plan.id}
              >
                {loadingPlan === plan.id
                  ? "Updating…"
                  : plan.featured
                    ? "Select Plan"
                    : `Switch to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="sub-note">
        Plan changes synchronize entitlement and renewal details via Stripe webhooks. Upgrades use
        Stripe proration — no custom calculations. If you don't have a subscription yet you'll be
        taken to secure checkout.
      </p>
    </SubscriptionPageLayout>
  );
};
