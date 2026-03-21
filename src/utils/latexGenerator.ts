/**
 * LaTeX Resume Generator
 * Converts ResumeEngine resume data into a clean, FAANG-style ATS-safe LaTeX document.
 * Based on the classic resume.cls style with custom modifications.
 */

import { Resume, ResumeData, TypographySettings } from '../types/resume';

/* ── helpers ─────────────────────────────────────────────────────── */
function fd(d: string): string {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1] ?? ''} ${y}`;
}

/** Escape LaTeX special characters */
function esc(s: string): string {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

/** Make a URL safe for LaTeX href */
function escUrl(url: string): string {
  if (!url) return '';
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  // Only escape % in URLs (other chars are fine in href)
  return href.replace(/%(?![0-9A-Fa-f]{2})/g, '\\%');
}

/** Render a LaTeX href link */
function href(url: string, label: string): string {
  if (!url) return esc(label);
  const h = escUrl(url);
  return `\\href{${h}}{${esc(label)}}`;
}

/** Format linespread from line height */
function lineSpread(lh: number): number {
  // LaTeX linespread factor: 1.0 linespread ≈ 1.2 line height
  return Math.max(0.8, Math.min(1.6, lh * 0.76));
}

/* ─────────────────────────────────────────────────────────────────
   Resume .cls content — embedded as a comment block for reference.
   The actual cls is referenced by \documentclass{resume}
   Users copy both files to Overleaf.
───────────────────────────────────────────────────────────────── */

export function generateLatex(resume: Resume): string {
  const d: ResumeData = resume.data;
  const p = d.personal;
  const typo: TypographySettings = resume.typography;
  const visKeys = resume.sections.filter(s => s.visible).map(s => s.key);

  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Your Name';

  /* ── Font package selection based on typography ── */
  const fontLower = typo.fontFamily.toLowerCase();
  const fontPkg =
    fontLower.includes('merriweather')
      ? '\\usepackage{merriweather}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('lato')
      ? '\\usepackage{lato}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('roboto')
      ? '\\usepackage[sfdefault]{roboto}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('source sans')
      ? '\\usepackage[default]{sourcesanspro}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('playfair')
      ? '% Playfair Display — use EB Garamond as closest LaTeX match\n\\usepackage[oldstyle]{ebgaramond}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('garamond') || fontLower.includes('eb garamond')
      ? '\\usepackage[oldstyle]{ebgaramond}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('charter') || fontLower.includes('bitstream')
      ? '\\usepackage[bitstream-charter]{mathdesign}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('helvetica') || fontLower.includes('helvet')
      ? '% Helvetica / Helvet\n\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('times')
      ? '\\usepackage{mathptmx}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('space grotesk') || fontLower.includes('dm sans')
      ? '% Modern sans-serif — using Inter/Helvetica as closest LaTeX match\n\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('georgia')
      ? '% Georgia — using Charter as closest LaTeX match\n\\usepackage[bitstream-charter]{mathdesign}\n\\usepackage[T1]{fontenc}'
    : fontLower.includes('computer modern') || fontLower.includes('latin modern')
      ? '% Computer Modern (LaTeX default — no package needed)\n\\usepackage{lmodern}\n\\usepackage[T1]{fontenc}'
    : '% Inter/System font — using Latin Modern as fallback\n\\usepackage{lmodern}\n\\usepackage[T1]{fontenc}';

  /* ── Margin calculation from typography ── */
  const mx = Math.max(0.3, Math.min(1.2, typo.pagePaddingX / 72)).toFixed(2);
  const my = Math.max(0.3, Math.min(1.2, typo.pagePaddingY / 72)).toFixed(2);
  const spread = lineSpread(typo.lineHeight).toFixed(2);

  /* ── Base font size ── */
  const fontSize = typo.baseFontSize >= 12 ? '12pt' : typo.baseFontSize >= 11 ? '11pt' : '10pt';

  /* ── Address lines ── */
  const addr1Parts: string[] = [];
  if (p.phone) addr1Parts.push(esc(p.phone));
  if (p.email) addr1Parts.push(href(`mailto:${p.email}`, p.email));
  const addr1 = addr1Parts.join(' , ');

  const addr2Parts: string[] = [];
  if (p.linkedIn) addr2Parts.push(href(p.linkedIn, p.linkedIn.replace(/^https?:\/\/(www\.)?/i, '')));
  if (p.location) addr2Parts.push(esc(p.location));
  if (p.github)   addr2Parts.push(href(p.github, p.github.replace(/^https?:\/\/(www\.)?/i, '')));
  const addr2 = addr2Parts.join(' -- ');

  const addr3Parts: string[] = [];
  if (p.portfolio) addr3Parts.push(href(p.portfolio, p.portfolio.replace(/^https?:\/\/(www\.)?/i, '')));
  if (p.headline)  addr3Parts.push(esc(p.headline));
  const addr3 = addr3Parts.join(' | ');

  /* ── Section renderers ── */
  const renderers: Record<string, () => string> = {

    summary: () => {
      if (!d.summary) return '';
      return `%==================== OBJECTIVE ====================
