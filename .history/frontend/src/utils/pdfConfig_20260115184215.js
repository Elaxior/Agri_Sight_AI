/**
 * PDF Generation Configuration
 * Settings for html2pdf.js library
 */

export const PDF_CONFIG = {
  // Page layout
  margin: 10,                    // 10mm margins on all sides
  pageOrientation: 'portrait',   // 'portrait' or 'landscape'
  pageFormat: 'a4',              // 'a4', 'letter', 'legal', etc.
  
  // Image quality
  imageType: 'jpeg',             // 'jpeg' or 'png'
  imageQuality: 0.95,            // 0-1 (higher = better quality, larger file)
  
  // HTML to Canvas conversion
  scale: 2,                       // 1 = 96dpi, 2 = 192dpi (better quality)
  useCORS: true,                 // Allow cross-origin images
  allowTaint: true,              // Allow tainted canvas (for local images)
  backgroundColor: '#ffffff',    // Page background color
  
  // Font settings
  fontName: 'arial',
  fontSize: 12,
  
  // File naming function
  filename: (fieldId, date) => {
    const sanitizedFieldId = (fieldId || 'Unknown').replace(/[^a-zA-Z0-9]/g, '-');
    const sanitizedDate = date || new Date().toISOString().split('T')[0];
    return `Mission-Report-${sanitizedFieldId}-${sanitizedDate}.pdf`;
  }
};

// Alternative: jsPDF-specific configuration (if you switch libraries)
export const JSPDF_CONFIG = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  compress: true,
  fontSize: 12,
  lineHeight: 1.5
};
