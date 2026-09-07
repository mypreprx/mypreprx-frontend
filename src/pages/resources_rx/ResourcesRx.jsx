import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";
import { BackButton } from "../../components/common/BackButton";

import "./ResourcesRx.css";

export const ResourcesRx = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filters = ["All", "Cheat Sheets", "Study planner", "Care Maps"];

  const resourceCards = [
    {
      id: 1,
      title: "Study planner",
      description: "Organize your NCLEX journey with our comprehensive weekly study maps.",
      category: "Study planner",
      link: "/**/"
    },
    {
      id: 2,
      title: "Cheat Sheets",
      description: "High-yield pharmacology and lab value shortcuts for quick review.",
      category: "Cheat Sheets",
      link: "/**/"
    },
    {
      id: 3,
      title: "Care Maps",
      description: "Visual logic flows for the most common nursing diagnoses and interventions.",
      category: "Care Maps",
      link: "/**/"
    },
    {
      id: 4,
      title: "Affiliate Tie-Ins",
      description: "Exclusive discounts and resources from our trusted nursing education partners.",
      category: "All",
      link: "/**/"
    }
  ];

  const filteredCards = activeFilter === "All" 
    ? resourceCards 
    : resourceCards.filter(card => card.category === activeFilter);

  return (
    <div className="rrx-container">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT AREA */}
      <div className="rrx-main-area">
        {/* TOPBAR */}
        <Topbar 
          pageTitle="Resources Rx" 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />

        <div className="rrx-content-scroll">
          {/* HEADER CARD */}
          {/* BACK BUTTON */}
          <div className="rrx-back-btn-container">
            <BackButton to="/home" />
          </div>

          <HeaderCard
            title="Resource RX"
            subtitle="Prescriptions for Growth: High-yield tools to accelerate your learning."
            className="rrx-header-card"
          />

          {/* FOLLOW US */}
          <div className="rrx-promo-banner">
            <p>
              Follow us for daily tips on 
              <span className="rrx-social tiktok"> TikTok</span>, 
              <span className="rrx-social instagram"> Instagram</span>, and 
              <span className="rrx-social youtube"> YouTube</span>
            </p>
          </div>

          {/* FILTERS */}
          <div className="rrx-filter-group">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`rrx-filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* CARDS GRID */}
          <div className="rrx-grid">
            {filteredCards.map((card) => (
              <div key={card.id} className="rrx-card" onClick={() => navigate(card.link)}>
                <div className="rrx-card-content">
                  <span className="rrx-card-category">{card.category}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <div className="rrx-card-footer">
                   <button className="rrx-download-btn">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17V18C2 19.6569 3.34315 21 5 21H19C20.6569 21 22 19.6569 22 18V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                     Download
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
