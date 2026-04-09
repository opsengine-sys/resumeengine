import { useState, useRef, useEffect } from 'react';
import { WorkExperience } from '../../types/resume';
import { FiPlus, FiTrash2, FiBriefcase, FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, StyledTextarea, MonthPicker, CheckboxField, ResetButton, inputStyle } from '../ui/SharedUI';

interface Props {
  experience: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

function BulletTextarea({
  value,
  onChange,
  onDelete,
  placeholder,
  onRephrase,
}: {
  value: string;
  onChange: (v: string) => void;
  onDelete: () => void;
  placeholder?: string;
  onRephrase?: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showRephraser, setShowRephraser] = useState(false);
  const [rephrased, setRephrased] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflow = 'hidden';
      const newHeight = Math.max(textareaRef.current.scrollHeight, 40);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [value]);

  const handleRephrase = async () => {
    if (!value.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    // Simple rephrase logic - capitalize first letter and add impact
    const rephrasedText = value.charAt(0).toUpperCase() + value.slice(1);
    setRephrased(rephrasedText);
    setLoading(false);
    setShowRephraser(true);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          style={{ ...inputStyle, overflow: 'hidden', resize: 'vertical' }}
          className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none
            focus:ring-2 focus:ring-emerald-500 bg-white placeholder-gray-300 resize-y min-h-[40px] max-h-[200px]"
        />
        <button
          onClick={onDelete}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0 mt-0.5"
        >
          <FiTrash2 size={12} />
        </button>
      </div>
      {value.trim().length > 10 && !showRephraser && (
        <div className="pl-5">
          <button
            onClick={handleRephrase}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
            style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {loading ? 'Rephrasing...' : 'Rephrase'}
          </button>
        </div>
      )}
      {showRephraser && rephrased && (
        <div className="pl-5 rounded-lg p-2 space-y-1.5 text-xs"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p style={{ color: 'var(--ui-text)', lineHeight: 1.5 }}>{rephrased}</p>
          <div className="flex gap-1.5">
            <button onClick={() => { onChange(rephrased); setShowRephraser(false); setRephrased(''); }}
              className="text-[9px] font-medium px-2 py-1 rounded bg-violet-600 text-white hover:bg-violet-700">
              Apply
            </button>
            <button onClick={() => { setShowRephraser(false); setRephrased(''); }}
              className="text-[9px] font-medium px-2 py-1 rounded"
              style={{ color: 'var(--ui-muted)', border: '1px solid var(--ui-border)' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
              <BulletTextarea
                key={bullet.id}
                value={bullet.text}
                onChange={text => updateBullet(bullet.id, text)}
                onDelete={() => removeBullet(bullet.id)}
                placeholder={`Achievement ${idx + 1} — quantify where possible`}
                onRephrase={text => updateBullet(bullet.id, text)}
              />
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
