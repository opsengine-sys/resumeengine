import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'icon' | 'builder';
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={17} height={17}>
    <circle cx="12" cy="12" r="4"/>
    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={17} height={17}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function ThemeToggle({ className = '', variant = 'pill' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  /* ── Builder floating button ── */
  if (variant === 'builder') {
    return (
      <motion.button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`relative flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-xl transition-colors duration-300 ${className}`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg,rgba(6,78,59,0.95) 0%,rgba(17,24,39,0.95) 100%)'
            : 'linear-gradient(135deg,rgba(240,253,244,0.97) 0%,rgba(255,255,255,0.97) 100%)',
          border: isDark ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(16,185,129,0.25)',
          color: isDark ? '#34d399' : '#059669',
          boxShadow: isDark
            ? '0 8px 32px rgba(16,185,129,0.18), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Animated icon swap */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-shrink-0"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </motion.span>
        </AnimatePresence>
        <span className="hidden sm:block" style={{ letterSpacing: '0.01em' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
        {/* Subtle glow pulse */}
        <motion.span
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 50% 50%, #10b981, transparent 70%)' }}
        />
      </motion.button>
    );
  }

  /* ── Icon variant ── */
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
          isDark ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'sun-icon' : 'moon-icon'}
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.18 }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  }

  /* ── Pill variant (landing page style) ── */
  return (
    <motion.button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full border transition-all duration-200 text-xs font-semibold select-none ${
        isDark
          ? 'bg-slate-800/90 border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60'
          : 'bg-white/90 border-emerald-200 text-emerald-700 hover:border-emerald-400'
      } ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: isDark ? '0 2px 12px rgba(16,185,129,0.15)' : '0 2px 12px rgba(16,185,129,0.1)',
      }}
    >
      {/* Toggle track */}
      <span className={`relative inline-flex items-center w-8 h-4 rounded-full transition-colors duration-300 ${
        isDark ? 'bg-emerald-500' : 'bg-gray-200'
      }`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute w-3 h-3 rounded-full bg-white shadow-sm"
          style={{ left: isDark ? '17px' : '2px' }}
        />
      </span>
      {/* Icon + label */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'dark-pill' : 'light-pill'}
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          {isDark ? (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13} className="text-yellow-400">
              <circle cx="12" cy="12" r="4"/>
              <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>Light</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>Dark</>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
