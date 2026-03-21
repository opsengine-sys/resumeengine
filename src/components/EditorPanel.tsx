import { useEffect, useRef } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { useTheme } from '../context/ThemeContext';
import PersonalInfoEditor from './editors/PersonalInfoEditor';
import SummaryEditor from './editors/SummaryEditor';
import SkillsEditor from './editors/SkillsEditor';
import ExperienceEditor from './editors/ExperienceEditor';
import EducationEditor from './editors/EducationEditor';
import ProjectsEditor from './editors/ProjectsEditor';
import CertificationsEditor from './editors/CertificationsEditor';
import {
  AchievementsEditor, LanguagesEditor, VolunteerEditor,
  PublicationsEditor, ReferencesEditor,
} from './editors/OtherSectionsEditor';
import CustomSectionEditor from './editors/CustomSectionEditor';
import {
  FiUser, FiFileText, FiBriefcase, FiBook, FiStar, FiCode,
  FiAward, FiTrendingUp, FiGlobe, FiHeart, FiBookOpen, FiUsers,
  FiSave, FiCheck,
} from 'react-icons/fi';

const SECTION_META: Record<string, {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}> = {
  personal:       { title: 'Personal Information',     subtitle: 'Basic contact and profile details',           Icon: FiUser,        color: 'blue'   },
  summary:        { title: 'Professional Summary',     subtitle: 'A brief overview of your career',            Icon: FiFileText,    color: 'indigo' },
  experience:     { title: 'Work Experience',          subtitle: 'Your professional history',                  Icon: FiBriefcase,   color: 'violet' },
  education:      { title: 'Education',                subtitle: 'Academic background and degrees',            Icon: FiBook,        color: 'emerald'},
  skills:         { title: 'Skills',                   subtitle: 'Technical, soft and tool skills',            Icon: FiStar,        color: 'amber'  },
  projects:       { title: 'Projects',                 subtitle: 'Personal and professional projects',         Icon: FiCode,        color: 'cyan'   },
  certifications: { title: 'Certifications',           subtitle: 'Professional certifications',                Icon: FiAward,       color: 'rose'   },
  achievements:   { title: 'Achievements & Awards',    subtitle: 'Notable accomplishments and recognition',    Icon: FiTrendingUp,  color: 'orange' },
  languages:      { title: 'Languages',                subtitle: 'Languages and proficiency levels',           Icon: FiGlobe,       color: 'teal'   },
  volunteer:      { title: 'Volunteer Experience',     subtitle: 'Community and volunteer work',               Icon: FiHeart,       color: 'pink'   },
  publications:   { title: 'Publications',             subtitle: 'Papers, articles, and publications',        Icon: FiBookOpen,    color: 'slate'  },
  references:     { title: 'References',               subtitle: 'Professional references',                   Icon: FiUsers,       color: 'gray'   },
};

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100'   },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  border: 'border-indigo-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100'},
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100'  },
  cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    border: 'border-cyan-100'   },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-rose-100'   },
  orange:  { bg: 'bg-orange-50',  icon: 'text-orange-600',  border: 'border-orange-100' },
  teal:    { bg: 'bg-teal-50',    icon: 'text-teal-600',    border: 'border-teal-100'   },
  pink:    { bg: 'bg-pink-50',    icon: 'text-pink-600',    border: 'border-pink-100'   },
  slate:   { bg: 'bg-slate-50',   icon: 'text-slate-600',   border: 'border-slate-100'  },
  gray:    { bg: 'bg-gray-50',    icon: 'text-gray-600',    border: 'border-gray-100'   },
};

interface Props {
  onExport: () => void;
}

