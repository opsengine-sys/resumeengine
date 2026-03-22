import React from 'react';
import { Resume, Template, SectionConfig, TypographySettings, TextLevel, ElementStyle } from '../../../types/resume';
import { DEFAULT_TYPOGRAPHY, DEFAULT_LEVEL_STYLES } from '../../../data/defaultData';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe, FiGithub } from 'react-icons/fi';

function toHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1] ?? ''} ${year}`;
}

function applyStyle(
  base: React.CSSProperties,
  level: TextLevel,
  levelStyles: Record<TextLevel, ElementStyle>,
  globalFont: string,
): React.CSSProperties {
  const s = levelStyles[level] ?? DEFAULT_LEVEL_STYLES[level];
  const r: React.CSSProperties = {
    ...base,
    fontFamily: s.fontFamily ?? globalFont,
    fontWeight: s.fontWeight === 'bold' ? 700 : s.fontWeight === 'light' ? 300 : (base.fontWeight ?? 400),
    fontStyle: s.isItalic ? 'italic' : (base.fontStyle ?? 'normal'),
    textTransform: (s.letterCase === 'normal' || !s.letterCase
      ? (base.textTransform ?? 'none')
      : s.letterCase) as React.CSSProperties['textTransform'],
  };
  if (s.fontSize !== undefined) r.fontSize = `${s.fontSize}px`;
  return r;
}

export default function TwoColumnTemplate({ resume, template, visibleSections }: Props) {
  const { data } = resume;
  const { primaryColor, textColor } = template;
  const typo: TypographySettings = resume.typography ?? DEFAULT_TYPOGRAPHY;
  const clr = resume.colors ?? { textColor: '#1f2937', headingColor: '#111827', linkColor: '#2563eb', mutedColor: '#6b7280', showBorder: false, borderColor: '#e5e7eb', showPageNumbers: false };
  const lvl: Record<TextLevel, ElementStyle> = { ...DEFAULT_LEVEL_STYLES, ...(typo.levelStyles ?? {}) };
  const globalFont = typo.fontFamily;
  const p = data.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const bs = typo.baseFontSize;

  const leftKeys  = ['skills', 'languages', 'certifications', 'achievements', 'volunteer', 'publications', 'references'];
  const rightKeys = ['summary', 'experience', 'education', 'projects'];

  const leftVisible  = visibleSections.filter(s => leftKeys.includes(s.key));
  const rightVisible = visibleSections.filter(s => rightKeys.includes(s.key) || s.isCustom);

  function SidebarSection({ title }: { title: string }) {
    const s = lvl['sectionTitle'] ?? DEFAULT_LEVEL_STYLES['sectionTitle'];
    const fs = s.fontSize ?? (bs - 1);
    return (
      <div style={{ marginBottom: '4px', marginTop: `${typo.sectionSpacing * 0.8}px` }}>
        <h2 style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: `${fs}px`,
          fontFamily: s.fontFamily ?? globalFont,
          fontWeight: 700,
          fontStyle: s.isItalic ? 'italic' : 'normal',
          textTransform: (s.letterCase === 'normal' || !s.letterCase ? 'uppercase' : s.letterCase) as React.CSSProperties['textTransform'],
          letterSpacing: '2px',
          paddingBottom: '3px',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
    );
  }

  function MainSection({ title }: { title: string }) {
    const s = lvl['sectionTitle'] ?? DEFAULT_LEVEL_STYLES['sectionTitle'];
    const fs = s.fontSize ?? (bs + 1);
    return (
      <div style={{ marginBottom: '6px', marginTop: `${typo.sectionSpacing}px` }}>
        <h2 style={{
          color: primaryColor,
          fontSize: `${fs}px`,
          fontFamily: s.fontFamily ?? globalFont,
          fontWeight: 700,
          fontStyle: s.isItalic ? 'italic' : 'normal',
          textTransform: (s.letterCase === 'normal' || !s.letterCase ? 'uppercase' : s.letterCase) as React.CSSProperties['textTransform'],
          letterSpacing: '2px',
          margin: 0,
        }}>{title}</h2>
        <div style={{ backgroundColor: primaryColor, height: '1.5px', width: '100%', marginTop: '3px' }} />
      </div>
    );
  }

  const renderSidebar = (section: SectionConfig) => {
    const key = section.key;
    switch (key) {
      case 'skills':
        if (!data.skills.length) return null;
        return (
          <div key={key}>
            <SidebarSection title="Skills" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px`, marginTop: '6px' }}>
              {['Technical', 'Tools', 'Soft'].map(cat => {
                const skills = data.skills.filter(s => s.category === cat);
                if (!skills.length) return null;
                return (
                  <div key={cat}>
                    <p style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {skills.map(s => (
                        <span key={s.id} style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: `${bs - 2}px`, padding: '1px 6px', borderRadius: '3px' }}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'languages':
        if (!data.languages.length) return null;
        return (
          <div key={key}>
            <SidebarSection title="Languages" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px`, marginTop: '6px' }}>
              {data.languages.map(lang => (
                <div key={lang.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: `${bs}px`, color: 'white', fontWeight: 500 }}>{lang.name}</span>
                    <span style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.55)' }}>{lang.proficiency}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {[1, 2, 3, 4, 5].map(i => {
                      const levels = ['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native'];
                      const li = levels.indexOf(lang.proficiency);
                      return <div key={i} style={{ backgroundColor: i <= li + 1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)', height: '4px', flex: 1, borderRadius: '2px' }} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!data.certifications.length) return null;
        return (
          <div key={key}>
            <SidebarSection title="Certifications" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px`, marginTop: '6px' }}>
              {data.certifications.map(c => (
                <div key={c.id}>
                  <p style={{ fontSize: `${bs}px`, color: 'white', fontWeight: 600, lineHeight: 1.3 }}>{c.name}</p>
                  <p style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.55)' }}>{c.organization}</p>
                  {c.issueDate && <p style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.4)' }}>{formatDate(c.issueDate)}</p>}
                  {c.credentialUrl && (
                    <a href={toHref(c.credentialUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.65)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      Verify ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!data.achievements.length) return null;
        return (
          <div key={key}>
            <SidebarSection title="Achievements" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px`, marginTop: '6px' }}>
              {data.achievements.map(a => (
                <div key={a.id}>
                  <p style={{ fontSize: `${bs}px`, color: 'white', fontWeight: 600 }}>{a.title}</p>
                  {a.organization && <p style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.55)' }}>{a.organization}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteer':
        if (!data.volunteer.length) return null;
        return (
          <div key={key}>
            <SidebarSection title="Volunteer" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px`, marginTop: '6px' }}>
              {data.volunteer.map(v => (
                <div key={v.id}>
                  <p style={{ fontSize: `${bs}px`, color: 'white', fontWeight: 600 }}>{v.role}</p>
                  <p style={{ fontSize: `${bs - 2}px`, color: 'rgba(255,255,255,0.55)' }}>{v.organization}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  const renderMain = (section: SectionConfig) => {
    const key = section.key;

    if (section.isCustom) {
      if (!section.customEntries || section.customEntries.length === 0) return null;
      return (
        <div key={key} style={{ marginBottom: `${typo.sectionSpacing * 0.5}px` }}>
          <MainSection title={section.label} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
            {section.customEntries.map(entry => (
              <div key={entry.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                {entry.fields.map(field => (
                  field.value ? (
                    <div key={field.id}>
                      <span style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, fontWeight: 700 }}>{field.label}: </span>
                      <span style={applyStyle({ fontSize: `${bs}px`, color: textColor }, 'bodyText', lvl, globalFont)}>
                        {field.type === 'date' ? formatDate(field.value) : field.value}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (key) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key={key} style={{ marginBottom: `${typo.sectionSpacing * 0.5}px` }}>
            <MainSection title="Professional Summary" />
            <p style={applyStyle({ color: textColor, fontSize: `${bs}px`, lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{data.summary}</p>
          </div>
        );

      case 'experience':
        if (!data.experience.length) return null;
        return (
          <div key={key} style={{ marginBottom: `${typo.sectionSpacing * 0.5}px` }}>
            <MainSection title="Work Experience" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
              {data.experience.map(exp => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1.5}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{exp.jobTitle}</h3>
                      <p style={applyStyle({ color: primaryColor, fontSize: `${bs + 0.5}px`, fontWeight: 600 }, 'companyName', lvl, globalFont)}>
                        {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                      </p>
                    </div>
                    <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>
                      {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={applyStyle({ fontSize: `${bs}px`, color: '#4b5563', marginTop: '3px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{exp.description}</p>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {exp.bullets.map(b => (
                        <li key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', ...applyStyle({ fontSize: `${bs}px`, color: '#374151', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont) }}>
                          <span style={{ color: primaryColor, marginTop: '2px', fontSize: `${bs - 3}px`, flexShrink: 0 }}>●</span>
                          {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!data.education.length) return null;
        return (
          <div key={key} style={{ marginBottom: `${typo.sectionSpacing * 0.5}px` }}>
            <MainSection title="Education" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
              {data.education.map(edu => (
                <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <p style={applyStyle({ color: primaryColor, fontSize: `${bs}px`, fontWeight: 600 }, 'institutionName', lvl, globalFont)}>
                      {edu.institution}{edu.location ? ` • ${edu.location}` : ''}
                    </p>
                    {edu.gpa && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>GPA: {edu.gpa}</p>}
                  </div>
                  <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!data.projects.length) return null;
        return (
          <div key={key} style={{ marginBottom: `${typo.sectionSpacing * 0.5}px` }}>
            <MainSection title="Projects" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
              {data.projects.map(proj => (
                <div key={proj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{proj.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {proj.projectUrl && (
                        <a href={toHref(proj.projectUrl)} target="_blank" rel="noopener noreferrer"
                          style={{ color: primaryColor, fontSize: `${bs - 1}px`, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          View ↗
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={toHref(proj.githubUrl)} target="_blank" rel="noopener noreferrer"
                          style={{ color: primaryColor, fontSize: `${bs - 1}px`, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.description && <p style={applyStyle({ fontSize: `${bs}px`, color: '#4b5563', marginTop: '2px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{proj.description}</p>}
                  {proj.technologies && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, marginTop: '2px', fontStyle: 'italic' }}>{proj.technologies}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{
      fontFamily: typo.fontFamily, color: textColor, backgroundColor: '#ffffff', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      border: clr.showBorder ? `1.5px solid ${clr.borderColor}` : 'none',
    }}>
      {/* Header */}
      <div style={{ backgroundColor: primaryColor, padding: `${typo.headerPaddingY}px ${typo.pagePaddingX}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {p.photo && (
            <img src={p.photo} alt={fullName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
          )}
          <div>
            <h1 style={applyStyle({ fontSize: `${typo.nameFontSize}px`, fontWeight: 700, color: 'white' }, 'candidateName', lvl, globalFont)}>
              {fullName || 'Your Name'}
            </h1>
            {p.headline && <p style={applyStyle({ fontSize: `${bs + 1}px`, color: 'rgba(255,255,255,0.75)', marginTop: '2px' }, 'headline', lvl, globalFont)}>{p.headline}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 16px', marginTop: '10px' }}>
          {p.email    && <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}><FiMail size={bs - 2} />{p.email}</a>}
          {p.phone    && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)' }}><FiPhone size={bs - 2} />{p.phone}</span>}
          {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)' }}><FiMapPin size={bs - 2} />{p.location}</span>}
          {p.linkedIn && <a href={toHref(p.linkedIn)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)', textDecoration: 'underline', textUnderlineOffset: '2px' }}><FiLinkedin size={bs - 2} />{p.linkedIn}</a>}
          {p.github   && <a href={toHref(p.github)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)', textDecoration: 'underline', textUnderlineOffset: '2px' }}><FiGithub size={bs - 2} />{p.github}</a>}
          {p.portfolio && <a href={toHref(p.portfolio)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${bs - 1}px`, color: 'rgba(255,255,255,0.88)', textDecoration: 'underline', textUnderlineOffset: '2px' }}><FiGlobe size={bs - 2} />{p.portfolio}</a>}
        </div>
      </div>

      {/* Two Column Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ backgroundColor: `${primaryColor}ee`, width: '190px', flexShrink: 0, padding: `${typo.pagePaddingY}px ${typo.pagePaddingX * 0.6}px` }}>
          {leftVisible.map(s => renderSidebar(s))}
        </div>
        <div style={{ flex: 1, padding: `${typo.pagePaddingY}px ${typo.pagePaddingX}px` }}>
          {rightVisible.map(s => renderMain(s))}
        </div>
      </div>
    </div>
  );
}