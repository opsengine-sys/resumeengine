/**
 * SharedUI.tsx — Reusable modern UI primitives (dark-mode aware via CSS vars)
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiExternalLink, FiRotateCcw, FiCalendar, FiWind } from 'react-icons/fi';

const I = {
  base: `w-full border rounded-lg py-2.5 pr-3 text-sm transition-all`,
  input: `focus:outline-none focus:ring-2 focus:border-transparent`,
};

/* ── tokens via CSS vars (works in both themes) ── */
const inputStyle: React.CSSProperties = {
  background: 'var(--ui-input-bg)',
  color: 'var(--ui-text)',
  borderColor: 'var(--ui-border2)',
};
const cardStyle: React.CSSProperties = {
  background: 'var(--ui-card)',
  borderColor: 'var(--ui-border)',
};
const card2Style: React.CSSProperties = {
  background: 'var(--ui-card2)',
  borderColor: 'var(--ui-border)',
};
const labelStyle: React.CSSProperties = { color: 'var(--ui-muted)' };
const textStyle:  React.CSSProperties = { color: 'var(--ui-text)' };
const text2Style: React.CSSProperties = { color: 'var(--ui-text2)' };
const mutedStyle: React.CSSProperties = { color: 'var(--ui-muted)' };

export { inputStyle, cardStyle, card2Style, labelStyle, textStyle, text2Style, mutedStyle };

/* ──────────────────────────────────────────────────────────────────
   FormField
────────────────────────────────────────────────────────────────── */
export function FormField({
  label, children, required, hint,
}: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
        style={mutedStyle}>
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px]" style={mutedStyle}>{hint}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   StyledInput
────────────────────────────────────────────────────────────────── */
export function StyledInput({
  value, onChange, placeholder, icon, type = 'text', disabled,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.ReactNode;
  type?: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={mutedStyle}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, '--tw-ring-color': 'var(--ui-focus)' } as React.CSSProperties}
        className={`${I.base} ${I.input} focus:ring-emerald-500
          disabled:opacity-50
          ${icon ? 'pl-9' : 'pl-3'}`}
      />
    </div>
  );
}

/* ── Inline rephraser logic ── */
const ACTION_VERBS_INLINE: [string, string][] = [
  ['managed','Spearheaded'],['led','Orchestrated'],['worked','Collaborated'],
  ['helped','Facilitated'],['made','Engineered'],['built','Architected'],
  ['created','Developed'],['used','Leveraged'],['improved','Enhanced'],
  ['increased','Amplified'],['reduced','Optimized'],['handled','Administered'],
  ['did','Executed'],['got','Acquired'],['gave','Delivered'],
  ['fixed','Resolved'],['wrote','Authored'],['ran','Directed'],
  ['set up','Established'],['started','Initiated'],['showed','Demonstrated'],
  ['found','Identified'],['changed','Transformed'],['was responsible for','Owned'],
];
const FILLERS_INLINE: [RegExp, string][] = [
  [/\bvarious\b/gi,'diverse'],[/\ba lot of\b/gi,'significant'],
  [/\bgood\b/gi,'strong'],[/\bvery\b/gi,'highly'],
  [/\bbasically\b/gi,''],[/\bactually\b/gi,''],[/\bjust\b/gi,''],
  [/\bkind of\b/gi,''],[/\bsort of\b/gi,''],
];
function doRephrase(text: string): string {
  let out = text;
  for (const [p,r] of FILLERS_INLINE) out = out.replace(p,r);
  for (const [from,to] of ACTION_VERBS_INLINE) {
    const pat = new RegExp(`\\b${from}\\b`, 'gi');
    out = out.replace(pat, m => m[0] === m[0].toUpperCase() ? to : to.toLowerCase());
  }
  if (!/\d/.test(out) && out.length > 30)
    out = out.trim().replace(/\.$/, '') + ', achieving measurable results.';
  return out.replace(/\s+/g,' ').trim();
}

