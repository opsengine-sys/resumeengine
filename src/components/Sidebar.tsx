import { useState, useRef, useEffect } from 'react';
import { useResumeStore } from '../store/resumeStore';
import BrandLogoComponent from './BrandLogo';
// ThemeToggle moved to App.tsx floating button
import { useTheme } from '../context/ThemeContext';
import {
  FiUser, FiFileText, FiBriefcase, FiBook, FiStar, FiCode,
  FiAward, FiTrendingUp, FiGlobe, FiHeart, FiBookOpen, FiUsers,
  FiMenu, FiEye, FiEyeOff, FiLayout, FiPlus, FiPrinter, FiType,
  FiList, FiCheck, FiDroplet, FiRotateCcw, FiEdit2, FiTrash2, FiCopy,
  FiChevronDown,
} from 'react-icons/fi';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionConfig, Template, TypographySettings, ColorSettings, TextLevel, ElementStyle } from '../types/resume';
import { TEMPLATES, FONT_OPTIONS, DEFAULT_TYPOGRAPHY, DEFAULT_COLORS, DEFAULT_LEVEL_STYLES } from '../data/defaultData';

/* ─── Icon map ────────────────────────────────────────────────────── */
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FiUser, FiFileText, FiBriefcase, FiBook, FiStar, FiCode,
  FiAward, FiTrendingUp, FiGlobe, FiHeart, FiBookOpen, FiUsers,
};

