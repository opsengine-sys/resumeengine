import { Resume, ResumeData, TypographySettings, ColorSettings } from '../types/resume';
import { TEMPLATES } from '../data/defaultData';

/* ── helpers ─────────────────────────────────────────────────────── */
function fd(d: string): string {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1] ?? ''} ${y}`;
}

function esc(s: string): string {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Creates a real clickable <a> tag.
 * CRITICAL FIX: Use INLINE hex color (not CSS var) so links render in ALL print engines.
 * Add display:inline so the link text is never hidden.
 */
function linkTag(url: string, label: string, linkColor: string, extraStyle = '') {
  if (!url || !label) return esc(label || url);
  const href = toHref(url);
  return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer"
    style="color:${linkColor};text-decoration:underline;text-underline-offset:2px;display:inline;${extraStyle}"
  >${esc(label)}</a>`;
}

const GFONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&family=Space+Grotesk:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap';

/* ─────────────────────────────────────────────────────────────────
   buildResumeHtml — generates fully self-contained HTML for print.
   ALL styles are inline so nothing depends on Tailwind/CSS classes.
   Hyperlinks use inline hex colors (not CSS vars) for print compat.
───────────────────────────────────────────────────────────────── */
function buildResumeHtml(resume: Resume): string {
  const template  = TEMPLATES.find(t => t.id === resume.templateId) || TEMPLATES[0];
  const typo: TypographySettings = resume.typography;
  const clr: ColorSettings = resume.colors ?? {
    textColor: '#1f2937', headingColor: '#111827', linkColor: '#2563eb',
    mutedColor: '#6b7280', showBorder: false, borderColor: '#e5e7eb',
    showPageNumbers: false,
  };
  const { primaryColor } = template;
  const d: ResumeData = resume.data;
  const p = d.personal;
  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Your Name';
  const bs       = typo.baseFontSize;
  const nameSz   = typo.nameFontSize   ?? 26;
  const subHSz   = typo.subHeadingFontSize ?? (bs + 2);
  // Use actual hex for link color (not CSS var) — critical for print
  const LINK = clr.linkColor || '#2563eb';
  // Style helpers
  const companyFW    = typo.companyStyle    === 'bold'   ? '700' : '400';
  const companyFS    = typo.companyStyle    === 'italic' ? 'italic' : 'normal';
  const dateFW       = typo.dateStyle       === 'bold'   ? '700' : '400';
  const dateFS       = typo.dateStyle       === 'italic' ? 'italic' : 'normal';
  const instFW       = typo.institutionStyle === 'bold'  ? '700' : '400';
  const instFS       = typo.institutionStyle === 'italic'? 'italic' : 'normal';
  const secTitleFW   = typo.sectionTitleStyle === 'bold' ? '700' : typo.sectionTitleStyle === 'normal' ? '500' : '700';
  const secTitleFS   = typo.sectionTitleStyle === 'italic' ? 'italic' : 'normal';
  // Case transform helpers
  const applyCase = (text: string, caseType: string) => {
    if (!text) return '';
    switch (caseType) {
      case 'uppercase':  return text.toUpperCase();
      case 'lowercase':  return text.toLowerCase();
      case 'capitalize': return text.replace(/\b\w/g, c => c.toUpperCase());
      default:           return text;
    }
  };
  const nCase   = typo.nameCase       ?? 'normal';
  const hCase   = typo.headingCase    ?? 'uppercase';
  const shCase  = typo.subHeadingCase ?? 'normal';

  const visKeys = resume.sections.filter(s => s.visible).map(s => s.key);
  const sectionLabel = (key: string): string => {
    const s = resume.sections.find(sec => sec.key === key);
    return s?.label ?? key;
  };

  /* ── LaTeX/ATS template: academic centered header style ── */
  const isLatex = resume.templateId === 'latex';
  const headingBorderColor = isLatex ? clr.headingColor : primaryColor;

  /* ── Section heading ── */
  const sectionHead = (key: string) => {
    const rawTitle = sectionLabel(key);
    const title = applyCase(rawTitle, hCase);
    const hSz = typo.headingFontSize ?? (bs + 1);
    if (isLatex) {
      return `
        <div style="margin-top:${typo.sectionSpacing}px;margin-bottom:${Math.round(typo.sectionSpacing * 0.35)}px;">
          <div style="font-weight:${secTitleFW};font-style:${secTitleFS};font-size:${hSz}px;color:${clr.headingColor};letter-spacing:0.06em;margin-bottom:3px;">${esc(title)}</div>
          <div style="border-top:1.5px solid ${clr.headingColor};"></div>
        </div>`;
    }
    return `
      <div style="margin-top:${typo.sectionSpacing}px;margin-bottom:${Math.round(typo.sectionSpacing * 0.4)}px;">
        <h2 style="color:${clr.headingColor};font-size:${hSz}px;font-weight:${secTitleFW};font-style:${secTitleFS};
                   letter-spacing:1.5px;
                   border-bottom:2px solid ${headingBorderColor};padding-bottom:3px;margin:0;">${esc(title)}</h2>
      </div>`;
  };

  /* ── Sub-heading helper (job title, degree title) ── */
  const subHead = (text: string, extraStyle = '') =>
    `<h3 style="color:${clr.headingColor};font-size:${subHSz}px;font-weight:700;margin:0;${extraStyle}">${esc(applyCase(text, shCase))}</h3>`;

  /* ── Company / institution helper ── */
  const companySpan = (text: string, isInst = false) => {
    const fw = isInst ? instFW : companyFW;
    const fs = isInst ? instFS : companyFS;
    return `<span style="font-weight:${fw};font-style:${fs};">${esc(text)}</span>`;
  };
  /* ── Date span helper ── */
  const dateSpan = (text: string) =>
    `<span style="font-size:${bs-1}px;color:${clr.mutedColor};white-space:nowrap;font-weight:${dateFW};font-style:${dateFS};">${text}</span>`;

  /* ── Section renderers ── */
  const sections: Record<string, () => string> = {

    summary: () => !d.summary ? '' : `
      ${sectionHead('summary')}
      <p style="color:${clr.textColor};font-size:${bs}px;line-height:${typo.lineHeight};margin:0;">${esc(d.summary)}</p>`,

    experience: () => !d.experience.length ? '' : `
      ${sectionHead('experience')}
      <div style="display:flex;flex-direction:column;gap:${typo.itemSpacing}px;">
        ${d.experience.map(e => `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                ${subHead(e.jobTitle)}
                <p style="color:${isLatex ? clr.mutedColor : primaryColor};font-size:${bs+1}px;margin:0;">
                  ${companySpan(e.company)}${e.location ? ` &bull; <span style="font-size:${bs-1}px;">${esc(e.location)}</span>` : ''}
                </p>
              </div>
              <div style="margin-left:8px;flex-shrink:0;">${dateSpan(`${fd(e.startDate)} &ndash; ${e.currentlyWorking ? 'Present' : fd(e.endDate)}`)}</div>
            </div>
            ${e.description ? `<p style="font-size:${bs}px;color:${clr.textColor};margin:3px 0 0;line-height:${typo.lineHeight};">${esc(e.description)}</p>` : ''}
            ${e.bullets.length ? `<ul style="margin:4px 0 0;padding-left:${isLatex ? '18' : '0'}px;list-style:${isLatex ? 'disc' : 'none'};">
              ${e.bullets.map(b => isLatex
                ? `<li style="font-size:${bs}px;color:${clr.textColor};line-height:${typo.lineHeight};margin-bottom:2px;">${esc(b.text)}</li>`
                : `<li style="display:flex;align-items:flex-start;gap:6px;font-size:${bs}px;color:${clr.textColor};line-height:${typo.lineHeight};margin-bottom:2px;">
                    <span style="color:${primaryColor};flex-shrink:0;margin-top:2px;">&#9679;</span>${esc(b.text)}</li>`
              ).join('')}
            </ul>` : ''}
          </div>`).join('')}
      </div>`,

    education: () => !d.education.length ? '' : `
      ${sectionHead('education')}
      <div style="display:flex;flex-direction:column;gap:${typo.itemSpacing}px;">
        ${d.education.map(e => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              ${subHead(`${e.degree}${e.fieldOfStudy ? ' in ' + e.fieldOfStudy : ''}`)}
              <p style="color:${isLatex ? clr.mutedColor : primaryColor};font-size:${bs+1}px;margin:0;">
                ${companySpan(e.institution, true)}${e.location ? ` &bull; <span style="font-size:${bs-1}px;">${esc(e.location)}</span>` : ''}
              </p>
              ${e.gpa ? `<p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:0;">GPA: ${esc(e.gpa)}</p>` : ''}
            </div>
            <div style="margin-left:8px;flex-shrink:0;">${dateSpan(`${fd(e.startDate)} &ndash; ${fd(e.endDate)}`)}</div>
          </div>`).join('')}
      </div>`,

    skills: () => !d.skills.length ? '' : `
      ${sectionHead('skills')}
      ${(['Technical','Tools','Soft','Other'] as const).map(cat => {
        const sk = d.skills.filter(s => s.category === cat);
        if (!sk.length) return '';
        if (isLatex) {
          return `<div style="margin-bottom:4px;font-size:${bs}px;">
            <strong style="color:${clr.headingColor};">${cat}: </strong>
            <span style="color:${clr.textColor};">${sk.map(s => esc(s.name)).join(', ')}</span>
          </div>`;
        }
        return `<div style="margin-bottom:5px;">
          <span style="font-size:${bs-1}px;font-weight:700;color:${clr.mutedColor};text-transform:uppercase;letter-spacing:1px;">${cat}: </span>
          ${sk.map(s => `<span style="display:inline-block;background:${primaryColor}18;color:${primaryColor};
            border:1px solid ${primaryColor}30;border-radius:4px;padding:1px 7px;
            font-size:${bs-1}px;font-weight:500;margin:2px;">${esc(s.name)}</span>`).join('')}
        </div>`;
      }).join('')}`,

    projects: () => !d.projects.length ? '' : `
      ${sectionHead('projects')}
      <div style="display:flex;flex-direction:column;gap:${typo.itemSpacing}px;">
        ${d.projects.map(pr => `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <h3 style="color:${clr.headingColor};font-size:${subHSz}px;font-weight:700;margin:0;text-transform:${shCase === 'normal' ? 'none' : shCase};">
                ${pr.projectUrl ? linkTag(pr.projectUrl, pr.title, LINK) : esc(applyCase(pr.title, shCase))}
              </h3>
              <div style="display:flex;gap:8px;flex-shrink:0;margin-left:8px;align-items:center;">
                ${pr.projectUrl ? linkTag(pr.projectUrl, 'View ↗', LINK, `font-size:${bs-1}px;`) : ''}
                ${pr.githubUrl  ? linkTag(pr.githubUrl,  'GitHub ↗', LINK, `font-size:${bs-1}px;`) : ''}
              </div>
            </div>
            ${pr.description ? `<p style="font-size:${bs}px;color:${clr.textColor};margin:2px 0 0;line-height:${typo.lineHeight};">${esc(pr.description)}</p>` : ''}
            ${pr.technologies ? `<p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:2px 0 0;font-style:italic;">${esc(pr.technologies)}</p>` : ''}
          </div>`).join('')}
      </div>`,

    certifications: () => !d.certifications.length ? '' : `
      ${sectionHead('certifications')}
      <div style="display:flex;flex-direction:column;gap:${Math.round(typo.itemSpacing * 0.7)}px;">
        ${d.certifications.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <h3 style="color:${clr.headingColor};font-size:${subHSz}px;font-weight:700;margin:0;">
                ${c.credentialUrl ? linkTag(c.credentialUrl, applyCase(c.name, shCase), LINK) : esc(applyCase(c.name, shCase))}
              </h3>
              <p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:0;">
                ${esc(c.organization)}
              </p>
            </div>
            <span style="font-size:${bs-1}px;color:${clr.mutedColor};white-space:nowrap;margin-left:8px;flex-shrink:0;">${fd(c.issueDate)}${c.expiryDate ? ` &ndash; ${fd(c.expiryDate)}` : ''}</span>
          </div>`).join('')}
      </div>`,

    achievements: () => !d.achievements.length ? '' : `
      ${sectionHead('achievements')}
      <div style="display:flex;flex-direction:column;gap:${Math.round(typo.itemSpacing * 0.7)}px;">
        ${d.achievements.map(a => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <h3 style="color:${clr.headingColor};font-size:${bs+1}px;font-weight:700;margin:0;">${esc(a.title)}</h3>
              ${a.organization ? `<p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:0;">${esc(a.organization)}</p>` : ''}
              ${a.description  ? `<p style="font-size:${bs-1}px;color:${clr.textColor};margin:2px 0 0;line-height:${typo.lineHeight};">${esc(a.description)}</p>` : ''}
            </div>
            ${a.date ? `<span style="font-size:${bs-1}px;color:${clr.mutedColor};white-space:nowrap;margin-left:8px;flex-shrink:0;">${fd(a.date)}</span>` : ''}
          </div>`).join('')}
      </div>`,

    languages: () => !d.languages.length ? '' : `
      ${sectionHead('languages')}
      <div style="display:flex;flex-wrap:wrap;gap:16px;">
        ${d.languages.map(l => {
          const levels = ['Basic','Intermediate','Advanced','Fluent','Native'];
          const idx = levels.indexOf(l.proficiency);
          if (isLatex) {
            return `<span style="font-size:${bs}px;color:${clr.textColor};"><strong>${esc(l.name)}</strong> — ${esc(l.proficiency)}</span>`;
          }
          const dots = [1,2,3,4,5].map(i =>
            `<div style="width:20px;height:4px;border-radius:2px;background:${i<=idx+1?primaryColor:'#e5e7eb'};display:inline-block;margin-right:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`
          ).join('');
          return `<div>
            <p style="color:${clr.headingColor};font-size:${bs+1}px;font-weight:600;margin:0;">${esc(l.name)}</p>
            <div style="margin-top:3px;">${dots}</div>
            <p style="font-size:${bs-2}px;color:${clr.mutedColor};margin:2px 0 0;">${esc(l.proficiency)}</p>
          </div>`;
        }).join('')}
      </div>`,

    volunteer: () => !d.volunteer.length ? '' : `
      ${sectionHead('volunteer')}
      <div style="display:flex;flex-direction:column;gap:${typo.itemSpacing}px;">
        ${d.volunteer.map(v => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <h3 style="color:${clr.headingColor};font-size:${bs+1}px;font-weight:700;margin:0;">${esc(v.role)}</h3>
              <p style="color:${isLatex ? clr.mutedColor : primaryColor};font-size:${bs}px;font-weight:${isLatex ? 400 : 600};font-style:${isLatex ? 'italic' : 'normal'};margin:0;">${esc(v.organization)}</p>
              ${v.description ? `<p style="font-size:${bs-1}px;color:${clr.textColor};margin:2px 0 0;line-height:${typo.lineHeight};">${esc(v.description)}</p>` : ''}
            </div>
            <span style="font-size:${bs-1}px;color:${clr.mutedColor};white-space:nowrap;margin-left:8px;flex-shrink:0;">
              ${fd(v.startDate)} &ndash; ${fd(v.endDate)}
            </span>
          </div>`).join('')}
      </div>`,

    publications: () => !d.publications.length ? '' : `
      ${sectionHead('publications')}
      <div style="display:flex;flex-direction:column;gap:${Math.round(typo.itemSpacing * 0.7)}px;">
        ${d.publications.map(pub => `
          <div>
            <h3 style="color:${clr.headingColor};font-size:${bs+1}px;font-weight:700;margin:0;">
              ${pub.url ? linkTag(pub.url, pub.title, LINK) : esc(pub.title)}
            </h3>
            <p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:0;">
              ${esc(pub.publisher)}${pub.date ? ` &bull; ${fd(pub.date)}` : ''}
            </p>
          </div>`).join('')}
      </div>`,

    references: () => !d.references.length ? '' : `
      ${sectionHead('references')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${d.references.map(r => `
          <div>
            <h3 style="color:${clr.headingColor};font-size:${bs+1}px;font-weight:700;margin:0;">${esc(r.name)}</h3>
            <p style="font-size:${bs-1}px;color:${clr.textColor};margin:0;">${esc(r.title)}${r.company ? ` at ${esc(r.company)}` : ''}</p>
            ${r.email ? `<p style="font-size:${bs-1}px;margin:0;">${linkTag('mailto:'+r.email, r.email, LINK)}</p>` : ''}
            ${r.phone ? `<p style="font-size:${bs-1}px;color:${clr.mutedColor};margin:0;">${esc(r.phone)}</p>` : ''}
          </div>`).join('')}
      </div>`,
  };

  /* ── Header — LaTeX uses centered academic style, others use colored block ── */
  let header: string;

  if (isLatex) {
    const contactParts: string[] = [];
    if (p.phone)     contactParts.push(`<span>${esc(p.phone)}</span>`);
    if (p.email)     contactParts.push(linkTag(`mailto:${p.email}`, p.email, LINK));
    if (p.location)  contactParts.push(`<span>${esc(p.location)}</span>`);
    if (p.linkedIn)  contactParts.push(linkTag(p.linkedIn, p.linkedIn.replace(/^https?:\/\/(www\.)?/i,''), LINK));
    if (p.github)    contactParts.push(linkTag(p.github,   p.github.replace(/^https?:\/\/(www\.)?/i,''),   LINK));
    if (p.portfolio) contactParts.push(linkTag(p.portfolio,p.portfolio.replace(/^https?:\/\/(www\.)?/i,''),LINK));

    header = `
      <div style="text-align:center;padding:${typo.headerPaddingY}px ${typo.pagePaddingX}px ${Math.round(typo.headerPaddingY*0.6)}px;border-bottom:1px solid ${clr.headingColor};">
        <h1 style="font-size:${nameSz}px;font-weight:700;color:${clr.headingColor};margin:0;letter-spacing:-0.02em;text-transform:${nCase === 'normal' ? 'none' : nCase};">${esc(fullName)}</h1>
        ${p.headline ? `<p style="font-size:${bs+1}px;color:${clr.mutedColor};margin:4px 0 0;font-style:italic;">${esc(p.headline)}</p>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:2px 16px;justify-content:center;margin-top:8px;font-size:${bs-1}px;color:${clr.mutedColor};">
          ${contactParts.join('<span style="color:#d1d5db;margin:0 2px;">·</span>')}
        </div>
      </div>`;
  } else {
    /* Colored header for other templates */
    const contactItem = (icon: string, text: string, url?: string) => {
      if (!text) return '';
      // CRITICAL: use inline hex color on the <a> tag, NOT CSS var
      const inner = url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"
               style="color:rgba(255,255,255,0.95);text-decoration:underline;text-underline-offset:2px;display:inline;">${esc(text)}</a>`
        : `<span style="color:rgba(255,255,255,0.88);">${esc(text)}</span>`;
      return `<span style="font-size:${bs-1}px;color:rgba(255,255,255,0.88);display:inline-flex;align-items:center;gap:4px;">
        <span style="font-size:${bs}px;">${icon}</span>${inner}</span>`;
    };
    header = `
      <div style="background:${primaryColor};padding:${typo.headerPaddingY}px ${typo.pagePaddingX}px;
        -webkit-print-color-adjust:exact;print-color-adjust:exact;">
        <div style="display:flex;align-items:center;gap:20px;">
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(fullName)}"
            style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4);flex-shrink:0;" />` : ''}
          <div>
            <h1 style="font-size:${nameSz}px;font-weight:800;color:#ffffff;
              letter-spacing:-0.025em;margin:0;text-transform:${nCase === 'normal' ? 'none' : nCase};">${esc(fullName)}</h1>
            ${p.headline ? `<p style="font-size:${bs+2}px;color:rgba(255,255,255,0.85);margin:2px 0 0;font-weight:500;">${esc(p.headline)}</p>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:10px;">
          ${contactItem('✉', p.email, p.email ? `mailto:${p.email}` : '')}
          ${contactItem('📞', p.phone)}
          ${contactItem('📍', p.location)}
          ${contactItem('🔗', p.linkedIn, p.linkedIn ? toHref(p.linkedIn) : '')}
          ${contactItem('💻', p.github, p.github ? toHref(p.github) : '')}
          ${contactItem('🌐', p.portfolio, p.portfolio ? toHref(p.portfolio) : '')}
        </div>
      </div>`;
  }

  /* ── Body ── */
  const body = visKeys
    .filter(k => k !== 'personal')
    .map(k => sections[k]?.() ?? '')
    .join('');

  /* ── Border & page numbers ── */
  const borderCss = clr.showBorder
    ? `border: 1.5px solid ${clr.borderColor} !important;`
    : '';

  const pageNumberCss = clr.showPageNumbers ? `
    @page { counter-increment: page; }
    #page-num-footer {
      display: block !important;
      text-align: right;
      padding: 6px ${typo.pagePaddingX}px 10px;
      font-size: ${bs - 2}px;
      color: ${clr.mutedColor};
    }
    #page-num-footer::after {
      content: "Page " counter(page);
    }
  ` : `#page-num-footer { display: none !important; }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${esc(resume.name)} — Resume</title>
  <!-- base target: all links open in new tab when clicked in preview window -->
  <base target="_blank" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="${GFONTS}" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #ffffff;
      font-family: ${typo.fontFamily}, sans-serif;
      font-size: ${bs}px;
      line-height: ${typo.lineHeight};
      color: ${clr.textColor};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1,h2,h3,h4,h5,h6,p,ul,li { margin:0; padding:0; }

    /* CRITICAL: Links must always be visible — use explicit colors, NOT CSS vars */
    a {
      color: ${LINK} !important;
      text-decoration: underline !important;
      text-underline-offset: 2px !important;
      display: inline !important;
    }
    a:hover { opacity: 0.85; }

    ${pageNumberCss}

    /* ── Screen: centered A4 preview ── */
    @media screen {
      body {
        margin: 0;
        padding: 24px;
        background: #e8eaed;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
      }
      #resume-page {
        width: 210mm;
        min-height: 297mm;
        background: white;
        box-shadow: 0 4px 32px rgba(0,0,0,0.18);
        border-radius: 2px;
        overflow: visible;
        position: relative;
        ${borderCss}
      }
    }

    /* ── Print: zero margin so resume fills page exactly ── */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        display: block !important;
        width: 210mm !important;
      }
      #print-bar {
        display: none !important;
      }
      #resume-page {
        width: 210mm !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        overflow: visible !important;
        ${borderCss}
      }
      /* Only avoid breaks inside small atomic items — NOT every div */
      li, tr, .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      /* Let section blocks break naturally */
      .section-block {
        break-inside: auto;
        page-break-inside: auto;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      /* CRITICAL: Links must render with color and underline in PDF.
         Chrome PDF writer respects href only when display:inline is set. */
      a, a:link, a:visited, a:hover, a:active {
        color: ${LINK} !important;
        text-decoration: underline !important;
        text-underline-offset: 2px !important;
        display: inline !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-text-fill-color: ${LINK} !important;
      }
      a * { color: ${LINK} !important; -webkit-text-fill-color: ${LINK} !important; }
    }
  </style>
</head>
<body>
  <div id="resume-page">
    ${header}
    <div style="padding:${typo.pagePaddingY}px ${typo.pagePaddingX}px;">
      ${body}
    </div>
    <div id="page-num-footer"></div>
  </div>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────────
   printResume — opens popup window with resume + green toolbar.
   User sees resume, clicks "Print / Save PDF" to open print dialog.
───────────────────────────────────────────────────────────────── */
export function printResume(_elementId: string, resume: Resume): void {
  const resumeHtml = buildResumeHtml(resume);

  const printBar = `
    <div id="print-bar" style="
      position:fixed;top:0;left:0;right:0;z-index:9999;
      background:linear-gradient(135deg,#064E3B 0%,#047857 100%);
      color:white;padding:10px 20px;
      display:flex;align-items:center;justify-content:space-between;
      font-family:'Inter',system-ui,sans-serif;font-size:13px;
      box-shadow:0 2px 16px rgba(0,0,0,0.25);gap:16px;flex-wrap:wrap;
    ">
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
        <svg width="26" height="28" viewBox="0 0 95 105" style="flex-shrink:0;">
          <defs>
            <linearGradient id="g1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"  stop-color="#BEF264"/>
              <stop offset="40%" stop-color="#34D399"/>
              <stop offset="100%" stop-color="#0D9488"/>
            </linearGradient>
          </defs>
          <path d="M25 0 H85 A10 10 0 0 1 95 10 V95 A10 10 0 0 1 85 105 H10 A10 10 0 0 1 0 95 V25 Z" fill="url(#g1)"/>
          <path d="M0 25 L25 25 L25 0 Z" fill="#0F766E" opacity="0.82"/>
          <rect x="20" y="42" width="55" height="10" rx="5" fill="white" opacity="0.92"/>
          <rect x="20" y="62" width="55" height="10" rx="5" fill="white" opacity="0.92"/>
          <rect x="20" y="82" width="38" height="10" rx="5" fill="white" opacity="0.92"/>
        </svg>
        <span style="font-weight:700;font-size:15px;letter-spacing:-0.3px;">
          <span style="color:#10B981;">Resume</span><span style="color:#ecfdf5;">Engine</span>
        </span>
        <span style="opacity:0.35;">|</span>
        <span style="opacity:0.8;font-size:12px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${resume.name}
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
        <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:6px 12px;font-size:11px;opacity:0.9;line-height:1.6;">
          <b>💡 Save as PDF:</b> Click Print → Destination: <i>Save as PDF</i> → Save<br/>
          <span style="opacity:0.7;">Tip: In print settings, enable "Background graphics" to preserve colors</span>
        </div>
        <button onclick="window.print()" style="
          background:#10B981;border:none;color:white;
          padding:10px 24px;border-radius:10px;font-size:13px;font-weight:700;
          cursor:pointer;letter-spacing:0.2px;white-space:nowrap;
          box-shadow:0 2px 10px rgba(16,185,129,0.5);
        ">🖨 Print / Save PDF</button>
      </div>
    </div>
    <style>
      @media print { #print-bar { display:none !important; } }
      @media screen { body { padding-top: 70px !important; } }
    </style>`;

  const fullHtml = resumeHtml.replace('<body>', `<body>${printBar}`);

  // ── CRITICAL FIX: Use Blob URL so browser treats it as a real loaded page.
  // document.write() in a popup strips <a href> processing in some browsers/print engines.
  // A Blob URL forces the browser to fully parse HTML including all hyperlinks,
  // which means links are clickable AND preserved when saving to PDF.
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const win = window.open(blobUrl, '_blank', 'width=1050,height=1200,scrollbars=yes,resizable=yes');
  if (!win) {
    // Fallback: try direct navigation if popup blocked
    URL.revokeObjectURL(blobUrl);
    alert(
      'Pop-up blocked! Please allow pop-ups for this site:\n\n' +
      '• Chrome: Click the 🚫 icon in the address bar → "Always allow pop-ups"\n' +
      '• Firefox: Click "Options" in the notification bar → "Allow pop-ups"\n' +
      '• Safari: Safari menu → Settings → Websites → Pop-up Windows → Allow\n\n' +
      'Then click Print again.'
    );
    return;
  }

  // Revoke blob URL after the window has loaded to free memory
  win.addEventListener('load', () => {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  });

  win.focus();
}

export function exportToPdf(elementId: string, resume: Resume): void {
  printResume(elementId, resume);
}
