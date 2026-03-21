import { useState } from 'react';
import { Education } from '../../types/resume';
import { FiPlus, FiTrash2, FiBook, FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, MonthPicker } from '../ui/SharedUI';

interface Props {
  education: Education[];
  onChange: (data: Education[]) => void;
}

function EducationItem({ edu, onUpdate, onDelete }: {
  edu: Education; onUpdate: (d: Education) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const up = (field: keyof Education, value: string) => onUpdate({ ...edu, [field]: value });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiBook size={14} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {edu.degree || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
          </p>
          <p className="text-xs text-gray-500 truncate">{edu.institution || 'Institution'}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <FiTrash2 size={13} />
          </button>
          {expanded ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3.5 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Degree" required>
              <StyledInput value={edu.degree} onChange={v => up('degree', v)} placeholder="Bachelor of Science" />
            </FormField>
            <FormField label="Field of Study">
              <StyledInput value={edu.fieldOfStudy} onChange={v => up('fieldOfStudy', v)} placeholder="Computer Science" />
            </FormField>
          </div>

          <FormField label="Institution">
            <StyledInput value={edu.institution} onChange={v => up('institution', v)} placeholder="University Name" />
          </FormField>

          <FormField label="Location">
            <StyledInput value={edu.location} onChange={v => up('location', v)} placeholder="City, State" icon={<FiMapPin size={13} />} />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Start Date">
              <MonthPicker value={edu.startDate} onChange={v => up('startDate', v)} placeholder="Start" />
            </FormField>
            <FormField label="End Date">
              <MonthPicker value={edu.endDate} onChange={v => up('endDate', v)} placeholder="End" />
            </FormField>
            <FormField label="GPA" hint="Optional">
              <StyledInput value={edu.gpa || ''} onChange={v => up('gpa', v)} placeholder="3.8" />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EducationEditor({ education, onChange }: Props) {
  const addEdu = () => onChange([...education, {
    id: uuidv4(), degree: '', fieldOfStudy: '', institution: '',
    location: '', startDate: '', endDate: '', gpa: '',
  }]);

  return (
    <div className="space-y-3">
      {education.map(edu => (
        <EducationItem
          key={edu.id}
          edu={edu}
          onUpdate={updated => onChange(education.map(e => e.id === edu.id ? updated : e))}
          onDelete={() => onChange(education.filter(e => e.id !== edu.id))}
        />
      ))}
      <button
        onClick={addEdu}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-amber-300 hover:text-amber-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Education
      </button>
    </div>
  );
}