/* ─── Sortable section row ─────────────────────────────────────────── */
function SortableSection({ section, isActive, onClick, onToggle, onRename, onRemove, onDuplicate, isDark }: {
  section: SectionConfig;
  isActive: boolean;
  onClick: () => void;
  onToggle: () => void;
  onRename: (label: string) => void;
  onRemove?: () => void;
  onDuplicate: () => void;
  isDark?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.key });
  const Icon = ICONS[section.icon] || FiFileText;
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(section.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commitRename = () => {
    const trimmed = editVal.trim();
    if (trimmed && trimmed !== section.label) onRename(trimmed);
    else setEditVal(section.label);
    setEditing(false);
  };

  const rowBg    = isActive ? '#059669' : 'transparent';
  const rowColor = isActive ? '#ffffff' : (isDark ? '#c9d1d9' : '#374151');
  const mutedCol = isActive ? 'rgba(255,255,255,0.55)' : (isDark ? '#484f58' : '#d1d5db');

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : (!section.visible ? 0.45 : 1), background: rowBg, borderRadius: 10, color: rowColor }}
      className="group flex items-center gap-1 px-1.5 py-1.5 transition-all cursor-pointer"
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <button {...attributes} {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded touch-none" tabIndex={-1}>
        <FiMenu size={9} style={{ color: mutedCol }} />
      </button>

      <div className="flex-1 flex items-center gap-1.5 min-w-0" onClick={() => !editing && onClick()}>
        <span style={{ color: isActive ? '#fff' : (isDark ? '#10b981' : '#6b7280'), flexShrink: 0, display:'flex' }}><Icon size={11} /></span>
        {editing ? (
          <input
            ref={inputRef} value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditVal(section.label); setEditing(false); } }}
            onClick={e => e.stopPropagation()}
            style={{ flex:1, minWidth:0, fontSize:11, fontWeight:500, background: isDark?'#0d1117':'#fff', color: isDark?'#e6edf3':'#111827', border:'1px solid #10b981', borderRadius:4, padding:'2px 6px', outline:'none' }}
          />
        ) : (
          <span style={{ fontSize:11, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{section.label}</span>
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); setEditVal(section.label); setEditing(true); }} title="Rename"
          style={{ padding:3, borderRadius:4, color: isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af'), background:'transparent', border:'none', cursor:'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color='#3b82f6'} onMouseLeave={e => e.currentTarget.style.color=isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af')}
        ><FiEdit2 size={9} /></button>
        <button onClick={e => { e.stopPropagation(); onDuplicate(); }} title="Duplicate"
          style={{ padding:3, borderRadius:4, color: isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af'), background:'transparent', border:'none', cursor:'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color='#10b981'} onMouseLeave={e => e.currentTarget.style.color=isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af')}
        ><FiCopy size={9} /></button>
        {onRemove && (
          <button onClick={e => { e.stopPropagation(); onRemove(); }} title="Remove"
            style={{ padding:3, borderRadius:4, color: isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af'), background:'transparent', border:'none', cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color='#ef4444'} onMouseLeave={e => e.currentTarget.style.color=isActive?'rgba(255,255,255,0.7)':(isDark?'#8b949e':'#9ca3af')}
          ><FiTrash2 size={9} /></button>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); onToggle(); }} title={section.visible ? 'Hide' : 'Show'}
        style={{ padding:3, borderRadius:4, color: section.visible?(isActive?'rgba(255,255,255,0.8)':'#10b981'):(isDark?'#484f58':'#d1d5db'), background:'transparent', border:'none', cursor:'pointer', flexShrink:0 }}
      >
        {section.visible ? <FiEye size={10} /> : <FiEyeOff size={10} />}
      </button>
    </div>
  );
}

/* ─── Tab type ────────────────────────────────────────────────────── */
type SideTab = 'sections' | 'templates' | 'typography' | 'colors';

/* ─── Template swatch SVG ─────────────────────────────────────────── */
function TemplateSwatch({ t }: { t: Template }) {
  if (t.id === 'latex') {
    return (
      <svg viewBox="0 0 40 50" width="40" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="50" fill="#ffffff" rx="2" stroke="#e5e7eb" strokeWidth="0.5" />
        <rect x="8" y="4" width="24" height="3" rx="1" fill="#111827" opacity="0.85" />
        <rect x="4" y="9" width="32" height="1.2" rx="0.6" fill="#6b7280" opacity="0.5" />
        <rect x="2" y="13" width="36" height="0.8" rx="0.4" fill="#111827" opacity="0.7" />
        <rect x="2" y="16" width="14" height="2" rx="0.5" fill="#111827" opacity="0.75" />
        <rect x="2" y="19.5" width="36" height="0.5" rx="0.25" fill="#111827" opacity="0.4" />
        {[22,25,28,31].map(y => <rect key={y} x="2" y={y} width={y % 6 === 0 ? 34 : 28} height="1.2" rx="0.6" fill="#d1d5db" />)}
        <rect x="2" y="35" width="12" height="2" rx="0.5" fill="#111827" opacity="0.75" />
        <rect x="2" y="38" width="36" height="0.5" rx="0.25" fill="#111827" opacity="0.4" />
        {[41,44,47].map(y => <rect key={y} x="2" y={y} width={y % 5 === 0 ? 32 : 25} height="1.2" rx="0.6" fill="#d1d5db" />)}
      </svg>
    );
  }
  if (t.layout === 'two-column') {
    return (
      <svg viewBox="0 0 40 50" width="40" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="50" fill="#f8fafc" rx="2" />
        <rect x="0" y="0" width="13" height="50" fill={t.primaryColor} rx="2" />
        <circle cx="6.5" cy="9" r="4" fill="rgba(255,255,255,0.35)" />
        {[15,19,23,27,31,35,40,44].map(y => <rect key={y} x="2" y={y} width="9" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)" />)}
        <rect x="16" y="5" width="20" height="2.5" rx="1" fill={t.primaryColor} opacity="0.7" />
        <rect x="16" y="10" width="14" height="1.5" rx="0.75" fill="#d1d5db" />
        {[15,18,21,25,28,32,35,39,43].map(y => <rect key={y} x="16" y={y} width={y % 6 === 0 ? 20 : 16} height="1.2" rx="0.6" fill="#e5e7eb" />)}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 50" width="40" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="50" fill="#f8fafc" rx="2" />
      <rect x="0" y="0" width="40" height="14" fill={t.primaryColor} rx="2" />
      <circle cx="8" cy="7" r="3.5" fill="rgba(255,255,255,0.3)" />
      <rect x="14" y="3.5" width="18" height="2" rx="1" fill="rgba(255,255,255,0.9)" />
      <rect x="14" y="7.5" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)" />
      <rect x="3" y="17" width="12" height="2" rx="1" fill={t.primaryColor} opacity="0.7" />
      <rect x="0" y="20.5" width="40" height="0.5" fill={t.primaryColor} opacity="0.3" />
      {[23,26,30,33,36,40,43,46].map(y => <rect key={y} x="3" y={y} width={y % 7 === 0 ? 30 : 22} height="1.2" rx="0.6" fill="#e5e7eb" />)}
    </svg>
  );
}

/* ─── Slider ──────────────────────────────────────────────────────── */
function SliderBlock({ label, unit, value, min, max, step, onChange, color, onReset, defaultVal }: {
  label: string; unit: string; value: number;
  min: number; max: number; step: number;
  onChange: (v: number) => void; color: string;
  onReset?: () => void; defaultVal?: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const id  = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[10px] font-semibold text-gray-600 cursor-pointer">{label}</label>
        <div className="flex items-center gap-1">
          {onReset && defaultVal !== undefined && value !== defaultVal && (
            <button onClick={onReset} title="Reset" className="p-0.5 text-gray-300 hover:text-orange-500 transition-colors">
              <FiRotateCcw size={8} />
            </button>
          )}
          <input
            type="number" value={value} min={min} max={max} step={step}
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
            className="w-12 text-center text-[10px] font-bold text-gray-800 border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-emerald-400 bg-white"
          />
          <span className="text-[9px] text-gray-400 w-3">{unit}</span>
        </div>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ '--thumb-color': color, '--fill-pct': `${pct}%` } as React.CSSProperties}
        className="sidebar-range w-full"
      />
    </div>
  );
}

/* ─── Color picker row ────────────────────────────────────────────── */
function ColorRow({ label, value, onChange, isDark }: { label: string; value: string; onChange: (v: string) => void; isDark?: boolean }) {
  const bg   = isDark ? '#161b22' : '#f9fafb';
  const text = isDark ? '#c9d1d9' : '#374151';
  const muted = isDark ? '#8b949e' : '#9ca3af';
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background: bg, borderRadius:12, padding:'8px 12px' }}>
      <span style={{ fontSize:11, fontWeight:600, color: text }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:10, color: muted, fontFamily:'monospace', textTransform:'uppercase' }}>{value}</span>
        <label style={{ position:'relative', width:32, height:32, borderRadius:8, overflow:'hidden', border:`2px solid ${isDark?'#30363d':'#fff'}`, boxShadow:'0 1px 4px rgba(0,0,0,0.2)', cursor:'pointer', display:'block' }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }} />
          <div style={{ width:'100%', height:'100%', borderRadius:6, backgroundColor: value }} />
        </label>
      </div>
    </div>
  );
}