/* ──────────────────────────────────────────────────────────────────
   StyledTextarea  (with built-in ✨ Rephrase button)
────────────────────────────────────────────────────────────────── */
export function StyledTextarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  const [rephrased, setRephrased] = useState('');
  const [loading, setLoading]     = useState(false);
  const [applied, setApplied]     = useState(false);

  const handleRephrase = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setApplied(false);
    await new Promise(r => setTimeout(r, 600));
    setRephrased(doRephrase(value));
    setLoading(false);
  };

  const apply = () => { onChange(rephrased); setRephrased(''); setApplied(true); setTimeout(() => setApplied(false), 1800); };
  const dismiss = () => setRephrased('');

  return (
    <div className="space-y-1.5">
      {/* Textarea + rephrase trigger */}
      <div className="relative group">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={inputStyle}
          className={`${I.base} pl-3 pr-16 ${I.input} focus:ring-emerald-500 resize-none`}
        />
        {/* Rephrase button — top-right of textarea */}
        <button
          type="button"
          onClick={handleRephrase}
          disabled={loading || !value.trim()}
          title="✨ AI Rephrase"
          className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-all duration-150 disabled:opacity-40"
          style={{
            background: applied ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
            color: applied ? '#059669' : '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(16,185,129,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = applied ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'; }}
        >
          {loading ? (
            <svg className="animate-spin" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : applied ? (
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          ) : (
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )}
          {applied ? 'Applied!' : 'Rephrase'}
        </button>
      </div>

      {/* Rephrased result */}
      {rephrased && (
        <div className="rounded-lg p-3 space-y-2 text-xs"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="font-semibold" style={{ color: '#10b981' }}>✨ Rephrased:</p>
          <p style={{ color: 'var(--ui-text)', lineHeight: 1.55 }}>{rephrased}</p>
          <div className="flex items-center gap-2 pt-0.5">
            <button onClick={apply}
              className="flex items-center gap-1 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all"
              style={{ background: '#10b981' }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
              onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
            >
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Apply
            </button>
            <button onClick={handleRephrase}
              className="text-[10px] px-2.5 py-1 rounded-md transition-all"
              style={{ color: '#10b981', background: 'transparent', border: '1px solid rgba(16,185,129,0.3)' }}
            >Try Again</button>
            <button onClick={dismiss}
              className="text-[10px] ml-auto"
              style={{ color: 'var(--ui-muted)' }}
            >Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   StyledSelect
────────────────────────────────────────────────────────────────── */
export function StyledSelect({
  value, onChange, options, groups,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: { label: string; value: string }[];
  groups?: { label: string; options: { label: string; value: string }[] }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
        className={`${I.base} pl-3 pr-8 ${I.input} focus:ring-emerald-500 appearance-none cursor-pointer`}
      >
        {options && options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {groups && groups.map(g => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={mutedStyle} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   URLInput — shows as hyperlink when filled
────────────────────────────────────────────────────────────────── */
/* LinkDisplay — shows a URL as a styled anchor link */
export function LinkDisplay({ url, label }: { url: string; label?: string }) {
  if (!url) return null;
  const href = url.startsWith('http') ? url : `https://${url}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-sm text-emerald-500 hover:text-emerald-400 underline transition-colors break-all">
      {label || url}
    </a>
  );
}

export function URLInput({
  value, onChange, placeholder,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const cleanUrl = (v: string) => v.startsWith('http') ? v : `https://${v}`;

  if (value && !editing) {
    return (
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: 'var(--ui-border2)', background: 'var(--ui-input-bg)' }}>
        <a href={cleanUrl(value)} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-sm text-emerald-500 hover:text-emerald-400 underline truncate transition-colors">
          {value}
        </a>
        <button onClick={() => setEditing(true)} className="flex-shrink-0 hover:text-emerald-500 transition-colors" style={mutedStyle}>
          <FiExternalLink size={13} />
        </button>
      </div>
    );
  }
  return (
    <StyledInput
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'https://...'}
      type="url"
      icon={<FiExternalLink size={13} />}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────
   MonthPicker — portal-based to escape overflow containers
────────────────────────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthPicker({
  value, onChange, placeholder = 'Select date', disabled: _disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  const [open,    setOpen]    = useState(false);
  const [year,    setYear]    = useState(() => value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
  const btnRef    = useRef<HTMLButtonElement>(null);
  const dropRef   = useRef<HTMLDivElement>(null);
  const [pos,     setPos]     = useState({ top: 0, left: 0, width: 200, above: false });

  const parsed = value ? { y: parseInt(value.split('-')[0]), m: parseInt(value.split('-')[1]) - 1 } : null;

  const openPicker = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const above = r.bottom + 260 > window.innerHeight;
      setPos({ top: above ? r.top - 4 : r.bottom + 4, left: r.left, width: Math.max(200, r.width), above });
      setYear(parsed?.y ?? new Date().getFullYear());
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (!dropRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [open]);

  const pick = (m: number) => {
    onChange(`${year}-${String(m + 1).padStart(2, '0')}`);
    setOpen(false);
  };
  const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setOpen(false); };

  const display = parsed ? `${MONTHS[parsed.m]} ${parsed.y}` : '';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openPicker}
        className="w-full flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        style={inputStyle}
      >
        <FiCalendar size={13} style={mutedStyle} />
        <span className="flex-1" style={display ? textStyle : mutedStyle}>
          {display || placeholder}
        </span>
        {value && (
          <span onClick={clear} className="text-xs hover:text-red-400 transition-colors ml-auto" style={mutedStyle}>✕</span>
        )}
      </button>

      {open && typeof document !== 'undefined' && (() => {
        const { createPortal } = require('react-dom');
        return createPortal(
          <div
            ref={dropRef}
            className="animate-in fixed z-[9999] rounded-xl shadow-2xl border p-3"
            style={{
              top:    pos.above ? undefined : pos.top,
              bottom: pos.above ? window.innerHeight - pos.top : undefined,
              left:   pos.left,
              width:  pos.width,
              background: 'var(--ui-surface)',
              borderColor: 'var(--ui-border)',
            }}
          >
            {/* Year nav */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setYear(y => y - 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-bold"
                style={mutedStyle}>‹</button>
              <span className="text-sm font-bold" style={textStyle}>{year}</span>
              <button onClick={() => setYear(y => y + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-bold"
                style={mutedStyle}>›</button>
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, i) => {
                const sel = parsed?.y === year && parsed?.m === i;
                return (
                  <button key={m} onClick={() => pick(i)}
                    className="py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={sel
                      ? { background: '#10b981', color: '#fff' }
                      : { color: 'var(--ui-text2)', background: 'transparent' }
                    }
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--ui-card2)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  >{m}</button>
                );
              })}
            </div>
          </div>,
          document.body
        );
      })()}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CheckboxField
────────────────────────────────────────────────────────────────── */
export function CheckboxField({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-emerald-500' : ''}`}
        style={checked ? {} : { background: 'var(--ui-border2)' }}
        onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </div>
      <span className="text-sm font-medium" style={text2Style}>{label}</span>
    </label>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ResetButton
────────────────────────────────────────────────────────────────── */
export function ResetButton({
  onClick, label = 'Reset',
}: {
  onClick: () => void; label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors"
      style={{ color: 'var(--ui-muted)', background: 'var(--ui-card2)', border: '1px solid var(--ui-border)' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ui-muted)'; e.currentTarget.style.borderColor = 'var(--ui-border)'; }}
    >
      <FiRotateCcw size={9} />{label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SectionCard — collapsible card for editor entries
────────────────────────────────────────────────────────────────── */
export function SectionCard({
  title, subtitle, isOpen, onToggle, onDelete, onDuplicate, children,
}: {
  title: string; subtitle?: string; isOpen: boolean;
  onToggle: () => void; onDelete?: () => void; onDuplicate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: 'var(--ui-border)', background: 'var(--ui-card)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: isOpen ? 'var(--ui-card2)' : 'var(--ui-card)' }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--ui-card2)'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'var(--ui-card)'; }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={textStyle}>{title || 'Untitled'}</p>
          {subtitle && <p className="text-xs truncate mt-0.5" style={mutedStyle}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onDuplicate && (
            <span onClick={e => { e.stopPropagation(); onDuplicate(); }}
              className="p-1.5 rounded-lg transition-colors text-xs"
              style={mutedStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ui-muted)'}
              title="Duplicate">⧉</span>
          )}
          {onDelete && (
            <span onClick={e => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg transition-colors text-xs"
              style={mutedStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ui-muted)'}
              title="Delete">✕</span>
          )}
          <span className="text-xs transition-transform" style={{ ...mutedStyle, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t" style={{ borderColor: 'var(--ui-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   AddButton
────────────────────────────────────────────────────────────────── */
export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full border-2 border-dashed rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
      style={{ borderColor: 'var(--ui-border2)', color: 'var(--ui-muted)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.color = '#10b981';
        e.currentTarget.style.background = 'rgba(16,185,129,0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--ui-border2)';
        e.currentTarget.style.color = 'var(--ui-muted)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span className="text-lg leading-none">+</span> {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Rephraser — inline AI rephraser for any text field
────────────────────────────────────────────────────────────────── */
const POWER_VERBS: Record<string, string> = {
  managed: 'Spearheaded', led: 'Orchestrated', built: 'Architected',
  created: 'Engineered', developed: 'Pioneered', improved: 'Optimized',
  worked: 'Collaborated', helped: 'Facilitated', made: 'Delivered',
  used: 'Leveraged', did: 'Executed', handled: 'Administered',
  increased: 'Accelerated', reduced: 'Streamlined', implemented: 'Deployed',
};
const FILLER = /\b(basically|just|kind of|sort of|very|really|quite|a bit|actually|simply|various|multiple)\b/gi;

function rephrase(text: string): string {
  let out = text;
  for (const [weak, strong] of Object.entries(POWER_VERBS)) {
    out = out.replace(new RegExp(`\\b${weak}\\b`, 'gi'), m =>
      m[0] === m[0].toUpperCase() ? strong : strong.toLowerCase()
    );
  }
  out = out.replace(FILLER, '').replace(/\s{2,}/g, ' ').trim();
  if (!/\d/.test(out) && out.length > 30) {
    out = out.replace(/\.$/, '') + ', achieving measurable results.';
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export function Rephraser({
  text, onApply,
}: {
  text: string; onApply: (v: string) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [result, setResult] = useState('');
  const [busy,   setBusy]   = useState(false);

  const run = async () => {
    setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    setResult(rephrase(text));
    setBusy(false);
    setOpen(true);
  };

  if (!text.trim()) return null;

  return (
    <div className="mt-1">
      {!open ? (
        <button onClick={run} disabled={busy}
          className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-all"
          style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
        >
          <FiWind size={10} />
          {busy ? 'Rephrasing…' : 'Rephrase with AI'}
        </button>
      ) : (
        <div className="rounded-xl border p-3 space-y-2 mt-2" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <FiWind size={10} style={{ color: '#8b5cf6' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#8b5cf6' }}>AI Suggestion</span>
          </div>
          <p className="text-xs leading-relaxed" style={text2Style}>{result}</p>
          <div className="flex gap-2 pt-1">
            <button onClick={() => { onApply(result); setOpen(false); }}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
              Apply
            </button>
            <button onClick={run}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--ui-muted)', background: 'var(--ui-card2)', border: '1px solid var(--ui-border)' }}>
              Try again
            </button>
            <button onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ml-auto"
              style={{ color: 'var(--ui-muted)' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
