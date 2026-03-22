import { Resume } from '../../types/resume';
import { TEMPLATES, DEFAULT_TYPOGRAPHY } from '../../data/defaultData';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import TwoColumnTemplate from './templates/TwoColumnTemplate';
import LaTeXTemplate from './templates/LaTeXTemplate';

interface Props {
  resume:     Resume;
  scale?:     number;
  forExport?: boolean;
  pageWidth?: number;
}

export default function ResumePreview({ resume, forExport = false, pageWidth = 794 }: Props) {
  const template = TEMPLATES.find(t => t.id === resume.templateId) || TEMPLATES[0];
  const typo = resume.typography ?? DEFAULT_TYPOGRAPHY;
  const visibleSections = resume.sections.filter(s => s.visible);

  const renderTemplate = () => {
    if (resume.templateId === 'latex') {
      return <LaTeXTemplate resume={resume} template={template} visibleSections={visibleSections} />;
    }
    if (template.layout === 'two-column') {
      return <TwoColumnTemplate resume={resume} template={template} visibleSections={visibleSections} />;
    }
    if (template.layout === 'single') {
      return <ClassicTemplate resume={resume} template={template} visibleSections={visibleSections} />;
    }
    return <ModernTemplate resume={resume} template={template} visibleSections={visibleSections} />;
  };

if (forExport) {
    return (
      <div
        id="resume-preview-export"
        style={{
          width: '794px',
          fontFamily: typo.fontFamily,
          backgroundColor: '#ffffff',
          padding: '18px 20px',
        }}
      >
        {renderTemplate()}
      </div>
    );
  }

  return (
    <div
      style={{
        width:           `${pageWidth}px`,
        fontFamily:      typo.fontFamily,
        backgroundColor: '#ffffff',
        padding:         '18px 20px',
      }}
    >
      {renderTemplate()}
    </div>
  );
}