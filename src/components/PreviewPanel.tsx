import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useResumeStore } from '../store/resumeStore';
import ResumePreview from './preview/ResumePreview';
import { generateLatex, RESUME_CLS } from '../utils/latexGenerator';
import {
  FiZoomIn, FiZoomOut, FiMonitor, FiMaximize2, FiMinimize2, FiChevronDown,
  FiCode, FiEye, FiCopy, FiCheck, FiDownload, FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi';


/* ── Page sizes (px at 96 dpi) ── */
const PAGE_SIZES = {
  A4:     { label: 'A4',     w: 794,  h: 1123, desc: '210×297mm' },
  Letter: { label: 'Letter', w: 816,  h: 1056, desc: '8.5×11in'  },
  Legal:  { label: 'Legal',  w: 816,  h: 1344, desc: '8.5×14in'  },
} as const;
type PageKey = keyof typeof PAGE_SIZES;

const ZOOM_STEP = 0.05;
const ZOOM_MIN  = 0.20;
const ZOOM_MAX  = 2.00;

const ZOOM_PRESETS = [
  { label: '25%',  value: 0.25 },
  { label: '33%',  value: 0.33 },
  { label: '50%',  value: 0.50 },
  { label: '67%',  value: 0.67 },
  { label: '75%',  value: 0.75 },
  { label: '90%',  value: 0.90 },
  { label: '100%', value: 1.00 },
  { label: '110%', value: 1.10 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.50 },
];

const AI_PLATFORMS = [
  { name: 'ChatGPT',  url: 'https://chat.openai.com',   color: '#10a37f' },
  { name: 'Claude',   url: 'https://claude.ai',          color: '#d97706' },
  { name: 'Gemini',   url: 'https://gemini.google.com',  color: '#4285f4' },
  { name: 'Overleaf', url: 'https://overleaf.com',       color: '#4cae4c' },
];

type PreviewTab = 'preview' | 'latex';
type LatexFile  = 'main' | 'cls';

/* ─────────────────────────────────────────────────────
   MultiPageCanvas — THE core fix.
   Renders the resume naturally at PAGE_W, measures real
   height via ResizeObserver, then slices into pages using
   clipPath + absolute offset (no transform scaling issues).
───────────────────────────────────────────────────── */
function MultiPageCanvas({
  resume,
  pageW,
  pageH,
  zoom,
  previewKey,
}: {
  resume: ReturnType<typeof useResumeStore.getState>['getActiveResume'] extends () => infer R ? NonNullable<R> : never;
  pageW: number;
  pageH: number;
  zoom: number;
  previewKey: number;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [totalH, setTotalH] = useState(pageH);

  /* Measure the natural rendered height */
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    // Immediate measure
    const h = el.getBoundingClientRect().height || el.scrollHeight;
    if (h > 100) setTotalH(Math.round(h));
    // Observe resize (content loads fonts, images)
    const ro = new ResizeObserver(() => {
      const rh = el.getBoundingClientRect().height || el.scrollHeight;
      if (rh > 100) setTotalH(Math.round(rh));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewKey, pageW]);

  const numPages = Math.max(1, Math.ceil(totalH / pageH));
  const scaledW  = Math.round(pageW * zoom);
  const scaledH  = Math.round(pageH * zoom);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 24px 40px' }}>

      {/* ── Hidden measurement div (natural size, off-screen render) ── */}
      <div style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: `${pageW}px`,
        height: 'auto',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}>
        <div ref={measureRef}>
          <ResumePreview key={`measure-${previewKey}`} resume={resume} pageWidth={pageW} />
        </div>
      </div>

      {/* ── Page frames ── */}
      {Array.from({ length: numPages }, (_, pageIdx) => {
        const offsetPx = pageIdx * pageH; // px to skip in natural coords
        return (
          <div key={pageIdx}>
            {/* Page label */}
            <div style={{
              textAlign: 'center',
              marginBottom: 8,
              fontSize: 10,
              color: 'var(--ui-muted)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {numPages > 1 ? `Page ${pageIdx + 1} of ${numPages}` : 'Preview'}
            </div>

            {/* Outer frame — defines the visual page boundary */}
            <div style={{
              width: `${scaledW}px`,
              height: `${scaledH}px`,
              overflow: 'hidden',
              boxShadow: '0 4px 40px rgba(0,0,0,0.18), 0 1px 8px rgba(0,0,0,0.10)',
              borderRadius: 4,
              position: 'relative',
              background: '#fff',
              flexShrink: 0,
            }}>
              {/*
                Inner scaler — TWO separate transforms:
                1. Outer wrapper: translateY FIRST (in natural coords), then scale
                   but CSS transform order is right-to-left, so:
                   transform: "scale(zoom)" on the outer, negative marginTop on the inner
                   
                Actually the cleanest approach:
                - A fixed-size (PAGE_W × totalH) container scaled by zoom
                - Clip at the page frame
                - Use scrollTop equivalent via marginTop inside the scaled container
              */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${pageW}px`,
                height: `${pageH}px`,        // height of one page in natural px
                transformOrigin: 'top left',
                transform: `scale(${zoom})`,
                overflow: 'hidden',           // clip this page's content
              }}>
                {/* 
                  Slide the full resume UP so that this page's content 
                  starts at top:0 of the clip container.
                  We do this by wrapping in a positioned div with negative top.
                */}
                <div style={{
                  position: 'absolute',
                  top: `-${offsetPx}px`,
                  left: 0,
                  width: `${pageW}px`,
                }}>
                  <ResumePreview
                    key={`page-${previewKey}-${pageIdx}`}
                    resume={resume}
                    pageWidth={pageW}
                  />
                </div>
              </div>

              {/* Page border overlay */}
              {resume.colors?.showBorder && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  border: `1.5px solid ${resume.colors.borderColor || '#e5e7eb'}`,
                  borderRadius: 4, zIndex: 10,
                }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PreviewPanel() {
  const { getActiveResume } = useResumeStore();
  const resume = getActiveResume();
  const containerRef = useRef<HTMLDivElement>(null);
  const isLatex = resume?.templateId === 'latex';

  /* Page size */
  const [pageKey,      setPageKey]      = useState<PageKey>('A4');
  const [showPageMenu, setShowPageMenu] = useState(false);
  const PAGE_W = PAGE_SIZES[pageKey].w;
  const PAGE_H = PAGE_SIZES[pageKey].h;

  const [tab,          setTab]          = useState<PreviewTab>('preview');
  const [latexFile,    setLatexFile]    = useState<LatexFile>('main');
  const [isMaximized,  setIsMaximized]  = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [showAiBanner, setShowAiBanner] = useState(true);
  const [previewKey,   setPreviewKey]   = useState(0);


  /* Zoom — fit to container */
  const computeFitZoom = useCallback(() => {
    const w = containerRef.current?.clientWidth ?? 600;
    return Math.min(1.0, Math.max(ZOOM_MIN, parseFloat(((w - 48) / PAGE_W).toFixed(2))));
  }, [PAGE_W]);

  const [zoom,        setZoom]       = useState(0.65);
  const [showPresets, setShowPresets] = useState(false);
  const [isFitted,    setIsFitted]   = useState(true);

  useEffect(() => {
    const update = () => { if (isFitted) setZoom(computeFitZoom()); };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isFitted, computeFitZoom]);

  useEffect(() => {
    if (isFitted) setZoom(computeFitZoom());
  }, [pageKey, isFitted, computeFitZoom]);

  const clampZ   = (v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
  const zoomIn   = () => { setIsFitted(false); setZoom(z => clampZ(parseFloat((z + ZOOM_STEP).toFixed(2)))); };
  const zoomOut  = () => { setIsFitted(false); setZoom(z => clampZ(parseFloat((z - ZOOM_STEP).toFixed(2)))); };
  const fitPage  = () => { setIsFitted(true);  setZoom(computeFitZoom()); };
  const setPreset = (v: number) => { setIsFitted(false); setZoom(v); setShowPresets(false); };

  if (!resume) return null;

  const pct   = Math.round(zoom * 100);

  /* LaTeX sources — always auto-generated from resume data */
  const generatedMain = isLatex ? generateLatex(resume) : '';
  const generatedCls  = RESUME_CLS;
  const activeCode    = latexFile === 'main' ? generatedMain : generatedCls;
  const fileName = latexFile === 'main' ? 'resume.tex' : 'resume.cls';;
  const copyCode = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadCode = () => {
    const blob = new Blob([activeCode], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Page size picker ── */
  const PageSizePicker = () => (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setShowPageMenu(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
        style={{
          background: 'var(--ui-surface2)',
          borderColor: 'var(--ui-border)',
          color: 'var(--ui-text2)',
        }}
        title="Change page size"
      >
        <span>{PAGE_SIZES[pageKey].label}</span>
        <FiChevronDown size={10} className={`transition-transform ${showPageMenu ? 'rotate-180' : ''}`}
          style={{ color: 'var(--ui-muted)' }} />
      </button>
      {showPageMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPageMenu(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 rounded-xl shadow-xl overflow-hidden w-36 py-1"
            style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-border)' }}>
            {(Object.entries(PAGE_SIZES) as [PageKey, typeof PAGE_SIZES[PageKey]][]).map(([key, sz]) => {
              const active = pageKey === key;
              return (
                <button key={key}
                  onClick={() => { setPageKey(key); setShowPageMenu(false); setIsFitted(true); setPreviewKey(k => k + 1); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between"
                  style={{
                    background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                    color: active ? '#10b981' : 'var(--ui-text2)',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--ui-surface2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div className="font-semibold">{sz.label}</div>
                    <div className="text-[10px] opacity-60">{sz.desc}</div>
                  </div>
                  {active && <FiCheck size={11} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  /* ── Zoom toolbar ── */
  const ZoomControls = () => (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button onClick={() => setPreviewKey(k => k + 1)}
        className="p-1.5 rounded-lg transition-colors" title="Refresh preview"
        style={{ color: 'var(--ui-muted)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--ui-surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <FiRefreshCw size={12} />
      </button>
      <div className="w-px h-4 mx-0.5" style={{ background: 'var(--ui-border)' }} />
      <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN}
        className="p-1.5 rounded-lg transition-colors disabled:opacity-30" title="Zoom out"
        style={{ color: 'var(--ui-muted)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--ui-surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <FiZoomOut size={14} />
      </button>
      <div className="relative">
        <button onClick={() => setShowPresets(o => !o)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors min-w-[60px] justify-center"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ui-surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span className="text-xs font-bold tabular-nums"
            style={{ color: isFitted ? '#10b981' : 'var(--ui-text)' }}>{pct}%</span>
          <FiChevronDown size={10} style={{ color: 'var(--ui-muted)' }}
            className={`transition-transform ${showPresets ? 'rotate-180' : ''}`} />
        </button>
        {showPresets && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
            <div className="absolute top-full mt-1 right-0 z-50 rounded-xl shadow-xl overflow-hidden w-32 py-1"
              style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-border)' }}>
              <button onClick={fitPage}
                className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between"
                style={{ background: isFitted ? 'rgba(16,185,129,0.1)' : 'transparent', color: isFitted ? '#10b981' : 'var(--ui-text2)' }}
                onMouseEnter={e => { if (!isFitted) e.currentTarget.style.background = 'var(--ui-surface2)'; }}
                onMouseLeave={e => { if (!isFitted) e.currentTarget.style.background = 'transparent'; }}>
                <span>Fit page</span>
                {isFitted && <FiCheck size={10} />}
              </button>
              <div className="h-px my-1" style={{ background: 'var(--ui-border)' }} />
              {ZOOM_PRESETS.map(p => {
                const active = !isFitted && Math.abs(zoom - p.value) < 0.001;
                return (
                  <button key={p.value} onClick={() => setPreset(p.value)}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ background: active ? 'rgba(16,185,129,0.1)' : 'transparent', color: active ? '#10b981' : 'var(--ui-text2)' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--ui-surface2)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX}
        className="p-1.5 rounded-lg transition-colors disabled:opacity-30" title="Zoom in"
        style={{ color: 'var(--ui-muted)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--ui-surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <FiZoomIn size={14} />
      </button>
      <div className="w-px h-4 mx-1" style={{ background: 'var(--ui-border)' }} />
      {/* Fit button */}
      <button onClick={fitPage}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors"
        title="Fit page to window width"
        style={{
          background: isFitted ? 'rgba(16,185,129,0.12)' : 'transparent',
          color: isFitted ? '#065f46' : 'var(--ui-muted)',
          border: isFitted ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
        }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}>
          <path strokeLinecap="round" d="M4 8V5a1 1 0 011-1h3M4 16v3a1 1 0 001 1h3M20 8V5a1 1 0 00-1-1h-3M20 16v3a1 1 0 01-1 1h-3"/>
        </svg>
        <span className="hidden lg:inline">Fit</span>
      </button>
    </div>
  );

  /* ── Toolbar ── */
  const Toolbar = () => (
    <div className="preview-toolbar px-3 py-2 flex items-center justify-between flex-shrink-0 shadow-sm gap-2"
      style={{ background: 'var(--ui-surface)', borderBottom: '1px solid var(--ui-border)' }}>
      {/* Left: label + page size */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <FiMonitor size={13} style={{ color: 'var(--ui-muted)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--ui-text2)' }}>Live Preview</span>
        <span className="text-[10px]" style={{ color: 'var(--ui-border2)' }}>·</span>
        <PageSizePicker />
      </div>

      {/* Center: tab toggle (latex only) */}
      {isLatex && (
        <div className="flex items-center rounded-lg p-0.5 gap-0.5 flex-shrink-0"
          style={{ background: 'var(--ui-surface2)' }}>
          <button onClick={() => setTab('preview')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              background: tab === 'preview' ? 'var(--ui-card)' : 'transparent',
              color: tab === 'preview' ? 'var(--ui-text)' : 'var(--ui-muted)',
              boxShadow: tab === 'preview' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            <FiEye size={11} /> Resume Preview
          </button>
          <button onClick={() => setTab('latex')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              background: tab === 'latex' ? 'var(--ui-card)' : 'transparent',
              color: tab === 'latex' ? '#10b981' : 'var(--ui-muted)',
              boxShadow: tab === 'latex' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            <FiCode size={11} /> LaTeX Code
          </button>
        </div>
      )}

      {/* Right: controls + maximize */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {tab === 'preview' && <ZoomControls />}
        {tab === 'latex' && (
          <>
            <button onClick={copyCode}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200">
              {copied ? <FiCheck size={10} /> : <FiCopy size={10} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadCode}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background: 'var(--ui-surface2)', color: 'var(--ui-text2)', borderColor: 'var(--ui-border)' }}>
              <FiDownload size={10} /> {fileName}
            </button>
          </>
        )}
        {/* Maximize */}
        <button
          onClick={() => setIsMaximized(m => !m)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ml-1 border"
          style={{
            background: isMaximized ? 'rgba(16,185,129,0.12)' : 'transparent',
            color: isMaximized ? '#065f46' : 'var(--ui-muted)',
            borderColor: isMaximized ? 'rgba(16,185,129,0.3)' : 'var(--ui-border)',
          }}
          title={isMaximized ? 'Exit full screen' : 'Full screen'}>
          {isMaximized
            ? <><FiMinimize2 size={11} /><span className="hidden lg:inline ml-0.5">Exit</span></>
            : <><FiMaximize2 size={11} /><span className="hidden lg:inline ml-0.5">Full</span></>}
        </button>
      </div>
    </div>
  );

  /* ── AI Banner for LaTeX ── */
const AIBanner = () => {
  // Detect light/dark from CSS variable or use a simple check
  const isDarkMode = document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark';

  const bannerBg      = isDarkMode ? '#12122a' : '#1e1b4b';
  const bannerBorder  = isDarkMode ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.4)';
  const titleColor    = isDarkMode ? '#c7d2fe' : '#e0e7ff';
  const bodyColor     = isDarkMode ? '#a5b4fc' : '#c7d2fe';
  const labelColor    = isDarkMode ? '#818cf8' : '#a5b4fc';
  const starColor     = isDarkMode ? '#818cf8' : '#a5b4fc';
  const closeBtnColor = isDarkMode ? '#6366f1' : '#818cf8';
  const miniBarBg     = isDarkMode ? '#12122a' : '#1e1b4b';
  const miniTextColor = isDarkMode ? '#818cf8' : '#a5b4fc';

  return (
    <>
      {showAiBanner ? (
        <div className="border-b flex-shrink-0" style={{
          background: bannerBg,
          borderColor: bannerBorder,
          padding: '10px 16px',
        }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <span style={{ color: starColor, fontSize: 14, flexShrink: 0, marginTop: 2 }}>✦</span>
                <div>
                  <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: titleColor,
                    margin: 0,
                    marginBottom: 3,
                  }}>
                    New to LaTeX? Let AI handle it.
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: bodyColor,
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    Copy the code → paste into any AI to customize → compile on Overleaf.
                    Font and layout changes from the left panel update the code automatically.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{
                  fontSize: 10,
                  color: labelColor,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Use with:
                </span>
                {AI_PLATFORMS.map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${p.color}25`,
                      color: p.color,
                      border: `1px solid ${p.color}40`,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <FiExternalLink size={9} />
                    {p.name}
                  </a>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAiBanner(false)}
              style={{
                color: closeBtnColor,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = titleColor)}
              onMouseLeave={e => (e.currentTarget.style.color = closeBtnColor)}
            >
              <svg viewBox="0 0 12 12" fill="none" width={12} height={12}>
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-b flex-shrink-0" style={{
          background: miniBarBg,
          borderColor: bannerBorder,
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 10, color: miniTextColor, fontWeight: 600 }}>
            LaTeX Tips
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            {AI_PLATFORMS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: p.color,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                {p.name}
              </a>
            ))}
          </div>
          <button
            onClick={() => setShowAiBanner(true)}
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              color: miniTextColor,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = titleColor)}
            onMouseLeave={e => (e.currentTarget.style.color = miniTextColor)}
          >
            Show tips
          </button>
        </div>
      )}
    </>
  );
};

  /* ── LaTeX code view ── */
  const LaTeXView = ({ inMaximized = false }: { inMaximized?: boolean }) => {
    const keywords = ['\\begin','\\end','\\documentclass','\\usepackage','\\hfill','\\textbf','\\textit','\\href','\\section','\\subsection','\\item','\\\\'];
    const highlight = (code: string) => {
      const lines = code.split('\n');
      return lines.map((line, li) => {
        let html = line
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/(\\[a-zA-Z]+)/g, '<span style="color:#c792ea">$1</span>')
          .replace(/(%.*$)/g, '<span style="color:#697098;font-style:italic">$1</span>')
          .replace(/(\{[^}]*\})/g, '<span style="color:#80cbc4">$1</span>')
          .replace(/(\[[^\]]*\])/g, '<span style="color:#ffcb6b">$1</span>');
        void keywords;
        return `<span style="color:#546e7a;user-select:none;margin-right:12px;text-align:right;display:inline-block;min-width:28px">${li + 1}</span>${html}`;
      }).join('\n');
    };

    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* File tabs */}
        <div className="flex items-center gap-0.5 px-3 pt-2 pb-0 border-b flex-shrink-0"
          style={{ background: '#1a1a2e', borderColor: '#2a2a4e' }}>
          {(['main','cls'] as LatexFile[]).map(f => (
            <button key={f} onClick={() => setLatexFile(f)}
              className="px-3 py-1.5 rounded-t-md text-xs font-mono transition-colors"
              style={{
                background: latexFile === f ? '#12122a' : 'transparent',
                color: latexFile === f ? '#c3e6cb' : '#697098',
                borderBottom: latexFile === f ? '2px solid #10b981' : '2px solid transparent',
              }}>
              {f === 'main' ? 'resume.tex' : 'resume.cls'}
            </button>
          ))}
        </div>
        {/* Code area */}
        <div className="flex-1 min-h-0 overflow-auto relative" style={{ background: '#12122a' }}>
          <pre
            className="p-4 font-mono text-xs leading-relaxed overflow-auto"
            style={{ color: '#cdd3de', margin: 0, background: 'transparent' }}
            dangerouslySetInnerHTML={{ __html: highlight(activeCode) }}
          />
        </div>
        <div className="px-3 py-1 flex items-center gap-3 text-[10px] flex-shrink-0"
          style={{ background: '#0e0e1e', color: '#546e7a', borderTop: '1px solid #1e1e3a' }}>
          <span>{activeCode.split('\n').length} lines</span>
          <span>{activeCode.length} chars</span>
          <span className="ml-auto">LaTeX · Overleaf compatible</span>
        </div>
      </div>
    );
  };

  /* ── Maximized portal ── */
  const MaximizedOverlay = () => createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--ui-bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <Toolbar />
      {tab === 'latex' && isLatex && <AIBanner />}
      {tab === 'preview' && (
        <div className="flex-1 overflow-auto" ref={containerRef} style={{ background: 'var(--ui-surface2)' }}>
          <MultiPageCanvas
            resume={resume}
            pageW={PAGE_W}
            pageH={PAGE_H}
            zoom={Math.min(1.5, Math.max(ZOOM_MIN, parseFloat(((window.innerWidth - 80) / PAGE_W).toFixed(2))))}
            previewKey={previewKey}
          />
        </div>
      )}
      {tab === 'latex' && <LaTeXView inMaximized />}
    </div>,
    document.body
  );

  /* ── Normal panel ── */
  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: 'var(--ui-bg)' }}>
      <Toolbar />
      {isMaximized && <MaximizedOverlay />}

      {tab === 'latex' && isLatex && <AIBanner />}

      {tab === 'preview' ? (
        <div ref={containerRef} className="flex-1 overflow-auto" style={{ background: 'var(--ui-surface2)' }}>
          <MultiPageCanvas
            resume={resume}
            pageW={PAGE_W}
            pageH={PAGE_H}
            zoom={zoom}
            previewKey={previewKey}
          />
        </div>
      ) : (
        isLatex ? <LaTeXView /> : (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--ui-muted)' }}>
            <p className="text-sm">Switch to a LaTeX template to see code.</p>
          </div>
        )
      )}
    </div>
  );
}