\\begin{rSection}{OBJECTIVE}
${esc(d.summary)}
\\end{rSection}

`;
    },

    education: () => {
      if (!d.education.length) return '';
      const rows = d.education.map(e => {
        const deg = e.degree && e.fieldOfStudy ? `{\\bf ${esc(e.degree)} in ${esc(e.fieldOfStudy)}}` : `{\\bf ${esc(e.degree || e.fieldOfStudy)}}`;
        const inst = e.institution ? `, ${esc(e.institution)}` : '';
        const loc  = e.location    ? `, ${esc(e.location)}`    : '';
        const gpa  = e.gpa         ? ` -- GPA: ${esc(e.gpa)}`  : '';
        const dates = `${fd(e.startDate)} -- ${fd(e.endDate)}`;
        return `${deg}${inst}${loc}${gpa} \\hfill ${esc(dates)}`;
      }).join('\\\\\n');
      return `%==================== EDUCATION ====================
\\begin{rSection}{EDUCATION}
${rows}
\\end{rSection}

`;
    },

    skills: () => {
      if (!d.skills.length) return '';
      const cats = ['Technical', 'Tools', 'Soft', 'Other'] as const;
      const grouped = cats.map(cat => {
        const sk = d.skills.filter(s => s.category === cat);
        return sk.length ? `{\\bf ${esc(cat)}:} ${sk.map(s => esc(s.name)).join(', ')}` : '';
      }).filter(Boolean);

      // Split into two columns if many skills
      const half = Math.ceil(grouped.length / 2);
      const col1 = grouped.slice(0, half);
      const col2 = grouped.slice(half);

      const allSkills = d.skills.map(s => esc(s.name));
      if (grouped.length <= 2) {
        // simple list
        return `%==================== SKILLS ====================
\\begin{rSection}{SKILLS}
\\begin{itemize}[leftmargin=*]
${allSkills.map(s => `  \\item ${s}`).join('\n')}
\\end{itemize}
\\end{rSection}

`;
      }

      return `%==================== SKILLS ====================
\\begin{rSection}{SKILLS}
\\begin{tabularx}{\\textwidth}{X X}
\\begin{itemize}[leftmargin=*]
${col1.map(s => `  \\item ${s}`).join('\n')}
\\end{itemize}
&
\\begin{itemize}[leftmargin=*]
${(col2.length ? col2 : ['{}']).map(s => `  \\item ${s}`).join('\n')}
\\end{itemize}
\\end{tabularx}
\\end{rSection}

`;
    },

    certifications: () => {
      if (!d.certifications.length) return '';
      const half = Math.ceil(d.certifications.length / 2);
      const col1 = d.certifications.slice(0, half);
      const col2 = d.certifications.slice(half);

      const renderCert = (c: typeof d.certifications[0]) => {
        const name = c.credentialUrl ? href(c.credentialUrl, c.name) : esc(c.name);
        const org  = c.organization  ? ` -- ${esc(c.organization)}`  : '';
        const date = c.issueDate     ? ` (${fd(c.issueDate)})`       : '';
        return `  \\item ${name}${org}${date}`;
      };

      if (d.certifications.length <= 3) {
        return `%==================== CERTIFICATIONS ====================
\\begin{rSection}{CERTIFICATIONS}
\\begin{itemize}[leftmargin=*]
${d.certifications.map(renderCert).join('\n')}
\\end{itemize}
\\end{rSection}

`;
      }

      return `%==================== CERTIFICATIONS ====================
\\begin{rSection}{CERTIFICATIONS}
\\begin{tabularx}{\\textwidth}{X X}
\\begin{itemize}[leftmargin=*]
${col1.map(renderCert).join('\n')}
\\end{itemize}
&
\\begin{itemize}[leftmargin=*]
${(col2.length ? col2 : []).map(renderCert).join('\n')}
\\end{itemize}
\\end{tabularx}
\\end{rSection}

