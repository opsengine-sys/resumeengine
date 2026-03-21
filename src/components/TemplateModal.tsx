import React, { useState } from 'react';
import { TEMPLATES } from '../data/defaultData';
import { useResumeStore } from '../store/resumeStore';
import { Template } from '../types/resume';
import { FiX, FiCheck } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════════
   TRULY UNIQUE TEMPLATE THUMBNAILS
   Each has a completely different layout structure
═══════════════════════════════════════════════════════════════ */

/** 1. LaTeX/FAANG — plain academic text, no color header, ruled sections */
function ThumbLatex() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      <rect x="20" y="7" width="80" height="7" rx="1" fill="#111" opacity="0.88"/>
      <rect x="15" y="17" width="90" height="2" rx="1" fill="#555" opacity="0.5"/>
      <rect x="8" y="22" width="104" height="0.8" fill="#111" opacity="0.8"/>
      {/* OBJECTIVE */}
      <rect x="8" y="27" width="45" height="3" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="32" width="104" height="0.6" fill="#666" opacity="0.5"/>
      <rect x="8" y="35" width="104" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="38" width="98" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="41" width="86" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      {/* SKILLS — two column */}
      <rect x="8" y="48" width="30" height="3" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="53" width="104" height="0.6" fill="#666" opacity="0.5"/>
      <rect x="8" y="56" width="45" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="60" y="56" width="45" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="59" width="42" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="60" y="59" width="38" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="62" width="48" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="60" y="62" width="40" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      {/* EXPERIENCE */}
      <rect x="8" y="70" width="52" height="3" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="75" width="104" height="0.6" fill="#666" opacity="0.5"/>
      <rect x="8" y="79" width="58" height="2" rx="0.5" fill="#333" opacity="0.8"/>
      <rect x="82" y="79" width="28" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="8" y="83" width="42" height="1.5" rx="0.5" fill="#777" opacity="0.6" fontStyle="italic"/>
      <rect x="12" y="87" width="98" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="12" y="90" width="94" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="12" y="93" width="88" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="12" y="96" width="76" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="8" y="103" width="55" height="2" rx="0.5" fill="#333" opacity="0.8"/>
      <rect x="82" y="103" width="28" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="8" y="107" width="40" height="1.5" rx="0.5" fill="#777" opacity="0.6"/>
      <rect x="12" y="111" width="96" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="12" y="114" width="90" height="1.5" rx="0.5" fill="#aaa" opacity="0.7"/>
      <rect x="110" y="155" width="8" height="2" rx="0.5" fill="#aaa" opacity="0.5"/>
    </svg>
  );
}

/** 2. Classic Professional — centered name, ruled sections, serif feel */
function ThumbClassic({ t }: { t: Template }) {
  const c = t.primaryColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Centered name */}
      <rect x="22" y="8" width="76" height="7" rx="1" fill={c} opacity="0.9"/>
      {/* Centered headline */}
      <rect x="30" y="18" width="60" height="2.5" rx="1" fill="#555" opacity="0.55"/>
      {/* Contact row centered */}
      <rect x="12" y="23" width="20" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="36" y="23" width="20" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="60" y="23" width="20" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="84" y="23" width="24" height="2" rx="0.5" fill="#888" opacity="0.5"/>
      {/* Full-width colored rule */}
      <rect x="8" y="28" width="104" height="1" fill={c} opacity="0.5"/>
      {/* EXPERIENCE section */}
      <rect x="8" y="32" width="55" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <rect x="8" y="37" width="104" height="0.7" fill={c} opacity="0.3"/>
      <rect x="8" y="41" width="56" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="78" y="41" width="30" height="2.5" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="8" y="45" width="42" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="10" y="49" width="96" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="10" y="52" width="90" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="10" y="55" width="80" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="8" y="60" width="52" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="78" y="60" width="30" height="2.5" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="8" y="64" width="38" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="10" y="68" width="94" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="10" y="71" width="88" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      {/* EDUCATION */}
      <rect x="8" y="77" width="44" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <rect x="8" y="82" width="104" height="0.7" fill={c} opacity="0.3"/>
      <rect x="8" y="85" width="65" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="78" y="85" width="28" height="2.5" rx="0.5" fill="#888" opacity="0.5"/>
      <rect x="8" y="89" width="48" height="2" rx="0.5" fill="#666" opacity="0.5"/>
      {/* SKILLS */}
      <rect x="8" y="96" width="30" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <rect x="8" y="101" width="104" height="0.7" fill={c} opacity="0.3"/>
      <rect x="8" y="104" width="104" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="8" y="107" width="96" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
      <rect x="8" y="110" width="80" height="1.5" rx="0.5" fill="#bbb" opacity="0.7"/>
    </svg>
  );
}

