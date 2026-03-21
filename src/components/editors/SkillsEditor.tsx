import { useState, useEffect } from 'react';
import { Skill, WorkExperience } from '../../types/resume';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, StyledSelect, ResetButton } from '../ui/SharedUI';
import { SkillsExtractor } from '../ui/AITools';

interface Props {
  skills: Skill[];
  experience: WorkExperience[];
  onChange: (skills: Skill[]) => void;
  summary?: string;
  certifications?: { id: string; name: string; organization: string }[];
  achievements?: { id: string; title: string; description: string }[];
  publications?: { id: string; title: string; description?: string }[];
}

const CATEGORIES = ['Technical', 'Soft', 'Tools', 'Other'] as const;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

/* Light mode colors */
const LEVEL_LIGHT: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: '#f1f5f9', color: '#64748b' },
  Intermediate: { bg: '#dbeafe', color: '#1d4ed8' },
  Advanced:     { bg: '#ede9fe', color: '#6d28d9' },
  Expert:       { bg: '#d1fae5', color: '#065f46' },
};
/* Dark mode colors */
const LEVEL_DARK: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: 'rgba(100,116,139,0.22)', color: '#94a3b8' },
  Intermediate: { bg: 'rgba(59,130,246,0.22)',  color: '#93c5fd' },
  Advanced:     { bg: 'rgba(139,92,246,0.22)',   color: '#c4b5fd' },
  Expert:       { bg: 'rgba(16,185,129,0.22)',   color: '#6ee7b7' },
};

const CAT_LIGHT: Record<string, { bg: string; text: string; dot: string }> = {
  Technical: { bg: '#eff6ff',   text: '#1d4ed8', dot: '#3b82f6' },
  Soft:      { bg: '#fffbeb',   text: '#b45309', dot: '#f59e0b' },
  Tools:     { bg: '#f5f3ff',   text: '#6d28d9', dot: '#8b5cf6' },
  Other:     { bg: '#f8fafc',   text: '#475569', dot: '#94a3b8' },
};
const CAT_DARK: Record<string, { bg: string; text: string; dot: string }> = {
  Technical: { bg: 'rgba(59,130,246,0.10)',  text: '#93c5fd', dot: '#3b82f6' },
  Soft:      { bg: 'rgba(245,158,11,0.10)',  text: '#fcd34d', dot: '#f59e0b' },
  Tools:     { bg: 'rgba(139,92,246,0.10)',  text: '#c4b5fd', dot: '#8b5cf6' },
  Other:     { bg: 'rgba(100,116,139,0.10)', text: '#94a3b8', dot: '#64748b' },
};

export default function SkillsEditor({ skills, experience, onChange, summary = '', certifications = [], achievements = [], publications = [] }: Props) {
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Technical' as Skill['category'],
    level: 'Intermediate' as Skill['level'],
  });

  /* Reactively track dark mode */
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    onChange([...skills, { id: uuidv4(), ...newSkill }]);
    setNewSkill({ name: '', category: newSkill.category, level: newSkill.level });
  };

  const removeSkill = (id: string) => onChange(skills.filter(s => s.id !== id));
  const updateSkill = (id: string, field: keyof Skill, value: string) =>
    onChange(skills.map(s => s.id === id ? { ...s, [field]: value } : s));

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-4">

      {/* AI Skills Extractor */}
      <SkillsExtractor
        experience={experience}
        existingSkills={skills}
        onAddSkills={newSkills => onChange([...skills, ...newSkills])}
        summary={summary}
        certifications={certifications}
        achievements={achievements}
        publications={publications}
      />

      {/* Add Skill Form */}
      <div className="rounded-xl p-4 border space-y-3"
        style={{ background: 'var(--ui-card2)', borderColor: 'var(--ui-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ui-muted)' }}>Add New Skill</p>
          <ResetButton onClick={() => onChange([])} label="Clear all" />
        </div>
        <FormField label="Skill Name">
          <StyledInput
            value={newSkill.name}
            onChange={v => setNewSkill(p => ({ ...p, name: v }))}
            placeholder="e.g. React, Leadership, Docker"
            icon={<FiTag size={13} />}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Category">
            <StyledSelect
              value={newSkill.category}
              onChange={v => setNewSkill(p => ({ ...p, category: v as Skill['category'] }))}
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
            />
          </FormField>
          <FormField label="Level">
            <StyledSelect
              value={newSkill.level ?? 'Intermediate'}
              onChange={v => setNewSkill(p => ({ ...p, level: v as Skill['level'] }))}
              options={LEVELS.map(l => ({ label: l, value: l }))}
            />
          </FormField>
        </div>
        <button
          onClick={addSkill}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium
            hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <FiPlus size={16} /> Add Skill
        </button>
      </div>

      {/* Grouped skill chips */}
      {CATEGORIES.map(cat => {
        const catSkills = grouped[cat];
        if (!catSkills.length) return null;
        const style = dark ? CAT_DARK[cat] : CAT_LIGHT[cat];
        return (
          <div key={cat} className="rounded-xl p-3"
            style={{ background: style.bg }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: style.text }}>{cat}</p>
              </div>
              <ResetButton
                onClick={() => onChange(skills.filter(s => s.category !== cat))}
                label={`Clear ${cat}`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {catSkills.map(skill => {
                const lvl = skill.level ?? 'Intermediate';
                const lc = dark ? LEVEL_DARK[lvl] : LEVEL_LIGHT[lvl];
                return (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 shadow-sm transition-all"
                    style={{
                      background: 'var(--ui-card)',
                      border: '1px solid var(--ui-border2)',
                    }}
                  >
                    <input
                      value={skill.name}
                      onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                      className="text-xs font-medium focus:outline-none bg-transparent w-20 min-w-0"
                      style={{ color: 'var(--ui-text)' }}
                    />
                    {/* Level badge — colored pill, click cycles through levels */}
                    <button
                      onClick={() => {
                        const idx = LEVELS.indexOf(lvl as typeof LEVELS[number]);
                        const next = LEVELS[(idx + 1) % LEVELS.length];
                        updateSkill(skill.id, 'level', next);
                      }}
                      title="Click to change level"
                      className="text-[10px] rounded-full px-2 py-0.5 font-bold border-0 cursor-pointer transition-all hover:opacity-80 whitespace-nowrap flex-shrink-0"
                      style={{ background: lc.bg, color: lc.color }}
                    >
                      {lvl}
                    </button>
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="ml-0.5 transition-colors p-0.5 rounded-full hover:text-red-500"
                      style={{ color: 'var(--ui-muted)' }}
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--ui-muted)' }}>
          <FiTag size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No skills added yet</p>
          <p className="text-xs opacity-70">Use the extractor or form above to add skills</p>
        </div>
      )}
    </div>
  );
}
