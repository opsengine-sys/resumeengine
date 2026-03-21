/**
 * LaTeXViewInline — standalone LaTeX code viewer/editor for PreviewPanel.
 */
import { useState, useRef, ReactElement } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { generateLatex, RESUME_CLS } from '../../utils/latexGenerator';

type Tab = 'main' | 'cls';

export default function LaTeXViewInline({ resumeId }: { resumeId: string }) {
  const resume             = useResumeStore(s => s.resumes.find(r => r.id === resumeId));
  const updateCustomSection = useResumeStore(s => s.updateCustomSection);

  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [editMode,  setEditMode]  = useState(false);
  const [editText,  setEditText]  = useState('');
  const [copied,    setCopied]    = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!resume) return null;

  /* Auto-generated code */
  const autoMain = generateLatex(resume);
  const autoCls  = RESUME_CLS;

  /* Custom overrides stored as hidden section labels */
  const customMain = resume.sections.find(s => s.key === '__latex_main__')?.label ?? '';
  const customCls  = resume.sections.find(s => s.key === '__latex_cls__')?.label  ?? '';

  const displayMain = customMain || autoMain;
  const displayCls  = customCls  || autoCls;
  const activeCode  = activeTab === 'main' ? displayMain : displayCls;
  const isCustom    = activeTab === 'main' ? !!customMain : !!customCls;

  const handleEdit = () => {
    setEditText(activeCode);
    setEditMode(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleApply = () => {
    const key = activeTab === 'main' ? '__latex_main__' : '__latex_cls__';
    updateCustomSection(key, { label: editText });
    setEditMode(false);
  };

  const handleReset = () => {
    const key = activeTab === 'main' ? '__latex_main__' : '__latex_cls__';
    updateCustomSection(key, { label: '' });
    setEditMode(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* Syntax highlight */
  function highlight(code: string): ReactElement[] {
    return code.split('\n').map((line, i) => {
      const trimmed = line.trim();
      const color = trimmed.startsWith('%') ? '#6a9955'
                  : /^\\[a-zA-Z]/.test(trimmed) ? '#569cd6'
                  : /^\{|\}$/.test(trimmed) ? '#ffd700'
                  : '#d4d4d4';
      return (
        <span key={i} style={{ color, display: 'block', lineHeight: '1.65' }}>
          {line || '\u00a0'}
        </span>
      );
    });
  }

  const toolBg   = '#1e1e2e';
  const codeBg   = '#12121c';
  const borderC  = '#2d2d3d';

  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100%',
      background: codeBg, color:'#d4d4d4',
      fontFamily:'"JetBrains Mono","Fira Code","Consolas",monospace',
    }}>
      {/* AI tip banner */}
      <div style={{
        background:'#0d2137', borderBottom:`1px solid ${borderC}`,
        padding:'8px 16px', fontSize:'12px', color:'#7ec8e3', lineHeight:1.5,
        flexShrink:0,
      }}>
        <strong style={{color:'#10b981'}}>New to LaTeX?</strong>
        {' '}Copy code → paste into{' '}
        {[
          ['ChatGPT','https://chat.openai.com'],
          ['Claude','https://claude.ai'],
          ['Gemini','https://gemini.google.com'],
        ].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{color:'#34d399', textDecoration:'underline', marginRight:6}}>
            {label}
          </a>
        ))}
        → compile on{' '}
        <a href="https://overleaf.com" target="_blank" rel="noopener noreferrer"
          style={{color:'#34d399', textDecoration:'underline'}}>Overleaf</a>.
        {isCustom && (
          <span style={{marginLeft:12, color:'#f59e0b', fontWeight:600}}>
            ● Custom edits active — auto-sync paused
          </span>
        )}
      </div>

      {/* Tab bar + actions */}
      <div style={{
        display:'flex', alignItems:'center', gap:'6px',
        padding:'6px 12px', background:toolBg,
        borderBottom:`1px solid ${borderC}`, flexShrink:0,
      }}>
        <div style={{display:'flex', gap:'2px'}}>
          {(['main','cls'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setEditMode(false); }} style={{
              padding:'4px 12px', borderRadius:'6px 6px 0 0', border:'none',
              cursor:'pointer', fontSize:'12px', fontWeight: activeTab===tab ? 700 : 400,
              background: activeTab===tab ? codeBg : 'transparent',
              color:      activeTab===tab ? '#10b981' : '#6b7280',
              borderBottom: activeTab===tab ? '2px solid #10b981' : '2px solid transparent',
              transition:'all 0.15s',
            }}>
              {tab==='main' ? 'resume.tex' : 'resume.cls'}
              {(tab==='main' && customMain) || (tab==='cls' && customCls) ? ' ⬤' : ''}
            </button>
          ))}
        </div>

        <div style={{flex:1}}/>

        {!editMode ? (
          <div style={{display:'flex', gap:'6px'}}>
            <button onClick={handleEdit} style={{
              padding:'4px 10px', borderRadius:'6px', border:`1px solid ${borderC}`,
              background:'#1e2d40', color:'#7ec8e3', cursor:'pointer', fontSize:'12px', fontWeight:600,
            }}>✏️ Edit</button>
            {isCustom && (
              <button onClick={handleReset} style={{
                padding:'4px 10px', borderRadius:'6px', border:'1px solid #7c3aed44',
                background:'#2d1b4e', color:'#a78bfa', cursor:'pointer', fontSize:'12px',
              }}>↺ Reset</button>
            )}
            <button onClick={handleCopy} style={{
              padding:'4px 10px', borderRadius:'6px', border:`1px solid ${borderC}`,
              background: copied ? '#064e3b' : '#1a2e1a', color: copied ? '#10b981' : '#6ee7b7',
              cursor:'pointer', fontSize:'12px', fontWeight:600, transition:'all 0.2s',
            }}>{copied ? '✓ Copied!' : '⎘ Copy'}</button>
          </div>
        ) : (
          <div style={{display:'flex', gap:'6px'}}>
            <button onClick={handleApply} style={{
              padding:'4px 10px', borderRadius:'6px', border:'none',
              background:'#065f46', color:'#6ee7b7', cursor:'pointer', fontSize:'12px', fontWeight:600,
            }}>✓ Apply Changes</button>
            <button onClick={() => setEditMode(false)} style={{
              padding:'4px 10px', borderRadius:'6px', border:`1px solid ${borderC}`,
              background:'transparent', color:'#6b7280', cursor:'pointer', fontSize:'12px',
            }}>✕ Cancel</button>
          </div>
        )}
      </div>

      {/* Code / editor area */}
      <div style={{flex:1, overflow:'auto', position:'relative'}}>
        {editMode ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            spellCheck={false}
            style={{
              width:'100%', height:'100%', background:codeBg, color:'#d4d4d4',
              fontFamily:'"JetBrains Mono","Fira Code","Consolas",monospace',
              fontSize:'12.5px', lineHeight:'1.65', padding:'16px',
              border:'none', outline:'none', resize:'none',
              boxSizing:'border-box', whiteSpace:'pre', caretColor:'#10b981',
            }}
          />
        ) : (
          <pre style={{
            margin:0, padding:'16px', fontSize:'12.5px',
            lineHeight:'1.65', overflow:'visible', background:'transparent',
          }}>
            {highlight(activeCode)}
          </pre>
        )}
      </div>
    </div>
  );
}
