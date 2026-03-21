import React from 'react';
import { Resume, Template, SectionConfig, TypographySettings, TextLevel, ElementStyle } from '../../../types/resume';
import { DEFAULT_TYPOGRAPHY, DEFAULT_LEVEL_STYLES } from '../../../data/defaultData';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe, FiGithub } from 'react-icons/fi';

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

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

function toHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1] ?? ''} ${year}`;
}

function SectionTitle({ title, color, typo, lvl, globalFont }: {
  title: string; color: string; typo: TypographySettings;
  lvl: Record<TextLevel, ElementStyle>; globalFont: string;
}) {
  const s = lvl['sectionTitle'] ?? DEFAULT_LEVEL_STYLES['sectionTitle'];
  const fs = s.fontSize ?? (typo.headingFontSize);
  const fw = s.fontWeight === 'bold' ? 700 : s.fontWeight === 'light' ? 300 : 700;
  return (
    <div style={{ marginBottom: `${typo.sectionSpacing * 0.4}px`, marginTop: `${typo.sectionSpacing}px` }}>
      <h2 style={{
        color,
        fontSize: `${fs}px`,
        fontFamily: s.fontFamily ?? globalFont,
        fontWeight: fw,
        fontStyle: s.isItalic ? 'italic' : 'normal',
        textTransform: (s.letterCase === 'normal' || !s.letterCase ? 'uppercase' : s.letterCase) as React.CSSProperties['textTransform'],
        letterSpacing: '2.5px',
        margin: 0,
      }}>
        {title}
      </h2>
      <div style={{ backgroundColor: color, height: '1px', width: '100%', marginTop: '3px' }} />
    </div>
  );
}

export default function ClassicTemplate({ resume, template, visibleSections }: Props) {
  const { data } = resume;
  const { primaryColor, textColor } = template;
  const typo: TypographySettings = resume.typography ?? DEFAULT_TYPOGRAPHY;
  const clr = resume.colors ?? { textColor: '#1f2937', headingColor: '#111827', linkColor: '#2563eb', mutedColor: '#6b7280', showBorder: false, borderColor: '#e5e7eb', showPageNumbers: false };
  const lvl: Record<TextLevel, ElementStyle> = { ...DEFAULT_LEVEL_STYLES, ...(typo.levelStyles ?? {}) };
  const globalFont = typo.fontFamily;
  const p = data.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const bs = typo.baseFontSize;

  /* Custom section renderer */
  const renderCustomSection = (section: SectionConfig) => {
    if (!section.customEntries || section.customEntries.length === 0) return null;
    return (
      <>
        <SectionTitle title={section.label} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
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
      </>
    );
  };

  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <>
        <SectionTitle title="Professional Summary" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <p style={applyStyle({ color: textColor, fontSize: `${bs}px`, lineHeight: typo.lineHeight, fontStyle: 'italic' }, 'bodyText', lvl, globalFont)}>
          {data.summary}
        </p>
      </>
    ) : null,

    experience: () => data.experience.length > 0 ? (
      <>
        <SectionTitle title="Professional Experience" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 2}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{exp.jobTitle}</h3>
                <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor }, 'date', lvl, globalFont)}>
                  {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <p style={applyStyle({ color: primaryColor, fontSize: `${bs + 1}px`, fontWeight: 600, fontStyle: 'italic' }, 'companyName', lvl, globalFont)}>
                {exp.company}{exp.location ? `, ${exp.location}` : ''}
              </p>
              {exp.description && (
                <p style={applyStyle({ fontSize: `${bs}px`, color: '#4b5563', marginTop: '3px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{exp.description}</p>
              )}
              {exp.bullets.length > 0 && (
                <ul style={{ marginTop: '4px', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {exp.bullets.map(b => (
                    <li key={b.id} style={{ ...applyStyle({ fontSize: `${bs}px`, color: '#374151', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont), listStyleType: 'disc' }}>{b.text}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </>
    ) : null,

    education: () => data.education.length > 0 ? (
      <>
        <SectionTitle title="Education" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.education.map(edu => (
            <div key={edu.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 2}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </h3>
                <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor }, 'date', lvl, globalFont)}>
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={applyStyle({ color: primaryColor, fontSize: `${bs + 1}px`, fontWeight: 600, fontStyle: 'italic' }, 'institutionName', lvl, globalFont)}>
                {edu.institution}{edu.location ? `, ${edu.location}` : ''}
              </p>
              {edu.gpa && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </>
    ) : null,

    skills: () => data.skills.length > 0 ? (
      <>
        <SectionTitle title="Skills" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        {['Technical', 'Tools', 'Soft', 'Other'].map(cat => {
          const catSkills = data.skills.filter(s => s.category === cat);
          if (!catSkills.length) return null;
          return (
            <div key={cat} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <span style={{ color: primaryColor, fontSize: `${bs}px`, fontWeight: 700, minWidth: '64px' }}>{cat}:</span>
              <span style={applyStyle({ fontSize: `${bs}px`, color: '#374151' }, 'bodyText', lvl, globalFont)}>{catSkills.map(s => s.name).join(' • ')}</span>
            </div>
          );
        })}
      </>
    ) : null,

    projects: () => data.projects.length > 0 ? (
      <>
        <SectionTitle title="Projects" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.projects.map(proj => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 2}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{proj.title}</h3>
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
      </>
    ) : null,

    certifications: () => data.certifications.length > 0 ? (
      <>
        <SectionTitle title="Certifications" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.6}px` }}>
          {data.certifications.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{c.name}</span>
                <span style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, marginLeft: '8px' }}>— {c.organization}</span>
                {c.credentialUrl && (
                  <> · <a href={toHref(c.credentialUrl)} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: `${bs - 2}px`, color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    Verify ↗
                  </a></>
                )}
              </div>
              <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>{formatDate(c.issueDate)}</span>
            </div>
          ))}
        </div>
      </>
    ) : null,

    achievements: () => data.achievements.length > 0 ? (
      <>
        <SectionTitle title="Achievements & Awards" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.7}px` }}>
          {data.achievements.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{a.title}</span>
                {a.organization && <span style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, marginLeft: '8px' }}>— {a.organization}</span>}
                {a.description && <p style={applyStyle({ fontSize: `${bs - 1}px`, color: '#4b5563', marginTop: '2px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{a.description}</p>}
              </div>
              {a.date && <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>{formatDate(a.date)}</span>}
            </div>
          ))}
        </div>
      </>
    ) : null,

    languages: () => data.languages.length > 0 ? (
      <>
        <SectionTitle title="Languages" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {data.languages.map(lang => (
            <span key={lang.id} style={{ fontSize: `${bs + 1}px` }}>
              <strong style={applyStyle({ color: textColor }, 'jobTitle', lvl, globalFont)}>{lang.name}</strong>
              <span style={{ color: clr.mutedColor }}> ({lang.proficiency})</span>
            </span>
          ))}
        </div>
      </>
    ) : null,

    volunteer: () => data.volunteer.length > 0 ? (
      <>
        <SectionTitle title="Volunteer Experience" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.7}px` }}>
          {data.volunteer.map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{v.role} — {v.organization}</h3>
                <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor }, 'date', lvl, globalFont)}>
                  {formatDate(v.startDate)} – {formatDate(v.endDate)}
                </span>
              </div>
              {v.description && <p style={applyStyle({ fontSize: `${bs - 1}px`, color: '#4b5563', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{v.description}</p>}
            </div>
          ))}
        </div>
      </>
    ) : null,

    publications: () => data.publications.length > 0 ? (
      <>
        <SectionTitle title="Publications" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        {data.publications.map(pub => (
          <div key={pub.id} style={{ marginBottom: `${typo.itemSpacing * 0.6}px` }}>
            <p style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>
              {pub.url
                ? <a href={toHref(pub.url)} target="_blank" rel="noopener noreferrer"
                    style={{ color: textColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>{pub.title}</a>
                : pub.title}
            </p>
            <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>{pub.publisher}{pub.date ? ` • ${formatDate(pub.date)}` : ''}</p>
          </div>
        ))}
      </>
    ) : null,

    references: () => data.references.length > 0 ? (
      <>
        <SectionTitle title="References" color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {data.references.map(ref => (
            <div key={ref.id}>
              <p style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 700 }, 'jobTitle', lvl, globalFont)}>{ref.name}</p>
              <p style={{ fontSize: `${bs - 1}px`, color: '#4b5563' }}>{ref.title}{ref.company ? `, ${ref.company}` : ''}</p>
              {ref.email && (
                <a href={`mailto:${ref.email}`}
                  style={{ fontSize: `${bs - 1}px`, color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '2px', display: 'block' }}>
                  {ref.email}
                </a>
              )}
              {ref.phone && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>{ref.phone}</p>}
            </div>
          ))}
        </div>
      </>
    ) : null,
  };

  return (
    <div style={{
      fontFamily: typo.fontFamily,
      color: textColor,
      backgroundColor: '#ffffff',
      minHeight: '100%',
      padding: `${typo.pagePaddingY}px ${typo.pagePaddingX}px`,
      border: clr.showBorder ? `1.5px solid ${clr.borderColor}` : 'none',
    }}>
      {/* Classic centered header */}
      <div style={{ textAlign: 'center', marginBottom: `${typo.headerPaddingY * 0.5}px` }}>
        {p.photo && (
          <img src={p.photo} alt={fullName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', border: `2px solid ${primaryColor}` }} />
        )}
        <h1 style={applyStyle({ color: primaryColor, fontSize: `${typo.nameFontSize}px`, letterSpacing: '0.05em', fontWeight: 700 }, 'candidateName', lvl, globalFont)}>
          {fullName || 'Your Name'}
        </h1>
        {p.headline && (
          <p style={applyStyle({ fontSize: `${bs + 2}px`, color: clr.mutedColor, marginTop: '4px', fontStyle: 'italic' }, 'headline', lvl, globalFont)}>{p.headline}</p>
        )}
        <div style={{ backgroundColor: primaryColor, height: '2px', width: '96px', margin: '8px auto' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 16px', marginTop: '8px' }}>
          {p.email && (
            <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: '#4b5563', textDecoration: 'none' }}>
              <FiMail size={bs - 2} />{p.email}
            </a>
          )}
          {p.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: '#4b5563' }}>
              <FiPhone size={bs - 2} />{p.phone}
            </span>
          )}
          {p.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: '#4b5563' }}>
              <FiMapPin size={bs - 2} />{p.location}
            </span>
          )}
          {p.linkedIn && (
            <a href={toHref(p.linkedIn)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              <FiLinkedin size={bs - 2} />{p.linkedIn}
            </a>
          )}
          {p.github && (
            <a href={toHref(p.github)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              <FiGithub size={bs - 2} />{p.github}
            </a>
          )}
          {p.portfolio && (
            <a href={toHref(p.portfolio)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: `${bs - 1}px`, color: primaryColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              <FiGlobe size={bs - 2} />{p.portfolio}
            </a>
          )}
        </div>
      </div>

      {/* Sections */}
      {visibleSections.filter(s => s.key !== 'personal').map(section => {
        const renderer = sectionMap[section.key];
        if (renderer) {
          const rendered = renderer();
          return rendered ? <div key={section.key}>{rendered}</div> : null;
        }
        if (section.isCustom) {
          const rendered = renderCustomSection(section);
          return rendered ? <div key={section.key}>{rendered}</div> : null;
        }
        return null;
      })}

      {clr.showPageNumbers && (
        <div style={{ textAlign: 'right', padding: `4px 0 0`, fontSize: `${bs - 2}px`, color: clr.mutedColor, marginTop: '8px' }}>
          Page 1
        </div>
      )}
    </div>
  );
}