/* ─── Toggle row ──────────────────────────────────────────────────── */
function ToggleRow({ label, description, value, onChange, isDark }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void; isDark?: boolean;
}) {
  const bg   = isDark ? '#161b22' : '#f9fafb';
  const text = isDark ? '#c9d1d9' : '#374151';
  const muted = isDark ? '#8b949e' : '#9ca3af';
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background: bg, borderRadius:12, padding:'8px 12px', gap:12 }}>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:11, fontWeight:600, color: text, lineHeight:1.3 }}>{label}</p>
        {description && <p style={{ fontSize:10, color: muted, lineHeight:1.3, marginTop:2 }}>{description}</p>}
      </div>
      <button
        role="switch" aria-checked={value} onClick={() => onChange(!value)}
        style={{ position:'relative', flexShrink:0, width:40, height:20, borderRadius:10, background: value?'#10b981':(isDark?'#374151':'#d1d5db'), border:'none', cursor:'pointer', transition:'background 0.2s' }}
      >
        <span style={{ position:'absolute', top:2, left:2, width:16, height:16, background:'#fff', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,0.3)', transition:'transform 0.2s', transform: value?'translateX(20px)':'translateX(0)' }} />
      </button>
    </div>
  );
}

/* ─── Logo (kept for reference, inlined in header) ──────────────── */

/* ─── Text Level definitions ──────────────────────────────────────── */
const TEXT_LEVELS: { key: TextLevel; label: string; desc: string; defaultSize: number }[] = [
  { key: 'candidateName',   label: 'Candidate Name',     desc: 'Full name in the resume header',        defaultSize: 26 },
  { key: 'headline',        label: 'Headline / Tagline', desc: 'Professional title below name',         defaultSize: 12 },
  { key: 'contactInfo',     label: 'Contact Info',       desc: 'Email, location, LinkedIn, URLs',       defaultSize: 10 },
  { key: 'sectionTitle',    label: 'Section Titles',     desc: 'WORK EXPERIENCE, EDUCATION, etc.',      defaultSize: 13 },
  { key: 'jobTitle',        label: 'Job Title / Degree', desc: 'Role name or degree title',             defaultSize: 12 },
  { key: 'companyName',     label: 'Company / Org Name', desc: 'Employer or institution',               defaultSize: 11 },
  { key: 'institutionName', label: 'Institution',        desc: 'University or school name',             defaultSize: 11 },
  { key: 'date',            label: 'Dates',              desc: 'Date ranges, periods',                  defaultSize: 10 },
  { key: 'bodyText',        label: 'Body Text',          desc: 'Paragraphs and bullet points',          defaultSize: 11 },
];

const CASE_OPTIONS: { value: string; label: string; title: string }[] = [
  { value: 'uppercase',  label: 'AA',  title: 'UPPERCASE'  },
  { value: 'capitalize', label: 'Aa',  title: 'Title Case' },
  { value: 'lowercase',  label: 'aa',  title: 'lowercase'  },
  { value: 'normal',     label: 'Ab',  title: 'Normal'     },
];

const WEIGHT_OPTIONS: { value: string; label: string; style: React.CSSProperties }[] = [
  { value: 'light',  label: 'Light',  style: { fontWeight: 300 } },
  { value: 'normal', label: 'Normal', style: { fontWeight: 400 } },
  { value: 'bold',   label: 'Bold',   style: { fontWeight: 700 } },
];

