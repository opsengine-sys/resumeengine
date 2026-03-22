import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useResumeStore } from '../store/resumeStore';
import ResumePreview from './preview/ResumePreview';
import { FiX, FiDownload, FiCheckCircle } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GFONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Source+Sans+3:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Roboto:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';

const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 41" height="32" style="display:block;flex-shrink:0;">
  <defs>
    <linearGradient id="lg-icon" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#BEF264"/>
      <stop offset="40%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
    <linearGradient id="lg-fold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
  </defs>
  <g>
    <path d="M7 0 H23 A2.5 2.5 0 0 1 25.5 2.5 V38.5 A2.5 2.5 0 0 1 23 41 H2.5 A2.5 2.5 0 0 1 0 38.5 V7 Z" fill="url(#lg-icon)"/>
    <path d="M0 7 L7 7 L7 0 Z" fill="url(#lg-fold)" opacity="0.85"/>
    <rect x="5" y="15" width="15" height="3.5" rx="1.75" fill="white" fill-opacity="0.92"/>
    <rect x="5" y="21" width="15" height="3.5" rx="1.75" fill="white" fill-opacity="0.92"/>
    <rect x="5" y="27" width="10" height="3.5" rx="1.75" fill="white" fill-opacity="0.92"/>
  </g>
  <text x="33" y="28" font-family="Space Grotesk,Inter,sans-serif" font-size="18" font-weight="500" fill="#34D399">Resume</text>
  <text x="107" y="28" font-family="Space Grotesk,Inter,sans-serif" font-size="18" font-weight="700" fill="#ecfdf5">Engine</text>