export default function EditorPanel({ onExport: _onExport }: Props) {
  const { isDark } = useTheme();
  const { activeSection, getActiveResume, updateResumeData, updateCustomSection, isSaving, triggerSave } = useResumeStore();
  const resume = getActiveResume();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const data = resume?.data;

  const handleChange = (updater: () => void) => {
    updater();
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => triggerSave(), 800);
  };

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const edBg   = isDark ? '#0d1526' : '#f8fafc';
  const hdrBg  = isDark ? '#0d1117' : '#ffffff';
  const hdrBdr = isDark ? '#21262d' : '#e5e7eb';
  const titleC = isDark ? '#e6edf3' : '#111827';
  const subtlC = isDark ? '#8b949e' : '#9ca3af';

  if (!resume || !data) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: edBg }}>
        <div className="text-center">
          <FiFileText size={40} className="mx-auto mb-3" style={{ color: subtlC }} />
          <p className="text-sm font-medium" style={{ color: subtlC }}>No resume selected</p>
        </div>
      </div>
    );
  }

  const customSec = resume.sections?.find(s => s.key === activeSection && s.isCustom);
  const meta  = SECTION_META[activeSection] ?? (customSec ? {
    title: customSec.label,
    subtitle: 'Custom section',
    Icon: FiFileText,
    color: 'gray',
  } : SECTION_META['personal']);
  const { Icon } = meta;
  const colors = COLOR_MAP[meta.color] ?? COLOR_MAP['gray'];

  const renderEditor = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalInfoEditor data={data.personal} onChange={d => handleChange(() => updateResumeData({ personal: d }))} />;
      case 'summary':
        return <SummaryEditor value={data.summary} onChange={v => handleChange(() => updateResumeData({ summary: v }))} />;
      case 'skills':
        return <SkillsEditor skills={data.skills} experience={data.experience} onChange={s => handleChange(() => updateResumeData({ skills: s }))} />;
      case 'experience':
        return <ExperienceEditor experience={data.experience} onChange={e => handleChange(() => updateResumeData({ experience: e }))} />;
      case 'education':
        return <EducationEditor education={data.education} onChange={e => handleChange(() => updateResumeData({ education: e }))} />;
      case 'projects':
        return <ProjectsEditor projects={data.projects} onChange={p => handleChange(() => updateResumeData({ projects: p }))} />;
      case 'certifications':
        return <CertificationsEditor certifications={data.certifications} onChange={c => handleChange(() => updateResumeData({ certifications: c }))} />;
      case 'achievements':
        return <AchievementsEditor achievements={data.achievements} onChange={a => handleChange(() => updateResumeData({ achievements: a }))} />;
      case 'languages':
        return <LanguagesEditor languages={data.languages} onChange={l => handleChange(() => updateResumeData({ languages: l }))} />;
      case 'volunteer':
        return <VolunteerEditor volunteer={data.volunteer} onChange={v => handleChange(() => updateResumeData({ volunteer: v }))} />;
      case 'publications':
        return <PublicationsEditor publications={data.publications} onChange={p => handleChange(() => updateResumeData({ publications: p }))} />;
      case 'references':
        return <ReferencesEditor references={data.references} onChange={r => handleChange(() => updateResumeData({ references: r }))} />;
      default: {
        // Custom section
        const customSection = resume.sections?.find(s => s.key === activeSection && s.isCustom);
        if (customSection) {
          return (
            <CustomSectionEditor
              section={customSection}
              onUpdate={updates => handleChange(() => updateCustomSection(activeSection, updates))}
            />
          );
        }
        return null;
      }
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: edBg }}>

      {/* ── Section header ────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ background: hdrBg, borderBottom: `1px solid ${hdrBdr}` }}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <Icon size={16} className={colors.icon} />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight" style={{ color: titleC }}>{meta.title}</h2>
            <p className="text-[11px]" style={{ color: subtlC }}>{meta.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium transition-all"
          style={{ color: isSaving ? '#3b82f6' : (isDark ? '#374151' : '#d1d5db') }}>
          {isSaving
            ? <><FiSave size={12} className="animate-pulse" /><span>Saving…</span></>
            : <><FiCheck size={12} /><span>Saved</span></>
          }
        </div>
      </div>

      {/* ── Editor content (scrollable) ───────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {renderEditor()}
      </div>
    </div>
  );
}
