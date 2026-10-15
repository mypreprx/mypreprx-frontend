import { ResourcePdfViewer } from "./ResourcePdfViewer";

// Served from /public/resources so the file can be both displayed here and
// downloaded byte-for-byte as the original PDF.
export const CARE_MAPS_PDF = "/resources/CARE_MAPS_preprx.pdf";
export const CARE_MAPS_PDF_NAME = "CARE_MAPS_preprx.pdf";

export const CareMaps = () => (
  <ResourcePdfViewer
    pageTitle="Care Maps"
    title="Care Maps"
    subtitle="PrepRX Care Maps — visual logic flows for the most common nursing diagnoses and interventions. See the cues, follow the logic, prioritize the nursing action."
    pdfPath={CARE_MAPS_PDF}
    pdfName={CARE_MAPS_PDF_NAME}
    docLabel="PrepRX Care Maps · 14 pages"
  />
);

export default CareMaps;