</svg>`;

const PAGE_SIZES = {
  A4:     { label: 'A4',     css: 'A4 portrait',     w: '794px', desc: '210×297mm', marginH: '14mm',   marginV: '12mm'   },
  Letter: { label: 'Letter', css: 'letter portrait', w: '816px', desc: '8.5×11in',  marginH: '0.55in', marginV: '0.47in' },
  Legal:  { label: 'Legal',  css: 'legal portrait',  w: '816px', desc: '8.5×14in',  marginH: '0.55in', marginV: '0.47in' },
} as const;
type PageSize = keyof typeof PAGE_SIZES;

export default function ExportModal({ isOpen, onClose }: Props) {
  const { getActiveResume } = useResumeStore();
  const resume = getActiveResume();
  const [pageSize, setPageSize] = useState<PageSize>('A4');

  if (!isOpen || !resume) return null;

  const openPopup = () => {
    const sz         = PAGE_SIZES[pageSize];
    const typo       = resume.typography;
    const colors     = resume.colors;
    const linkColor  = colors?.linkColor  ?? '#2563eb';
    const fontFamily = typo?.fontFamily   ?? 'Inter, sans-serif';

    const resumeHtml = renderToStaticMarkup(
      <ResumePreview resume={resume} scale={1} forExport />
    );

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${resume.name} – Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="${GFONTS}" rel="stylesheet"/>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    html, body {
      margin: 0; padding: 0;
      background: #f0f0f0;
      font-family: ${fontFamily};
      font-size: ${typo?.baseFontSize ?? 10}px;
      line-height: ${typo?.lineHeight ?? 1.5};
      color: ${colors?.textColor ?? '#1f2937'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1,h2,h3,h4,h5,h6,p,ul,ol,li { margin:0; padding:0; }
    a, a:link, a:visited, a:hover, a:active {
      color: ${linkColor} !important;
      text-decoration: underline !important;
      text-underline-offset: 2px !important;
      display: inline !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      -webkit-text-fill-color: ${linkColor} !important;
    }

    /* ── Screen layout ── */
    @media screen {
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        min-height: 100vh;
      }
      #save-bar {
        position: sticky;
        top: 0;
        z-index: 999;
        width: 100%;
        background: linear-gradient(135deg, #064E3B 0%, #047857 100%);
        color: white;
        padding: 10px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.25);
        gap: 16px;
        flex-wrap: wrap;
      }
      #resume-page {
        width: ${sz.w};
        min-height: 1123px;
        background: #ffffff;
        box-shadow: 0 4px 32px rgba(0,0,0,0.2);
        margin: 24px 0 40px;
      }
      #pdf-hint { display: none; }
      #pdf-hint.visible {
        display: flex;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,0,0,0.72);
        align-items: center;
        justify-content: center;
        font-family: 'Inter', system-ui, sans-serif;
      }
    }

    /* ── Paged media — page size + margins + page numbers ── */
    @page {
      size: ${sz.css};
      margin: ${sz.marginH} ${sz.marginV};
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 9px;
        color: #9ca3af;
      }
    }
    @page :first {
      margin-top: 0mm;
    }

    /* ── Print styles ── */
    @media print {
      #save-bar { display: none !important; }
      #pdf-hint { display: none !important; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        display: block !important;
      }
      #resume-page {
        width: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      li, tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1, h2, h3, h4, h5, h6 {
        break-after: avoid;
        page-break-after: avoid;
      }
      h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + * {
        break-before: avoid;
        page-break-before: avoid;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      a, a:link, a:visited, a:hover, a:active {
        color: ${linkColor} !important;
        text-decoration: underline !important;
        display: inline !important;
        opacity: 1 !important;
        -webkit-text-fill-color: ${linkColor} !important;
      }
    }
  </style>
</head>
<body>
  <div id="save-bar">
    <div style="display:flex;align-items:center;gap:10px;">
      ${LOGO_SVG}
      <span style="opacity:0.35;font-size:18px;margin:0 4px;">|</span>
      <span style="opacity:0.75;font-size:12px;">${resume.name}</span>
      <span style="opacity:0.5;font-size:11px;margin-left:4px;">(${sz.label})</span>
    </div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <div style="font-size:11px;opacity:0.9;background:rgba(255,255,255,0.12);padding:7px 14px;border-radius:8px;line-height:1.6;">
        ✅ Text is selectable &nbsp;·&nbsp; 🔗 Links are clickable<br/>
        <strong>Destination:</strong> Save as PDF &nbsp;→&nbsp; disable headers/footers &nbsp;→&nbsp; Save
      </div>
      <button
        onclick="window.print()"
        style="background:#10B981;border:none;color:white;padding:10px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px rgba(16,185,129,0.5);">
        ⬇ Save as PDF
      </button>
    </div>
  </div>

  <div id="pdf-hint">
    <div style="background:#fff;border-radius:16px;padding:32px 40px;max-width:440px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.3);">
      <div style="font-size:40px;margin-bottom:12px;">📄</div>
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 12px;">Save as PDF (${sz.label})</h2>
      <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;text-align:left;">
        <p style="font-size:13px;color:#065f46;margin:0;line-height:1.8;">
          <strong>1.</strong> Set <strong>Destination</strong> →
            <span style="background:#059669;color:white;padding:1px 8px;border-radius:4px;font-weight:700;">Save as PDF</span><br/>
          <strong>2.</strong> Under <strong>More settings</strong> → turn off <strong>Headers and footers</strong><br/>
          <strong>3.</strong> Click <strong>Save</strong>
        </p>
      </div>
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        ✅ Selectable text &nbsp;·&nbsp; 🔗 Clickable links &nbsp;·&nbsp; 🎨 Full colors
      </p>
    </div>
  </div>

  <div id="resume-page">
    ${resumeHtml}
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.getElementById('pdf-hint').classList.add('visible');
        window.print();
        window.addEventListener('afterprint', function() {
          document.getElementById('pdf-hint').classList.remove('visible');
        });
      }, 1000);
    });
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=960,height=800,scrollbars=yes,resizable=yes');
    if (!win) {
      alert(
        'Pop-up blocked!\n\n' +
        '• Chrome: Click 🚫 in address bar → "Always allow pop-ups"\n' +
        '• Firefox: Click "Options" → "Allow pop-ups"\n\n' +
        'Then click Download again.'
      );
      return;
    }

    win.document.open();
    win.document.write(fullHtml);
    win.document.close();
    win.focus();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Download as PDF</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose your page size first</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Page size picker */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(PAGE_SIZES) as PageSize[]).map(key => (
            <button
              key={key}
              onClick={() => setPageSize(key)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
              style={{
                borderColor: pageSize === key ? '#10b981' : '#e5e7eb',
                background:  pageSize === key ? '#f0fdf4' : '#fafafa',
              }}
            >
              <div
                className="rounded-sm border-2 flex-shrink-0"
                style={{
                  width:       22,
                  height:      key === 'A4' ? 31 : key === 'Letter' ? 29 : 38,
                  borderColor: pageSize === key ? '#10b981' : '#d1d5db',
                  background:  '#fff',
                }}
              />
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color: pageSize === key ? '#059669' : '#374151' }}>
                  {PAGE_SIZES[key].label}
                </p>
                <p className="text-[10px] text-gray-400">{PAGE_SIZES[key].desc}</p>
              </div>
              {pageSize === key && <FiCheckCircle size={14} className="text-emerald-500" />}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={openPopup}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm"
        >
          <FiDownload size={14} /> Download {PAGE_SIZES[pageSize].label} PDF
        </button>

      </div>
    </div>
  );
}