import React, { useRef } from 'react';
import { PersonalInfo } from '../../types/resume';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe, FiGithub, FiCamera, FiX } from 'react-icons/fi';
import { FormField, StyledInput, LinkDisplay, ResetButton } from '../ui/SharedUI';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const BLANK: PersonalInfo = {
  firstName: '', lastName: '', headline: '',
  email: '', phone: '', location: '',
  linkedIn: '', portfolio: '', github: '', photo: '',
};

export default function PersonalInfoEditor({ data, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const up = (field: keyof PersonalInfo) => (value: string) => onChange({ ...data, [field]: value });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ ...data, photo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Details</h3>
        <ResetButton onClick={() => onChange({ ...BLANK })} label="Reset all" />
      </div>

      {/* Photo Upload */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100
            flex items-center justify-center border-2 border-white shadow-md">
            {data.photo
              ? <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
              : <FiUser className="text-emerald-400" size={30} />}
          </div>
          {data.photo && (
            <button
              onClick={() => onChange({ ...data, photo: '' })}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
            >
              <FiX size={10} />
            </button>
          )}
        </div>
        <div className="space-y-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium
              hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FiCamera size={14} />
            {data.photo ? 'Change Photo' : 'Upload Photo'}
          </button>
          <p className="text-xs text-gray-400">JPG, PNG · max 2 MB</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" required>
          <StyledInput value={data.firstName} onChange={up('firstName')} placeholder="Alex" icon={<FiUser size={14} />} />
        </FormField>
        <FormField label="Last Name">
          <StyledInput value={data.lastName} onChange={up('lastName')} placeholder="Johnson" />
        </FormField>
      </div>

      <FormField label="Professional Headline">
        <StyledInput value={data.headline} onChange={up('headline')} placeholder="Senior Software Engineer" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Email" required>
          <StyledInput value={data.email} onChange={up('email')} placeholder="alex@email.com" icon={<FiMail size={14} />} type="email" />
        </FormField>
        <FormField label="Phone">
          <StyledInput value={data.phone} onChange={up('phone')} placeholder="+1 (555) 000-0000" icon={<FiPhone size={14} />} />
        </FormField>
      </div>

      <FormField label="Location">
        <StyledInput value={data.location} onChange={up('location')} placeholder="San Francisco, CA" icon={<FiMapPin size={14} />} />
      </FormField>

      {/* URL fields with live hyperlink preview */}
      <FormField label="LinkedIn URL">
        <StyledInput value={data.linkedIn} onChange={up('linkedIn')} placeholder="linkedin.com/in/username" icon={<FiLinkedin size={14} />} />
        <LinkDisplay url={data.linkedIn} />
      </FormField>

      <FormField label="Portfolio URL">
        <StyledInput value={data.portfolio} onChange={up('portfolio')} placeholder="yourwebsite.com" icon={<FiGlobe size={14} />} />
        <LinkDisplay url={data.portfolio} />
      </FormField>

      <FormField label="GitHub URL">
        <StyledInput value={data.github} onChange={up('github')} placeholder="github.com/username" icon={<FiGithub size={14} />} />
        <LinkDisplay url={data.github} />
      </FormField>
    </div>
  );
}
