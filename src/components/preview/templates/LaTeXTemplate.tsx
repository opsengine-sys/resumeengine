/**
 * LaTeXTemplate.tsx
 * Faithfully mirrors the resume.cls + geometry layout:
 *   - Margins: 0.4in top/left/right, 0.7in bottom
 *   - 11pt base, linespread 0.94 → lineHeight ~1.1
 *   - Name: \LARGE bold centered
 *   - Address lines: centered, plain
 *   - Sections: UPPERCASE BOLD + full-width hrule
 *   - Skills/Certs: two-column tabularx layout
 *   - Page number: bottom-right (handled via @page CSS in ExportModal)
 *   - Font: CMU Serif / Georgia / serif fallback
 */

import React from 'react';
import { Resume, Template, SectionConfig } from '../../../types/resume';

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

/* ── Constants matching resume.cls + geometry ── */
const FONT   = "'CMU Serif', 'Computer Modern', Georgia, serif";
const BASE   = 11;       /* px  ≈ 11pt */
const LH     = 1.1;      /* linespread 0.94 × 1.2 natural ≈ 1.13, round to 1.1 */
const PAD_H  = 38;       /* 0.4in @ 96dpi */
const PAD_B  = 67;       /* 0.7in @ 96dpi */
const NAME_SIZE  = 18;   /* \LARGE at 11pt base ≈ 17–19px */
const SECTION_FS = 11;   /* same as base, bold + uppercase */
const MUTED  = '#444444';
const BLACK  = '#111111';
const LINK   = '#0000EE'; /* classic browser blue, matches LaTeX urlcolor=blue */
const SEC_GAP = 8;        /* \medskip between sections */
const ITEM_GAP = 2;       /* itemsep=0.15em */

/* ── Helpers ── */
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

/* ── Sub-components ── */

/** Full-width section heading: UPPERCASE BOLD + hrule */
function SecHead({ label }: { label: string }) {
  return (
    <div style={{ marginTop: SEC_GAP * 1.5, marginBottom: 4 }}>
      <div style={{
        fontFamily:    FONT,
        fontSize:      SECTION_FS,
        fontWeight:    700,
        color:         BLACK,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom:  3,
      }}>
        {label}
      </div>
      <div style={{ borderTop: `1px solid ${BLACK}`, width: '100%' }} />
    </div>
  );
}

/** Inline link styled like LaTeX urlcolor=blue */
function HRef({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <a href={toHref(url)} target="_blank" rel="noopener noreferrer"
      style={{ color: LINK, textDecoration: 'underline', textUnderlineOffset: '1px' }}>
      {children}
    </a>
  );
}

/** Bullet list matching \begin{itemize}[itemsep=0.15em] */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '3px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
      {items.map((text, i) => (
        <li key={i} style={{
          fontFamily:  FONT,
          fontSize:    BASE,
          color:       BLACK,
          lineHeight:  LH,
          marginBottom: ITEM_GAP,
        }}>
          {text}
        </li>
      ))}
    </ul>
  );
}