/** 3. Modern Bold Header — full-width color header, avatar, contact pills */
function ThumbModernHeader({ t }: { t: Template }) {
  const c = t.primaryColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Full-width header block */}
      <rect width="120" height="38" fill={c}/>
      {/* Avatar circle */}
      <circle cx="18" cy="18" r="10" fill="rgba(255,255,255,0.2)"/>
      <circle cx="18" cy="16" r="4" fill="rgba(255,255,255,0.5)"/>
      <path d="M10 26 Q18 20 26 26" fill="rgba(255,255,255,0.4)"/>
      {/* Name */}
      <rect x="32" y="10" width="60" height="6" rx="1" fill="rgba(255,255,255,0.95)"/>
      {/* Headline */}
      <rect x="32" y="19" width="45" height="3" rx="0.5" fill="rgba(255,255,255,0.65)"/>
      {/* Contact pills */}
      <rect x="32" y="27" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      <rect x="55" y="27" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      <rect x="78" y="27" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      {/* Left accent bar sections */}
      <rect x="8" y="44" width="3" height="16" rx="1.5" fill={c} opacity="0.8"/>
      <rect x="15" y="44" width="42" height="3" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="15" y="49" width="32" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="15" y="53" width="96" height="1.5" rx="0.5" fill="#ccc" opacity="0.7"/>
      <rect x="15" y="56" width="90" height="1.5" rx="0.5" fill="#ccc" opacity="0.7"/>
      <rect x="8" y="64" width="3" height="16" rx="1.5" fill={c} opacity="0.8"/>
      <rect x="15" y="64" width="38" height="3" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="15" y="69" width="28" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="15" y="73" width="96" height="1.5" rx="0.5" fill="#ccc" opacity="0.7"/>
      <rect x="15" y="76" width="88" height="1.5" rx="0.5" fill="#ccc" opacity="0.7"/>
      {/* Skills section */}
      <rect x="8" y="84" width="3" height="3" rx="1.5" fill={c} opacity="0.8"/>
      <rect x="15" y="84" width="25" height="3" rx="0.5" fill="#222" opacity="0.85"/>
      {/* Skill pills */}
      <rect x="8" y="91" width="22" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="33" y="91" width="18" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="54" y="91" width="25" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="82" y="91" width="16" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="8" y="99" width="28" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="39" y="99" width="20" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
    </svg>
  );
}

