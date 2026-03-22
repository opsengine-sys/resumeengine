/**
 * latexGenerator.ts
 * Generates LaTeX .tex and .cls files from resume data
 */

import { Resume } from '../types/resume';

/**
 * The resume.cls content as a constant (used by PreviewPanel)
 */
export const RESUME_CLS = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Resume Class File
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\ProvidesClass{resume}[2026/01/15 Resume class]

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

\\def \\name#1{\\def\\@name{#1}}
\\def \\@name {}

\\def \\addressSep {\\\\}

\\let \\@addressone \\relax
\\let \\@addresstwo \\relax
\\let \\@addressthree \\relax

\\def \\address #1{
  \\@ifundefined{@addressone}{
    \\def \\@addressone {#1}
  }{
  \\@ifundefined{@addresstwo}{
    \\def \\@addresstwo {#1}
  }{
     \\def \\@addressthree {#1}
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

\\let\\ori@document=\\document
\\renewcommand{\\document}{
  \\ori@document
  \\printname
  \\@ifundefined{@addressone}{}{\\printaddress{\\@addressone}}
  \\@ifundefined{@addresstwo}{}{\\printaddress{\\@addresstwo}}
  \\@ifundefined{@addressthree}{}{\\printaddress{\\@addressthree}}
}

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

\\def\\namesize{\\LARGE}
\\def\\addressskip{\\smallskip}
\\def\\sectionlineskip{\\medskip}
\\def\\nameskip{\\medskip}
\\def\\sectionskip{\\medskip}
`;

/**
 * Generates the main .tex file content
 */
export function generateLatexMain(resume: Resume): string {
  try {
    const d = resume?.data;
    const p = d?.personal;

    if (!d || !p) {
      return '\\documentclass[11pt]{article}\\begin{document}No data.\\end{document}';
    }

    const typo = (resume as any).typography || {};
    const baseSize = typo.baseFontSize || 11;
    const lineSpread = typo.lineHeight ? (typo.lineHeight / 1.1).toFixed(2) : '0.94';
    const leftMargin = ((typo.pagePaddingX || 38) / 96).toFixed(2);
    const topMargin = ((typo.pagePaddingY || 38) / 96).toFixed(2);

    const esc = (s: string) => {
      if (!s) return '';
      return s.replace(/([#$%&_{}])/g, '\\$1').replace(/\n/g, '\\\\\n');
    };

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function fd(dt: string): string {
      if (!dt) return '';
      const parts = dt.split('-');
      const y = parts[0] || '';
      const m = parts[1];
      if (m) {
        const idx = parseInt(m, 10) - 1;
        if (idx >= 0 && idx < 12) return MONTHS[idx] + ' ' + y;
      }
      return y;
    }

    function makeUrl(link: string, text?: string): string {
      if (!link) return '';
      const display = text || link.replace(/^https?:\/\/(www\.)?/i, '');
      return '\\href{' + link + '}{' + esc(display) + '}';
    }

    const fullName = ((p.firstName || '') + ' ' + (p.lastName || '')).trim() || 'Your Name';

    let tex = '\\documentclass[' + baseSize + 'pt]{resume}\n\n';
    tex += '\\linespread{' + lineSpread + '}\n';
    tex += '\\usepackage[left=' + leftMargin + 'in,top=' + topMargin + 'in,right=' + leftMargin + 'in,bottom=0.7in]{geometry}\n';
    tex += '\\usepackage{fancyhdr}\n';
    tex += '\\usepackage{tabularx}\n';
    tex += '\\usepackage{enumitem}\n';
    tex += '\\setlist[itemize]{topsep=1pt, partopsep=0pt, parsep=0pt}\n\n';
    tex += '\\hypersetup{\n';
    tex += '  colorlinks=true,\n';
    tex += '  linkcolor=black,\n';
    tex += '  urlcolor=blue,\n';
    tex += '  citecolor=black\n';
    tex += '}\n\n';
    tex += '\\pagestyle{fancy}\n';
    tex += '\\fancyhf{}\n';
    tex += '\\fancyfoot[R]{\\thepage}\n';
    tex += '\\renewcommand{\\headrulewidth}{0pt}\n';
    tex += '\\renewcommand{\\footrulewidth}{0pt}\n\n';

    tex += '\\name{' + esc(fullName) + '}\n';

    const addr1: string[] = [];
    if (p.phone) addr1.push(esc(p.phone));
    if (p.email) addr1.push(makeUrl('mailto:' + p.email, p.email));
    if (addr1.length > 0) {
      tex += '\\address{' + addr1.join(' , ') + '}\n';
    }

    const addr2: string[] = [];
    if (p.linkedIn) addr2.push(makeUrl(p.linkedIn));
    if (p.github) addr2.push(makeUrl(p.github));
    if (p.portfolio) addr2.push(makeUrl(p.portfolio));
    const links = addr2.join(' | ');
    if (links || p.location) {
      tex += '\\address{' + links + (links && p.location ? ' -- ' : '') + esc(p.location || '') + '}\n';
    }

    tex += '\n\\begin{document}\n\n';

    const sections = Array.isArray(resume.sections) ? resume.sections : [];
    const visibleSections = sections.filter(s => !s.hidden && s.key !== 'personal');

    visibleSections.forEach(section => {
      const label = (section.label || '').toUpperCase();

      if (section.key === 'summary' && d.summary) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += esc(d.summary) + '\n';
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'education' && d.education && d.education.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        d.education.forEach(e => {
          tex += '{\\bf ' + esc(e.degree || '');
          if (e.fieldOfStudy) tex += ' in ' + esc(e.fieldOfStudy);
          tex += '}, ' + esc(e.institution || '');
          if (e.location) tex += ', ' + esc(e.location);
          tex += ' \\hfill ' + fd(e.startDate) + ' -- ' + fd(e.endDate);
          if (e.gpa) tex += '\\\\ GPA: ' + esc(e.gpa);
          tex += '\\\\\n';
        });
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'skills' && d.skills && d.skills.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += '\\begin{tabularx}{\\textwidth}{X X}\n';
        const skills = d.skills.map(s => esc(s.name || ''));
        const mid = Math.ceil(skills.length / 2);
        const left = skills.slice(0, mid);
        const right = skills.slice(mid);
        tex += '\\begin{itemize}[leftmargin=*]\n';
        left.forEach(sk => { tex += '  \\item ' + sk + '\n'; });
        tex += '\\end{itemize}\n&\n';
        tex += '\\begin{itemize}[leftmargin=*]\n';
        right.forEach(sk => { tex += '  \\item ' + sk + '\n'; });
        tex += '\\end{itemize}\n';
        tex += '\\end{tabularx}\n';
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'certifications' && d.certifications && d.certifications.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += '\\begin{tabularx}{\\textwidth}{X X}\n';
        const certs = d.certifications.map(c => c.organization ? esc(c.name || '') + ' -- ' + esc(c.organization) : esc(c.name || ''));
        const mid = Math.ceil(certs.length / 2);
        const left = certs.slice(0, mid);
        const right = certs.slice(mid);
        tex += '\\begin{itemize}[leftmargin=*]\n';
        left.forEach(cert => { tex += ' \\item ' + cert + '\n'; });
        tex += '\\end{itemize}\n &\n';
        tex += '\\begin{itemize}[leftmargin=*]\n';
        right.forEach(cert => { tex += ' \\item ' + cert + '\n'; });
        tex += '\\end{itemize}\n';
        tex += '\\end{tabularx}\n';
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'experience' && d.experience && d.experience.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n\n';
        d.experience.forEach(e => {
          tex += '\\textbf{' + esc(e.jobTitle || '') + '} \\hfill ' + fd(e.startDate) + ' -- ' + (e.currentlyWorking ? 'Present' : fd(e.endDate)) + '\\\\\n';
          tex += '\\textit{' + esc(e.company || '');
          if (e.location) tex += ', ' + esc(e.location);
          tex += '}\n';
          const bullets = Array.isArray(e.bullets) ? e.bullets : [];
          if (bullets.length > 0) {
            tex += '\\begin{itemize}[itemsep=0.15em]\n';
            bullets.forEach(b => {
              tex += '\\item ' + esc(b.text || '') + '\n';
            });
            tex += '\\end{itemize}\n\n';
          }
        });
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'projects' && d.projects && d.projects.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n\n';
        d.projects.forEach(proj => {
          const title = proj.projectUrl ? makeUrl(proj.projectUrl, proj.title) : esc(proj.title || '');
          tex += '\\textbf{' + title + '}';
          if (proj.githubUrl) tex += ' | ' + makeUrl(proj.githubUrl, 'GitHub');
          tex += '\\\\\n';
          if (proj.description) tex += esc(proj.description) + '\\\\\n';
          if (proj.technologies) tex += '\\textit{Tech: ' + esc(proj.technologies) + '}\\\\\n';
          tex += '\n';
        });
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'achievements' && d.achievements && d.achievements.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += '\\begin{itemize}[itemsep=0.1em]\n';
        d.achievements.forEach(a => {
          tex += '  \\item ' + esc(a.title || '');
          if (a.organization) tex += ': ' + esc(a.organization);
          if (a.date) tex += ' (' + fd(a.date) + ')';
          if (a.description) tex += ' -- ' + esc(a.description);
          tex += '\n';
        });
        tex += '\\end{itemize}\n';
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'languages' && d.languages && d.languages.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        d.languages.forEach(l => {
          tex += '\\textbf{' + esc(l.name || '') + '} -- ' + esc(l.proficiency || '') + ' \\quad ';
        });
        tex += '\n\\end{rSection}\n\n';
      }

      else if (section.key === 'volunteer' && d.volunteer && d.volunteer.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n\n';
        d.volunteer.forEach(v => {
          tex += '\\textbf{' + esc(v.role || '') + '} \\hfill ' + fd(v.startDate) + ' -- ' + fd(v.endDate) + '\\\\\n';
          tex += '\\textit{' + esc(v.organization || '') + '}\\\\\n';
          if (v.description) tex += esc(v.description) + '\\\\\n';
          tex += '\n';
        });
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'publications' && d.publications && d.publications.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += '\\begin{itemize}[itemsep=0.1em]\n';
        d.publications.forEach(pub => {
          const title = pub.url ? makeUrl(pub.url, pub.title) : esc(pub.title || '');
          tex += '  \\item ' + title;
          if (pub.publisher) tex += ' -- ' + esc(pub.publisher);
          if (pub.date) tex += ' (' + fd(pub.date) + ')';
          tex += '\n';
        });
        tex += '\\end{itemize}\n';
        tex += '\\end{rSection}\n\n';
      }

      else if (section.key === 'references' && d.references && d.references.length > 0) {
        tex += '\\begin{rSection}{' + label + '}\n';
        tex += '\\begin{itemize}[itemsep=0.1em]\n';
        d.references.forEach(ref => {
          tex += '  \\item \\textbf{' + esc(ref.name || '') + '}';
          if (ref.title) tex += ' -- ' + esc(ref.title);
          if (ref.company) tex += ' at ' + esc(ref.company);
          if (ref.email) tex += ' | ' + makeUrl('mailto:' + ref.email, ref.email);
          if (ref.phone) tex += ' | ' + esc(ref.phone);
          tex += '\n';
        });
        tex += '\\end{itemize}\n';
        tex += '\\end{rSection}\n\n';
      }
    });

    tex += '\\vspace{0.6em}\n';
    tex += '\\begin{center}\n';
    tex += '{\\large \\textbf{***}}\n';
    tex += '\\end{center}\n';
    tex += '\\end{document}\n';

    return tex;

  } catch (error) {
    console.error('LaTeX generation error:', error);
    return '';
  }
}

/**
 * Generates the resume.cls file (same content as RESUME_CLS)
 */
export function generateLatexCls(): string {
  return RESUME_CLS;
}

/**
 * Download .tex file
 */
export function downloadTexFile(resume: Resume) {
  try {
    const content = generateLatexMain(resume);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download .tex error:', error);
  }
}

/**
 * Download .cls file
 */
export function downloadClsFile() {
  try {
    const content = generateLatexCls();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'resume.cls';
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download .cls error:', error);
  }
}
/**
 * Alias - PreviewPanel.tsx imports this name
 */
export const generateLatex = generateLatexMain;