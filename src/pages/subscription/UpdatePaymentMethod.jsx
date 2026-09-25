import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

export const UpdatePaymentMethod = () => {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await api.post("/billing/portal");
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error("Unable to open billing portal");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionPageLayout
      pageTitle="Update Payment Method"
      subtitle="Update the card used for your subscription payments via Stripe."
    >
      <div className="sub-card">
        <h3 className="sub-card-title">Payment Method</h3>
        <p className="sub-note">
          Card details are managed securely in the Stripe Customer Portal. You can update your
          card, view saved methods, and download invoices there. Subscription status is always
          synchronized from Stripe webhooks — never from this page alone.
        </p>
        <div className="sub-actions" style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="sub-btn sub-btn-primary"
            onClick={openPortal}
            disabled={loading}
          >
            {loading ? "Opening…" : "Open Stripe Portal"}
          </button>
        </div>
      </div>
    </SubscriptionPageLayout>
  );
};
