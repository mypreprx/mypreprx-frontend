import { useState } from "react";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import { HeaderCard } from "../../components/common/HeaderCard";

import "./ResourcesRx.css";
import "./ResourcePdfViewer.css";

/**
 * Shared in-app PDF viewer used by Resources RX documents (Study Planner,
 * Cheat Sheets, ...). Shows the exact document (fit-to-width) and lets the
 * user open it in a new tab or download the original file.
 */
export const ResourcePdfViewer = ({
  pageTitle,
  title,
  subtitle,
  pdfPath,
  pdfName,
  docBadge = "PDF",
  docLabel,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="rrx-container">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT AREA */}
      <div className="rrx-main-area">
        {/* TOPBAR */}
        <Topbar
          pageTitle={pageTitle}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="rrx-content-scroll">
          <HeaderCard
            title={title}
            subtitle={subtitle}
            className="rrx-header-card"
          />

          {/* TOOLBAR */}
          <div className="rpv-toolbar">
            <div className="rpv-toolbar-info">
              <span className="rpv-doc-badge">{docBadge}</span>
              {docLabel && <span className="rpv-doc-name">{docLabel}</span>}
            </div>

            <div className="rpv-toolbar-actions">
              <a
                className="rpv-btn rpv-btn-ghost"
                href={pdfPath}
                target="_blank"
                rel="noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Open in new tab
              </a>

              <a
                className="rpv-btn rpv-btn-primary"
                href={pdfPath}
                download={pdfName}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17V18C2 19.6569 3.34315 21 5 21H19C20.6569 21 22 19.6569 22 18V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>

          {/* PDF VIEWER — shows the exact text and styling of the document */}
          <div className="rpv-viewer">
            <iframe
              className="rpv-frame"
              src={`${pdfPath}#zoom=page-width`}
              title={title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePdfViewer;
