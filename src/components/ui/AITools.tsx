/**
 * AITools.tsx — Smart writing tools
 * • Skills Extractor from Work Experience
 * • Professional Summary Generator
 * • Content Rephraser
 * These run fully client-side using smart templates & NLP-lite patterns.
 */

import { useState } from 'react';
import { WorkExperience, Skill } from '../../types/resume';
import { FiZap, FiRefreshCw, FiCheck, FiX, FiCopy, FiLoader } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

/* ── Simulated async delay ───────────────────────────────────────── */
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/* ─────────────────────────────────────────────────────────────────
   SKILLS EXTRACTOR
   Analyzes experience text for known technical/soft/tool keywords
────────────────────────────────────────────────────────────────── */
const TECH_KEYWORDS = [
  'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby','Swift','Kotlin','Scala','R','MATLAB',
  'React','Vue','Angular','Svelte','Next.js','Nuxt','Gatsby','Node.js','Express','Django','Flask','FastAPI','Spring Boot','Laravel',
  'GraphQL','REST','API','gRPC','WebSocket',
  'PostgreSQL','MySQL','MongoDB','Redis','SQLite','DynamoDB','Cassandra','Elasticsearch','Firebase',
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','Ansible','Jenkins','GitHub Actions','CI/CD',
  'Git','Linux','Bash','Shell','PowerShell',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','scikit-learn','NLP','Computer Vision','LLM',
  'HTML','CSS','SCSS','Tailwind','Bootstrap','Figma','Adobe XD','Webpack','Vite','Babel',
  'Agile','Scrum','Kanban','JIRA','Confluence','Notion',
];

const SOFT_KEYWORDS = [
  'Leadership','Communication','Problem-solving','Teamwork','Collaboration','Mentoring','Coaching',
  'Project Management','Time Management','Critical Thinking','Analytical','Creativity','Innovation',
  'Presentation','Negotiation','Stakeholder Management','Cross-functional','Strategic Planning',
  'Decision Making','Adaptability','Attention to Detail','Prioritization',
];

const TOOL_KEYWORDS = [
  'VS Code','IntelliJ','Eclipse','Xcode','Android Studio','Postman','Insomnia',
  'Slack','Teams','Zoom','Trello','Asana','Linear','Monday.com',
  'Tableau','Power BI','Looker','Google Analytics','Mixpanel','Amplitude',
  'Salesforce','HubSpot','Zendesk','Shopify',
  'Excel','Google Sheets','PowerPoint','Word','Notion',
  'GitHub','GitLab','Bitbucket','Jira','Confluence',
];

