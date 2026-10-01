import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { PLAN_LIST } from "../../config/plans";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

export const UpgradePlan = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const navigate = useNavigate();

  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId);
    try {
      const res = await api.post("/billing/plan", { planId });
      const data = res.data?.data;
      if (data?.url) {
        // Checkout (no subscription yet) or Stripe portal (already subscribed)
        window.location.href = data.url;
        return;
      }
      toast.success(res.data?.message || "Plan updated");
      navigate("/subscriptions/manage");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to change plan");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SubscriptionPageLayout
      pageTitle="Upgrade Plan"
      subtitle="Choose the plan that fits your NCLEX prep journey. Upgrades bill immediately; downgrades start at your next renewal."
    >
      <div className="sub-card">
        <h3 className="sub-card-title">Available Plans</h3>
        <div className="sub-plan-grid">
          {PLAN_LIST.map((plan) => (
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
        Stripe proration and bill the difference immediately. Downgrades are not prorated — the lower
        price takes effect at your next renewal, so no refund is issued today. If you don't have a
        subscription yet you'll be taken to secure checkout.
      </p>
    </SubscriptionPageLayout>
  );
};
