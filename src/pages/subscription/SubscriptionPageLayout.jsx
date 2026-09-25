import { useState } from "react";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";

import "./Subscription.css";

export const SubscriptionPageLayout = ({ pageTitle, subtitle, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sub-layout">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="sub-main">
        <Topbar
          pageTitle={pageTitle}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="sub-content-scroll">
          <HeaderCard
            title={pageTitle}
            subtitle={subtitle}
            className="sub-header-card"
          />

          <div className="sub-body">{children}</div>
        </div>
      </div>
    </div>
  );
};
