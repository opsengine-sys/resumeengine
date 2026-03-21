import { useState } from 'react';
import { FiX, FiSend, FiCheck } from 'react-icons/fi';

interface Props { onClose: () => void; isDark: boolean; }

const AREAS = [
  'Landing Page — Hero Section',
  'Landing Page — Features Section',
  'Landing Page — Templates Section',
  'Landing Page — AI Tools Section',
  'Landing Page — Overall Design',
  'Builder — Resume Editor',
  'Builder — Live Preview',
  'Builder — Templates',
  'Builder — Typography / Styling',
  'Builder — Skills Section',
  'Builder — AI Tools (Extractor / Generator / Rephraser)',
  'Builder — LaTeX Export',
  'Builder — Print / PDF Export',
  'Builder — Dark / Light Theme',
  'Builder — Custom Sections',
  'Builder — Drag & Drop / Reordering',
  'General — Performance',
  'General — Other',
];

const TYPES = ['Bug / Not Working', 'Feature Request', 'UI / Design Feedback', 'Content Suggestion', 'Compliment', 'Other'];
const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackModal({ onClose, isDark }: Props) {
  const [areas, setAreas]     = useState<string[]>([]);
  const [type, setType]       = useState('');
  const [rating, setRating]   = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const bg      = isDark ? '#0f172a' : '#ffffff';
  const surface = isDark ? '#1e293b' : '#f8fafc';
  const border  = isDark ? '#334155' : '#e2e8f0';
  const text    = isDark ? '#f1f5f9' : '#0f172a';
  const muted   = isDark ? '#94a3b8' : '#64748b';
  const accent  = '#10b981';

  const toggleArea = (a: string) =>
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!areas.length) e.areas = 'Please select at least one area';
    if (!type) e.type = 'Please select a feedback type';
    if (!message.trim()) e.message = 'Please describe your feedback';
    if (message.trim().length < 10) e.message = 'Please provide more detail (min 10 chars)';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Store in localStorage until backend is ready
    const existing = JSON.parse(localStorage.getItem('re-feedback') || '[]');
    existing.push({ areas, type, rating, message, email, timestamp: new Date().toISOString() });
    localStorage.setItem('re-feedback', JSON.stringify(existing));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: bg, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: border, background: isDark ? '#0a0f1a' : '#f0fdf4' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: text }}>Share Your Feedback</h2>
            <p className="text-xs mt-0.5" style={{ color: muted }}>Help us improve Resume Engine — your feedback shapes what we build next</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors"
            style={{ color: muted }} onMouseEnter={e => (e.currentTarget.style.background = surface)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <FiX size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981' }}>
              <FiCheck size={32} color="#10b981" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: text }}>Thank you!</h3>
            <p className="text-sm mb-6" style={{ color: muted }}>
              Your feedback has been saved. We'll review it and use it to improve Resume Engine.
              Backend integration coming soon — for now it's stored locally.
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
              Close
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Area of feedback */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text }}>
                What area are you giving feedback on? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <p className="text-xs mb-3" style={{ color: muted }}>Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(a => {
                  const sel = areas.includes(a);
                  return (
                    <button key={a} onClick={() => toggleArea(a)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: sel ? 'rgba(16,185,129,0.15)' : surface,
                        color: sel ? accent : muted,
                        border: `1px solid ${sel ? '#10b981' : border}`,
                        transform: sel ? 'scale(1.03)' : 'scale(1)',
                      }}>
                      {sel ? '✓ ' : ''}{a}
                    </button>
                  );
                })}
              </div>
              {errors.areas && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.areas}</p>}
            </div>

            {/* Feedback type */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text }}>
                Type of Feedback <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPES.map(t => {
                  const sel = type === t;
                  const icons: Record<string, string> = {
                    'Bug / Not Working': '🐛',
                    'Feature Request': '✨',
                    'UI / Design Feedback': '🎨',
                    'Content Suggestion': '📝',
                    'Compliment': '❤️',
                    'Other': '💬',
                  };
                  return (
                    <button key={t} onClick={() => setType(t)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                      style={{
                        background: sel ? 'rgba(16,185,129,0.15)' : surface,
                        color: sel ? accent : muted,
                        border: `1px solid ${sel ? '#10b981' : border}`,
                      }}>
                      <span>{icons[t]}</span>{t}
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.type}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text }}>
                Overall Experience <span className="text-xs font-normal" style={{ color: muted }}>(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                {RATINGS.map(r => (
                  <button key={r} onClick={() => setRating(r === rating ? 0 : r)}
                    className="text-2xl transition-all hover:scale-110"
                    style={{ opacity: rating === 0 || rating >= r ? 1 : 0.35 }}
                    title={['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][r]}>
                    ⭐
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs ml-2 font-semibold" style={{ color: accent }}>
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text }}>
                Describe Your Feedback <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what's not working, what you'd like improved, or what you love..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 transition-all"
                style={{
                  background: surface,
                  border: `1px solid ${errors.message ? '#ef4444' : border}`,
                  color: text,
                  lineHeight: 1.6,
                }}
                onFocus={e => (e.target.style.borderColor = accent)}
                onBlur={e => (e.target.style.borderColor = errors.message ? '#ef4444' : border)}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.message
                  ? <p className="text-xs" style={{ color: '#ef4444' }}>{errors.message}</p>
                  : <p className="text-xs" style={{ color: muted }}>Be as specific as possible — screenshots welcome in future</p>}
                <span className="text-xs" style={{ color: muted }}>{message.length} chars</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text }}>
                Email <span className="text-xs font-normal" style={{ color: muted }}>(optional — if you want a reply)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  color: text,
                }}
                onFocus={e => (e.target.style.borderColor = accent)}
                onBlur={e => (e.target.style.borderColor = border)}
              />
              <p className="text-xs mt-1" style={{ color: muted }}>
                We'll only use this to follow up on your feedback. No spam, ever.
              </p>
            </div>

            {/* Privacy note */}
            <div className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.05)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)'}` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-xs" style={{ color: muted }}>
                <strong style={{ color: accent }}>Privacy:</strong> Feedback is stored locally in your browser until backend integration is complete. Your email (if provided) will only be used to respond to your feedback.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        {!submitted && (
          <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: border, background: isDark ? '#0a0f1a' : '#f8fafc' }}>
            <p className="text-xs" style={{ color: muted }}>
              Fields marked <span style={{ color: '#ef4444' }}>*</span> are required
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: muted, border: `1px solid ${border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = surface)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                <FiSend size={14} /> Submit Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