/** 4. Dark Sidebar — 35% dark left panel + 65% white right */
function ThumbDarkSidebar({ t }: { t: Template }) {
  const c = t.primaryColor;
  const acc = t.accentColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Dark sidebar */}
      <rect width="38" height="160" fill={c}/>
      {/* Avatar in sidebar */}
      <circle cx="19" cy="20" r="11" fill="rgba(255,255,255,0.12)"/>
      <circle cx="19" cy="17" r="5" fill="rgba(255,255,255,0.35)"/>
      <path d="M11 30 Q19 24 27 30" fill="rgba(255,255,255,0.25)"/>
      {/* Sidebar name */}
      <rect x="5" y="36" width="28" height="3.5" rx="1" fill="rgba(255,255,255,0.9)"/>
      <rect x="7" y="41" width="24" height="2" rx="0.5" fill="rgba(255,255,255,0.5)"/>
      {/* Sidebar section labels */}
      <rect x="5" y="50" width="28" height="2" rx="0.5" fill={acc} opacity="0.8"/>
      <rect x="5" y="55" width="24" height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="5" y="58" width="22" height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="5" y="61" width="26" height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      {/* Skill bars in sidebar */}
      <rect x="5" y="70" width="28" height="2" rx="0.5" fill={acc} opacity="0.8"/>
      <rect x="5" y="75" width="28" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="5" y="75" width="22" height="2" rx="1" fill={acc} opacity="0.7"/>
      <rect x="5" y="79" width="28" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="5" y="79" width="16" height="2" rx="1" fill={acc} opacity="0.7"/>
      <rect x="5" y="83" width="28" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="5" y="83" width="25" height="2" rx="1" fill={acc} opacity="0.7"/>
      <rect x="5" y="87" width="28" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="5" y="87" width="20" height="2" rx="1" fill={acc} opacity="0.7"/>
      {/* Main right column */}
      <rect x="42" y="8" width="70" height="6" rx="1" fill="#111" opacity="0.85"/>
      <rect x="42" y="17" width="50" height="2.5" rx="0.5" fill="#555" opacity="0.5"/>
      <rect x="42" y="22" width="70" height="0.8" fill={acc} opacity="0.4"/>
      {/* Experience */}
      <rect x="42" y="27" width="38" height="3" rx="0.5" fill={acc} opacity="0.7"/>
      <rect x="42" y="32" width="58" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="42" y="36" width="40" height="2" rx="0.5" fill="#777" opacity="0.6"/>
      <rect x="42" y="40" width="70" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="42" y="43" width="66" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="42" y="46" width="60" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="42" y="52" width="55" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="42" y="56" width="38" height="2" rx="0.5" fill="#777" opacity="0.6"/>
      <rect x="42" y="60" width="70" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="42" y="63" width="64" height="1.5" rx="0.5" fill="#ccc"/>
      {/* Education */}
      <rect x="42" y="70" width="35" height="3" rx="0.5" fill={acc} opacity="0.7"/>
      <rect x="42" y="75" width="60" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="42" y="79" width="45" height="2" rx="0.5" fill="#777" opacity="0.6"/>
    </svg>
  );
}

/** 5. Timeline — vertical timeline bar with dot markers on left */
function ThumbTimeline({ t }: { t: Template }) {
  const c = t.primaryColor;
  const acc = t.accentColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Header bar - diagonal accent */}
      <rect width="120" height="28" fill={c}/>
      <polygon points="0,28 40,28 60,0 0,0" fill={c} opacity="0.15"/>
      <rect x="10" y="7" width="65" height="7" rx="1" fill="rgba(255,255,255,0.95)"/>
      <rect x="10" y="17" width="45" height="3" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      {/* Contact icons row */}
      <circle cx="10" cy="37" r="3" fill={acc} opacity="0.7"/>
      <rect x="16" y="35.5" width="25" height="2.5" rx="0.5" fill="#888" opacity="0.6"/>
      <circle cx="50" cy="37" r="3" fill={acc} opacity="0.7"/>
      <rect x="56" y="35.5" width="22" height="2.5" rx="0.5" fill="#888" opacity="0.6"/>
      {/* Timeline vertical line */}
      <line x1="18" y1="47" x2="18" y2="145" stroke={acc} strokeWidth="1.5" opacity="0.35"/>
      {/* Section: Experience */}
      <rect x="8" y="44" width="40" height="3" rx="0.5" fill={c} opacity="0.85"/>
      {/* Timeline item 1 */}
      <circle cx="18" cy="55" r="3" fill={c}/>
      <rect x="26" y="52" width="50" height="2.5" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="26" y="56" width="36" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="26" y="60" width="82" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="26" y="63" width="78" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="26" y="66" width="70" height="1.5" rx="0.5" fill="#ccc"/>
      {/* Timeline item 2 */}
      <circle cx="18" cy="76" r="3" fill={c} opacity="0.7"/>
      <rect x="26" y="73" width="45" height="2.5" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="26" y="77" width="32" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="26" y="81" width="82" height="1.5" rx="0.5" fill="#ccc"/>
      <rect x="26" y="84" width="74" height="1.5" rx="0.5" fill="#ccc"/>
      {/* Section: Education */}
      <rect x="8" y="92" width="35" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <circle cx="18" cy="103" r="3" fill={c} opacity="0.7"/>
      <rect x="26" y="100" width="60" height="2.5" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="26" y="104" width="42" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      {/* Skills as horizontal chips */}
      <rect x="8" y="112" width="28" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <rect x="8" y="118" width="20" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="31" y="118" width="22" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="56" y="118" width="18" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
      <rect x="77" y="118" width="24" height="5" rx="2.5" fill={c} opacity="0.15" stroke={c} strokeWidth="0.5"/>
    </svg>
  );
}