`;
    },

    experience: () => {
      if (!d.experience.length) return '';
      const jobs = d.experience.map(e => {
        const dateRange = `${fd(e.startDate)} -- ${e.currentlyWorking ? 'Present' : fd(e.endDate)}`;
        const companyLine = e.location
          ? `\\textit{${esc(e.company)}, ${esc(e.location)}}`
          : `\\textit{${esc(e.company)}}`;
        const bullets = e.bullets.length
          ? `\\begin{itemize}[itemsep=0.15em]\n${e.bullets.map(b => `\\item ${esc(b.text)}`).join('\n')}\n\\end{itemize}`
          : '';
        const desc = e.description
          ? `${esc(e.description)}\n`
          : '';
        return `\\textbf{${esc(e.jobTitle)}} \\hfill ${esc(dateRange)}\\\\
${companyLine}
${desc}${bullets}`;
      }).join('\n\n');

      return `%==================== EXPERIENCE ====================
\\begin{rSection}{EXPERIENCE}

${jobs}

\\end{rSection}

`;
    },

    projects: () => {
      if (!d.projects.length) return '';
      const items = d.projects.map(pr => {
        const titleLink = pr.projectUrl ? href(pr.projectUrl, pr.title) : esc(pr.title);
        const ghLink    = pr.githubUrl  ? ` | ${href(pr.githubUrl, 'GitHub')}` : '';
        const tech      = pr.technologies ? `\\\\{\\em Tech: ${esc(pr.technologies)}}` : '';
        const desc      = pr.description  ? `\\\\${esc(pr.description)}` : '';
        return `  \\item \\textbf{${titleLink}}${ghLink}${desc}${tech}`;
      }).join('\n');
      return `%==================== PROJECTS ====================
\\begin{rSection}{PROJECTS}
\\begin{itemize}[leftmargin=*, itemsep=0.3em]
${items}
\\end{itemize}
\\end{rSection}

`;
    },

    achievements: () => {
      if (!d.achievements.length) return '';
      const items = d.achievements.map(a => {
        const date = a.date ? ` (${fd(a.date)})` : '';
        const org  = a.organization ? ` -- ${esc(a.organization)}` : '';
        const desc = a.description  ? `: ${esc(a.description)}` : '';
        return `  \\item \\textbf{${esc(a.title)}}${org}${date}${desc}`;
      }).join('\n');
      return `%==================== ACHIEVEMENTS ====================
\\begin{rSection}{ACHIEVEMENTS}
\\begin{itemize}[itemsep=0.1em]
${items}
\\end{itemize}
\\end{rSection}

`;
    },

    languages: () => {
      if (!d.languages.length) return '';
      const items = d.languages.map(l => `  \\item ${esc(l.name)} -- ${esc(l.proficiency)}`).join('\n');
      return `%==================== LANGUAGES ====================
\\begin{rSection}{LANGUAGES}
\\begin{itemize}[leftmargin=*]
${items}
\\end{itemize}
\\end{rSection}

`;
    },

    volunteer: () => {
      if (!d.volunteer.length) return '';
      const items = d.volunteer.map(v => {
        const dateRange = `${fd(v.startDate)} -- ${fd(v.endDate)}`;
        return `\\textbf{${esc(v.role)}} \\hfill ${esc(dateRange)}\\\\
\\textit{${esc(v.organization)}}
${v.description ? `\\\\${esc(v.description)}` : ''}`;
      }).join('\n\n');
      return `%==================== VOLUNTEER ====================
\\begin{rSection}{VOLUNTEER EXPERIENCE}
${items}
\\end{rSection}

`;
    },

    publications: () => {
      if (!d.publications.length) return '';
      const items = d.publications.map(pub => {
        const titleLink = pub.url ? href(pub.url, pub.title) : esc(pub.title);
        const pub2 = pub.publisher ? ` -- ${esc(pub.publisher)}` : '';
        const date = pub.date     ? ` (${fd(pub.date)})`        : '';
        const desc = pub.description ? `\\\\${esc(pub.description)}` : '';
        return `  \\item ${titleLink}${pub2}${date}${desc}`;
      }).join('\n');
      return `%==================== PUBLICATIONS ====================
\\begin{rSection}{PUBLICATIONS}
\\begin{itemize}[leftmargin=*]
${items}
\\end{itemize}
\\end{rSection}

`;
    },

    references: () => {
      if (!d.references.length) return '';
      const items = d.references.map(r => {
        const email = r.email ? ` | ${href(`mailto:${r.email}`, r.email)}` : '';
        const comp  = r.company ? ` at ${esc(r.company)}` : '';
        return `  \\item \\textbf{${esc(r.name)}} -- ${esc(r.title)}${comp}${email}`;
      }).join('\n');
      return `%==================== REFERENCES ====================
\\begin{rSection}{REFERENCES}
\\begin{itemize}[leftmargin=*]
${items}
\\end{itemize}
\\end{rSection}

