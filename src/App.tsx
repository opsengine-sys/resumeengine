import { useState, useRef, useCallback, useEffect } from 'react';
import { useResumeStore } from './store/resumeStore';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import TemplateModal from './components/TemplateModal';
import ResumeListModal from './components/ResumeListModal';
import ExportModal from './components/ExportModal';
import LandingPage from './components/LandingPage';
import ThemeToggle from './components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FiEye, FiEdit3, FiHome } from 'react-icons/fi';

function HomeButton({ onClick }: { onClick: () => void }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      title="Back to Home"
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="relative flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #065f46 0%, #0d9488 60%, #0891b2 100%)'
          : 'linear-gradient(135deg, #047857 0%, #0d9488 60%, #0284c7 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#ffffff',
        boxShadow: hov
          ? '0 0 28px rgba(13,148,136,0.7), 0 8px 24px rgba(0,0,0,0.35)'
          : '0 0 16px rgba(13,148,136,0.4), 0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      <AnimatePresence>
        {hov && (
          <motion.span
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', transform: 'skewX(-15deg)' }}
          />
        )}
      </AnimatePresence>
      <FiHome size={16} strokeWidth={2.2} />
      <span style={{ letterSpacing: '0.02em' }}>Home</span>
      <motion.span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ background: 'radial-gradient(circle at 50% 50%, #34d399, transparent 70%)' }}
      />
    </motion.button>
  );
}

const MIN_SIDEBAR = 200;
const MAX_SIDEBAR = 360;
const MIN_EDITOR  = 300;
const MAX_EDITOR  = 700;
const MIN_PREVIEW = 280;
const DIVIDER_W   = 5;

