import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FiMinus, FiPlus, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useResumeStore } from '../../store/resumeStore';
import ResumePreview from './ResumePreview';
import { useTheme } from '../../context/ThemeContext';

/* ── Page size definitions ── */
const PAGE_SIZES = {
  A4:     { w: 794,  h: 1123, label: 'A4',     sub: '210×297mm' },
  Letter: { w: 816,  h: 1056, label: 'Letter',  sub: '8.5×11in' },
  Legal:  { w: 816,  h: 1344, label: 'Legal',   sub: '8.5×14in' },
} as const;
type PageSizeKey = keyof typeof PAGE_SIZES;

/* ─────────────────────────────────────────────────────────────────
   MultiPagePreview — correct approach:
   1. Render the resume ONCE in a hidden div at natural size (scale=1)
   2. ResizeObserver measures the real pixel height → numPages
   3. For each page:
      a. Outer wrapper: overflow:hidden, sized to pageW×pageH (natural)
         then CSS-scaled via transform:scale(zoom) at top-left origin
      b. Inner div: natural width pageW, position relative, marginTop = -(pageIdx * pageH)
         This clips exactly one page-height slice
   This avoids the transform-order bug entirely.
──────────────────────────────────────────────────────────────── */
interface MPProps {
  resume:     ReturnType<typeof useResumeStore.getState>['resumes'][0];
  pageW:      number;
  pageH:      number;
  scale:      number;
  isDark:     boolean;
}