function extractSkillsFromText(text: string): { name: string; category: Skill['category'] }[] {
  const found: { name: string; category: Skill['category'] }[] = [];
  const lower = text.toLowerCase();

  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) found.push({ name: kw, category: 'Technical' });
  }
  for (const kw of SOFT_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) found.push({ name: kw, category: 'Soft' });
  }
  for (const kw of TOOL_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) found.push({ name: kw, category: 'Tools' });
  }
  // Deduplicate by name
  const seen = new Set<string>();
  return found.filter(s => { const k = s.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

interface SkillsExtractorProps {
  experience: WorkExperience[];
  existingSkills: Skill[];
  onAddSkills: (skills: Skill[]) => void;
  summary?: string;
  certifications?: { name: string; organization: string }[];
  achievements?: { title: string; description: string }[];
  publications?: { title: string; description?: string }[];
}

export function SkillsExtractor({
  experience, existingSkills, onAddSkills,
  summary = '', certifications = [], achievements = [], publications = [],
}: SkillsExtractorProps) {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<{ name: string; category: Skill['category']; selected: boolean; source: string }[]>([]);
  const [done, setDone] = useState(false);
  const [noResults, setNoResults] = useState(false);

  /* Check which sections have content */
  const hasExperience = experience.length > 0;
  const hasSummary = summary.trim().length > 20;
  const hasCerts = certifications.length > 0;
  const hasContent = hasExperience || hasSummary || hasCerts;

  /* Missing sections hint */
  const missingSections: string[] = [];
  if (!hasExperience) missingSections.push('Work Experience');
  if (!hasSummary)    missingSections.push('Summary');
  if (!hasCerts)      missingSections.push('Certifications');

  const run = async () => {
    setLoading(true);
    setDone(false);
    setNoResults(false);
    await delay(900);

    const textParts: string[] = [];
    // Experience
    if (hasExperience) {
      textParts.push(...experience.map(e =>
        [e.jobTitle, e.company, e.description, ...e.bullets.map(b => b.text)].join(' ')
      ));
    }
    // Summary
    if (hasSummary) textParts.push(summary);
    // Certifications
    if (hasCerts) textParts.push(...certifications.map(c => `${c.name} ${c.organization}`));
    // Achievements
    if (achievements.length > 0) textParts.push(...achievements.map(a => `${a.title} ${a.description}`));
    // Publications
    if (publications.length > 0) textParts.push(...publications.map(p => `${p.title} ${p.description ?? ''}`));

    const allText = textParts.join(' ');
    const found = extractSkillsFromText(allText);
    const existingNames = new Set(existingSkills.map(s => s.name.toLowerCase()));
    const newOnes = found.filter(s => !existingNames.has(s.name.toLowerCase()));

    if (newOnes.length === 0) setNoResults(true);
    setExtracted(newOnes.map(s => ({ ...s, selected: true, source: 'auto' })));
    setLoading(false);
  };

  const toggleSelect = (i: number) =>
    setExtracted(prev => prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s));

  const addSelected = () => {
    const toAdd: Skill[] = extracted
      .filter(s => s.selected)
      .map(s => ({ id: uuidv4(), name: s.name, category: s.category, level: 'Intermediate' as const }));
    onAddSkills(toAdd);
    setDone(true);
    setExtracted([]);
  };

  const CAT_COLOR: Record<string, { pill: string; label: string }> = {
    Technical: { pill: 'rgba(59,130,246,0.12)', label: '#3b82f6' },
    Soft:      { pill: 'rgba(245,158,11,0.12)', label: '#d97706' },
    Tools:     { pill: 'rgba(139,92,246,0.12)', label: '#7c3aed' },
    Other:     { pill: 'rgba(107,114,128,0.12)', label: '#6b7280' },
  };

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <FiZap size={13} style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--ui-text)' }}>Skills Extractor</p>
            <p className="text-[10px]" style={{ color: 'var(--ui-muted)' }}>
              Scans {[hasExperience && 'Experience', hasSummary && 'Summary', hasCerts && 'Certifications'].filter(Boolean).join(', ') || 'your resume'} for skills
            </p>
          </div>
        </div>
        <button onClick={run} disabled={loading || !hasContent}
          className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          style={{ background: '#10b981' }}
          onMouseEnter={e => { if (!loading && hasContent) e.currentTarget.style.background = '#059669'; }}
          onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
        >
          {loading ? <FiLoader size={11} className="animate-spin" /> : <FiZap size={11} />}
          {loading ? 'Scanning…' : 'Extract'}
        </button>
      </div>

      {/* Missing sections hint */}
      {missingSections.length > 0 && missingSections.length < 3 && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[10px]"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }}>
          <FiZap size={10} className="mt-0.5 flex-shrink-0" />
          <span>
            Fill in <strong>{missingSections.join(', ')}</strong> for better skill detection.
          </span>
        </div>
      )}
      {!hasContent && (
        <div className="text-center py-2">
          <p className="text-xs" style={{ color: 'var(--ui-muted)' }}>
            Add Work Experience, Summary, or Certifications first to enable skill extraction.
          </p>
        </div>
      )}

      {noResults && (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
          style={{ background: 'var(--ui-card2)', color: 'var(--ui-muted)' }}>
          <FiCheck size={12} /> No new skills found — your existing skills may already cover them.
        </div>
      )}

      {done && !noResults && extracted.length === 0 && (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
          <FiCheck size={12} /> Skills added to your profile!
        </div>
      )}

      {extracted.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ui-muted)' }}>
            Found {extracted.length} new skills — tap to toggle:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {extracted.map((s, i) => {
              const c = CAT_COLOR[s.category] ?? CAT_COLOR['Other'];
              return (
                <button key={s.name} onClick={() => toggleSelect(i)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all"
                  style={s.selected
                    ? { background: c.pill, color: c.label, borderColor: c.label, opacity: 1 }
                    : { background: 'var(--ui-card2)', color: 'var(--ui-muted)', borderColor: 'var(--ui-border2)', opacity: 0.5, textDecoration: 'line-through' }
                  }
                >
                  {s.selected && <FiCheck size={9} />}
                  {s.name}
                  <span className="text-[9px] opacity-60">({s.category.slice(0,4)})</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={addSelected}
              className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ background: '#10b981' }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
              onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
            >
              <FiCheck size={11} /> Add {extracted.filter(s => s.selected).length} Skills
            </button>
            <button onClick={() => setExtracted([])}
              className="text-xs transition-colors"
              style={{ color: 'var(--ui-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ui-muted)'}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUMMARY GENERATOR
   Generates a professional summary from resume data
────────────────────────────────────────────────────────────────── */
const OPENERS = [
  'Results-driven', 'Dynamic', 'Experienced', 'Passionate', 'Strategic',
  'Innovative', 'Accomplished', 'Detail-oriented', 'Highly motivated', 'Dedicated',
];

const CLOSERS = [
  'committed to delivering high-quality solutions.',
  'passionate about driving meaningful impact.',
  'eager to bring expertise to a forward-thinking team.',
  'focused on continuous learning and professional growth.',
  'dedicated to exceeding expectations and achieving results.',
  'known for a collaborative approach and strong attention to detail.',
];

interface SummaryGeneratorProps {
  firstName: string;
  lastName: string;
  headline: string;
  experience: WorkExperience[];
  skills: Skill[];
  onApply: (summary: string) => void;
}

export function SummaryGenerator({ firstName, headline, experience, skills, onApply }: SummaryGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    await delay(1100);

    const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
    const closer = CLOSERS[Math.floor(Math.random() * CLOSERS.length)];
    const name = firstName || 'professional';
    const role = headline || (experience[0]?.jobTitle ?? 'professional');

    // Years of experience
    const years = experience.reduce((acc, e) => {
      if (e.startDate) {
        const start = new Date(e.startDate + '-01');
        const end = e.currentlyWorking ? new Date() : (e.endDate ? new Date(e.endDate + '-01') : new Date());
        acc += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      }
      return acc;
    }, 0);
    const yearsStr = years >= 1 ? `${Math.round(years)}+ years of` : 'hands-on';

    // Top skills
    const topTech = skills.filter(s => s.category === 'Technical').slice(0, 3).map(s => s.name);
    const topSkillsStr = topTech.length > 0
      ? ` with expertise in ${topTech.join(', ')}`
      : '';

    // Companies
    const companies = experience.slice(0, 2).map(e => e.company).filter(Boolean);
    const companyStr = companies.length > 0
      ? ` Previously contributed to ${companies.join(' and ')}.`
      : '';

    // Key achievements
    const bullets = experience.flatMap(e => e.bullets.map(b => b.text)).filter(Boolean);
    const achievement = bullets[0] ? ` ${bullets[0].charAt(0).toUpperCase() + bullets[0].slice(1)}.` : '';

    const summary =
      `${opener} ${role} with ${yearsStr} experience${topSkillsStr}.` +
      `${companyStr}${achievement} ${name ? `${name} is ` : ''}${closer}`;

    setGenerated(summary);
    setLoading(false);
  };

  const regenerate = async () => {
    setGenerated('');
    await generate();
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FiZap size={13} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-900">Summary Generator</p>
            <p className="text-[10px] text-indigo-600">Auto-generate from your resume data</p>
          </div>
        </div>
        <button
          onClick={generated ? regenerate : generate}
          disabled={loading}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold
            px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading
            ? <FiLoader size={11} className="animate-spin" />
            : generated ? <FiRefreshCw size={11} /> : <FiZap size={11} />}
          {loading ? 'Generating…' : generated ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {generated && (
        <div className="space-y-2">
          <div className="bg-white border border-indigo-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
            {generated}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onApply(generated); setGenerated(''); }}
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold
                px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiCheck size={11} /> Apply to Resume
            </button>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700
                px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {copied ? <FiCheck size={11} className="text-green-500" /> : <FiCopy size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setGenerated('')}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CONTENT REPHRASER
   Rephrases text using power-word substitutions and action verbs
────────────────────────────────────────────────────────────────── */
const ACTION_VERBS = [
  ['managed','Spearheaded'],['led','Orchestrated'],['worked','Collaborated'],
  ['helped','Facilitated'],['made','Engineered'],['built','Architected'],
  ['created','Developed'],['used','Leveraged'],['improved','Enhanced'],
  ['increased','Amplified'],['reduced','Optimized'],['handled','Administered'],
  ['did','Executed'],['got','Acquired'],['gave','Delivered'],
  ['fixed','Resolved'],['wrote','Authored'],['ran','Directed'],
  ['set up','Established'],['started','Initiated'],['showed','Demonstrated'],
  ['found','Identified'],['changed','Transformed'],['helped develop','Pioneered'],
  ['was responsible for','Owned'],['in charge of','Oversaw'],
  ['played a role in','Contributed to'],['worked on','Executed'],
];

const FILLER_PHRASES = [
  [/\bvarious\b/gi,'diverse'],
  [/\ba lot of\b/gi,'significant'],
  [/\bgood\b/gi,'strong'],
  [/\bvery\b/gi,'highly'],
  [/\bbasically\b/gi,''],
  [/\bactually\b/gi,''],
  [/\bjust\b/gi,''],
  [/\bkind of\b/gi,''],
  [/\bsort of\b/gi,''],
  [/\bresponsible for doing\b/gi,'responsible for'],
];

function rephraseText(text: string): string {
  let out = text;

  // Apply filler replacements
  for (const [pattern, replacement] of FILLER_PHRASES) {
    out = out.replace(pattern as RegExp, replacement as string);
  }

  // Apply action verb upgrades (case-insensitive, word boundary)
  for (const [from, to] of ACTION_VERBS) {
    const pattern = new RegExp(`\\b${from}\\b`, 'gi');
    out = out.replace(pattern, (match) => {
      return match[0] === match[0].toUpperCase() ? to : to.toLowerCase();
    });
  }

  // Add quantifiers hint if none exist
  if (!/\d/.test(out) && out.length > 30) {
    out = out.trim().replace(/\.$/, '') + ', achieving measurable results.';
  }

  // Clean up double spaces
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

interface RephraserProps {
  text: string;
  label?: string;
  onApply: (text: string) => void;
}

export function ContentRephraser({ text, label = 'Rephrase', onApply }: RephraserProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [show, setShow] = useState(false);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setShow(true);
    await delay(700);
    setResult(rephraseText(text));
    setLoading(false);
  };

  if (!show) {
    return (
      <button
        onClick={run}
        title="Rephrase with power words"
        className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800
          font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-violet-50 border border-transparent hover:border-violet-100"
      >
        <FiZap size={9} />
        {label}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1">
          <FiZap size={10} /> Rephrased Version
        </p>
        <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
          <FiX size={12} />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <FiLoader size={12} className="animate-spin text-violet-500" />
          <span className="text-xs text-violet-600">Rephrasing…</span>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-700 leading-relaxed bg-white rounded-lg px-3 py-2 border border-violet-100">
            {result}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onApply(result); setShow(false); }}
              className="flex items-center gap-1 bg-violet-600 text-white text-[11px] font-bold
                px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <FiCheck size={10} /> Apply
            </button>
            <button
              onClick={run}
              className="flex items-center gap-1 text-[11px] text-violet-600 font-semibold
                hover:text-violet-800 transition-colors"
            >
              <FiRefreshCw size={10} /> Try Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