/** 6. Minimal Lines — white space, thin rules, left-aligned, dot bullets */
function ThumbMinimal({ t }: { t: Template }) {
  const c = t.accentColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Very thin top accent bar */}
      <rect width="120" height="3" fill={c}/>
      {/* Name — large, left-aligned, dark */}
      <rect x="8" y="10" width="78" height="8" rx="1" fill="#111" opacity="0.9"/>
      {/* Headline */}
      <rect x="8" y="21" width="52" height="3" rx="0.5" fill="#666" opacity="0.6"/>
      {/* Contact — inline with dots */}
      <rect x="8" y="27" width="18" height="2" rx="0.5" fill="#aaa" opacity="0.7"/>
      <circle cx="29" cy="28" r="1" fill="#ccc"/>
      <rect x="32" y="27" width="18" height="2" rx="0.5" fill="#aaa" opacity="0.7"/>
      <circle cx="53" cy="28" r="1" fill="#ccc"/>
      <rect x="56" y="27" width="22" height="2" rx="0.5" fill="#aaa" opacity="0.7"/>
      {/* Thin rule */}
      <rect x="8" y="32" width="104" height="0.7" fill="#e5e7eb"/>
      {/* Section: Experience — thin accent underline */}
      <rect x="8" y="37" width="42" height="2.5" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="40" width="42" height="0.7" fill={c} opacity="0.6"/>
      {/* Job entries with dot bullets */}
      <rect x="8" y="45" width="55" height="2" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="8" y="49" width="38" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <circle cx="10" cy="53.5" r="1.2" fill={c} opacity="0.6"/>
      <rect x="14" y="52" width="95" height="1.5" rx="0.5" fill="#ddd"/>
      <circle cx="10" cy="56.5" r="1.2" fill={c} opacity="0.6"/>
      <rect x="14" y="55" width="88" height="1.5" rx="0.5" fill="#ddd"/>
      <circle cx="10" cy="59.5" r="1.2" fill={c} opacity="0.6"/>
      <rect x="14" y="58" width="92" height="1.5" rx="0.5" fill="#ddd"/>
      <rect x="8" y="64" width="48" height="2" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="8" y="68" width="35" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
      <circle cx="10" cy="72.5" r="1.2" fill={c} opacity="0.6"/>
      <rect x="14" y="71" width="90" height="1.5" rx="0.5" fill="#ddd"/>
      <circle cx="10" cy="75.5" r="1.2" fill={c} opacity="0.6"/>
      <rect x="14" y="74" width="84" height="1.5" rx="0.5" fill="#ddd"/>
      {/* Section: Skills */}
      <rect x="8" y="81" width="28" height="2.5" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="84" width="28" height="0.7" fill={c} opacity="0.6"/>
      {/* Skill pills — soft, outlined */}
      <rect x="8" y="88" width="22" height="5" rx="2.5" fill="#f9fafb" stroke={c} strokeWidth="0.7"/>
      <rect x="33" y="88" width="28" height="5" rx="2.5" fill="#f9fafb" stroke={c} strokeWidth="0.7"/>
      <rect x="64" y="88" width="20" height="5" rx="2.5" fill="#f9fafb" stroke={c} strokeWidth="0.7"/>
      <rect x="8" y="96" width="18" height="5" rx="2.5" fill="#f9fafb" stroke={c} strokeWidth="0.7"/>
      <rect x="29" y="96" width="26" height="5" rx="2.5" fill="#f9fafb" stroke={c} strokeWidth="0.7"/>
      {/* Section: Education */}
      <rect x="8" y="106" width="35" height="2.5" rx="0.5" fill="#111" opacity="0.85"/>
      <rect x="8" y="109" width="35" height="0.7" fill={c} opacity="0.6"/>
      <rect x="8" y="113" width="62" height="2" rx="0.5" fill="#222" opacity="0.85"/>
      <rect x="8" y="117" width="45" height="1.5" rx="0.5" fill="#888" opacity="0.6"/>
    </svg>
  );
}

