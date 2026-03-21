import { useState } from 'react';
import { Achievement, Language, VolunteerExperience, Publication, Reference } from '../../types/resume';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiLink, FiMail, FiPhone } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, StyledTextarea, StyledSelect, MonthPicker, LinkDisplay } from '../ui/SharedUI';

// ─── ACHIEVEMENTS ──────────────────────────────────────────────────
interface AchievementsProps { achievements: Achievement[]; onChange: (d: Achievement[]) => void; }

export function AchievementsEditor({ achievements, onChange }: AchievementsProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (id: string) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const up = (id: string, field: keyof Achievement, value: string) =>
    onChange(achievements.map(a => a.id === id ? { ...a, [field]: value } : a));

  return (
    <div className="space-y-3">
      {achievements.map(a => (
        <div key={a.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => toggle(a.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{a.title || 'Achievement Title'}</p>
              <p className="text-xs text-gray-500">{a.organization}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onChange(achievements.filter(x => x.id !== a.id)); }}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <FiTrash2 size={13} />
            </button>
            {expanded.includes(a.id) ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
          </div>
          {expanded.includes(a.id) && (
            <div className="p-4 space-y-3.5 border-t border-gray-100">
              <FormField label="Award Title" required>
                <StyledInput value={a.title} onChange={v => up(a.id, 'title', v)} placeholder="Best Innovation Award" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Organization">
                  <StyledInput value={a.organization} onChange={v => up(a.id, 'organization', v)} placeholder="Company / Org" />
                </FormField>
                <FormField label="Date">
                  <MonthPicker value={a.date} onChange={v => up(a.id, 'date', v)} placeholder="Award date" />
                </FormField>
              </div>
              <FormField label="Description">
                <StyledTextarea value={a.description} onChange={v => up(a.id, 'description', v)} placeholder="Brief description…" rows={2} />
              </FormField>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...achievements, { id: uuidv4(), title: '', organization: '', date: '', description: '' }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-orange-300 hover:text-orange-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Achievement
      </button>
    </div>
  );
}

// ─── LANGUAGES ─────────────────────────────────────────────────────
interface LanguagesProps { languages: Language[]; onChange: (d: Language[]) => void; }
const PROFICIENCY = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] as const;
const PROF_COLORS: Record<string, string> = {
  Native: 'bg-emerald-100 text-emerald-700',
  Fluent: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-violet-100 text-violet-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Basic: 'bg-gray-100 text-gray-600',
};

export function LanguagesEditor({ languages, onChange }: LanguagesProps) {
  const [newLang, setNewLang] = useState({ name: '', proficiency: 'Fluent' as Language['proficiency'] });

  const addLang = () => {
    if (!newLang.name.trim()) return;
    onChange([...languages, { id: uuidv4(), ...newLang }]);
    setNewLang({ name: '', proficiency: 'Fluent' });
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Language">
            <StyledInput
              value={newLang.name}
              onChange={v => setNewLang(p => ({ ...p, name: v }))}
              placeholder="e.g. Spanish"
            />
          </FormField>
          <FormField label="Proficiency">
            <StyledSelect
              value={newLang.proficiency}
              onChange={v => setNewLang(p => ({ ...p, proficiency: v as Language['proficiency'] }))}
              options={PROFICIENCY.map(p => ({ label: p, value: p }))}
            />
          </FormField>
        </div>
        <button
          onClick={addLang}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium
            hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <FiPlus size={16} /> Add Language
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {languages.map(lang => (
          <div key={lang.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex-1 min-w-0">
              <input
                value={lang.name}
                onChange={e => onChange(languages.map(l => l.id === lang.id ? { ...l, name: e.target.value } : l))}
                className="text-sm font-semibold text-gray-800 focus:outline-none bg-transparent w-full"
                placeholder="Language"
              />
            </div>
            <span className={`text-xs rounded-full px-2.5 py-1 font-medium flex-shrink-0 ${PROF_COLORS[lang.proficiency] || 'bg-gray-100 text-gray-600'}`}>
              {lang.proficiency}
            </span>
            <select
              value={lang.proficiency}
              onChange={e => onChange(languages.map(l => l.id === lang.id ? { ...l, proficiency: e.target.value as Language['proficiency'] } : l))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
            >
              {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
            </select>
            <button
              onClick={() => onChange(languages.filter(l => l.id !== lang.id))}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOLUNTEER ─────────────────────────────────────────────────────
interface VolunteerProps { volunteer: VolunteerExperience[]; onChange: (d: VolunteerExperience[]) => void; }

export function VolunteerEditor({ volunteer, onChange }: VolunteerProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (id: string) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const up = (id: string, field: keyof VolunteerExperience, value: string) =>
    onChange(volunteer.map(v => v.id === id ? { ...v, [field]: value } : v));

  return (
    <div className="space-y-3">
      {volunteer.map(v => (
        <div key={v.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => toggle(v.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{v.role || 'Role'}</p>
              <p className="text-xs text-gray-500">{v.organization}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onChange(volunteer.filter(x => x.id !== v.id)); }}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <FiTrash2 size={13} />
            </button>
            {expanded.includes(v.id) ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
          </div>
          {expanded.includes(v.id) && (
            <div className="p-4 space-y-3.5 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Organization">
                  <StyledInput value={v.organization} onChange={val => up(v.id, 'organization', val)} placeholder="Org Name" />
                </FormField>
                <FormField label="Role">
                  <StyledInput value={v.role} onChange={val => up(v.id, 'role', val)} placeholder="Volunteer Role" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Date">
                  <MonthPicker value={v.startDate} onChange={val => up(v.id, 'startDate', val)} placeholder="Start" />
                </FormField>
                <FormField label="End Date">
                  <MonthPicker value={v.endDate} onChange={val => up(v.id, 'endDate', val)} placeholder="End" />
                </FormField>
              </div>
              <FormField label="Description">
                <StyledTextarea value={v.description} onChange={val => up(v.id, 'description', val)} placeholder="Description…" rows={2} />
              </FormField>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...volunteer, { id: uuidv4(), organization: '', role: '', startDate: '', endDate: '', description: '' }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-pink-300 hover:text-pink-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Volunteer Experience
      </button>
    </div>
  );
}

// ─── PUBLICATIONS ──────────────────────────────────────────────────
interface PublicationsProps { publications: Publication[]; onChange: (d: Publication[]) => void; }

export function PublicationsEditor({ publications, onChange }: PublicationsProps) {
  const up = (id: string, field: keyof Publication, value: string) =>
    onChange(publications.map(p => p.id === id ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-3">
      {publications.map(p => (
        <div key={p.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3.5 shadow-sm">
          <div className="flex justify-between items-start gap-2">
            <FormField label="Title" required>
              <StyledInput value={p.title} onChange={v => up(p.id, 'title', v)} placeholder="Publication Title" />
            </FormField>
            <button
              onClick={() => onChange(publications.filter(x => x.id !== p.id))}
              className="mt-6 p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg hover:bg-red-50"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Publisher / Journal">
              <StyledInput value={p.publisher} onChange={v => up(p.id, 'publisher', v)} placeholder="Nature, IEEE…" />
            </FormField>
            <FormField label="Date">
              <MonthPicker value={p.date} onChange={v => up(p.id, 'date', v)} placeholder="Publication date" />
            </FormField>
          </div>
          <FormField label="URL">
            <StyledInput value={p.url} onChange={v => up(p.id, 'url', v)} placeholder="doi.org/..." icon={<FiLink size={13} />} />
            <LinkDisplay url={p.url} label="Open Publication ↗" />
          </FormField>
        </div>
      ))}
      <button
        onClick={() => onChange([...publications, { id: uuidv4(), title: '', publisher: '', date: '', url: '', description: '' }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Publication
      </button>
    </div>
  );
}

// ─── REFERENCES ────────────────────────────────────────────────────
interface ReferencesProps { references: Reference[]; onChange: (d: Reference[]) => void; }

export function ReferencesEditor({ references, onChange }: ReferencesProps) {
  const up = (id: string, field: keyof Reference, value: string) =>
    onChange(references.map(r => r.id === id ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-3">
      {references.map(r => (
        <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3.5 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-semibold text-gray-700">{r.name || 'New Reference'}</p>
            <button
              onClick={() => onChange(references.filter(x => x.id !== r.id))}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required>
              <StyledInput value={r.name} onChange={v => up(r.id, 'name', v)} placeholder="Jane Smith" />
            </FormField>
            <FormField label="Job Title">
              <StyledInput value={r.title} onChange={v => up(r.id, 'title', v)} placeholder="Engineering Manager" />
            </FormField>
          </div>
          <FormField label="Company">
            <StyledInput value={r.company} onChange={v => up(r.id, 'company', v)} placeholder="Company Name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <StyledInput value={r.email} onChange={v => up(r.id, 'email', v)} placeholder="jane@email.com" icon={<FiMail size={13} />} type="email" />
            </FormField>
            <FormField label="Phone">
              <StyledInput value={r.phone} onChange={v => up(r.id, 'phone', v)} placeholder="+1 (555) 000-0000" icon={<FiPhone size={13} />} />
            </FormField>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...references, { id: uuidv4(), name: '', title: '', company: '', email: '', phone: '' }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-gray-400 hover:text-gray-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Reference
      </button>
    </div>
  );
}