/* ─── Level style editor ──────────────────────────────────────────── */
function LevelStyleEditor({
  level, style, globalFont, globalFontSize, onUpdate, onReset,
}: {
  level: TextLevel;
  style: ElementStyle;
  globalFont: string;
  globalFontSize: number;
  onUpdate: (s: Partial<ElementStyle>) => void;
  onReset: () => void;
}) {
  const defaults      = DEFAULT_LEVEL_STYLES[level];
  const levelInfo     = TEXT_LEVELS.find(l => l.key === level)!;
  const isModified    = JSON.stringify(style) !== JSON.stringify(defaults);
  const currentSize   = style.fontSize ?? levelInfo.defaultSize;
  const sizeMin       = level === 'candidateName' ? 14 : 8;
  const sizeMax       = level === 'candidateName' ? 60 : 32;

  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 space-y-3">

      {/* Font family — global override per level */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Font</span>
          <div className="flex items-center gap-1.5">
            {style.fontFamily && (
              <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Override</span>
            )}
            {isModified && (
              <button onClick={onReset} className="text-[9px] text-orange-400 hover:text-orange-600 flex items-center gap-0.5">
                <FiRotateCcw size={8} /> Reset all
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <select
            value={style.fontFamily ?? ''}
            onChange={e => onUpdate({ fontFamily: e.target.value || undefined })}
            className="w-full text-[10px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 appearance-none pr-6"
          >
            <option value="">— Use Global ({globalFont.split(',')[0].replace(/"/g, '')}) —</option>
            {(['LaTeX', 'Modern', 'Serif'] as const).map(grp => (
              <optgroup key={grp} label={`── ${grp} ──`}>
                {FONT_OPTIONS.filter(f => f.group === grp).map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <FiChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {style.fontFamily && (
          <p className="text-[9px] text-emerald-600 mt-0.5 px-0.5">
            ✓ Using <strong>{style.fontFamily.split(',')[0].replace(/"/g,'')}</strong> instead of global font
          </p>
        )}
      </div>

      {/* Font size — per level override */}
      <div>
        <SliderBlock
          label="Font Size" unit="px"
          value={currentSize}
          min={sizeMin} max={sizeMax} step={0.5}
          onChange={v => onUpdate({ fontSize: v })}
          color="#10b981"
          onReset={() => onUpdate({ fontSize: undefined })}
          defaultVal={levelInfo.defaultSize}
        />
        {style.fontSize !== undefined && (
          <p className="text-[9px] text-emerald-600 mt-0.5 px-0.5">
            ✓ Custom size: {style.fontSize}px (global: {Math.round(globalFontSize)}px)
          </p>
        )}
      </div>

      {/* Weight + Italic row */}
      <div>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Style</span>
        <div className="flex gap-1.5 flex-wrap">
          {WEIGHT_OPTIONS.map(w => (
            <button
              key={w.value}
              onClick={() => onUpdate({ fontWeight: w.value as ElementStyle['fontWeight'] })}
              className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all
                ${style.fontWeight === w.value
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'}`}
              style={w.style}
            >
              {w.label}
            </button>
          ))}
          <button
            onClick={() => onUpdate({ isItalic: !style.isItalic })}
            className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all italic
              ${style.isItalic
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}
          >
            Italic
          </button>
        </div>
      </div>

      {/* Letter case */}
      <div>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Letter Case</span>
        <div className="grid grid-cols-4 gap-1">
          {CASE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ letterCase: opt.value as ElementStyle['letterCase'] })}
              title={opt.title}
              className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all
                ${style.letterCase === opt.value
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'}`}
              style={{ textTransform: opt.value === 'normal' ? 'none' : opt.value as React.CSSProperties['textTransform'] }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="pt-1 border-t border-gray-100">
        <span className="text-[9px] text-gray-400 uppercase tracking-wide block mb-1">Preview</span>
        <div
          className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 truncate"
          style={{
            fontFamily: style.fontFamily ?? globalFont,
            fontSize: `${Math.min(currentSize, 18)}px`,
            fontWeight: style.fontWeight === 'bold' ? 700 : style.fontWeight === 'light' ? 300 : 400,
            fontStyle: style.isItalic ? 'italic' : 'normal',
            textTransform: (style.letterCase === 'normal' || !style.letterCase) ? 'none' : style.letterCase as React.CSSProperties['textTransform'],
          }}
        >
          {levelInfo.label}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ────────────────────────────────────────────────── */
interface Props { onExport: () => void; onGoHome?: () => void; onTabChange?: (tab: SideTab) => void; }

export default function Sidebar({ onExport, onGoHome: _onGoHome, onTabChange }: Props) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<SideTab>('sections');
  const handleTabChange = (tab: SideTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [showAddSection, setShowAddSection]   = useState(false);
  const [selectedLevel, setSelectedLevel]     = useState<TextLevel>('candidateName');

  const {
    activeSection, setActiveSection, getActiveResume,
    updateSections, toggleSectionVisibility,
    renameSection, addCustomSection, removeCustomSection, resetSections, duplicateSection,
    setShowTemplateModal, setShowResumeListModal,
    updateTemplate, updateTypography, updateColors,
  } = useResumeStore();

  const resume   = getActiveResume();
  const sections = resume?.sections || [];
  const typo     = resume?.typography ?? DEFAULT_TYPOGRAPHY;
  const colors   = resume?.colors     ?? DEFAULT_COLORS;

  const levelStyles: Record<TextLevel, ElementStyle> = {
    ...DEFAULT_LEVEL_STYLES,
    ...(typo.levelStyles ?? {}),
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = sections.findIndex(s => s.key === active.id);
      const newIdx = sections.findIndex(s => s.key === over.id);
      updateSections(arrayMove(sections, oldIdx, newIdx));
    }
  };

  const ut = (key: keyof TypographySettings, value: number | string) => updateTypography({ [key]: value });
  const uc = (key: keyof ColorSettings, value: string | boolean)     => updateColors({ [key]: value });

  const updateLevelStyle = (level: TextLevel, patch: Partial<ElementStyle>) => {
    const current = levelStyles[level] ?? DEFAULT_LEVEL_STYLES[level];
    updateTypography({
      levelStyles: { ...levelStyles, [level]: { ...current, ...patch } },
    });
  };

  const resetLevelStyle = (level: TextLevel) => {
    updateTypography({
      levelStyles: { ...levelStyles, [level]: { ...DEFAULT_LEVEL_STYLES[level] } },
    });
  };

  const TABS: { id: SideTab; icon: React.ReactNode; label: string }[] = [
    { id: 'sections',   icon: <FiList    size={12} />, label: 'Sections'  },
    { id: 'templates',  icon: <FiLayout  size={12} />, label: 'Templates' },
    { id: 'typography', icon: <FiType    size={12} />, label: 'Style'     },
    { id: 'colors',     icon: <FiDroplet size={12} />, label: 'Colors'    },
  ];

  // ── Dark mode tokens ────────────────────────────────────────────
  const d = {
    bg:          isDark ? '#0d1117' : '#ffffff',
    bgSecondary: isDark ? '#161b22' : '#f9fafb',
    bgTertiary:  isDark ? '#1c2333' : '#f3f4f6',
    border:      isDark ? '#30363d' : '#e5e7eb',
    borderSoft:  isDark ? '#21262d' : '#f0f0f0',
    text:        isDark ? '#e6edf3' : '#111827',
    textMuted:   isDark ? '#8b949e' : '#6b7280',
    textFaint:   isDark ? '#484f58' : '#9ca3af',
    tabActive:   isDark ? '#10b981' : '#059669',
    tabActiveBg: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
    inputBg:     isDark ? '#0d1117' : '#ffffff',
    inputBorder: isDark ? '#30363d' : '#d1d5db',
    cardBg:      isDark ? '#161b22' : '#f9fafb',
    cardBorder:  isDark ? '#30363d' : '#e5e7eb',
    hoverBg:     isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5',
    activeBg:    isDark ? 'rgba(16,185,129,0.18)' : '#d1fae5',
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: d.bg, borderRight: `1px solid ${d.border}` }}>

      {/* ── Logo header ──────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)',
          borderBottom: '1px solid rgba(16,185,129,0.2)',
          padding: '10px 12px',
          minHeight: 50,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0">
            <BrandLogoComponent size="sm" variant="icon" />
          </div>
          <div className="flex flex-col min-w-0" style={{ lineHeight: 1 }}>
            <div className="flex items-baseline gap-0.5">
              <span style={{ fontFamily:"'Space Grotesk','Inter',sans-serif", fontWeight:500, fontSize:14, color:'#34D399' }}>Resume</span>
              <span style={{ fontFamily:"'Space Grotesk','Inter',sans-serif", fontWeight:700, fontSize:14, color:'#ecfdf5' }}>Engine</span>
            </div>
            <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:7.5, letterSpacing:'2.5px', color:'rgba(167,243,208,0.55)', textTransform:'uppercase', marginTop:3 }}>BUILDER</span>
          </div>
        </div>
      </div>

      {/* ── Resume switcher ──────────────────────────────────── */}
      <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${d.borderSoft}` }}>
        <button
          onClick={() => setShowResumeListModal(true)}
          className="w-full text-left px-3 py-2 rounded-xl transition-all group"
          style={{ background: d.bgSecondary, border: `1px solid ${d.border}` }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = d.border)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p style={{ fontSize:9, color: d.textFaint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Active Resume</p>
              <p style={{ fontSize:12, fontWeight:700, color: d.text }} className="truncate">{resume?.name || 'My Resume'}</p>
            </div>
            <FiPlus size={12} style={{ color: d.textMuted, flexShrink:0 }} />
          </div>
        </button>
      </div>

      {/* ── Top Tab Bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 flex-shrink-0" style={{ borderBottom: `1px solid ${d.border}` }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 py-2 text-[9px] font-bold transition-all"
            style={{
              borderBottom: activeTab === tab.id ? `2px solid #10b981` : '2px solid transparent',
              color: activeTab === tab.id ? '#10b981' : d.textMuted,
              background: activeTab === tab.id ? d.tabActiveBg : 'transparent',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content (scrollable) ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ background: d.bg }}>

        {/* ══ SECTIONS tab ════════════════════════════════════ */}
        {activeTab === 'sections' && (
          <div className="p-2 pb-4">
            {/* Hint bar */}
            <div className="flex items-center justify-between px-1 pt-2 pb-1.5 mb-1">
              <div className="flex items-center gap-2">
                {[['Drag', FiMenu], ['Toggle', FiEye], ['Copy', FiCopy]].map(([label, Icon], i) => (
                  <div key={i} className="flex items-center gap-1">
                    {i > 0 && <span style={{ color: d.textFaint, fontSize:9 }}>·</span>}
                    {/* @ts-ignore */}
                    <Icon size={9} style={{ color: d.textFaint }} />
                    <span style={{ fontSize:9, color: d.textMuted, fontWeight:600 }}>{label as string}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={resetSections}
                className="flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all"
                style={{ fontSize:9, fontWeight:600, color: d.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.color='#f97316'; e.currentTarget.style.background=isDark?'rgba(249,115,22,0.1)':'#fff7ed'; }}
                onMouseLeave={e => { e.currentTarget.style.color=d.textMuted; e.currentTarget.style.background='transparent'; }}
                title="Reset to defaults"
              >
                <FiRotateCcw size={8} /> Reset
              </button>
            </div>

            {/* Sortable list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.key)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5">
                  {sections.map(section => (
                    <SortableSection
                      key={section.key}
                      section={section}
                      isActive={activeSection === section.key}
                      onClick={() => setActiveSection(section.key)}
                      onToggle={() => toggleSectionVisibility(section.key)}
                      onRename={label => renameSection(section.key, label)}
                      onRemove={section.isCustom ? () => removeCustomSection(section.key) : undefined}
                      onDuplicate={() => duplicateSection(section.key)}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add custom section */}
            <div className="mt-3 px-1">
              {showAddSection ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus value={newSectionLabel}
                    onChange={e => setNewSectionLabel(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSectionLabel.trim()) { addCustomSection(newSectionLabel.trim()); setNewSectionLabel(''); setShowAddSection(false); }
                      if (e.key === 'Escape') { setNewSectionLabel(''); setShowAddSection(false); }
                    }}
                    placeholder="Section name..."
                    style={{ flex:1, minWidth:0, fontSize:11, border:`1px solid #10b981`, borderRadius:8, padding:'6px 10px', outline:'none', background: d.inputBg, color: d.text }}
                  />
                  <button onClick={() => { if (newSectionLabel.trim()) { addCustomSection(newSectionLabel.trim()); setNewSectionLabel(''); } setShowAddSection(false); }}
                    style={{ padding:6, borderRadius:8, background:'#059669', color:'#fff', border:'none', cursor:'pointer', flexShrink:0 }}
                  ><FiCheck size={11} /></button>
                  <button onClick={() => { setNewSectionLabel(''); setShowAddSection(false); }}
                    style={{ padding:6, borderRadius:8, background: d.bgTertiary, color: d.textMuted, border:'none', cursor:'pointer', flexShrink:0 }}
                  ><FiTrash2 size={11} /></button>
                </div>
              ) : (
                <button onClick={() => setShowAddSection(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all"
                  style={{ fontSize:10, fontWeight:600, color:'#10b981', border:`1px dashed ${isDark?'rgba(16,185,129,0.3)':'#a7f3d0'}`, background:'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background=isDark?'rgba(16,185,129,0.08)':'#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                >
                  <FiPlus size={11} /> Add Custom Section
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ TEMPLATES tab ══════════════════════════════════ */}
        {activeTab === 'templates' && (
          <div className="p-3 pb-6">
            <div className="flex items-center justify-between mb-3 px-1 pt-2">
              <p style={{ fontSize:9, fontWeight:700, color: d.textFaint, textTransform:'uppercase', letterSpacing:'0.1em' }}>Choose a Template</p>
            </div>
            <div className="space-y-2">
              {TEMPLATES.map(t => {
                const isSelected = resume?.templateId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateTemplate(t.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
                    style={{
                      border: `2px solid ${isSelected ? '#10b981' : d.cardBorder}`,
                      background: isSelected ? (isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4') : d.cardBg,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = isDark?'#374151':'#d1d5db'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = d.cardBorder; }}
                  >
                    <div className="flex-shrink-0 w-10 rounded-lg overflow-hidden shadow-sm" style={{ border:`1px solid ${d.border}` }}>
                      <TemplateSwatch t={t} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p style={{ fontSize:12, fontWeight:700, color: isSelected ? '#10b981' : d.text }} className="truncate">{t.name}</p>
                      <p style={{ fontSize:10, color: d.textMuted }} className="truncate">{t.description}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                        <FiCheck size={10} style={{ color:'#fff' }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full py-2.5 mt-3 rounded-xl transition-all"
              style={{ fontSize:11, fontWeight:600, color:'#10b981', border:`1px dashed ${isDark?'rgba(16,185,129,0.3)':'#a7f3d0'}`, background:'transparent' }}
            >
              Full Template Gallery →
            </button>
          </div>
        )}

        {/* ══ STYLE tab ══════════════════════════════════════ */}
        {activeTab === 'typography' && (
          <div className="p-3 pb-8">
            <div className="flex items-center justify-between mb-3 px-1 pt-2">
              <p style={{ fontSize:9, fontWeight:700, color: d.textFaint, textTransform:'uppercase', letterSpacing:'0.1em' }}>Text & Style</p>
              <button onClick={() => updateTypography({ ...DEFAULT_TYPOGRAPHY })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                style={{ fontSize:10, fontWeight:600, color: d.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color=d.textMuted; }}
              ><FiRotateCcw size={9} /> Reset All</button>
            </div>

            {/* ── Global Font ── */}
            <div className="rounded-xl p-3 mb-3" style={{ background: d.bgSecondary, border:`1px solid ${d.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize:11, fontWeight:700, color: d.text }}>Global Font</p>
                <p style={{ fontSize:9, color: d.textMuted }}>Per-level overrides below</p>
              </div>
              <div className="relative">
                <select value={typo.fontFamily} onChange={e => ut('fontFamily', e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 appearance-none cursor-pointer pr-7 focus:outline-none"
                  style={{ background: d.inputBg, border:`1px solid ${d.inputBorder}`, color: d.text }}
                >
                  {(['LaTeX', 'Modern', 'Serif'] as const).map(grp => (
                    <optgroup key={grp} label={`── ${grp} Fonts ──`}>
                      {FONT_OPTIONS.filter(f => f.group === grp).map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <FiChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: d.textMuted }} />
              </div>
            </div>

            {/* ── Text Level Selector + Editor ── */}
            <div className="rounded-xl p-3 mb-3" style={{ background: d.bgSecondary, border:`1px solid ${d.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize:11, fontWeight:700, color: d.text }}>Text Level Styles</p>
                <button onClick={() => resetLevelStyle(selectedLevel)}
                  className="flex items-center gap-1 transition-colors"
                  style={{ fontSize:9, fontWeight:600, color: d.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.color='#f97316'} onMouseLeave={e => e.currentTarget.style.color=d.textMuted}
                ><FiRotateCcw size={8} /> Reset</button>
              </div>
              <div className="relative mb-2">
                <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as TextLevel)}
                  className="w-full text-xs rounded-lg px-3 py-2 appearance-none cursor-pointer pr-7 focus:outline-none font-semibold"
                  style={{ background: d.inputBg, border:`1px solid #10b981`, color:'#10b981' }}
                >
                  {TEXT_LEVELS.map(l => (<option key={l.key} value={l.key}>{l.label}</option>))}
                </select>
                <FiChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: d.textMuted }} />
              </div>
              <p style={{ fontSize:10, color: d.textMuted, marginBottom:4, paddingLeft:2 }}>
                {TEXT_LEVELS.find(l => l.key === selectedLevel)?.desc}
              </p>
              <LevelStyleEditor
                level={selectedLevel} style={levelStyles[selectedLevel]}
                globalFont={typo.fontFamily} globalFontSize={typo.baseFontSize}
                onUpdate={patch => updateLevelStyle(selectedLevel, patch)}
                onReset={() => resetLevelStyle(selectedLevel)}
              />
            </div>

            {/* ── Spacing ── */}
            <div className="rounded-xl p-3 mb-3" style={{ background: d.bgSecondary, border:`1px solid ${d.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize:11, fontWeight:700, color: d.text }}>Spacing & Padding</p>
                <button onClick={() => updateTypography({ lineHeight: DEFAULT_TYPOGRAPHY.lineHeight, sectionSpacing: DEFAULT_TYPOGRAPHY.sectionSpacing, itemSpacing: DEFAULT_TYPOGRAPHY.itemSpacing, pagePaddingX: DEFAULT_TYPOGRAPHY.pagePaddingX, pagePaddingY: DEFAULT_TYPOGRAPHY.pagePaddingY, headerPaddingY: DEFAULT_TYPOGRAPHY.headerPaddingY })}
                  className="flex items-center gap-1 transition-colors"
                  style={{ fontSize:9, fontWeight:600, color: d.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.color='#f97316'} onMouseLeave={e => e.currentTarget.style.color=d.textMuted}
                ><FiRotateCcw size={8} /> Reset</button>
              </div>
              <div className="space-y-2.5">
                <SliderBlock label="Line Height" unit="×"
                  value={typo.lineHeight} min={1} max={2.5} step={0.05}
                  onChange={v => ut('lineHeight', v)} color="#3b82f6"
                  onReset={() => ut('lineHeight', DEFAULT_TYPOGRAPHY.lineHeight)} defaultVal={DEFAULT_TYPOGRAPHY.lineHeight} />
                <SliderBlock label="Section Spacing" unit="px"
                  value={typo.sectionSpacing} min={4} max={40} step={1}
                  onChange={v => ut('sectionSpacing', v)} color="#f59e0b"
                  onReset={() => ut('sectionSpacing', DEFAULT_TYPOGRAPHY.sectionSpacing)} defaultVal={DEFAULT_TYPOGRAPHY.sectionSpacing} />
                <SliderBlock label="Item Spacing" unit="px"
                  value={typo.itemSpacing} min={2} max={24} step={1}
                  onChange={v => ut('itemSpacing', v)} color="#ef4444"
                  onReset={() => ut('itemSpacing', DEFAULT_TYPOGRAPHY.itemSpacing)} defaultVal={DEFAULT_TYPOGRAPHY.itemSpacing} />
                <SliderBlock label="Horizontal Padding" unit="px"
                  value={typo.pagePaddingX} min={16} max={72} step={2}
                  onChange={v => ut('pagePaddingX', v)} color="#06b6d4"
                  onReset={() => ut('pagePaddingX', DEFAULT_TYPOGRAPHY.pagePaddingX)} defaultVal={DEFAULT_TYPOGRAPHY.pagePaddingX} />
                <SliderBlock label="Vertical Padding" unit="px"
                  value={typo.pagePaddingY} min={16} max={72} step={2}
                  onChange={v => ut('pagePaddingY', v)} color="#6366f1"
                  onReset={() => ut('pagePaddingY', DEFAULT_TYPOGRAPHY.pagePaddingY)} defaultVal={DEFAULT_TYPOGRAPHY.pagePaddingY} />
                <SliderBlock label="Header Padding" unit="px"
                  value={typo.headerPaddingY} min={8} max={60} step={2}
                  onChange={v => ut('headerPaddingY', v)} color="#ec4899"
                  onReset={() => ut('headerPaddingY', DEFAULT_TYPOGRAPHY.headerPaddingY)} defaultVal={DEFAULT_TYPOGRAPHY.headerPaddingY} />
              </div>
            </div>
          </div>
        )}

        {/* ══ COLORS tab ═════════════════════════════════════ */}
        {activeTab === 'colors' && (
          <div className="p-3 pb-8">
            <div className="flex items-center justify-between mb-3 px-1 pt-2">
              <p style={{ fontSize:9, fontWeight:700, color: d.textFaint, textTransform:'uppercase', letterSpacing:'0.1em' }}>Colors</p>
              <button onClick={() => updateColors({ ...DEFAULT_COLORS })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                style={{ fontSize:10, fontWeight:600, color: d.textMuted }}
                onMouseEnter={e => e.currentTarget.style.color='#ef4444'} onMouseLeave={e => e.currentTarget.style.color=d.textMuted}
              ><FiRotateCcw size={9} /> Reset All</button>
            </div>
            <div className="space-y-2">
              <p style={{ fontSize:9, fontWeight:700, color: d.textMuted, textTransform:'uppercase', letterSpacing:'0.05em', padding:'4px 4px 0' }}>Text Colors</p>
              <ColorRow label="Body Text"     value={colors.textColor}    onChange={v => uc('textColor',    v)} isDark={isDark} />
              <ColorRow label="Headings"      value={colors.headingColor} onChange={v => uc('headingColor', v)} isDark={isDark} />
              <ColorRow label="Muted / Dates" value={colors.mutedColor}   onChange={v => uc('mutedColor',   v)} isDark={isDark} />
              <ColorRow label="Links / URLs"  value={colors.linkColor}    onChange={v => uc('linkColor',    v)} isDark={isDark} />
              <p style={{ fontSize:9, fontWeight:700, color: d.textMuted, textTransform:'uppercase', letterSpacing:'0.05em', padding:'8px 4px 0' }}>Page Decoration</p>
              <ToggleRow label="Page Border"   description="Thin border around the resume page" value={colors.showBorder}      onChange={v => uc('showBorder',      v)} isDark={isDark} />
              {colors.showBorder && <ColorRow label="Border Color" value={colors.borderColor} onChange={v => uc('borderColor', v)} isDark={isDark} />}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Print / Export ───────────────────────────── */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${d.border}`, background: d.bg }}>
        <button onClick={onExport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl active:scale-95 transition-all text-xs font-bold shadow-md"
          style={{ background:'linear-gradient(135deg,#059669,#0d9488)', color:'#fff' }}
        >
          <FiPrinter size={13} />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}
