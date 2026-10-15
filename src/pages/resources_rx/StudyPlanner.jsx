import { ResourcePdfViewer } from "./ResourcePdfViewer";

// Served from /public/resources so the file can be both displayed here and
// downloaded byte-for-byte as the original PDF.
export const STUDY_PLANNER_PDF = "/resources/Study_Planner.pdf";
export const STUDY_PLANNER_PDF_NAME = "Study_Planner.pdf";

export const StudyPlanner = () => (
  <ResourcePdfViewer
    pageTitle="Study Planner"
    title="Study Planner"
    subtitle="PrepRX NCLEX Study Planner — comprehensive weekly study maps to keep your preparation focused, measurable, and consistent. Organize your NCLEX journey."
    pdfPath={STUDY_PLANNER_PDF}
    pdfName={STUDY_PLANNER_PDF_NAME}
    docLabel="PrepRX Study Planner · 12 pages"
  />
);

export default StudyPlanner;