function MultiPagePreview({ resume, pageW, pageH, scale, isDark }: MPProps) {
  const hiddenRef  = useRef<HTMLDivElement>(null);
  const [totalH, setTotalH] = useState(pageH);

  useEffect(() => {
    const el = hiddenRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.scrollHeight;
      if (h > 50) setTotalH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageH, resume]);

  const numPages = Math.max(1, Math.ceil(totalH / pageH));

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           `${Math.round(20 * scale)}px`,
      padding:       `${Math.round(20 * scale)}px ${Math.round(16 * scale)}px ${Math.round(40 * scale)}px`,
      minWidth:      `${pageW * scale + 40}px`,
    }}>

      {/* Hidden measurement div — at natural size, off-screen */}
      <div
        ref={hiddenRef}
        aria-hidden
        style={{
          position:      'fixed',
          top:           0,
          left:          '-9999px',
          width:         `${pageW}px`,
          visibility:    'hidden',
          pointerEvents: 'none',
          zIndex:        -1,
        }}
      >
        <ResumePreview resume={resume} scale={1} forExport={false} />
      </div>

      {/* One frame per page */}
      {Array.from({ length: numPages }, (_, pageIndex) => (
        <div key={pageIndex} style={{ flexShrink: 0 }}>
          {/* Page label */}
          <div style={{
            textAlign:     'center',
            marginBottom:  `${Math.round(4 * scale)}px`,
            fontSize:      '11px',
            fontFamily:    'system-ui, sans-serif',
            color:         isDark ? '#6b7280' : '#9ca3af',
            letterSpacing: '0.05em',
            userSelect:    'none',
          }}>
            Page {pageIndex + 1} of {numPages}
          </div>

          {/*
            Outer: clips to one page. Scaled via transform.
            transform-origin: top left so it scales outward correctly.
          */}
          <div style={{
            width:           `${pageW * scale}px`,
            height:          `${pageH * scale}px`,
            overflow:        'hidden',
            position:        'relative',
            boxShadow:       isDark
              ? '0 8px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.5)'
              : '0 4px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
            borderRadius:    '3px',
            background:      '#ffffff',
          }}>
            {/*
              Scale wrapper: scales the natural-size resume.
              transform-origin top left means x=0,y=0 stays fixed.
            */}
            <div style={{
              width:           `${pageW}px`,
              height:          `${totalH}px`,
              transformOrigin: 'top left',
              transform:       `scale(${scale})`,
              pointerEvents:   'none',
              userSelect:      'none',
            }}>
              {/*
                Shift the resume up by (pageIndex * pageH) so the
                correct slice shows through the outer clip.
                marginTop works in pre-scale coordinates — correct!
              */}
              <div style={{ marginTop: `${-(pageIndex * pageH)}px` }}>
                <ResumePreview resume={resume} scale={1} forExport={false} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── LaTeX Panel (lazy) ── */
function LaTeXPanel({ resumeId }: { resumeId: string }) {
  const [LaTeXView, setLaTeXView] = useState<React.ComponentType<{ resumeId: string }> | null>(null);
  useEffect(() => {
    import('./LaTeXViewInline').then(m => setLaTeXView(() => m.default)).catch(() => {});
  }, []);
  if (!LaTeXView) return <div style={{ padding: 32, color: '#6b7280' }}>Loading LaTeX…</div>;
  return <LaTeXView resumeId={resumeId} />;
}

/* ────────────────────────────────────────────────────────────────
   Main PreviewPanel
──────────────────────────────────────────────────────────────── */
export default function PreviewPanel({ previewKey }: { previewKey: number }) {
  const { isDark }   = useTheme();
  const activeId     = useResumeStore(s => s.activeResumeId);
  const resume       = useResumeStore(s => s.resumes.find(r => r.id === s.activeResumeId));
  const templateId   = resume?.templateId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [pageSizeKey, setPageSizeKey] = useState<PageSizeKey>('A4');
  const [zoom,        setZoom]        = useState(0);     // 0 = fit-mode
  const [fitZoom,     setFitZoom]     = useState(0.85);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab,   setActiveTab]   = useState<'preview' | 'latex'>('preview');

  const pageW  = PAGE_SIZES[pageSizeKey].w;
  const pageH  = PAGE_SIZES[pageSizeKey].h;
  const isLatex = templateId === 'latex';
  const isFit   = zoom === 0;

  /* Compute fit-zoom from container width */
  const computeFit = useCallback((el: HTMLElement | null, w: number) => {
    if (!el) return;
    const available = el.clientWidth - 48;
    if (available > 0) setFitZoom(Math.min(available / w, 1.3));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    computeFit(el, pageW);
    if (!el) return;
    const ro = new ResizeObserver(() => computeFit(el, pageW));
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeFit, pageW]);

  useEffect(() => { setZoom(0); }, [pageSizeKey]);

  const effectiveZoom = isFit ? fitZoom : zoom / 100;

  const changeZoom = (delta: number) => {
    const cur  = isFit ? Math.round(fitZoom * 100) : zoom;
    const next = Math.max(25, Math.min(200, Math.round(cur / 5) * 5 + delta));
    setZoom(next);
  };

  /* Stable resume memo — only re-renders MultiPagePreview when resume data changes */
  const stableResume = useMemo(() => resume, [resume]);  // eslint-disable-line

  /* ── Theme colors ── */
  const toolbarBg     = isDark ? '#1a2236' : '#f1f5f9';
  const toolbarBorder = isDark ? '#2d3748' : '#e2e8f0';
  const btnBg         = isDark ? '#2d3748' : '#e2e8f0';
  const btnColor      = isDark ? '#d1d5db' : '#374151';
  const mutedColor    = isDark ? '#9ca3af' : '#6b7280';
  const canvasBg      = isDark ? '#111827' : '#cbd5e1';

  /* ── Toolbar ── */
  const Toolbar = ({ forMaximized = false }: { forMaximized?: boolean }) => (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '6px',
      padding:      '7px 12px',
      borderBottom: `1px solid ${toolbarBorder}`,
      background:   toolbarBg,
      flexShrink:   0,
      flexWrap:     'wrap',
      minHeight:    '44px',
    }}>
      {/* Label */}
      <span style={{
        fontSize:      '11px',
        fontWeight:    700,
        letterSpacing: '0.07em',
        color:         mutedColor,
        textTransform: 'uppercase',
        flexShrink:    0,
        marginRight:   '2px',
      }}>
        Live Preview
      </span>

      {/* Page size picker */}
      <select
        value={pageSizeKey}
        onChange={e => { setPageSizeKey(e.target.value as PageSizeKey); setZoom(0); }}
        style={{
          fontSize:     '11px',
          padding:      '3px 6px',
          borderRadius: '6px',
          border:       `1px solid ${toolbarBorder}`,
          background:   isDark ? '#2d3748' : '#fff',
          color:        isDark ? '#e5e7eb' : '#374151',
          cursor:       'pointer',
          outline:      'none',
          flexShrink:   0,
          fontWeight:   500,
        }}
      >
        {(Object.keys(PAGE_SIZES) as PageSizeKey[]).map(k => (
          <option key={k} value={k}>
            {PAGE_SIZES[k].label} — {PAGE_SIZES[k].sub}
          </option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      {/* LaTeX tab toggle */}
      {isLatex && (
        <div style={{
          display:      'flex',
          gap:          '2px',
          background:   isDark ? '#374151' : '#e2e8f0',
          borderRadius: '8px',
          padding:      '2px',
          flexShrink:   0,
        }}>
          {(['preview', 'latex'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding:    '3px 10px',
                borderRadius:'6px',
                border:     'none',
                cursor:     'pointer',
                fontSize:   '11px',
                fontWeight: activeTab === tab ? 700 : 400,
                background: activeTab === tab
                  ? (isDark ? '#1a2236' : '#fff')
                  : 'transparent',
                color:      activeTab === tab
                  ? (isDark ? '#10b981' : '#064e3b')
                  : mutedColor,
                transition: 'all 0.15s',
              }}
            >
              {tab === 'preview' ? '📄 Resume' : '</> LaTeX'}
            </button>
          ))}
        </div>
      )}

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
        <button
          onClick={() => changeZoom(-5)}
          style={{ width:26, height:26, display:'flex', alignItems:'center',
            justifyContent:'center', borderRadius:'6px', border:'none',
            cursor:'pointer', background:btnBg, color:btnColor }}
        >
          <FiMinus size={11} />
        </button>

        {/* Fit button */}
        <button
          onClick={() => setZoom(0)}
          title="Fit to panel width"
          style={{
            display:'flex', alignItems:'center', gap:'3px',
            padding:'3px 7px', borderRadius:'6px',
            border:`1px solid ${isFit ? '#10b981' : toolbarBorder}`,
            background: isFit ? 'rgba(16,185,129,0.13)' : (isDark ? '#2d3748' : '#fff'),
            color:      isFit ? '#10b981' : mutedColor,
            cursor:     'pointer', fontSize:'11px', fontWeight:600,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Fit
        </button>

        {/* Zoom % */}
        <span style={{
          fontSize:'12px', fontWeight:600,
          minWidth:'40px', textAlign:'center',
          color: isFit ? '#10b981' : btnColor,
        }}>
          {Math.round(effectiveZoom * 100)}%
        </span>

        <button
          onClick={() => changeZoom(5)}
          style={{ width:26, height:26, display:'flex', alignItems:'center',
            justifyContent:'center', borderRadius:'6px', border:'none',
            cursor:'pointer', background:btnBg, color:btnColor }}
        >
          <FiPlus size={11} />
        </button>
      </div>

      {/* Full Screen toggle */}
      <button
        onClick={() => setIsMaximized(m => !m)}
        title={forMaximized ? 'Exit fullscreen' : 'Enter fullscreen'}
        style={{
          display:'flex', alignItems:'center', gap:'4px',
          padding:'4px 8px', borderRadius:'6px', border:'none',
          cursor:'pointer', background:btnBg, color:btnColor,
          fontSize:'11px', fontWeight:600, flexShrink:0,
        }}
      >
        {forMaximized
          ? <><FiMinimize2 size={12} /> Exit Full</>
          : <><FiMaximize2 size={12} /> Full Screen</>
        }
      </button>
    </div>
  );

  /* ── Preview scroll body ── */
  const PreviewBody = ({ forMaximized = false }: { forMaximized?: boolean }) => {
    const bodyRef  = useRef<HTMLDivElement>(null);
    const [localFit, setLocalFit] = useState(fitZoom);

    useEffect(() => {
      if (!forMaximized) { setLocalFit(fitZoom); return; }
      const el = bodyRef.current;
      if (!el) return;
      const compute = () => {
        const available = el.clientWidth - 64;
        if (available > 0) setLocalFit(Math.min(available / pageW, 1.4));
      };
      compute();
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      return () => ro.disconnect();
    }, [forMaximized, pageW]);

    const ez = isFit ? (forMaximized ? localFit : fitZoom) : zoom / 100;

    if (!activeId || !stableResume) return null;

    /* LaTeX tab */
    if (isLatex && activeTab === 'latex') {
      return (
        <div ref={bodyRef} style={{
          flex: 1, overflow: 'auto',
          background: isDark ? '#0f172a' : '#f8fafc',
        }}>
          <LaTeXPanel resumeId={activeId} />
        </div>
      );
    }

    /* Multi-page resume preview */
    return (
      <div
        ref={bodyRef}
        style={{
          flex:           1,
          overflow:       'auto',
          background:     canvasBg,
        }}
      >
        <MultiPagePreview
          key={`mp-${activeId}-${pageSizeKey}-${previewKey}`}
          resume={stableResume}
          pageW={pageW}
          pageH={pageH}
          scale={ez}
          isDark={isDark}
        />
      </div>
    );
  };

  if (!activeId) return (
    <div style={{
      flex:1, display:'flex', alignItems:'center', justifyContent:'center',
      color:mutedColor, fontSize:'14px',
      background: isDark ? '#111827' : '#e5e7eb',
    }}>
      No resume selected
    </div>
  );

  /* Normal panel */
  const NormalPanel = (
    <div
      ref={containerRef}
      style={{
        display:'flex', flexDirection:'column', height:'100%',
        overflow:'hidden',
        visibility: isMaximized ? 'hidden' : 'visible',
      }}
    >
      <Toolbar />
      <PreviewBody />
    </div>
  );

  /* Maximized portal */
  const MaxPanel = isMaximized ? createPortal(
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', flexDirection:'column',
      background: isDark ? '#111827' : '#e5e7eb',
    }}>
      <Toolbar forMaximized />
      <PreviewBody forMaximized />
    </div>,
    document.body
  ) : null;

  return (
    <>
      {NormalPanel}
      {MaxPanel}
    </>
  );
}
