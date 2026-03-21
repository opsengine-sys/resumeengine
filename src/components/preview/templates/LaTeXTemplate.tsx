/**
 * LaTeXTemplate.tsx
 * Visual preview of the LaTeX/FAANG ATS-safe resume template.
 * Mimics the classic academic single-column style with centered header,
 * uppercase section titles, full-width hrule dividers, and bullet points.
 */

import { Resume, Template, SectionConfig } from '../../../types/resume';
import { DEFAULT_TYPOGRAPHY } from '../../../data/defaultData';

interface Props {
  resume: Resume;
  template: Template;
  visibleSections: SectionConfig[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fd(d: string): string {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${MONTHS[parseInt(m) - 1] ?? ''} ${y}`;
}

function toHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function Link({ url, children }: { url: string; children: React.ReactNode }) {
  if (!url) return <>{children}</>;
  return (
    <a
      href={toHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#1a56db', textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      {children}
    </a>
  );
}

export default function LaTeXTemplate({ resume, visibleSections }: Props) {
  const typo = resume.typography ?? DEFAULT_TYPOGRAPHY;
  const d = resume.data;
  const p = d.personal;
  const bs = typo.baseFontSize;
  const clr = resume.colors ?? {
    textColor: '#111827', headingColor: '#111827',
    linkColor: '#1a56db', mutedColor: '#374151',
    showBorder: false, borderColor: '#e5e7eb', showPageNumbers: false,
  };

  const visKeys = visibleSections.map(s => s.key);
  const sectionLabel = (key: string): string => {
    const s = resume.sections.find(sec => sec.key === key);
    return (s?.label ?? key).toUpperCase();
  };

  /* ── Section heading — matches LaTeX \rSection style ── */
  const SectionHead = ({ skey }: { skey: string }) => (
    <div style={{ marginTop: typo.sectionSpacing, marginBottom: Math.round(typo.sectionSpacing * 0.35) }}>
      <div style={{
        fontWeight: 700,
        fontSize: bs + 1,
        color: clr.headingColor,
        letterSpacing: '0.06em',
        marginBottom: 3,
        fontFamily: typo.fontFamily,
      }}>
        {sectionLabel(skey)}
      </div>
      <hr style={{ border: 'none', borderTop: `1px solid ${clr.headingColor}`, margin: 0 }} />
    </div>
  );

  /* ── Renderers ── */
  const renderSummary = () => {
    if (!d.summary) return null;
    return (
      <div>
        <SectionHead skey="summary" />
        <p style={{ fontSize: bs, lineHeight: typo.lineHeight, color: clr.textColor, margin: 0 }}>
          {d.summary}
        </p>
      </div>
    );
  };

  const renderExperience = () => {
    if (!d.experience.length) return null;
    return (
      <div>
        <SectionHead skey="experience" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: typo.itemSpacing }}>
          {d.experience.map(e => (
            <div key={e.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: bs + 1, color: clr.headingColor }}>{e.jobTitle}</span>
                <span style={{ fontSize: bs - 1, color: clr.mutedColor, flexShrink: 0, marginLeft: 8 }}>
                  {fd(e.startDate)} – {e.currentlyWorking ? 'Present' : fd(e.endDate)}
                </span>
              </div>
              <div style={{ fontStyle: 'italic', fontSize: bs, color: clr.mutedColor }}>
                {e.company}{e.location ? `, ${e.location}` : ''}
              </div>
              {e.description && (
                <p style={{ fontSize: bs, color: clr.textColor, margin: '2px 0 0', lineHeight: typo.lineHeight }}>{e.description}</p>
              )}
              {e.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, listStyle: 'disc' }}>
                  {e.bullets.map(b => (
                    <li key={b.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight, marginBottom: 2 }}>
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
  };

  const renderEducation = () => {
    if (!d.education.length) return null;
    return (
      <div>
        <SectionHead skey="education" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(typo.itemSpacing * 0.7) }}>
          {d.education.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: bs, color: clr.headingColor }}>
                  {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}
                </span>
                {', '}
                <span style={{ fontSize: bs, color: clr.textColor }}>{e.institution}</span>
                {e.location && <span style={{ fontSize: bs - 1, color: clr.mutedColor }}>{`, ${e.location}`}</span>}
                {e.gpa && <span style={{ fontSize: bs - 1, color: clr.mutedColor }}> — GPA: {e.gpa}</span>}
              </div>
              <span style={{ fontSize: bs - 1, color: clr.mutedColor, flexShrink: 0, marginLeft: 8 }}>
                {fd(e.startDate)} – {fd(e.endDate)}
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
    const grouped = cats.map(cat => ({
      cat,
      skills: d.skills.filter(s => s.category === cat),
    })).filter(g => g.skills.length > 0);

    return (
      <div>
        <SectionHead skey="skills" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {grouped.map(({ cat, skills }) => (
            <div key={cat} style={{ display: 'flex', flexWrap: 'wrap', gap: '0 4px', fontSize: bs }}>
              <span style={{ fontWeight: 700, color: clr.headingColor }}>{cat}: </span>
              <span style={{ color: clr.textColor }}>{skills.map(s => s.name).join(', ')}</span>
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
        <SectionHead skey="projects" />
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: Math.round(typo.itemSpacing * 0.8) }}>
          {d.projects.map(pr => (
            <li key={pr.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight }}>
              <span style={{ fontWeight: 700 }}>
                {pr.projectUrl ? <Link url={pr.projectUrl}>{pr.title}</Link> : pr.title}
              </span>
              {pr.githubUrl && <> | <Link url={pr.githubUrl}>GitHub</Link></>}
              {pr.description && <> — {pr.description}</>}
              {pr.technologies && (
                <div style={{ fontStyle: 'italic', color: clr.mutedColor, fontSize: bs - 1 }}>
                  Tech: {pr.technologies}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!d.certifications.length) return null;
    return (
      <div>
        <SectionHead skey="certifications" />
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {d.certifications.map(c => (
            <li key={c.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight }}>
              {c.credentialUrl ? <Link url={c.credentialUrl}><strong>{c.name}</strong></Link> : <strong>{c.name}</strong>}
              {c.organization && ` — ${c.organization}`}
              {c.issueDate && <span style={{ color: clr.mutedColor }}> ({fd(c.issueDate)}{c.expiryDate ? ` – ${fd(c.expiryDate)}` : ''})</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!d.achievements.length) return null;
    return (
      <div>
        <SectionHead skey="achievements" />
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {d.achievements.map(a => (
            <li key={a.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight }}>
              <strong>{a.title}</strong>
              {a.organization && ` — ${a.organization}`}
              {a.date && <span style={{ color: clr.mutedColor }}> ({fd(a.date)})</span>}
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
        <SectionHead skey="languages" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', fontSize: bs }}>
          {d.languages.map(l => (
            <span key={l.id} style={{ color: clr.textColor }}>
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
        <SectionHead skey="volunteer" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: typo.itemSpacing }}>
          {d.volunteer.map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: bs, color: clr.headingColor }}>{v.role}</strong>
                <span style={{ fontSize: bs - 1, color: clr.mutedColor }}>{fd(v.startDate)} – {fd(v.endDate)}</span>
              </div>
              <div style={{ fontStyle: 'italic', fontSize: bs - 1, color: clr.mutedColor }}>{v.organization}</div>
              {v.description && <p style={{ fontSize: bs, color: clr.textColor, margin: '2px 0 0', lineHeight: typo.lineHeight }}>{v.description}</p>}
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
        <SectionHead skey="publications" />
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {d.publications.map(pub => (
            <li key={pub.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight }}>
              {pub.url ? <Link url={pub.url}><strong>{pub.title}</strong></Link> : <strong>{pub.title}</strong>}
              {pub.publisher && ` — ${pub.publisher}`}
              {pub.date && <span style={{ color: clr.mutedColor }}> ({fd(pub.date)})</span>}
              {pub.description && <div style={{ fontSize: bs - 1, color: clr.mutedColor }}>{pub.description}</div>}
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
        <SectionHead skey="references" />
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {d.references.map(r => (
            <li key={r.id} style={{ fontSize: bs, color: clr.textColor, lineHeight: typo.lineHeight }}>
              <strong>{r.name}</strong> — {r.title}{r.company ? ` at ${r.company}` : ''}
              {r.email && <> | <Link url={`mailto:${r.email}`}>{r.email}</Link></>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const sectionRenderers: Record<string, (() => React.ReactNode) | undefined> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certifications: renderCertifications,
    achievements: renderAchievements,
    languages: renderLanguages,
    volunteer: renderVolunteer,
    publications: renderPublications,
    references: renderReferences,
  };

  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Your Name';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '1123px',
        background: '#fff',
        fontFamily: typo.fontFamily || 'Georgia, serif',
        color: clr.textColor,
        fontSize: bs,
        lineHeight: typo.lineHeight,
        border: clr.showBorder ? `1.5px solid ${clr.borderColor}` : undefined,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header — centered, academic LaTeX style ── */}
      <div style={{
        textAlign: 'center',
        padding: `${typo.headerPaddingY}px ${typo.pagePaddingX}px ${Math.round(typo.headerPaddingY * 0.6)}px`,
        borderBottom: `1px solid ${clr.headingColor}`,
      }}>
        <h1 style={{
          fontSize: typo.headingFontSize + 4,
          fontWeight: 700,
          color: clr.headingColor,
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {fullName}
        </h1>
        {p.headline && (
          <p style={{ fontSize: bs + 1, color: clr.mutedColor, margin: '4px 0 0', fontStyle: 'italic' }}>
            {p.headline}
          </p>
        )}

        {/* Contact row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px 16px',
          justifyContent: 'center',
          marginTop: 8,
          fontSize: bs - 1,
          color: clr.mutedColor,
        }}>
          {p.phone && (
            <span>{p.phone}</span>
          )}
          {p.email && (
            <Link url={`mailto:${p.email}`}>{p.email}</Link>
          )}
          {p.location && <span>{p.location}</span>}
          {p.linkedIn && (
            <Link url={p.linkedIn}>{p.linkedIn.replace(/^https?:\/\/(www\.)?/i, '')}</Link>
          )}
          {p.github && (
            <Link url={p.github}>{p.github.replace(/^https?:\/\/(www\.)?/i, '')}</Link>
          )}
          {p.portfolio && (
            <Link url={p.portfolio}>{p.portfolio.replace(/^https?:\/\/(www\.)?/i, '')}</Link>
          )}
        </div>
      </div>

      {/* ── Body sections ── */}
      <div style={{ padding: `${typo.pagePaddingY}px ${typo.pagePaddingX}px` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: typo.sectionSpacing }}>
          {visKeys
            .filter(k => k !== 'personal')
            .map(k => {
              const renderer = sectionRenderers[k];
              if (!renderer) return null;
              const content = renderer();
              if (!content) return null;
              return <div key={k}>{content}</div>;
            })}
        </div>

        {/* Page number */}
        {clr.showPageNumbers && (
          <div style={{ textAlign: 'right', marginTop: 24, fontSize: bs - 2, color: clr.mutedColor }}>
            Page 1
          </div>
        )}
      </div>
    </div>
  );
}