/* ── Main component ── */
export default function LaTeXTemplate({ resume, visibleSections }: Props) {
  const d = resume.data;
  const p = d.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Your Name';

  /* Section label from resume.sections (respects renames) */
  const secLabel = (key: string, fallback: string) =>
    resume.sections.find(s => s.key === key)?.label ?? fallback;

  /* ── Section renderers ── */

  const renderSummary = () => {
    if (!d.summary) return null;
    return (
      <div>
        <SecHead label={secLabel('summary', 'Objective')} />
        <p style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, margin: '4px 0 0' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          {d.education.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontFamily: FONT, fontSize: BASE, fontWeight: 700, color: BLACK }}>
                  {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}
                </span>
                {e.institution && (
                  <span style={{ fontFamily: FONT, fontSize: BASE, color: BLACK }}>
                    {', '}{e.institution}{e.location ? `, ${e.location}` : ''}
                  </span>
                )}
                {e.gpa && <span style={{ fontSize: BASE - 1, color: MUTED }}> — GPA: {e.gpa}</span>}
              </div>
              <span style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, whiteSpace: 'nowrap', marginLeft: 8 }}>
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
    const cats = ['Technical', 'Tools', 'Soft', 'Other'] as const;
    const groups = cats
      .map(cat => ({ cat, items: d.skills.filter(s => s.category === cat).map(s => s.name) }))
      .filter(g => g.items.length > 0);

    /* Split into two columns like tabularx */
    const half  = Math.ceil(groups.length / 2);
    const left  = groups.slice(0, half);
    const right = groups.slice(half);

    const renderCol = (grps: typeof groups) => (
      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
        {grps.flatMap(g => g.items.map((item, i) => (
          <li key={`${g.cat}-${i}`} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>
            {i === 0 && grps.length > 1
              ? <><strong>{g.cat}:</strong> {item}</>
              : item}
          </li>
        )))}
      </ul>
    );

    /* If we have enough skills for two columns, split them */
    const allSkillNames = d.skills.map(s => s.name);
    const mid = Math.ceil(allSkillNames.length / 2);
    const leftItems  = allSkillNames.slice(0, mid);
    const rightItems = allSkillNames.slice(mid);

    return (
      <div>
        <SecHead label={secLabel('skills', 'Skills')} />
        <div style={{ display: 'flex', gap: 0, marginTop: 4 }}>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {leftItems.map((item, i) => (
              <li key={i} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>{item}</li>
            ))}
          </ul>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {rightItems.map((item, i) => (
              <li key={i} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>{item}</li>
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
    const mid   = Math.ceil(names.length / 2);
    const left  = names.slice(0, mid);
    const right = names.slice(mid);

    return (
      <div>
        <SecHead label={secLabel('certifications', 'Certifications/Training')} />
        <div style={{ display: 'flex', gap: 0, marginTop: 4 }}>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {left.map((item, i) => (
              <li key={i} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>{item}</li>
            ))}
          </ul>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc', flex: 1 }}>
            {right.map((item, i) => (
              <li key={i} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>{item}</li>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: SEC_GAP, marginTop: 4 }}>
          {d.experience.map(e => (
            <div key={e.id}>
              {/* \textbf{Title} \hfill Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: BASE, fontWeight: 700, color: BLACK }}>{e.jobTitle}</span>
                <span style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {fd(e.startDate)} -- {e.currentlyWorking ? 'Present' : fd(e.endDate)}
                </span>
              </div>
              {/* \textit{Company, Location} */}
              <div style={{ fontFamily: FONT, fontSize: BASE, fontStyle: 'italic', color: BLACK, marginBottom: 2 }}>
                {e.company}{e.location ? `, ${e.location}` : ''}
              </div>
              {e.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, margin: '2px 0' }}>{e.description}</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: SEC_GAP, marginTop: 4 }}>
          {d.projects.map(proj => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: BASE, fontWeight: 700, color: BLACK }}>
                  {proj.projectUrl ? <HRef url={proj.projectUrl}>{proj.title}</HRef> : proj.title}
                  {proj.githubUrl && <> | <HRef url={proj.githubUrl}>GitHub</HRef></>}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, margin: '2px 0' }}>{proj.description}</p>
              )}
              {proj.technologies && (
                <p style={{ fontFamily: FONT, fontSize: BASE - 1, color: MUTED, fontStyle: 'italic', margin: '1px 0' }}>
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
            <li key={a.id} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>
              <strong>{a.title}</strong>
              {a.organization && ` — ${a.organization}`}
              {a.date && <span style={{ color: MUTED }}> ({fd(a.date)})</span>}
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
            <span key={l.id} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: SEC_GAP, marginTop: 4 }}>
          {d.volunteer.map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: BASE, fontWeight: 700, color: BLACK }}>{v.role}</span>
                <span style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {fd(v.startDate)} -- {fd(v.endDate)}
                </span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: BASE, fontStyle: 'italic', color: BLACK }}>{v.organization}</div>
              {v.description && (
                <p style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, margin: '2px 0' }}>{v.description}</p>
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
            <li key={pub.id} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>
              {pub.url ? <HRef url={pub.url}><strong>{pub.title}</strong></HRef> : <strong>{pub.title}</strong>}
              {pub.publisher && ` — ${pub.publisher}`}
              {pub.date && <span style={{ color: MUTED }}> ({fd(pub.date)})</span>}
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
            <li key={r.id} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>
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
              <li key={field.id} style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginBottom: ITEM_GAP }}>
                <strong>{field.label}:</strong> {field.value}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  const sectionRenderers: Record<string, (() => React.ReactNode) | undefined> = {
    summary:        renderSummary,
    education:      renderEducation,
    skills:         renderSkills,
    certifications: renderCertifications,
    experience:     renderExperience,
    projects:       renderProjects,
    achievements:   renderAchievements,
    languages:      renderLanguages,
    volunteer:      renderVolunteer,
    publications:   renderPublications,
    references:     renderReferences,
  };

  return (
    <div style={{
      width:       '100%',
      minHeight:   '1123px',
      background:  '#ffffff',
      fontFamily:  FONT,
      color:       BLACK,
      fontSize:    BASE,
      lineHeight:  LH,
      boxSizing:   'border-box',
      /* Margins: 0.4in top/sides, 0.7in bottom */
      paddingTop:    PAD_H,
      paddingLeft:   PAD_H,
      paddingRight:  PAD_H,
      paddingBottom: PAD_B,
    }}>

      {/* ── Centered header: \printname + \printaddress ── */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        {/* Name: \LARGE\bf */}
        <div style={{
          fontFamily:  FONT,
          fontSize:    NAME_SIZE,
          fontWeight:  700,
          color:       BLACK,
          letterSpacing: '0.01em',
          marginBottom: 4,
        }}>
          {fullName}
        </div>

        {/* Address line 1: phone + email */}
        <div style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH }}>
          {p.phone && <span>{p.phone}</span>}
          {p.phone && p.email && <span style={{ margin: '0 6px' }}>·</span>}
          {p.email && <HRef url={`mailto:${p.email}`}>{p.email}</HRef>}
        </div>

        {/* Address line 2: LinkedIn | Website — Location */}
        <div style={{ fontFamily: FONT, fontSize: BASE, color: BLACK, lineHeight: LH, marginTop: 1 }}>
          {p.linkedIn && <HRef url={p.linkedIn}>{p.linkedIn.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
          {p.linkedIn && (p.github || p.portfolio || p.location) && <span style={{ margin: '0 6px' }}>|</span>}
          {p.github && <HRef url={p.github}>{p.github.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
          {p.github && (p.portfolio || p.location) && <span style={{ margin: '0 6px' }}>|</span>}
          {p.portfolio && <HRef url={p.portfolio}>{p.portfolio.replace(/^https?:\/\/(www\.)?/i, '')}</HRef>}
          {p.portfolio && p.location && <span style={{ margin: '0 6px' }}>--</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>

      {/* ── Body sections ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleSections
          .filter(s => s.key !== 'personal')
          .map(section => {
            const renderer = sectionRenderers[section.key];
            const content  = renderer ? renderer() : section.isCustom ? renderCustomSection(section) : null;
            if (!content) return null;
            return <div key={section.key}>{content}</div>;
          })}
      </div>

    </div>
  );
}