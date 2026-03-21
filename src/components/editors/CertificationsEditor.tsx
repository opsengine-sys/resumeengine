import { useState } from 'react';
import { Certification } from '../../types/resume';
import { FiPlus, FiTrash2, FiAward, FiChevronDown, FiChevronUp, FiLink } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, MonthPicker, LinkDisplay } from '../ui/SharedUI';

interface Props {
  certifications: Certification[];
  onChange: (data: Certification[]) => void;
}

function CertItem({ cert, onUpdate, onDelete }: {
  cert: Certification; onUpdate: (d: Certification) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const up = (field: keyof Certification, value: string) => onUpdate({ ...cert, [field]: value });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiAward size={14} className="text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{cert.name || 'Certification Name'}</p>
          <p className="text-xs text-gray-500 truncate">{cert.organization || 'Organization'}</p>
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
          <FormField label="Certification Name" required>
            <StyledInput value={cert.name} onChange={v => up('name', v)} placeholder="AWS Certified Solutions Architect" />
          </FormField>

          <FormField label="Issuing Organization">
            <StyledInput value={cert.organization} onChange={v => up('organization', v)} placeholder="Amazon Web Services" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Issue Date">
              <MonthPicker value={cert.issueDate} onChange={v => up('issueDate', v)} placeholder="Issue date" />
            </FormField>
            <FormField label="Expiry Date">
              <MonthPicker value={cert.expiryDate} onChange={v => up('expiryDate', v)} placeholder="Expiry date" />
            </FormField>
          </div>

          <FormField label="Credential URL">
            <StyledInput
              value={cert.credentialUrl}
              onChange={v => up('credentialUrl', v)}
              placeholder="credential.net/verify/abc123"
              icon={<FiLink size={13} />}
            />
            <LinkDisplay url={cert.credentialUrl} label="Verify Credential ↗" />
          </FormField>
        </div>
      )}
    </div>
  );
}

export default function CertificationsEditor({ certifications, onChange }: Props) {
  return (
    <div className="space-y-3">
      {certifications.map(c => (
        <CertItem
          key={c.id}
          cert={c}
          onUpdate={updated => onChange(certifications.map(x => x.id === c.id ? updated : x))}
          onDelete={() => onChange(certifications.filter(x => x.id !== c.id))}
        />
      ))}
      <button
        onClick={() => onChange([...certifications, {
          id: uuidv4(), name: '', organization: '', issueDate: '', expiryDate: '', credentialUrl: '',
        }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-rose-300 hover:text-rose-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Certification
      </button>
    </div>
  );
}
