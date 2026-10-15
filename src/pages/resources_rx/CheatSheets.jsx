import { ResourcePdfViewer } from "./ResourcePdfViewer";

// Served from /public/resources so the file can be both displayed here and
// downloaded byte-for-byte as the original PDF.
export const CHEAT_SHEETS_PDF = "/resources/CHEAT_SHEETS.pdf";
export const CHEAT_SHEETS_PDF_NAME = "CHEAT_SHEETS.pdf";

export const CheatSheets = () => (
  <ResourcePdfViewer
    pageTitle="Cheat Sheets"
    title="Cheat Sheets"
    subtitle="PrepRX Cheat Sheets — high-yield pharmacology and lab value shortcuts for quick NCLEX review. Scan a table, cover the right column, recall the nursing action."
    pdfPath={CHEAT_SHEETS_PDF}
    pdfName={CHEAT_SHEETS_PDF_NAME}
    docLabel="PrepRX Cheat Sheets · 6 pages"
  />
);

export default CheatSheets;
