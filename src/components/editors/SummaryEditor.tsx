import { useResumeStore } from '../../store/resumeStore';
import { SummaryGenerator, ContentRephraser } from '../ui/AITools';
import { ResetButton } from '../ui/SharedUI';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SummaryEditor({ value, onChange }: Props) {
  const { getActiveResume } = useResumeStore();
  const resume = getActiveResume();
  const data = resume?.data;

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="space-y-4">

      {/* AI Summary Generator */}
      {data && (
        <SummaryGenerator
          firstName={data.personal.firstName}
          lastName={data.personal.lastName}
          headline={data.personal.headline}
          experience={data.experience}
          skills={data.skills}
          onApply={onChange}
        />
      )}

      {/* Manual editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Professional Summary
          </label>
          <div className="flex items-center gap-1">
            <ContentRephraser
              text={value}
              label="Rephrase"
              onApply={onChange}
            />
            <ResetButton onClick={() => onChange('')} label="Clear" />
          </div>
        </div>
        <div className="relative">
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={6}
            placeholder="Write a compelling professional summary that highlights your key skills, experience, and career goals. Aim for 3–4 sentences that make a strong first impression…"
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 bg-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              transition-all placeholder-gray-300 resize-none leading-relaxed"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{wordCount} words · {charCount} characters</span>
          <span className={`font-medium ${wordCount > 80 ? 'text-amber-500' : wordCount > 40 ? 'text-emerald-500' : 'text-gray-400'}`}>
            {wordCount < 20 ? 'Too short' : wordCount > 80 ? 'Too long' : '✓ Good length'}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <p className="text-xs text-blue-700 font-semibold mb-1.5">💡 Pro Tips</p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Start with your years of experience and primary expertise</li>
          <li>• Include 2–3 key technical skills or domain areas</li>
          <li>• End with your career goal or value proposition</li>
          <li>• Keep it between 40–80 words for best ATS results</li>
        </ul>
      </div>
    </div>
  );
}
