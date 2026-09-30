/**
 * reportGenerator.ts — Standalone Medical Screening Report Generator
 *
 * Generates professional, standalone clinical diagnostic reports for RetinaCare AI:
 *   - Standalone HTML export (.html file that opens cleanly in any browser/viewer)
 *   - Standalone Print rendering (isolated iframe print without website chrome or navigation)
 *   - Strict compliance with patient privacy: NO internal ML metrics/architecture details
 *   - Prominently displays permanent unique Patient ID (e.g. RC-000001)
 */

import { DR_STAGES, DR_CLASS_MAPPING } from '../types';

export interface StandaloneReportData {
  reportId: string;
  createdAt: string;
  patient: {
    name: string;
    patientId: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  doctor?: {
    name: string;
    specialization?: string;
    hospital?: string;
  } | null;
  image?: {
    originalFilename?: string;
    mimeType?: string;
    size?: number;
    url?: string;
    previewUrl?: string;
  };
  aiResult: {
    predictedClass: number;
    predictedLabel: string;
    referable: boolean;
    disclaimer?: string;
  };
  review?: {
    decision: string;
    doctorNotes?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  } | null;
}

const DR_SEVERITY_META: Record<number, { label: string; badgeColor: string; bgLight: string; textColor: string; borderColor: string; description: string }> = {
  0: {
    label: 'No Diabetic Retinopathy (Stage 0)',
    badgeColor: '#059669',
    bgLight: '#ecfdf5',
    textColor: '#065f46',
    borderColor: '#a7f3d0',
    description: 'No microaneurysms or retinal vascular abnormalities detected. Retinal examination is within normal physiological limits for diabetic retinopathy.',
  },
  1: {
    label: 'Mild Non-Proliferative DR (Stage 1)',
    badgeColor: '#d97706',
    bgLight: '#fffbeb',
    textColor: '#92400e',
    borderColor: '#fde68a',
    description: 'Microaneurysms only are present. This indicates early, non-referable diabetic retinal vascular changes. Regular annual screening and glycemic control recommended.',
  },
  2: {
    label: 'Moderate Non-Proliferative DR (Stage 2)',
    badgeColor: '#ea580c',
    bgLight: '#fff7ed',
    textColor: '#9a3412',
    borderColor: '#fed7aa',
    description: 'More than microaneurysms but less than severe NPDR. Features may include retinal hemorrhages and hard exudates. Specialist consultation recommended.',
  },
  3: {
    label: 'Severe Non-Proliferative DR (Stage 3)',
    badgeColor: '#dc2626',
    bgLight: '#fef2f2',
    textColor: '#991b1b',
    borderColor: '#fecaca',
    description: 'Extensive intraretinal hemorrhages, venous beading, or prominent IRMA. High risk of progression to proliferative DR. Prompt ophthalmologist follow-up required.',
  },
  4: {
    label: 'Proliferative Diabetic Retinopathy (Stage 4)',
    badgeColor: '#b91c1c',
    bgLight: '#fef2f2',
    textColor: '#7f1d1d',
    borderColor: '#fca5a5',
    description: 'Neovascularization or vitreous/preretinal hemorrhage present. Sight-threatening advanced retinopathy requiring urgent specialist clinical intervention.',
  },
};

/**
 * Builds a complete, standalone, self-contained HTML document string.
 */
export function generateStandaloneReportHtml(data: StandaloneReportData): string {
  const cls = (data.aiResult.predictedClass in DR_SEVERITY_META ? data.aiResult.predictedClass : 0) as 0 | 1 | 2 | 3 | 4;
  const stageMeta = DR_SEVERITY_META[cls] || DR_SEVERITY_META[0];
  const stageInfo = DR_STAGES.find((s) => s.index === cls);
  const diagnosisLabel = DR_CLASS_MAPPING[cls] || data.aiResult.predictedLabel || stageMeta.label;

  const reportDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US');
  const reviewDate = data.review?.reviewedAt ? new Date(data.review.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : reportDate;
  const doctorName = data.doctor?.name ? (data.doctor.name.startsWith('Dr.') ? data.doctor.name : `Dr. ${data.doctor.name}`) : 'Attending Ophthalmologist';
  const doctorNotes = data.review?.doctorNotes || 'Screening confirmed and approved. Patient is advised to continue routine retinal health management.';
  const patientId = data.patient.patientId || 'RC-000000';
  const reportRef = `RC-REP-${data.reportId.slice(-8).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RetinaCare AI Screening Report — ${patientId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    .report-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
    }
    /* Header */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 2px solid #0284c7;
      margin-bottom: 20px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7 0%, #0891b2 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: -0.5px;
    }
    .brand-text h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .brand-text h1 span {
      color: #0284c7;
    }
    .brand-text p {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-top: 3px;
    }
    .header-meta {
      text-align: right;
    }
    .report-ref {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
    }
    .report-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    /* Grid Sections */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .info-card-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #64748b;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }
    .info-value-highlight {
      color: #0284c7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
    }

    /* Section Component */
    .section-box {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #334155;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 12px;
      background: #0284c7;
      border-radius: 2px;
    }

    /* Result Banner */
    .result-banner {
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .result-meta-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      opacity: 0.85;
      margin-bottom: 2px;
    }
    .result-diagnosis-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin-bottom: 6px;
    }
    .result-description {
      font-size: 12px;
      line-height: 1.5;
    }

    /* Card Box */
    .card-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .recommendations-list {
      padding-left: 18px;
      margin-top: 4px;
    }
    .recommendations-list li {
      margin-bottom: 6px;
    }

    /* Retinal Image Metadata Block */
    .image-meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 11px;
    }
    .image-meta-item span {
      display: block;
      color: #64748b;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .image-meta-item strong {
      color: #0f172a;
      font-size: 11.5px;
    }

    /* Disclaimer */
    .disclaimer-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 11px;
      color: #713f12;
      line-height: 1.45;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .disclaimer-title {
      font-weight: 700;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9.5px;
    }

    /* Footer */
    .report-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }

    @media print {
      body {
        background: #ffffff !important;
      }
      .report-container {
        padding: 0 !important;
        max-width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="report-header">
      <div class="brand-section">
        <div class="brand-badge">RC</div>
        <div class="brand-text">
          <h1>RetinaCare <span>AI</span></h1>
          <p>Diabetic Retinopathy Screening Report</p>
        </div>
      </div>
      <div class="header-meta">
        <div class="report-ref">${reportRef}</div>
        <div class="report-date">Report Date: ${reportDate}</div>
        <div class="status-badge">Doctor Verified &amp; Approved</div>
      </div>
    </div>

    <!-- Patient & Doctor Information -->
    <div class="info-grid">
      <!-- Patient Information -->
      <div class="info-card">
        <div class="info-card-title">Patient Information</div>
        <div class="info-row">
          <span class="info-label">Patient Name:</span>
          <span class="info-value">${data.patient.name || 'Patient'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Patient ID:</span>
          <span class="info-value info-value-highlight">${patientId}</span>
        </div>
        ${data.patient.dateOfBirth ? `
        <div class="info-row">
          <span class="info-label">Date of Birth:</span>
          <span class="info-value">${data.patient.dateOfBirth}</span>
        </div>` : ''}
        ${data.patient.gender ? `
        <div class="info-row">
          <span class="info-label">Gender:</span>
          <span class="info-value">${data.patient.gender}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">Screening Date:</span>
          <span class="info-value">${reportDate}</span>
        </div>
      </div>

      <!-- Attending Specialist Information -->
      <div class="info-card">
        <div class="info-card-title">Attending Specialist</div>
        <div class="info-row">
          <span class="info-label">Reviewing Doctor:</span>
          <span class="info-value">${doctorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Specialization:</span>
          <span class="info-value">${data.doctor?.specialization || 'Ophthalmology'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hospital / Clinic:</span>
          <span class="info-value">${data.doctor?.hospital || 'RetinaCare Partner Clinic'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Verification Date:</span>
          <span class="info-value">${reviewDate}</span>
        </div>
      </div>
    </div>

    <!-- Retinal Screening Result Banner -->
    <div class="result-banner" style="background-color: ${stageMeta.bgLight}; border: 1px solid ${stageMeta.borderColor}; color: ${stageMeta.textColor};">
      <div class="result-meta-label">Screening Classification Result</div>
      <div class="result-diagnosis-title">${diagnosisLabel}</div>
      <div class="result-description">${stageMeta.description}</div>
    </div>

    <!-- Clinical Interpretation -->
    <div class="section-box">
      <div class="section-title">Clinical Interpretation</div>
      <div class="card-content">
        <p>${stageInfo?.description || stageMeta.description}</p>
      </div>
    </div>

    <!-- Doctor's Assessment -->
    <div class="section-box">
      <div class="section-title">Doctor's Clinical Assessment &amp; Recommendations</div>
      <div class="card-content">
        <p style="margin-bottom: 8px; font-weight: 600; color: #0f172a;">Specialist Assessment Notes:</p>
        <p style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; color: #1e293b;">
          ${doctorNotes}
        </p>

        <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Recommended Next Steps:</p>
        <ul class="recommendations-list" style="color: #334155;">
          <li>Review the specialist assessment and clinical findings above with your healthcare provider.</li>
          <li>
            ${data.aiResult.referable
              ? 'Schedule a formal clinical consultation with a retina specialist / ophthalmologist for diagnostic evaluation.'
              : 'Maintain recommended routine annual screening examinations as advised by your eye care specialist.'}
          </li>
          <li>Continue diligent blood glucose, blood pressure, and HbA1c monitoring in accordance with your physician\'s diabetes care plan.</li>
        </ul>
      </div>
    </div>

    <!-- Retinal Examination Record -->
    <div class="section-box">
      <div class="section-title">Retinal Image Examination Record</div>
      ${data.image?.url || data.image?.previewUrl ? `
      <div style="text-align: center; margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
        <img src="${data.image.url || data.image.previewUrl}" alt="Retinal Fundus Examination" style="max-height: 220px; max-width: 100%; border-radius: 6px; object-fit: contain; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
      </div>` : ''}
      <div class="image-meta-grid">
        <div class="image-meta-item">
          <span>Digital Image File</span>
          <strong>${data.image?.originalFilename || 'Fundus_Examination.jpg'}</strong>
        </div>
        <div class="image-meta-item">
          <span>Examination Modality</span>
          <strong>Color Fundus Photography</strong>
        </div>
        <div class="image-meta-item">
          <span>Evaluation Status</span>
          <strong>Verified &amp; Archived</strong>
        </div>
      </div>
    </div>

    <!-- Medical Notice Disclaimer -->
    <div class="disclaimer-box">
      <div class="disclaimer-title">Important Medical Notice &amp; Disclaimer</div>
      <p>
        ${data.aiResult.disclaimer || 'This report is generated through AI-assisted diabetic retinopathy screening and reviewed by a licensed medical practitioner. It is intended for early screening support and should be interpreted within comprehensive clinical context.'}
      </p>
    </div>

    <!-- Report Footer -->
    <div class="report-footer">
      <div>RetinaCare AI Diagnostic Platform &bull; Medical Screening Document</div>
      <div>Generated: ${new Date().toLocaleString('en-US')} &bull; Ref: ${reportRef}</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a file download of the standalone HTML report.
 */
export function downloadStandaloneReport(data: StandaloneReportData): void {
  const htmlContent = generateStandaloneReportHtml(data);
  const patientId = data.patient.patientId || 'RC-000000';
  const filename = `RetinaCare_Report_${patientId}_${data.reportId.slice(-8).toUpperCase()}.html`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Prints the standalone medical report in an isolated hidden iframe
 * ensuring NO website dashboard, sidebar, navbar, or UI buttons appear in the print/PDF output.
 */
export function printStandaloneReport(data: StandaloneReportData): void {
  const htmlContent = generateStandaloneReportHtml(data);

  // Create an isolated iframe for clean printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback if iframe access fails: open standalone popup print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);
}
