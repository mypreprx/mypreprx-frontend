import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

const CancelIconWarn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.33 1.55 18.7 1.55 19.07C1.55 19.44 1.64 19.81 1.82 20.14C2 20.47 2.26 20.75 2.58 20.95C2.9 21.15 3.27 21.26 3.65 21.26H20.35C20.73 21.26 21.1 21.15 21.42 20.95C21.74 20.75 22 20.47 22.18 20.14C22.36 19.81 22.45 19.44 22.45 19.07C22.45 18.7 22.36 18.33 22.18 18L13.71 3.86C13.53 3.53 13.27 3.25 12.95 3.05C12.63 2.85 12.26 2.75 11.88 2.75C11.5 2.75 11.13 2.85 10.81 3.05C10.49 3.25 10.23 3.53 10.05 3.86H10.29Z" stroke="#C53030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CancelSubscription = () => {
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The reason is persisted on the subscription record (and echoed in the
      // cancellation notification) — previously it was collected and discarded.
      const res = await api.post("/billing/cancel", {
        reason: selectedReason || undefined,
      });
      toast.success(res.data?.message || "Subscription will cancel at the end of the paid period");
      navigate("/subscriptions/manage");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionPageLayout
      pageTitle="Cancel Subscription"
      subtitle="We're sorry to see you go. Access continues until the end of your paid period."
    >
      <div className="sub-notice">
        <CancelIconWarn />{" "}
        <strong>Heads up:</strong> Canceling sets your subscription to end at the close of the
        current paid period. You keep access until then. Stripe webhooks confirm the final status —
        this page alone does not change your entitlement.
      </div>

      <div className="sub-card">
        <h3 className="sub-card-title">Why are you canceling?</h3>
        <form className="sub-form" onSubmit={handleSubmit}>
          <div className="sub-reason-list">
            {[
              "Too expensive",
              "Not using it enough",
              "Found another solution",
              "Technical issues",
              "Just taking a break",
              "Other",
            ].map((reason) => (
              <label
                key={reason}
                className={`sub-reason-item ${selectedReason === reason ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                />
                {reason}
              </label>
            ))}
          </div>

          <p className="sub-note">
            Prefer to pause or update your card instead? Use the Stripe Customer Portal from
            Manage Subscription.
          </p>

          <div className="sub-actions">
            <button
              type="button"
              className="sub-btn sub-btn-primary"
              onClick={() => navigate("/subscriptions/manage")}
            >
              Keep My Subscription
            </button>
            <button type="submit" className="sub-btn sub-btn-danger" disabled={loading}>
              {loading ? "Processing…" : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </SubscriptionPageLayout>
  );
};
