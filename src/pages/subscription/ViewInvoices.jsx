import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../config/axiosInstance";
import { SubscriptionPageLayout } from "./SubscriptionPageLayout";
import "./Subscription.css";

export const ViewInvoices = () => {
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
      pageTitle="View Invoices"
      subtitle="Review and download your past subscription invoices in Stripe."
    >
      <div className="sub-card">
        <h3 className="sub-card-title">Invoice History</h3>
        <p className="sub-note">
          Invoices are hosted by Stripe. Open the Customer Portal to view invoice history,
          download PDFs, and manage billing details. Payment success/failure is reflected here
          only after Stripe webhooks synchronize your subscription.
        </p>
        <div className="sub-actions" style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="sub-btn sub-btn-primary"
            onClick={openPortal}
            disabled={loading}
          >
            {loading ? "Opening…" : "Open Invoices in Stripe"}
          </button>
        </div>
      </div>
    </SubscriptionPageLayout>
  );
};
