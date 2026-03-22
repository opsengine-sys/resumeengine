/**
 * LaTeXTemplate.tsx
 * Fully reactive to user typography and color settings
 */

import React from 'react';
import { Resume, Template, SectionConfig } from '../types/resume';

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

export default function LaTeXTemplate({ resume, visibleSections }: Props) {
  const d = resume.data;
  const p = d.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Your Name';

  // Read user settings
  const typo = resume.typography || {};
  const colors = resume.colors || {};
  const levels = typo.levelStyles || {};

  // Base settings
  const FONT = typo.globalFont || "'CMU Serif', 'Computer Modern', Georgia, serif";
  const BASE_SIZE = typo.baseFontSize || 11;
  const LINE_HEIGHT = typo.lineHeight || 1.1;
  const SECTION_SPACING = typo.sectionSpacing || 12;
  const ITEM_SPACING = typo.itemSpacing || 4;
  
  // Colors
  const TEXT_COLOR = colors.textColor || '#111111';
  const HEADING_COLOR = colors.headingColor || '#111111';
  const LINK_COLOR = colors.linkColor || '#0000EE';

  // Padding (0.4in = 38px, 0.7in = 67px at 96dpi)
  const PAD_H = typo.pagePaddingX || 38;
  const PAD_V_TOP = typo.pagePaddingY || 38;
  const PAD_V_BOTTOM = 67;

  // Helper: apply level-specific styles
  const applyLevel = (levelKey: string, base: React.CSSProperties = {}): React.CSSProperties => {
    const level = levels[levelKey];
    if (!level) return { ...base, fontFamily: FONT, color: TEXT_COLOR };

    const fontSize = level.fontSize || base.fontSize || BASE_SIZE;
    const fontWeight = level.fontWeight === 'bold' ? 700 : level.fontWeight === 'light' ? 300 : base.fontWeight || 400;
    const fontStyle = level.isItalic ? 'italic' : base.fontStyle || 'normal';
    const textTransform = level.letterCase === 'uppercase' ? 'uppercase' : level.letterCase === 'lowercase' ? 'lowercase' : level.letterCase === 'capitalize' ? 'capitalize' : base.textTransform || 'none';
    const fontFamily = level.fontFamily || FONT;
    const color = base.color || TEXT_COLOR;

    return {
      ...base,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textTransform: textTransform as any,
      color,
    };
  };

  // Date formatting
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fd(d: string): string {
    if (!d) return '';
    const [y, m] = d.split('-');
    return `${MONTHS[parseInt(m) - 1] ?? ''} ${y}`;
  }

  function toHref(url: string): string {
    if (!url) return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  // Section heading component
  function SecHead({ label }: { label: string }) {
    return (
      <div style={{ marginTop: SECTION_SPACING, marginBottom: 6 }}>
        <div style={{
          ...applyLevel('sectionTitle', {
            fontSize: typo.headingFontSize || 12,
            fontWeight: 700,
            color: HEADING_COLOR,
            letterSpacing: '0.04em',
            textTransform: typo.headingCase === 'uppercase' ? 'uppercase' : 'none',
            marginBottom: 3,
          })
        }}>
          {label}
        </div>
        <div style={{ borderTop: `1px solid ${HEADING_COLOR}`, width: '100%' }} />
      </div>
    );
  }

  // Hyperlink component
  function HRef({ url, children }: { url: string; children: React.ReactNode }) {
    return (
      <a href={toHref(url)} target="_blank" rel="noopener noreferrer"
        style={{ color: LINK_COLOR, textDecoration: 'underline', textUnderlineOffset: '1px' }}>
        {children}
      </a>
    );
  }

  // Bullet list
  function BulletList({ items }: { items: string[] }) {
    return (
      <ul style={{ margin: '3px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
        {items.map((text, i) => (
          <li key={i} style={{
            fontFamily: FONT,
            fontSize: BASE_SIZE,
            color: TEXT_COLOR,
            lineHeight: LINE_HEIGHT,
            marginBottom: ITEM_SPACING,
          }}>
            {text}
          </li>
        ))}
      </ul>
    );
  }

  // Section label helper
  const secLabel = (key: string, fallback: string) =>
    resume.sections.find(s => s.key === key)?.label ?? fallback;

  // Section renderers
  const renderSummary = () => {
    if (!d.summary) return null;
    return (
      <div>
        <SecHead label={secLabel('summary', 'Objective')} />
        <p style={{ 
          fontFamily: FONT, 
          fontSize: BASE_SIZE, 
          color: TEXT_COLOR, 
          lineHeight: LINE_HEIGHT, 
          margin: '4px 0 0' 
        }}>
          {d.summary}
        </p>
      </div>
    );
  };

  const renderEducation = () => {
    if (!d.education.length) return null;
    return (
      <div>
        <SecHead label={secLabel('education', 'Education')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: ITEM_SPACING, marginTop: 4 }}>
          {d.education.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ 
                  ...applyLevel('jobTitle', { 
                    fontSize: BASE_SIZE, 
                    fontWeight: 700 
                  }) 
                }}>
                  {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}
                </span>
                {e.institution && (
                  <span style={{ 
                    ...applyLevel('companyName', { 
                      fontSize: BASE_SIZE 
                    }) 
                  }}>
                    {', '}{e.institution}{e.location ? `, ${e.location}` : ''}
                  </span>
                )}
                {e.gpa && (
                  <span style={{ fontSize: BASE_SIZE - 1, color: TEXT_COLOR, opacity: 0.7 }}>
                    {' — GPA: '}{e.gpa}
                  </span>
                )}
              </div>
              <span style={{ 
                ...applyLevel('date', { 
                  fontSize: BASE_SIZE, 
                  whiteSpace: 'nowrap' as const, 
                  marginLeft: 8 
                }) 
              }}>
                {fd(e.startDate)}{fd(e.endDate) ? ` -- ${fd(e.endDate)}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!d.skills.length) return null;
    
    const allSkillNames = d.skills.map(s => s.name);
    const mid = Math.ceil(allSkillNames.length / 2);
    const leftItems = allSkillNames.slice(0, mid);
    const rightItems = allSkillNames.slice(mid);

    return (
      <div>
        <SecHead label={secLabel('skills', 'Skills')} />
        <div style={{ display: 'flex', gap: 0, marginTop: 4 }}>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {leftItems.map((item, i) => (
              <li key={i} style={{ 
                fontFamily: FONT, 
                fontSize: BASE_SIZE, 
                color: TEXT_COLOR, 
                lineHeight: LINE_HEIGHT, 
                marginBottom: ITEM_SPACING 
              }}>
                {item}
              </li>
            ))}
          </ul>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {rightItems.map((item, i) => (
              <li key={i} style={{ 
                fontFamily: FONT, 
                fontSize: BASE_SIZE, 
                color: TEXT_COLOR, 
                lineHeight: LINE_HEIGHT, 
                marginBottom: ITEM_SPACING 
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!d.certifications.length) return null;
    const names = d.certifications.map(c =>
      c.organization ? `${c.name} — ${c.organization}` : c.name
    );
    const mid = Math.ceil(names.length / 2);
    const left = names.slice(0, mid);
    const right = names.slice(mid);

    return (
      <div>
        <SecHead label={secLabel('certifications', 'Certifications/Training')} />
        <div style={{ display: 'flex', gap: 0, marginTop: 4 }}>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {left.map((item, i) => (
              <li key={i} style={{ 
                fontFamily: FONT, 
                fontSize: BASE_SIZE, 
                color: TEXT_COLOR, 
                lineHeight: LINE_HEIGHT, 
                marginBottom: ITEM_SPACING 
              }}>
                {item}
              </li>
            ))}
          </ul>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {right.map((item, i) => (
              <li key={i} style={{ 
                fontFamily: FONT, 
                fontSize: BASE_SIZE, 
                color: TEXT_COLOR, 
                lineHeight: LINE_HEIGHT, 
                marginBottom: ITEM_SPACING 
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!d.experience.length) return null;
    return (
      <div>
        <SecHead label={secLabel('experience', 'Experience')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: SECTION_SPACING, marginTop: 4 }}>
          {d.experience.map(e => (
            <div key={e.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ ...applyLevel('jobTitle', { fontSize: BASE_SIZE, fontWeight: 700 }) }}>
                  {e.jobTitle}
                </span>
                <span style={{ ...applyLevel('date', { fontSize: BASE_SIZE, whiteSpace: 'nowrap' as const, marginLeft: 8 }) }}>
                  {fd(e.startDate)} -- {e.currentlyWorking ? 'Present' : fd(e.endDate)}
                </span>
              </div>
              <div style={{ ...applyLevel('companyName', { fontSize: BASE_SIZE, fontStyle: 'italic', marginBottom: 2 }) }}>
                {e.company}{e.location ? `, ${e.location}` : ''}
              </div>
              {e.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, margin: '2px 0' }}>
                  {e.description}
                </p>
              )}
              {e.bullets.length > 0 && <BulletList items={e.bullets.map(b => b.text)} />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!d.projects.length) return null;
    return (
      <div>
        <SecHead label={secLabel('projects', 'Projects')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: SECTION_SPACING, marginTop: 4 }}>
          {d.projects.map(proj => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: BASE_SIZE, fontWeight: 700, color: TEXT_COLOR }}>
                  {proj.projectUrl ? <HRef url={proj.projectUrl}>{proj.title}</HRef> : proj.title}
                  {proj.githubUrl && <> | <HRef url={proj.githubUrl}>GitHub</HRef></>}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, margin: '2px 0' }}>
                  {proj.description}
                </p>
              )}
              {proj.technologies && (
                <p style={{ fontFamily: FONT, fontSize: BASE_SIZE - 1, color: TEXT_COLOR, opacity: 0.7, fontStyle: 'italic', margin: '1px 0' }}>
                  Tech: {proj.technologies}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!d.achievements.length) return null;
    return (
      <div>
        <SecHead label={secLabel('achievements', 'Achievements')} />
        <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {d.achievements.map(a => (
            <li key={a.id} style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, marginBottom: ITEM_SPACING }}>
              <strong>{a.title}</strong>
              {a.organization && ` — ${a.organization}`}
              {a.date && <span style={{ opacity: 0.7 }}> ({fd(a.date)})</span>}
              {a.description && <span>: {a.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!d.languages.length) return null;
    return (
      <div>
        <SecHead label={secLabel('languages', 'Languages')} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 24px', marginTop: 4 }}>
          {d.languages.map(l => (
            <span key={l.id} style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT }}>
              <strong>{l.name}</strong> — {l.proficiency}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderVolunteer = () => {
    if (!d.volunteer.length) return null;
    return (
      <div>
        <SecHead label={secLabel('volunteer', 'Volunteer Experience')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: SECTION_SPACING, marginTop: 4 }}>
          {d.volunteer.map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: BASE_SIZE, fontWeight: 700, color: TEXT_COLOR }}>{v.role}</span>
                <span style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {fd(v.startDate)} -- {fd(v.endDate)}
                </span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: BASE_SIZE, fontStyle: 'italic', color: TEXT_COLOR }}>{v.organization}</div>
              {v.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, margin: '2px 0' }}>
                  {v.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPublications = () => {
    if (!d.publications.length) return null;
    return (
      <div>
        <SecHead label={secLabel('publications', 'Publications')} />
        <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {d.publications.map(pub => (
            <li key={pub.id} style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, marginBottom: ITEM_SPACING }}>
              {pub.url ? <HRef url={pub.url}><strong>{pub.title}</strong></HRef> : <strong>{pub.title}</strong>}
              {pub.publisher && ` — ${pub.publisher}`}
              {pub.date && <span style={{ opacity: 0.7 }}> ({fd(pub.date)})</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderReferences = () => {
    if (!d.references.length) return null;
    return (
      <div>
        <SecHead label={secLabel('references', 'References')} />
        <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {d.references.map(r => (
            <li key={r.id} style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, marginBottom: ITEM_SPACING }}>
              <strong>{r.name}</strong>
              {r.title && ` — ${r.title}`}
              {r.company && ` at ${r.company}`}
              {r.email && <> | <HRef url={`mailto:${r.email}`}>{r.email}</HRef></>}
              {r.phone && ` | ${r.phone}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCustomSection = (section: SectionConfig) => {
    if (!section.customEntries?.length) return null;
    return (
      <div>
        <SecHead label={section.label} />
        <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {section.customEntries.map(entry =>
            entry.fields.filter(f => f.value).map(field => (
              <li key={field.id} style={{ fontFamily: FONT, fontSize: BASE_SIZE, color: TEXT_COLOR, lineHeight: LINE_HEIGHT, marginBottom: ITEM_SPACING }}>
                <strong>{field.label}:</strong> {field.value}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  const sectionRenderers: Record<string, (() => React.ReactNode) | undefined> = {
    summary: renderSummary,
    education: renderEducation,
    skills: renderSkills,
    certifications: renderCertifications,
    experience: renderExperience,
    projects: renderProjects,
    achievements: renderAchievements,
    languages: renderLanguages,
    volunteer: renderVolunteer,
    publications: renderPublications,
    references: renderReferences,
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '1123px',
      background: '#ffffff',
      fontFamily: FONT,
      color: TEXT_COLOR,
      fontSize: BASE_SIZE,
      lineHeight: LINE_HEIGHT,
      boxSizing: 'border-box',
      paddingTop: PAD_V_TOP,
      paddingLeft: PAD_H,
      paddingRight: PAD_H,
      paddingBottom: PAD_V_BOTTOM,
    }}>

{/* Header */}
<div style={{ textAlign: 'center', marginBottom: 8 }}>
  {/* Name */}
  <div style={{
    ...applyLevel('candidateName', {
      fontSize: typo.headingFontSize ? typo.headingFontSize + 4 : 18,
      fontWeight: 700,
      color: HEADING_COLOR,
      letterSpacing: '0.01em',
      marginBottom: 4,
    })
  }}>
    {fullName}
  </div>

  {/* Professional Headline */}
  {p.headline && (
    <div style={{
      ...applyLevel('headline', {
        fontSize: BASE_SIZE,
        fontStyle: 'italic',
        color: TEXT_COLOR,
        marginBottom: 4,
      })
    }}>
      {p.headline}
    </div>
  )}

  {/* Contact line 1: phone + email */}
  <div style={{
    ...applyLevel('contactInfo', {
      fontSize: BASE_SIZE,
      color: TEXT_COLOR,
      lineHeight: LINE_HEIGHT,
    })
  }}>
    {p.phone && <span>{p.phone}</span>}
    {p.phone && p.email && <span style={{ margin: '0 6px' }}>·</span>}
    {p.email && <HRef url={`mailto:${p.email}`}>{p.email}</HRef>}
  </div>

  {/* Contact line 2: LinkedIn | GitHub | Portfolio — Location */}
  <div style={{
    ...applyLevel('contactInfo', {
      fontSize: BASE_SIZE,
      color: TEXT_COLOR,
      lineHeight: LINE_HEIGHT,
      marginTop: 1,
    })
  }}>
    {p.linkedIn && <HRef url={p.linkedIn}>{p.linkedIn.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
    {p.linkedIn && (p.github || p.portfolio || p.location) && <span style={{ margin: '0 6px' }}>|</span>}
    {p.github && <HRef url={p.github}>{p.github.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
    {p.github && (p.portfolio || p.location) && <span style={{ margin: '0 6px' }}>|</span>}
    {p.portfolio && <HRef url={p.portfolio}>{p.portfolio.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
    {p.portfolio && p.location && <span style={{ margin: '0 6px' }}>--</span>}
    {p.location && <span>{p.location}</span>}
  </div>
</div>

      {/* Body sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleSections
          .filter(s => s.key !== 'personal')
          .map(section => {
            const renderer = sectionRenderers[section.key];
            const content = renderer ? renderer() : section.isCustom ? renderCustomSection(section) : null;
            if (!content) return null;
            return <div key={section.key}>{content}</div>;
          })}
      </div>

    </div>
  );
}