function BuilderApp({ onGoHome, startTemplate }: { onGoHome: () => void; startTemplate: string | null }) {
  const { showTemplateModal, showResumeListModal } = useResumeStore();
  const updateTemplate = useResumeStore(s => s.updateTemplate);
  const { isDark } = useTheme();
  const [showExportModal, setShowExportModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showEditor, setShowEditor] = useState(true);
  const [sidebarW, setSidebarW] = useState(242);
  const [editorW, setEditorW]   = useState(460);

  const dragging     = useRef<'sidebar' | 'editor' | null>(null);
  const startX       = useRef(0);
  const startSideW   = useRef(0);
  const startEditW   = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (startTemplate) {
      updateTemplate(startTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseDown = useCallback(
    (which: 'sidebar' | 'editor') => (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current   = which;
      startX.current     = e.clientX;
      startSideW.current = sidebarW;
      startEditW.current = editorW;
      setIsDragging(true);
      document.body.style.cursor     = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [sidebarW, editorW],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta     = e.clientX - startX.current;
      const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
      if (dragging.current === 'sidebar') {
        setSidebarW(Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, startSideW.current + delta)));
      } else {
        const avail = containerW - startSideW.current - MIN_PREVIEW - DIVIDER_W * 2;
        const newW  = Math.min(MAX_EDITOR, Math.min(avail, Math.max(MIN_EDITOR, startEditW.current + delta)));
        setEditorW(newW);
      }
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = null;
      setIsDragging(false);
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const Divider = ({ which }: { which: 'sidebar' | 'editor' }) => (
    <div
      onMouseDown={onMouseDown(which)}
      className="relative flex-shrink-0 group z-30 hidden md:flex items-center justify-center select-none"
      style={{ width: DIVIDER_W, cursor: 'col-resize', background: 'transparent' }}
    >
      <div
        className={`absolute inset-y-0 w-px transition-all duration-150 ${isDark ? 'bg-slate-700 group-hover:bg-emerald-500' : 'bg-gray-200 group-hover:bg-emerald-400'}`}
        style={{ left: '50%' }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-1 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`}
        style={{ left: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
      />
    </div>
  );

  const bg      = isDark ? '#0a0f1a' : '#f0f4f8';
  const panelBg = isDark ? '#111827' : '#ffffff';
  const bdr     = `1px solid ${isDark ? 'rgba(52,211,153,0.08)' : '#e5e7eb'}`;

  return (
    <div
      ref={containerRef}
      className="builder-ui flex h-screen w-screen overflow-hidden"
      style={{ background: bg, color: 'var(--ui-text)' }}
    >
      {/* ── Sidebar ── */}
      <div
        className="flex-shrink-0 h-full overflow-hidden hidden md:block"
        style={{
          width: sidebarW, minWidth: sidebarW, maxWidth: sidebarW,
          pointerEvents: isDragging ? 'none' : undefined,
          background: panelBg, borderRight: bdr,
        }}
      >
        <Sidebar
          onExport={() => setShowExportModal(true)}
          onGoHome={onGoHome}
          onTabChange={(tab) => setShowEditor(tab === 'sections')}
        />
      </div>

      <Divider which="sidebar" />

      {/* ── Editor — hidden when Templates / Style / Colors tab active ── */}
      {showEditor && (
        <>
          <div
            className={`flex-shrink-0 h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:block' : 'block'}`}
            style={{
              width: editorW, minWidth: editorW, maxWidth: editorW,
              pointerEvents: isDragging ? 'none' : undefined,
              background: isDark ? '#0d1526' : '#ffffff', borderRight: bdr,
            }}
          >
            <EditorPanel onExport={() => setShowExportModal(true)} />
          </div>
          <Divider which="editor" />
        </>
      )}

      {/* ── Preview ── */}
      <div
        className={`flex-1 h-full overflow-hidden min-w-0 ${mobileTab === 'editor' ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}
        style={{ pointerEvents: isDragging ? 'none' : undefined, background: isDark ? '#060c14' : '#e8f0ec' }}
      >
        <PreviewPanel />
      </div>

      {/* ── Floating Home + Theme ── */}
      <div className="fixed bottom-5 right-5 z-50 hidden md:flex flex-col items-end gap-3">
        <ThemeToggle variant="builder" />
        <HomeButton onClick={onGoHome} />
      </div>

      {/* ── Mobile bottom bar ── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex md:hidden rounded-2xl shadow-2xl p-1 gap-1"
        style={{ background: isDark ? '#111827' : '#fff', border: bdr }}
      >
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mobileTab === 'editor' ? 'bg-emerald-600 text-white shadow-md' : ''}`}
          style={{ color: mobileTab === 'editor' ? '#fff' : 'var(--ui-muted)' }}
        >
          <FiEdit3 size={15} /> Edit
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mobileTab === 'preview' ? 'bg-emerald-600 text-white shadow-md' : ''}`}
          style={{ color: mobileTab === 'preview' ? '#fff' : 'var(--ui-muted)' }}
        >
          <FiEye size={15} /> Preview
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:text-emerald-500"
          style={{ color: 'var(--ui-muted)' }}
          title="Home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
          </svg>
        </button>
      </div>

      {/* ── Modals ── */}
      {showTemplateModal   && <TemplateModal onClose={() => useResumeStore.getState().setShowTemplateModal(false)} />}
      {showResumeListModal && <ResumeListModal />}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}

export function App() {
  const [view, setView]                   = useState<'landing' | 'builder'>('landing');
  const [startTemplate, setStartTemplate] = useState<string | null>(null);
  return (
    <ThemeProvider>
      <AppInner
        view={view}
        onSetView={setView}
        startTemplate={startTemplate}
        setStartTemplate={setStartTemplate}
      />
    </ThemeProvider>
  );
}

function AppInner({
  view, onSetView, startTemplate, setStartTemplate,
}: {
  view: 'landing' | 'builder';
  onSetView: (v: 'landing' | 'builder') => void;
  startTemplate: string | null;
  setStartTemplate: (t: string | null) => void;
}) {
  const { isDark } = useTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  if (view === 'landing') return (
    <LandingPage
      onEnterBuilder={(templateId?: string) => {
        setStartTemplate(templateId ?? null);
        onSetView('builder');
      }}
    />
  );

  return <BuilderApp onGoHome={() => onSetView('landing')} startTemplate={startTemplate} />;
}