/** 7. Infographic — right sidebar with skill bars, icon contacts, colored left strip */
function ThumbInfographic({ t }: { t: Template }) {
  const c = t.primaryColor;
  const acc = t.accentColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Left color strip */}
      <rect width="5" height="160" fill={c}/>
      {/* Right sidebar */}
      <rect x="78" y="0" width="42" height="160" fill={c} opacity="0.07"/>
      <rect x="78" y="0" width="0.8" height="160" fill={c} opacity="0.25"/>
      {/* Header */}
      <rect x="8" y="8" width="65" height="8" rx="1" fill="#111" opacity="0.9"/>
      <rect x="8" y="19" width="48" height="3" rx="0.5" fill={acc} opacity="0.7"/>
      {/* Contact with icon dots */}
      <circle cx="10" cy="27" r="2" fill={acc} opacity="0.6"/>
      <rect x="15" y="25.5" width="30" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <circle cx="10" cy="32" r="2" fill={acc} opacity="0.6"/>
      <rect x="15" y="30.5" width="35" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <circle cx="10" cy="37" r="2" fill={acc} opacity="0.6"/>
      <rect x="15" y="35.5" width="28" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      {/* Main section */}
      <rect x="8" y="44" width="104" height="0.7" fill="#e5e7eb"/>
      <rect x="8" y="47" width="42" height="3" rx="0.5" fill={c} opacity="0.85"/>
      <rect x="8" y="52" width="55" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="8" y="56" width="38" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="60" width="65" height="1.5" rx="0.5" fill="#ddd"/>
      <rect x="8" y="63" width="60" height="1.5" rx="0.5" fill="#ddd"/>
      <rect x="8" y="66" width="55" height="1.5" rx="0.5" fill="#ddd"/>
      <rect x="8" y="72" width="48" height="2.5" rx="0.5" fill="#222" opacity="0.8"/>
      <rect x="8" y="76" width="35" height="2" rx="0.5" fill="#888" opacity="0.6"/>
      <rect x="8" y="80" width="62" height="1.5" rx="0.5" fill="#ddd"/>
      <rect x="8" y="83" width="58" height="1.5" rx="0.5" fill="#ddd"/>
      {/* Right sidebar content */}
      <rect x="82" y="8" width="34" height="3" rx="0.5" fill={acc} opacity="0.7"/>
      {/* Skill bars */}
      {[14, 21, 28, 35, 42].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="82" y={y + 4} width="34" height="1.5" rx="0.5" fill="#888" opacity="0.5"/>
          <rect x="82" y={y + 7} width="34" height="2.5" rx="1" fill={c} opacity="0.12"/>
          <rect x="82" y={y + 7} width={[28, 22, 30, 18, 25][i]} height="2.5" rx="1" fill={acc} opacity="0.65"/>
        </React.Fragment>
      ))}
      {/* Language rings in sidebar */}
      <rect x="82" y="62" width="34" height="3" rx="0.5" fill={acc} opacity="0.7"/>
      <circle cx="92" cy="77" r="8" fill="none" stroke={c} strokeWidth="2" opacity="0.2"/>
      <circle cx="92" cy="77" r="8" fill="none" stroke={acc} strokeWidth="2"
        strokeDasharray="40 50" strokeDashoffset="0" opacity="0.8"/>
      <circle cx="108" cy="77" r="8" fill="none" stroke={c} strokeWidth="2" opacity="0.2"/>
      <circle cx="108" cy="77" r="8" fill="none" stroke={acc} strokeWidth="2"
        strokeDasharray="30 50" strokeDashoffset="0" opacity="0.8"/>
    </svg>
  );
}

