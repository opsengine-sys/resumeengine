import React from 'react';
import { Resume, Template, SectionConfig, TypographySettings, TextLevel, ElementStyle } from '../../../types/resume';
import { DEFAULT_TYPOGRAPHY, DEFAULT_COLORS, DEFAULT_LEVEL_STYLES } from '../../../data/defaultData';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe, FiGithub } from 'react-icons/fi';

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

function formatDate(d: string): string {
  if (!d) return '';
  const [year, month] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month) - 1] ?? ''} ${year}`;
}

function toHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function applyStyle(
  base: React.CSSProperties,
  level: TextLevel,
  levelStyles: Record<TextLevel, ElementStyle>,
  globalFont: string,
): React.CSSProperties {
  const s = levelStyles[level] ?? DEFAULT_LEVEL_STYLES[level];
  const result: React.CSSProperties = {
    ...base,
    fontFamily: s.fontFamily ?? globalFont,
    fontWeight: s.fontWeight === 'bold' ? 700 : s.fontWeight === 'light' ? 300 : (base.fontWeight ?? 400),
    fontStyle: s.isItalic ? 'italic' : (base.fontStyle ?? 'normal'),
    textTransform: (s.letterCase === 'normal' || !s.letterCase
      ? (base.textTransform ?? 'none')
      : s.letterCase) as React.CSSProperties['textTransform'],
  };
  if (s.fontSize !== undefined) result.fontSize = `${s.fontSize}px`;
  return result;
}

export default function ModernTemplate({ resume, template, visibleSections }: Props) {
  const { data } = resume;
  const { primaryColor } = template;
  const typo: TypographySettings = resume.typography ?? DEFAULT_TYPOGRAPHY;
  const clr = resume.colors ?? DEFAULT_COLORS;
  const p = data.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const textColor = clr.textColor;
  const bs = typo.baseFontSize;
  const lvl: Record<TextLevel, ElementStyle> = { ...DEFAULT_LEVEL_STYLES, ...(typo.levelStyles ?? {}) };
  const globalFont = typo.fontFamily;

  const renderCustomSection = (section: SectionConfig) => {
    const entries = section.customEntries ?? [];
    return (
      <>
        <SectionTitle title={section.label} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        {entries.length === 0 ? (
          <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, fontStyle: 'italic' }}>
            Add entries in the editor panel →
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
            {entries.map(entry => {
              const filledFields = entry.fields.filter(f => f.value);
              if (filledFields.length === 0) return null;
              return (
                <div key={entry.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  {filledFields.map(field => (
                    <div key={field.id} style={{ minWidth: '120px' }}>
                      <span style={{ fontSize: `${bs - 2}px`, color: clr.mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        {field.label}:{' '}
                      </span>
                      {field.type === 'longtext' ? (
                        <p style={applyStyle({ fontSize: `${bs}px`, color: textColor, lineHeight: typo.lineHeight, whiteSpace: 'pre-wrap' }, 'bodyText', lvl, globalFont)}>
                          {field.value}
                        </p>
                      ) : (
                        <span style={applyStyle({ fontSize: `${bs}px`, color: textColor }, 'bodyText', lvl, globalFont)}>
                          {field.type === 'date' ? formatDate(field.value) : field.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const getSectionLabel = (key: string, fallback: string) => {
    return resume.sections.find(s => s.key === key)?.label ?? fallback;
  };

  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <>
        <SectionTitle title={getSectionLabel('summary', 'Professional Summary')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <p style={applyStyle({ color: textColor, fontSize: `${bs}px`, lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>
          {data.summary}
        </p>
      </>
    ) : null,

    experience: () => data.experience.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('experience', 'Work Experience')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={applyStyle({ color: textColor, fontSize: `${typo.subHeadingFontSize}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>
                    {exp.jobTitle}
                  </h3>
                  <p style={applyStyle({ color: primaryColor, fontSize: `${bs + 1}px` }, 'companyName', lvl, globalFont)}>
                    {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                  </p>
                </div>
                <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>
                  {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && (
                <p style={applyStyle({ fontSize: `${bs}px`, color: '#4b5563', marginTop: '3px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>
                  {exp.description}
                </p>
              )}
              {exp.bullets.length > 0 && (
                <ul style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {exp.bullets.map(b => (
                    <li key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', ...applyStyle({ fontSize: `${bs}px`, color: '#374151', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont) }}>
                      <span style={{ color: primaryColor, marginTop: '2px', fontSize: `${bs - 2}px`, flexShrink: 0 }}>●</span>
                      {b.text}
                    </li>
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
        <SectionTitle title={getSectionLabel('education', 'Education')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.education.map(edu => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={applyStyle({ color: textColor, fontSize: `${typo.subHeadingFontSize}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </h3>
                <p style={applyStyle({ color: primaryColor, fontSize: `${bs + 1}px` }, 'institutionName', lvl, globalFont)}>
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
      </>
    ) : null,

    skills: () => data.skills.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('skills', 'Skills')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.skills.map(skill => (
            <span key={skill.id} style={applyStyle({
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              borderColor: `${primaryColor}30`,
              fontSize: `${bs - 1}px`,
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid',
            }, 'bodyText', lvl, globalFont)}>
              {skill.name}
            </span>
          ))}
        </div>
      </>
    ) : null,

    projects: () => data.projects.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('projects', 'Projects')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.projects.map(proj => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3 style={applyStyle({ color: textColor, fontSize: `${typo.subHeadingFontSize}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{proj.title}</h3>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                  {proj.projectUrl && (
                    <a href={toHref(proj.projectUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: `${bs - 1}px`, color: clr.linkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      View ↗
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={toHref(proj.githubUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: `${bs - 1}px`, color: clr.linkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>
              {proj.description && <p style={applyStyle({ fontSize: `${bs}px`, color: '#4b5563', marginTop: '2px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{proj.description}</p>}
              {proj.technologies && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor, marginTop: '2px' }}><strong>Tech:</strong> {proj.technologies}</p>}
            </div>
          ))}
        </div>
      </>
    ) : null,

    certifications: () => data.certifications.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('certifications', 'Certifications')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.7}px` }}>
          {data.certifications.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{c.name}</h3>
                <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>
                  {c.organization}
                  {c.credentialUrl && (
                    <> · <a href={toHref(c.credentialUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ color: clr.linkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Verify ↗</a></>
                  )}
                </p>
              </div>
              <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>
                {formatDate(c.issueDate)}{c.expiryDate ? ` – ${formatDate(c.expiryDate)}` : ''}
              </span>
            </div>
          ))}
        </div>
      </>
    ) : null,

    achievements: () => data.achievements.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('achievements', 'Achievements & Awards')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.7}px` }}>
          {data.achievements.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{a.title}</h3>
                {a.organization && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>{a.organization}</p>}
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
        <SectionTitle title={getSectionLabel('languages', 'Languages')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {data.languages.map(lang => (
            <div key={lang.id}>
              <p style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{lang.name}</p>
              <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                {[1,2,3,4,5].map(i => {
                  const idx = ['Basic','Intermediate','Advanced','Fluent','Native'].indexOf(lang.proficiency);
                  return <div key={i} style={{ width: '20px', height: '4px', borderRadius: '2px', backgroundColor: i <= idx + 1 ? primaryColor : '#e5e7eb' }} />;
                })}
              </div>
              <p style={{ fontSize: `${bs - 2}px`, color: clr.mutedColor, marginTop: '2px' }}>{lang.proficiency}</p>
            </div>
          ))}
        </div>
      </>
    ) : null,

    volunteer: () => data.volunteer.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('volunteer', 'Volunteer Experience')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing}px` }}>
          {data.volunteer.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{v.role}</h3>
                <p style={applyStyle({ color: primaryColor, fontSize: `${bs}px` }, 'companyName', lvl, globalFont)}>{v.organization}</p>
                {v.description && <p style={applyStyle({ fontSize: `${bs - 1}px`, color: '#4b5563', marginTop: '2px', lineHeight: typo.lineHeight }, 'bodyText', lvl, globalFont)}>{v.description}</p>}
              </div>
              <span style={applyStyle({ fontSize: `${bs - 1}px`, color: clr.mutedColor, whiteSpace: 'nowrap', marginLeft: '8px' }, 'date', lvl, globalFont)}>
                {formatDate(v.startDate)} – {formatDate(v.endDate)}
              </span>
            </div>
          ))}
        </div>
      </>
    ) : null,

    publications: () => data.publications.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('publications', 'Publications')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${typo.itemSpacing * 0.7}px` }}>
          {data.publications.map(pub => (
            <div key={pub.id}>
              <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>
                {pub.url ? <a href={toHref(pub.url)} target="_blank" rel="noopener noreferrer" style={{ color: clr.linkColor, textDecoration: 'underline' }}>{pub.title}</a> : pub.title}
              </h3>
              <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>
                {pub.publisher}{pub.date ? ` • ${formatDate(pub.date)}` : ''}
              </p>
            </div>
          ))}
        </div>
      </>
    ) : null,

    references: () => data.references.length > 0 ? (
      <>
        <SectionTitle title={getSectionLabel('references', 'References')} color={primaryColor} typo={typo} lvl={lvl} globalFont={globalFont} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {data.references.map(ref => (
            <div key={ref.id}>
              <h3 style={applyStyle({ color: textColor, fontSize: `${bs + 1}px`, fontWeight: 600 }, 'jobTitle', lvl, globalFont)}>{ref.name}</h3>
              <p style={{ fontSize: `${bs - 1}px`, color: '#4b5563' }}>{ref.title}{ref.company ? ` at ${ref.company}` : ''}</p>
              {ref.email && <a href={`mailto:${ref.email}`} style={{ fontSize: `${bs - 1}px`, color: clr.linkColor, textDecoration: 'underline', display: 'block' }}>{ref.email}</a>}
              {ref.phone && <p style={{ fontSize: `${bs - 1}px`, color: clr.mutedColor }}>{ref.phone}</p>}
            </div>
          ))}
        </div>
      </>
    ) : null,
  };

  return (
    <div style={{
      fontFamily: typo.fontFamily, color: textColor, backgroundColor: '#ffffff',
      border: clr.showBorder ? `1.5px solid ${clr.borderColor}` : 'none',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ backgroundColor: primaryColor, padding: `${typo.headerPaddingY}px ${typo.pagePaddingX}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {p.photo && (
            <img src={p.photo} alt={fullName} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={applyStyle({ fontSize: `${typo.nameFontSize}px`, color: '#ffffff', letterSpacing: '-0.025em', fontWeight: 700 }, 'candidateName', lvl, globalFont)}>
              {fullName || 'Your Name'}
            </h1>
            {p.headline && (
              <p style={applyStyle({ fontSize: `${bs + 2}px`, color: 'rgba(255,255,255,0.8)', marginTop: '2px' }, 'headline', lvl, globalFont)}>
                {p.headline}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', marginTop: '12px' }}>
          {[
            p.email    && { icon: <FiMail size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.email,    href: `mailto:${p.email}`,    isLink: true  },
            p.phone    && { icon: <FiPhone size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.phone,   href: '',                     isLink: false },
            p.location && { icon: <FiMapPin size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.location, href: '',                   isLink: false },
            p.linkedIn && { icon: <FiLinkedin size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.linkedIn, href: toHref(p.linkedIn), isLink: true  },
            p.github   && { icon: <FiGithub size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.github,   href: toHref(p.github),   isLink: true  },
            p.portfolio&& { icon: <FiGlobe size={(lvl.contactInfo?.fontSize ?? bs) - 1} />, label: p.portfolio, href: toHref(p.portfolio), isLink: true  },
          ].filter(Boolean).map((item, i) => {
            const ci = item as { icon: React.ReactNode; label: string; href: string; isLink: boolean };
            const ciStyle = applyStyle({
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: `${lvl.contactInfo?.fontSize ?? (bs - 1)}px`,
              color: 'rgba(255,255,255,0.88)', textDecoration: 'none',
            }, 'contactInfo', lvl, globalFont);
            return ci.isLink
              ? <a key={i} href={ci.href} target="_blank" rel="noopener noreferrer" style={ciStyle}>{ci.icon}{ci.label}</a>
              : <span key={i} style={ciStyle}>{ci.icon}{ci.label}</span>;
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `${typo.pagePaddingY}px ${typo.pagePaddingX}px` }}>
        {visibleSections.filter(s => s.key !== 'personal').map(section => {
          const renderer = sectionMap[section.key];
          if (renderer) {
            const rendered = renderer();
            return rendered ? <div key={section.key} style={{ marginBottom: `${typo.sectionSpacing}px` }}>{rendered}</div> : null;
          }
          if (section.isCustom) {
            const rendered = renderCustomSection(section);
            return rendered ? <div key={section.key} style={{ marginBottom: `${typo.sectionSpacing}px` }}>{rendered}</div> : null;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function SectionTitle({ title, color, typo, lvl, globalFont }: {
  title: string; color: string; typo: TypographySettings;
  lvl: Record<TextLevel, ElementStyle>; globalFont: string;
}) {
  const s = lvl['sectionTitle'] ?? DEFAULT_LEVEL_STYLES['sectionTitle'];
  const fw = s.fontWeight === 'bold' ? 700 : s.fontWeight === 'light' ? 300 : 600;
  const fs = s.fontSize ?? typo.headingFontSize;
  return (
    <div style={{ marginBottom: `${typo.sectionSpacing * 0.4}px` }}>
      <h2 style={{
        color,
        fontSize: `${fs}px`,
        fontFamily: s.fontFamily ?? globalFont,
        fontWeight: fw,
        fontStyle: s.isItalic ? 'italic' : 'normal',
        textTransform: (s.letterCase === 'normal' || !s.letterCase ? 'none' : s.letterCase) as React.CSSProperties['textTransform'],
        borderBottom: `2px solid ${color}`,
        paddingBottom: '4px',
        letterSpacing: s.letterCase === 'uppercase' ? '1.5px' : '0',
        margin: 0,
      }}>
        {title}
      </h2>
    </div>
  );
}