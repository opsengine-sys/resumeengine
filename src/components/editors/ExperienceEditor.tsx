import { useState } from 'react';
import { WorkExperience } from '../../types/resume';
import { FiPlus, FiTrash2, FiBriefcase, FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, StyledTextarea, MonthPicker, CheckboxField, ResetButton } from '../ui/SharedUI';
import { ContentRephraser } from '../ui/AITools';

interface Props {
  experience: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

function ExperienceItem({ exp, onUpdate, onDelete }: {
  exp: WorkExperience;
  onUpdate: (data: WorkExperience) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const up = (field: keyof WorkExperience, value: any) => onUpdate({ ...exp, [field]: value });

  const addBullet    = () => onUpdate({ ...exp, bullets: [...exp.bullets, { id: uuidv4(), text: '' }] });
  const updateBullet = (id: string, text: string) =>
    onUpdate({ ...exp, bullets: exp.bullets.map(b => b.id === id ? { ...b, text } : b) });
  const removeBullet = (id: string) =>
    onUpdate({ ...exp, bullets: exp.bullets.filter(b => b.id !== id) });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiBriefcase size={14} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{exp.jobTitle || 'Job Title'}</p>
          <p className="text-xs text-gray-500 truncate">{exp.company || 'Company'}{exp.currentlyWorking ? ' · Present' : ''}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Delete"
          >
            <FiTrash2 size={13} />
          </button>
          {expanded
            ? <FiChevronUp size={15} className="text-gray-400" />
            : <FiChevronDown size={15} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3.5 border-t border-gray-100">

          {/* Row 1: Job Title + Company */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job Title" required>
              <StyledInput value={exp.jobTitle} onChange={v => up('jobTitle', v)} placeholder="Senior Engineer" />
            </FormField>
            <FormField label="Company" required>
              <StyledInput value={exp.company} onChange={v => up('company', v)} placeholder="Company Name" />
            </FormField>
          </div>

          {/* Row 2: Location */}
          <FormField label="Location">
            <StyledInput value={exp.location} onChange={v => up('location', v)} placeholder="City, State" icon={<FiMapPin size={13} />} />
          </FormField>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date">
              <MonthPicker value={exp.startDate} onChange={v => up('startDate', v)} placeholder="Start date" />
            </FormField>
            <FormField label="End Date">
              <MonthPicker
                value={exp.endDate}
                onChange={v => up('endDate', v)}
                placeholder={exp.currentlyWorking ? 'Present' : 'End date'}
                disabled={exp.currentlyWorking}
              />
            </FormField>
          </div>

          {/* Currently working toggle */}
          <CheckboxField
            checked={exp.currentlyWorking}
            onChange={v => up('currentlyWorking', v)}
            label="I currently work here"
          />

          {/* Description */}
          <FormField label="Description">
            <StyledTextarea
              value={exp.description}
              onChange={v => up('description', v)}
              placeholder="Brief overview of your role and responsibilities…"
              rows={2}
            />
          </FormField>

          {/* Bullet Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Key Achievements</label>
              <ResetButton onClick={() => onUpdate({ ...exp, bullets: [] })} label="Clear bullets" />
            </div>
            {exp.bullets.map((bullet, idx) => (
              <div key={bullet.id} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
                  <input
                    value={bullet.text}
                    onChange={e => updateBullet(bullet.id, e.target.value)}
                    placeholder={`Achievement ${idx + 1} — quantify where possible`}
                    className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none
                      focus:ring-2 focus:ring-emerald-500 bg-white placeholder-gray-300"
                  />
                  <button
                    onClick={() => removeBullet(bullet.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
                {bullet.text.trim().length > 10 && (
                  <div className="pl-5">
                    <ContentRephraser
                      text={bullet.text}
                      label="Rephrase"
                      onApply={text => updateBullet(bullet.id, text)}
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addBullet}
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
            >
              <FiPlus size={14} /> Add Achievement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceEditor({ experience, onChange }: Props) {
  const addExp = () => onChange([...experience, {
    id: uuidv4(), jobTitle: '', company: '', location: '',
    startDate: '', endDate: '', currentlyWorking: false, description: '', bullets: [],
  }]);

  return (
    <div className="space-y-3">
      {experience.map(exp => (
        <ExperienceItem
          key={exp.id}
          exp={exp}
          onUpdate={updated => onChange(experience.map(e => e.id === exp.id ? updated : e))}
          onDelete={() => onChange(experience.filter(e => e.id !== exp.id))}
        />
      ))}
      <button
        onClick={addExp}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Work Experience
      </button>
    </div>
  );
}