`;
    },
  };

  /* ── Build body sections in order ── */
  const body = visKeys
    .filter(k => k !== 'personal')
    .map(k => renderers[k]?.() ?? '')
    .filter(Boolean)
    .join('');

  /* ── Address lines ── */
  const addressLines: string[] = [];
  if (addr1) addressLines.push(`\\address{${addr1}}`);
  if (addr2) addressLines.push(`\\address{${addr2}}`);
  if (addr3) addressLines.push(`\\address{${addr3}}`);

  return `\\linespread{${spread}}
\\documentclass[${fontSize},letterpaper]{resume}

\\usepackage[left=${mx}in,top=${my}in,right=${mx}in,bottom=${my}in]{geometry}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{enumitem}
${fontPkg}
\\setlist[itemize]{topsep=1pt, partopsep=0pt, parsep=0pt}

% hyperref is already loaded by resume.cls
\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=blue,
  citecolor=black
}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot[R]{\\thepage}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\newcommand{\\tab}[1]{\\hspace{.2667\\textwidth}\\rlap{#1}}
\\newcommand{\\itab}[1]{\\hspace{0em}\\rlap{#1}}

\\name{${esc(fullName)}}
${addressLines.join('\n')}

\\begin{document}

${body}\\end{document}
`;
}

/* ─────────────────────────────────────────────────────────────────
   resume.cls source — users paste this as a second file in Overleaf
───────────────────────────────────────────────────────────────── */
export const RESUME_CLS = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Resume Class File — Resume Engine Export
% Based on original by Trey Hunner
% Modified: No ALL CAPS name, no diamond separators
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\ProvidesClass{resume}[2025/07/11 Resume Engine Resume class]

\\LoadClass[11pt,letterpaper]{article}

\\usepackage[parfill]{parskip}
\\usepackage{array}
\\usepackage{ifthen}
\\usepackage{hyperref}

\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  filecolor=magenta,
  urlcolor=blue,
}

\\pagestyle{empty}

%-------------------------------------------
%  NAME AND ADDRESS
%-------------------------------------------

\\def \\name#1{\\def\\@name{#1}}
\\def \\@name {}

\\def \\addressSep {\\\\}

\\let \\@addressone \\relax
\\let \\@addresstwo \\relax
\\let \\@addressthree \\relax

\\def \\address #1{
  \\@ifundefined{@addresstwo}{
    \\def \\@addresstwo {#1}
  }{
  \\@ifundefined{@addressthree}{
    \\def \\@addressthree {#1}
  }{
     \\def \\@addressone {#1}
  }}
}

\\def \\printaddress #1{
  \\begingroup
    \\def \\\\ {\\addressSep\\ }
    \\centerline{#1}
  \\endgroup
  \\par
  \\addressskip
}

\\def \\printname {
  \\begingroup
    \\hfil{{\\namesize\\bf \\@name}}\\hfil
    \\nameskip\\break
  \\endgroup
}

%-------------------------------------------
%  PRINT HEADER
%-------------------------------------------

\\let\\ori@document=\\document
\\renewcommand{\\document}{
  \\ori@document
  \\printname
  \\@ifundefined{@addressone}{}{\\printaddress{\\@addressone}}
  \\@ifundefined{@addresstwo}{}{\\printaddress{\\@addresstwo}}
  \\@ifundefined{@addressthree}{}{\\printaddress{\\@addressthree}}
}

%-------------------------------------------
%  SECTION FORMATTING
%-------------------------------------------

\\newenvironment{rSection}[1]{
  \\sectionskip
  \\MakeUppercase{{\\bf #1}}
  \\sectionlineskip
  \\hrule
  \\begin{list}{}{
    \\setlength{\\leftmargin}{0em}
  }
  \\item[]
}{
  \\end{list}
}

%-------------------------------------------
%  WORK EXPERIENCE FORMAT
%-------------------------------------------

\\newenvironment{rSubsection}[4]{
 {\\bf #1} \\hfill {#2}
 \\ifthenelse{\\equal{#3}{}}{}{
  \\\\
  {\\em #3} \\hfill {\\em #4}
  }\\smallskip
  \\begin{list}{$\\cdot$}{\\leftmargin=0em}
   \\itemsep -0.5em \\vspace{-0.5em}
}{
  \\end{list}
  \\vspace{0.5em}
}

%-------------------------------------------
%  SPACING
%-------------------------------------------

\\def\\namesize{\\LARGE}
\\def\\addressskip{\\smallskip}
\\def\\sectionlineskip{\\medskip}
\\def\\nameskip{\\medskip}
\\def\\sectionskip{\\medskip}
`;