/** 8. Harvard/Academic — crimson rules, centered layout, traditional */
function ThumbHarvard({ t }: { t: Template }) {
  const c = t.primaryColor;
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Centered name - large */}
      <rect x="18" y="8" width="84" height="8" rx="1" fill="#111" opacity="0.9"/>
      {/* Crimson top rule */}
      <rect x="8" y="18" width="104" height="2" fill={c} opacity="0.85"/>
      {/* Contact centered */}
      <rect x="14" y="23" width="22" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="40" y="23" width="18" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="62" y="23" width="22" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="88" y="23" width="22" height="2" rx="0.5" fill="#666" opacity="0.6"/>
      {/* Crimson bottom rule */}
      <rect x="8" y="28" width="104" height="1.5" fill={c} opacity="0.6"/>
      {/* EDUCATION section */}
      <rect x="8" y="34" width="50" height="3" rx="0.5" fill="#111" opacity="0.9"/>
      <rect x="8" y="39" width="104" height="0.7" fill="#888" opacity="0.4"/>
      <rect x="8" y="42" width="70" height="2.5" rx="0.5" fill="#111" opacity="0.8"/>
      <rect x="82" y="42" width="28" height="2.5" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="8" y="46" width="48" height="2" rx="0.5" fill="#666" opacity="0.55"/>
      <rect x="8" y="50" width="55" height="2" rx="0.5" fill="#888" opacity="0.45"/>
      {/* EXPERIENCE */}
      <rect x="8" y="57" width="52" height="3" rx="0.5" fill="#111" opacity="0.9"/>
      <rect x="8" y="62" width="104" height="0.7" fill="#888" opacity="0.4"/>
      <rect x="8" y="65" width="58" height="2.5" rx="0.5" fill="#111" opacity="0.8"/>
      <rect x="80" y="65" width="30" height="2.5" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="8" y="69" width="44" height="2" rx="0.5" fill="#666" opacity="0.55"/>
      <rect x="12" y="73" width="98" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="12" y="76" width="92" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="12" y="79" width="86" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="85" width="52" height="2.5" rx="0.5" fill="#111" opacity="0.8"/>
      <rect x="80" y="85" width="30" height="2.5" rx="0.5" fill="#666" opacity="0.6"/>
      <rect x="12" y="90" width="96" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="12" y="93" width="88" height="1.5" rx="0.5" fill="#bbb"/>
      {/* SKILLS */}
      <rect x="8" y="100" width="32" height="3" rx="0.5" fill="#111" opacity="0.9"/>
      <rect x="8" y="105" width="104" height="0.7" fill="#888" opacity="0.4"/>
      <rect x="8" y="108" width="104" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="111" width="96" height="1.5" rx="0.5" fill="#bbb"/>
    </svg>
  );
}

/** 9. ATS Ultra-Safe — pure text, zero decoration, simple hierarchy */
function ThumbATS() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff"/>
      {/* Name */}
      <rect x="8" y="8" width="65" height="6" rx="0.5" fill="#111" opacity="0.9"/>
      {/* Contact plain text */}
      <rect x="8" y="17" width="100" height="2" rx="0.5" fill="#555" opacity="0.6"/>
      <rect x="8" y="21" width="80" height="2" rx="0.5" fill="#555" opacity="0.5"/>
      {/* Simple rule */}
      <rect x="8" y="26" width="104" height="1" fill="#888" opacity="0.4"/>
      {/* Section — all caps simple */}
      <rect x="8" y="30" width="50" height="2.5" rx="0.5" fill="#333" opacity="0.9"/>
      <rect x="8" y="35" width="104" height="0.6" fill="#888" opacity="0.35"/>
      <rect x="8" y="38" width="58" height="2" rx="0.5" fill="#444" opacity="0.85"/>
      <rect x="8" y="42" width="40" height="1.5" rx="0.5" fill="#777" opacity="0.7"/>
      <rect x="10" y="46" width="96" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="49" width="92" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="52" width="86" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="55" width="80" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="61" width="52" height="2" rx="0.5" fill="#444" opacity="0.85"/>
      <rect x="8" y="65" width="38" height="1.5" rx="0.5" fill="#777" opacity="0.7"/>
      <rect x="10" y="69" width="94" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="72" width="88" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="75" width="84" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="81" width="45" height="2.5" rx="0.5" fill="#333" opacity="0.9"/>
      <rect x="8" y="86" width="104" height="0.6" fill="#888" opacity="0.35"/>
      <rect x="8" y="90" width="55" height="2" rx="0.5" fill="#444" opacity="0.85"/>
      <rect x="8" y="94" width="42" height="1.5" rx="0.5" fill="#777" opacity="0.7"/>
      <rect x="10" y="98" width="90" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="10" y="101" width="84" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="108" width="30" height="2.5" rx="0.5" fill="#333" opacity="0.9"/>
      <rect x="8" y="113" width="104" height="0.6" fill="#888" opacity="0.35"/>
      <rect x="8" y="117" width="104" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="120" width="96" height="1.5" rx="0.5" fill="#bbb"/>
      <rect x="8" y="123" width="88" height="1.5" rx="0.5" fill="#bbb"/>
    </svg>
  );
}

/* Map template id → thumbnail component */
const THUMB_MAP: Record<string, (t: Template) => React.ReactNode> = {
  'latex':        () => <ThumbLatex />,
  'classic':      (t) => <ThumbClassic t={t} />,
  'modern-header':(t) => <ThumbModernHeader t={t} />,
  'sidebar-dark': (t) => <ThumbDarkSidebar t={t} />,
  'timeline':     (t) => <ThumbTimeline t={t} />,
  'minimal-line': (t) => <ThumbMinimal t={t} />,
  'infographic':  (t) => <ThumbInfographic t={t} />,
  'harvard':      (t) => <ThumbHarvard t={t} />,
  'ats-clean':    () => <ThumbATS />,
};

/* Category/badge metadata */
const BADGES: Record<string, { label: string; color: string }> = {
  'latex':         { label: 'LaTeX · ATS-Safe',    color: '#6366f1' },
  'classic':       { label: 'Single Column · Serif',color: '#b45309' },
  'modern-header': { label: 'Modern · Color Header', color: '#1d4ed8' },
  'sidebar-dark':  { label: 'Two-Column · Dark Side',color: '#0f172a' },
  'timeline':      { label: 'Timeline · Unique',    color: '#7c3aed' },
  'minimal-line':  { label: 'Minimal · White Space', color: '#059669' },
  'infographic':   { label: 'Infographic · Creative',color: '#0f4c5c' },
  'harvard':       { label: 'Academic · Harvard',   color: '#A41034' },
  'ats-clean':     { label: 'ATS Safe · Plain Text', color: '#374151' },
};

interface Props { onClose: () => void; }

export default function TemplateModal({ onClose }: Props) {
  const { getActiveResume, updateTemplate } = useResumeStore();
  const resume = getActiveResume();
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const current = resume?.templateId ?? 'classic';

  const handleSelect = (id: string) => {
    updateTemplate(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: '920px', maxWidth: '95vw', maxHeight: '88vh',
          background: isDark ? '#1a1a2e' : '#f9fafb',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}` }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: isDark ? '#f1f5f9' : '#111827' }}>
              Choose Template
            </h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
              9 professionally designed layouts — each with a unique structure
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: isDark ? '#94a3b8' : '#6b7280', background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}>
            <FiX size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map(t => {
              const isActive  = t.id === current;
              const isHov     = hovered === t.id;
              const badge     = BADGES[t.id] ?? { label: 'Professional', color: '#374151' };
              const thumbFn   = THUMB_MAP[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative flex flex-col rounded-xl overflow-hidden text-left transition-all"
                  style={{
                    border: isActive ? `2.5px solid #10b981` : `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                    background: isDark ? '#0f172a' : '#fff',
                    transform: isHov ? 'translateY(-3px)' : 'none',
                    boxShadow: isActive ? '0 0 0 3px rgba(16,185,129,0.25)' : isHov ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                      <FiCheck size={13} className="text-white" />
                    </div>
                  )}
                  {/* Thumbnail */}
                  <div className="w-full aspect-[3/4] overflow-hidden"
                    style={{ background: isDark ? '#1e293b' : '#f8fafc' }}>
                    {thumbFn ? thumbFn(t) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {t.name}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    {/* Template name — always visible, prominent */}
                    <p className="text-sm font-bold leading-tight mb-1"
                      style={{ color: isDark ? '#f1f5f9' : '#111827' }}>
                      {t.name}
                    </p>
                    {/* Category badge */}
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1.5"
                      style={{ background: `${badge.color}18`, color: badge.color }}>
                      {badge.label}
                    </span>
                    {/* Description */}
                    <p className="text-[10px] leading-relaxed line-clamp-2"
                      style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                      {t.description}
                    </p>
                  </div>
                  {/* Hover: select button */}
                  {isHov && !isActive && (
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-6"
                      style={{ background: 'linear-gradient(to top, rgba(16,185,129,0.12) 0%, transparent 100%)' }}>
                      <div className="w-full py-1.5 rounded-lg text-xs font-bold text-center text-emerald-600"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        Select Template
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="px-3 pb-3">
                      <div className="w-full py-1.5 rounded-lg text-xs font-bold text-center text-emerald-700"
                        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        ✓ Currently Active
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
