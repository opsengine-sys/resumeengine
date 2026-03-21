import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// framer-motion used by Banner component
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface Props { onEnterBuilder: () => void; }

/* ─────────────────────────────────────────────
   In-view hook — re-triggers on enter AND leave
───────────────────────────────────────────── */
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   Wireframe Canvas — neural mesh, full page
───────────────────────────────────────────── */
function WireframeCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLS   = 22, ROWS = 16;
    const NODES  = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      phase: Math.random() * Math.PI * 2,
      r: 1.5 + Math.random() * 2,
    }));

    let scroll = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cw = W / COLS, ch = H / ROWS;
      const alpha = isDark ? 0.07 : 0.09;

      // scrolling horizontal grid lines
      scroll = (scroll + 0.18) % ch;
      ctx.strokeStyle = isDark ? `rgba(52,211,153,${alpha})` : `rgba(16,185,129,${alpha})`;
      ctx.lineWidth = 0.7;
      for (let r = -1; r <= ROWS + 1; r++) {
        const y = r * ch + scroll;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // vertical grid lines (static)
      for (let c = 0; c <= COLS; c++) {
        const x = c * cw;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // nodes drift
      const t = Date.now() / 1000;
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        const pulse = 0.5 + 0.5 * Math.sin(t + n.phase);

        // glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 70);
        g.addColorStop(0, isDark ? `rgba(52,211,153,${0.18 * pulse})` : `rgba(16,185,129,${0.13 * pulse})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, 70, 0, Math.PI * 2); ctx.fill();

        // core dot
        ctx.fillStyle = isDark ? `rgba(52,211,153,${0.35 + 0.25 * pulse})` : `rgba(16,185,129,${0.28 + 0.2 * pulse})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (0.8 + 0.4 * pulse), 0, Math.PI * 2); ctx.fill();
      });

      // connecting lines
      for (let a = 0; a < NODES.length; a++) {
        for (let b = a + 1; b < NODES.length; b++) {
          const dx = NODES[a].x - NODES[b].x, dy = NODES[a].y - NODES[b].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 220) {
            const op = (1 - d / 220) * (isDark ? 0.16 : 0.12);
            ctx.strokeStyle = isDark ? `rgba(52,211,153,${op})` : `rgba(16,185,129,${op})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath(); ctx.moveTo(NODES[a].x, NODES[a].y); ctx.lineTo(NODES[b].x, NODES[b].y); ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [isDark]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

/* ─────────────────────────────────────────────
   WebGL Shader Background — subtle, full-page
───────────────────────────────────────────── */
function ShaderBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const startRef  = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) return;

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;
    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2  u_res;
      uniform float u_dark;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u2 = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u2.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u2.x), u2.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 4; i++) { v += a*noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t  = u_time * 0.08;
        vec2 q = vec2(fbm(uv + t*0.4), fbm(uv + 1.2));
        vec2 r = vec2(fbm(uv + q + vec2(1.7,9.2) + t*0.25),
                      fbm(uv + q + vec2(8.3,2.8) + t*0.20));
        float f = fbm(uv + r);
        vec3 c1 = vec3(0.024, 0.306, 0.231);
        vec3 c2 = vec3(0.063, 0.725, 0.506);
        vec3 c3 = vec3(0.204, 0.827, 0.600);
        vec3 c4 = vec3(0.745, 0.949, 0.392);
        vec3 col = mix(c1, c2, clamp(f*2.0, 0.0, 1.0));
        col = mix(col, c3, clamp(f*f*3.0, 0.0, 1.0));
        col = mix(col, c4, clamp(pow(f,4.0)*4.0, 0.0, 1.0));
        float alpha = u_dark > 0.5 ? 0.038 : 0.022;
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_res');
    const uDark = gl.getUniformLocation(prog, 'u_dark');

    const draw = () => {
      const t = (Date.now() - startRef.current) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDark, isDark ? 1.0 : 0.0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Gear icon for UpgradeBanner
───────────────────────────────────────────── */
function GearIcon({ color }: { color: string }) {
  return (
    <svg height="14" viewBox="0 0 16 16" width="14" fill={color}>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M9.49999 0H6.49999L6.22628 1.45975C6.1916 1.64472 6.05544 1.79299 5.87755 1.85441C5.6298 1.93996 5.38883 2.04007 5.15568 2.15371C4.98644 2.2362 4.78522 2.22767 4.62984 2.12136L3.40379 1.28249L1.28247 3.40381L2.12135 4.62986C2.22766 4.78524 2.23619 4.98646 2.1537 5.15569C2.04005 5.38885 1.93995 5.62981 1.8544 5.87756C1.79297 6.05545 1.6447 6.19162 1.45973 6.2263L0 6.5V9.5L1.45973 9.7737C1.6447 9.80838 1.79297 9.94455 1.8544 10.1224C1.93995 10.3702 2.04006 10.6112 2.1537 10.8443C2.23619 11.0136 2.22767 11.2148 2.12136 11.3702L1.28249 12.5962L3.40381 14.7175L4.62985 13.8786C4.78523 13.7723 4.98645 13.7638 5.15569 13.8463C5.38884 13.9599 5.6298 14.06 5.87755 14.1456C6.05544 14.207 6.1916 14.3553 6.22628 14.5403L6.49999 16H9.49999L9.77369 14.5403C9.80837 14.3553 9.94454 14.207 10.1224 14.1456C10.3702 14.06 10.6111 13.9599 10.8443 13.8463C11.0135 13.7638 11.2147 13.7723 11.3701 13.8786L12.5962 14.7175L14.7175 12.5962L13.8786 11.3701C13.7723 11.2148 13.7638 11.0135 13.8463 10.8443C13.9599 10.6112 14.06 10.3702 14.1456 10.1224C14.207 9.94455 14.3553 9.80839 14.5402 9.7737L16 9.5V6.5L14.5402 6.2263C14.3553 6.19161 14.207 6.05545 14.1456 5.87756C14.06 5.62981 13.9599 5.38885 13.8463 5.1557C13.7638 4.98647 13.7723 4.78525 13.8786 4.62987L14.7175 3.40381L12.5962 1.28249L11.3701 2.12137C11.2148 2.22768 11.0135 2.2362 10.8443 2.15371C10.6111 2.04007 10.3702 1.93996 10.1224 1.85441C9.94454 1.79299 9.80837 1.64472 9.77369 1.45974L9.49999 0ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Banner — 21st.dev UpgradeBanner style
───────────────────────────────────────────── */
function Banner({ isDark }: { isDark: boolean }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('re-banner-v3') === '1'; } catch { return false; }
  });
  const [hovered, setHovered] = useState(false);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('re-banner-v3', '1'); } catch {}
  };

  const gearColor   = isDark ? '#34D399' : '#059669';
  const borderColor = isDark ? '#1e3a2f' : '#a7f3d0';
  const bgColor     = isDark ? '#06193A' : '#F0FDF4';
  const textMain    = isDark ? '#d1fae5' : '#064E3B';
  const textAccent  = isDark ? '#34D399' : '#065F46';

  const gearVariants = {
    hidden: { x: 0, y: 0, opacity: 0, rotate: 0 },
    visible: (c: { x: number; y: number }) => ({
      x: c.x, y: c.y, opacity: 1, rotate: 360,
      transition: {
        x: { duration: 0.35, ease: 'easeOut' as const },
        y: { duration: 0.35, ease: 'easeOut' as const },
        opacity: { duration: 0.25 },
        rotate: { duration: 1.1, type: 'spring' as const, stiffness: 90, damping: 10 },
      },
    }),
  };

  if (dismissed) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1, padding: '10px 0' }}>
      <AnimatePresence>
        <motion.div
          style={{ position: 'relative' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        >
          {/* Gear top-left */}
          <motion.div
            initial="hidden"
            animate={hovered ? 'visible' : 'hidden'}
            variants={gearVariants}
            custom={{ x: -13, y: -12 }}
            style={{ position: 'absolute', left: 4, top: 2, pointerEvents: 'none' }}
          >
            <GearIcon color={gearColor} />
          </motion.div>

          {/* Gear bottom-right */}
          <motion.div
            initial="hidden"
            animate={hovered ? 'visible' : 'hidden'}
            variants={gearVariants}
            custom={{ x: 13, y: 11 }}
            style={{ position: 'absolute', bottom: 2, left: '5.5rem', pointerEvents: 'none' }}
          >
            <GearIcon color={gearColor} />
          </motion.div>

          {/* Pill */}
          <div style={{
            position: 'relative', display: 'flex', height: 36,
            alignItems: 'center', gap: 6,
            borderRadius: 8, border: `1px solid ${borderColor}`,
            background: bgColor,
            paddingLeft: 12, paddingRight: 6,
            boxShadow: isDark ? '0 2px 24px rgba(0,0,0,0.4)' : '0 2px 14px rgba(16,185,129,0.12)',
            backdropFilter: 'blur(14px)',
          }}>
            {/* Underline button text */}
            <button
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                color: textAccent, padding: '0 2px', outline: 'none',
                textDecoration: 'underline',
                textDecorationColor: isDark ? 'rgba(52,211,153,0.3)' : 'rgba(16,185,129,0.3)',
                textUnderlineOffset: 4,
                transition: 'color 0.2s',
              }}
            >
              Resume Engine is actively being built.
            </button>

            {/* Description */}
            <span style={{ fontSize: 13, color: textMain, whiteSpace: 'nowrap' }}>
              New features and templates added regularly.
            </span>

            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 99,
              background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${isDark ? 'rgba(52,211,153,0.28)' : 'rgba(16,185,129,0.22)'}`,
              color: textAccent, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 2,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
                background: isDark ? '#34D399' : '#10B981',
                boxShadow: `0 0 5px ${isDark ? '#34D399' : '#10B981'}`,
              }} />
              In Development
            </span>

            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 5,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: textAccent, marginLeft: 2, flexShrink: 0,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12 }}>
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat card — no gradient boxes, plain color
───────────────────────────────────────────── */
function StatCard({ label, val, suffix, delay, isDark, sub }: {
  label: string; val: number; suffix: string; delay: number;
  isDark: boolean; sub: string;
}) {
  const { ref, visible } = useInView(0.2);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '6px',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)'
          : 'translateY(24px) scale(0.96)',
        transition: `opacity 0.5s ease-out ${delay}s, transform ${hovered ? '0.35s cubic-bezier(0.34,1.56,0.64,1)' : `0.5s ease-out ${delay}s`}`,
        cursor: 'default', padding: '20px 12px', borderRadius: '16px',
        background: hovered
          ? isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)'
          : 'transparent',
      }}
    >
      {/* Number — plain color, no gradient clip */}
      <div style={{
        fontSize: 'clamp(2.2rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1,
        color: hovered ? '#10B981' : (isDark ? '#34D399' : '#059669'),
        transition: 'color 0.3s ease', letterSpacing: '-0.02em',
      }}>
        {visible ? <Counter to={val} suffix={suffix} /> : `0${suffix}`}
      </div>
      {/* Label */}
      <div style={{
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: hovered ? '#10B981' : sub,
        transition: 'color 0.3s ease',
      }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hover Button (Serafim / 21st.dev style)
───────────────────────────────────────────── */
function HoverButton({ onClick, children, large = false }: {
  onClick: () => void; children: React.ReactNode; large?: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos]   = useState({ x: 50, y: 50 });
  const [hov, setHov]   = useState(false);

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <button ref={btnRef} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onMouseMove={onMove}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        gap: '10px', padding: large ? '1.1rem 2.5rem' : '0.85rem 2rem',
        borderRadius: '14px', border: 'none', cursor: 'pointer',
        fontSize: large ? '1rem' : '0.875rem', fontWeight: 700, color: '#fff',
        background: 'linear-gradient(135deg,#10B981 0%,#0D9488 100%)',
        boxShadow: hov
          ? '0 8px 40px rgba(16,185,129,0.45), 0 2px 12px rgba(16,185,129,0.25)'
          : '0 4px 20px rgba(16,185,129,0.25)',
        transform: hov ? 'scale(1.04) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        overflow: 'hidden', letterSpacing: '-0.01em',
      }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s ease',
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(190,242,100,0.35) 0%, rgba(52,211,153,0.18) 40%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s ease',
        boxShadow: 'inset 0 0 0 1.5px rgba(190,242,100,0.55)',
        pointerEvents: 'none',
      }} />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </button>
  );
}

function OutlineButton({ onClick, children, isDark }: { onClick: () => void; children: React.ReactNode; isDark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '0.85rem 1.75rem', borderRadius: '14px',
        border: `1.5px solid ${hov ? 'rgba(16,185,129,0.5)' : (isDark ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.22)')}`,
        background: hov ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)') : 'transparent',
        color: hov ? '#10B981' : (isDark ? '#94a3b8' : '#64748b'),
        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        transform: hov ? 'scale(1.03) translateY(-1px)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const NAV = ['Features', 'Templates', 'How it works', 'Privacy', 'Feedback'];


const FEATURES = [
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    title: '12+ Resume Sections', desc: 'Personal info, experience, education, skills, projects, certifications, languages, volunteer work, publications and more.', grad: ['#34d399', '#10b981'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>),
    title: '7 Professional Templates', desc: 'Modern, Classic, Executive, Minimal, Bold, Navy — plus ATS-safe LaTeX (FAANG) template with live code preview.', grad: ['#2dd4bf', '#14b8a6'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
    title: 'Live Real-Time Preview', desc: 'Every keystroke reflected instantly in your A4 resume preview. Zoom in/out, fit to screen, switch templates on the fly.', grad: ['#a3e635', '#10b981'],
  },

  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>),
    title: 'LaTeX / ATS Export', desc: 'Generate FAANG-standard LaTeX code. Edit with syntax highlighting, compile on Overleaf, or customize with AI.', grad: ['#14b8a6', '#0d9488'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>),
    title: '100% Private & Local', desc: 'Your data never leaves your browser. Saved in localStorage — no accounts, no servers, no tracking. Ever.', grad: ['#34d399', '#84cc16'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>),
    title: 'Skills Extractor', desc: 'Automatically scan your experience, certifications and achievements to surface relevant technical and soft skills.', grad: ['#10b981', '#059669'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>),
    title: 'Summary Generator', desc: 'Generate a tailored professional summary from your experience, skills and achievements in one click.', grad: ['#0d9488', '#0f766e'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20, color: '#fff' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>),
    title: 'Content Rephraser', desc: 'Improve any bullet point or description with power action verbs. Available on every text field in the builder.', grad: ['#064e3b', '#10b981'],
  },
];

const TEMPLATES = [
  {
    name: 'LaTeX / FAANG', tag: 'ATS Safe', tagColor: '#10B981', tagBg: 'rgba(16,185,129,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <text x="80" y="20" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1a1a1a" fontFamily="serif">RAJENDRA A</text>
        <line x1="12" y1="26" x2="148" y2="26" stroke="#1a1a1a" strokeWidth="0.8" />
        <text x="80" y="34" textAnchor="middle" fontSize="4.5" fill="#555">rajendra@email.com · Hyderabad, India</text>
        <text x="12" y="48" fontSize="6" fontWeight="700" fill="#1a1a1a" fontFamily="serif">EXPERIENCE</text>
        <line x1="12" y1="51" x2="148" y2="51" stroke="#333" strokeWidth="0.5" />
        <text x="12" y="60" fontSize="5.2" fontWeight="700" fill="#111">Senior Software Engineer</text>
        <text x="148" y="60" textAnchor="end" fontSize="4.5" fill="#444">2022 – Present</text>
        <text x="12" y="67" fontSize="4.5" fontStyle="italic" fill="#666">Tech Corp · San Francisco</text>
        {[74, 80, 86].map(y => <g key={y}><circle cx="16" cy={y - 1} r="1" fill="#555" /><rect x="20" y={y - 3} width={60 + y % 22} height="1.5" rx="0.5" fill="#d1d5db" /></g>)}
        <text x="12" y="102" fontSize="6" fontWeight="700" fill="#1a1a1a" fontFamily="serif">EDUCATION</text>
        <line x1="12" y1="105" x2="148" y2="105" stroke="#333" strokeWidth="0.5" />
        <text x="12" y="114" fontSize="5" fontWeight="600" fill="#222">B.S. Computer Science</text>
        <text x="148" y="114" textAnchor="end" fontSize="4.5" fill="#555">2018 – 2022</text>
        <text x="12" y="136" fontSize="6" fontWeight="700" fill="#1a1a1a" fontFamily="serif">SKILLS</text>
        <line x1="12" y1="139" x2="148" y2="139" stroke="#333" strokeWidth="0.5" />
        {[146, 153, 160].map(y => <g key={y}><circle cx="16" cy={y - 1} r="1" fill="#555" /><rect x="20" y={y - 3} width={50 + y % 30} height="1.5" rx="0.5" fill="#d1d5db" /></g>)}
      </svg>
    ),
  },
  {
    name: 'Modern', tag: 'Popular', tagColor: '#3b82f6', tagBg: 'rgba(59,130,246,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <defs><linearGradient id="mod-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#0891b2" /></linearGradient></defs>
        <rect width="160" height="52" fill="url(#mod-g)" />
        <circle cx="26" cy="26" r="14" fill="rgba(255,255,255,0.18)" />
        <text x="46" y="21" fontSize="8.5" fontWeight="700" fill="#fff">Krishna VL</text>
        <text x="46" y="30" fontSize="5" fill="rgba(255,255,255,0.85)">Product Manager</text>
        <text x="46" y="38" fontSize="4" fill="rgba(255,255,255,0.65)">krishna@email.com</text>
        <rect x="8" y="60" width="30" height="2" rx="1" fill="#0ea5e9" />
        <line x1="8" y1="65" x2="152" y2="65" stroke="#e2e8f0" strokeWidth="0.5" />
        {[72, 78, 84].map(y => <rect key={y} x="8" y={y} width={70 + y % 30} height="1.5" rx="0.5" fill="#e2e8f0" />)}
        <rect x="8" y="98" width="40" height="2" rx="1" fill="#0ea5e9" />
        {[110, 116, 122, 128].map(y => <rect key={y} x="8" y={y} width={55 + y % 40} height="1.5" rx="0.5" fill="#e2e8f0" />)}
        {[0, 1, 2, 3].map(i => <rect key={i} x={8 + i * 36} y="148" width="30" height="7" rx="3.5" fill="#dbeafe" />)}
      </svg>
    ),
  },
  {
    name: 'Executive', tag: 'Two-Column', tagColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <defs><linearGradient id="exec-g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4f46e5" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
        <rect width="52" height="210" fill="url(#exec-g)" />
        <circle cx="26" cy="28" r="14" fill="rgba(255,255,255,0.18)" />
        {[55, 62, 68, 74, 80, 86, 92, 98].map(y => <rect key={y} x="9" y={y} width="34" height="1.5" rx="0.5" fill="rgba(255,255,255,0.2)" />)}
        <text x="62" y="18" fontSize="8.5" fontWeight="700" fill="#1e1b4b">Ameer Basha</text>
        <text x="62" y="27" fontSize="5.5" fill="#6366f1">Engineering Director</text>
        <rect x="62" y="33" width="90" height="1.5" rx="0.75" fill="#4f46e5" />
        {[40, 47, 54, 61, 84, 91, 98, 105, 112].map(y => <rect key={y} x="62" y={y} width="90" height="1.5" rx="0.5" fill="#e0e7ff" />)}
      </svg>
    ),
  },
  {
    name: 'Minimal', tag: 'Clean', tagColor: '#6b7280', tagBg: 'rgba(107,114,128,0.1)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <rect width="160" height="3" fill="#10b981" />
        <text x="14" y="21" fontSize="10" fontWeight="700" fill="#111827">Vishal K</text>
        <text x="14" y="30" fontSize="5" fill="#6b7280" fontStyle="italic">UX Designer · vishal@email.com</text>
        <line x1="14" y1="36" x2="146" y2="36" stroke="#e5e7eb" strokeWidth="0.8" />
        <text x="14" y="48" fontSize="5.5" fontWeight="700" fill="#10b981">Experience</text>
        <rect x="14" y="50" width="20" height="0.8" rx="0.4" fill="#10b981" />
        <text x="14" y="60" fontSize="5" fontWeight="600" fill="#222">Senior Designer</text>
        {[67, 73, 79, 85].map(y => <rect key={y} x="14" y={y} width={55 + y % 35} height="1.5" rx="0.5" fill="#f3f4f6" />)}
        <text x="14" y="104" fontSize="5.5" fontWeight="700" fill="#10b981">Education</text>
        {[114, 121, 128].map(y => <rect key={y} x="14" y={y} width={50 + y % 40} height="1.5" rx="0.5" fill="#f3f4f6" />)}
        {[0, 1, 2].map(i => <rect key={i} x={14 + i * 42} y="154" width="37" height="7" rx="3.5" fill="#f0fdf4" />)}
      </svg>
    ),
  },
  {
    name: 'Dark Sidebar', tag: 'Two-Column', tagColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <rect width="52" height="210" fill="#1e293b" />
        <circle cx="26" cy="24" r="13" fill="rgba(16,185,129,0.3)" />
        <text x="26" y="28" textAnchor="middle" fontSize="7" fontWeight="700" fill="#34d399">PJ</text>
        <text x="26" y="44" textAnchor="middle" fontSize="4" fill="#94a3b8">Peter MJ</text>
        {[52,60,68,76,84,92,100].map(y => <rect key={y} x="8" y={y} width="35" height="2" rx="1" fill="rgba(148,163,184,0.25)" />)}
        {[0,1,2].map(i => <><rect key={i+'b'} x="8" y={120+i*14} width="12" height="2" rx="1" fill="rgba(52,211,153,0.6)" /><rect key={i+'c'} x="22" y={120+i*14} width={15+i*5} height="2" rx="1" fill="rgba(148,163,184,0.3)" /></>)}
        <text x="62" y="16" fontSize="9" fontWeight="700" fill="#1e293b">Peter MJ</text>
        <text x="62" y="24" fontSize="5" fill="#8b5cf6">Full Stack Developer</text>
        <rect x="62" y="30" width="90" height="1" rx="0.5" fill="#e2e8f0" />
        {[40,48,56,64,80,88,96,112,120].map(y => <rect key={y} x="62" y={y} width="85" height="2" rx="1" fill="#f1f5f9" />)}
        <text x="62" y="75" fontSize="5" fontWeight="700" fill="#1e293b">EXPERIENCE</text>
        <text x="62" y="107" fontSize="5" fontWeight="700" fill="#1e293b">SKILLS</text>
      </svg>
    ),
  },
  {
    name: 'Timeline', tag: 'Creative', tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fafafa" />
        <rect x="0" y="0" width="160" height="38" fill="#0f172a" />
        <text x="80" y="17" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">Ameer Basha</text>
        <text x="80" y="28" textAnchor="middle" fontSize="5" fill="#94a3b8">Senior DevOps Engineer</text>
        <text x="80" y="35" textAnchor="middle" fontSize="4" fill="#64748b">ameer@email.com · Chennai</text>
        <line x1="30" y1="48" x2="30" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />
        {[52,80,120,158].map((y,i) => <>
          <circle key={i+'d'} cx="30" cy={y} r="4" fill={i===0?'#10b981':'#f59e0b'} />
          <rect key={i+'e'} x="42" y={y-4} width="55" height="3" rx="1.5" fill={i===0?'#064e3b':'#92400e'} opacity="0.8" />
          {[y+6,y+12,y+18].map((yy,j) => <rect key={j} x="42" y={yy} width={40+j*8} height="1.5" rx="0.5" fill="#e2e8f0" />)}
        </>)}
      </svg>
    ),
  },
  {
    name: 'Harvard Style', tag: 'Academic', tagColor: '#dc2626', tagBg: 'rgba(220,38,38,0.1)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <rect x="0" y="0" width="160" height="4" fill="#a21313" />
        <text x="80" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111" fontFamily="Georgia,serif">Krishna K</text>
        <line x1="20" y1="25" x2="140" y2="25" stroke="#a21313" strokeWidth="1.2" />
        <line x1="20" y1="27" x2="140" y2="27" stroke="#a21313" strokeWidth="0.4" />
        <text x="80" y="35" textAnchor="middle" fontSize="4.5" fill="#666">krishna@email.com · Bengaluru, India · linkedin.com/in/krishnak</text>
        {['EDUCATION','EXPERIENCE','SKILLS','PUBLICATIONS'].map((s,i) => <>
          <text key={s} x="14" y={52+i*40} fontSize="6" fontWeight="700" fill="#a21313" fontFamily="Georgia,serif">{s}</text>
          <line key={s+'l'} x1="14" y1={54+i*40} x2="146" y2={54+i*40} stroke="#a21313" strokeWidth="0.5" />
          {[58,64,70].map((y,j) => <rect key={j} x="14" y={y+i*40} width={55+j*10} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        </>)}
      </svg>
    ),
  },
  {
    name: 'ATS Safe', tag: 'ATS Friendly', tagColor: '#374151', tagBg: 'rgba(55,65,81,0.1)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#fff" />
        <text x="14" y="16" fontSize="10" fontWeight="700" fill="#111">Madhuri R</text>
        <text x="14" y="24" fontSize="4.5" fill="#555">HR Business Partner · madhuri@email.com · Hyderabad</text>
        <line x1="14" y1="28" x2="146" y2="28" stroke="#333" strokeWidth="0.6" />
        {['SUMMARY','EXPERIENCE','EDUCATION','SKILLS'].map((s,i) => <>
          <text key={s} x="14" y={38+i*44} fontSize="6" fontWeight="700" fill="#111">{s}</text>
          <line key={s+'l'} x1="14" y1={40+i*44} x2="146" y2={40+i*44} stroke="#555" strokeWidth="0.4" />
          {[44,50,56,62].map((y,j) => <rect key={j} x="14" y={y+i*44} width={60+j*8} height="1.5" rx="0.3" fill="#d1d5db" />)}
        </>)}
      </svg>
    ),
  },
  {
    name: 'Infographic', tag: 'Visual', tagColor: '#0891b2', tagBg: 'rgba(8,145,178,0.12)',
    svg: (
      <svg viewBox="0 0 160 210" style={{ width: '100%', height: '100%' }}>
        <rect width="160" height="210" fill="#f0f9ff" />
        <rect width="5" height="210" fill="#0891b2" />
        <rect x="5" width="55" height="210" fill="#0c4a6e" />
        <circle cx="32" cy="26" r="14" fill="rgba(8,145,178,0.4)" />
        <text x="32" y="30" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">JN</text>
        <text x="32" y="48" textAnchor="middle" fontSize="4" fill="#7dd3fc">Jubil NS</text>
        {[60,72,84,96,108,120].map((y,i) => <>
          <rect key={i} x="10" y={y} width={25+i*3} height="2" rx="1" fill="rgba(125,211,252,0.5)" />
        </>)}
        {[0,1,2].map(i => <>
          <circle key={i} cx={16+i*14} cy="168" r="8" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray={`${(i+1)*12} 40`} />
          <circle key={i+'c'} cx={16+i*14} cy="168" r="5" fill="none" stroke="rgba(125,211,252,0.3)" strokeWidth="3" />
        </>)}
        <text x="68" y="14" fontSize="9" fontWeight="700" fill="#0c4a6e">Jubil NS</text>
        <text x="68" y="22" fontSize="5" fill="#0891b2">Product Designer</text>
        <rect x="68" y="27" width="86" height="1" rx="0.5" fill="#bae6fd" />
        {[36,48,60,72,88,100,112].map(y => <rect key={y} x="68" y={y} width="82" height="2" rx="1" fill="rgba(186,230,253,0.6)" />)}
      </svg>
    ),
  },
];

const STEPS = [
  { n: '01', title: 'Fill your details', desc: 'Add personal info, work experience, education, skills and projects using clean guided forms.' },
  { n: '02', title: 'Choose a template', desc: 'Pick from 7 professional templates — or use the ATS-safe LaTeX template for FAANG applications.' },
  { n: '03', title: 'Customize & style', desc: 'Control fonts, sizes, colors, spacing, and borders per text level. Preview updates in real time.' },
  { n: '04', title: 'Export & apply', desc: 'Print to PDF, export LaTeX for Overleaf, or use AI to refine. Your resume is job-ready.' },
];

const PRIVACY = [
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24, color: '#10B981' }}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>),
    title: 'Zero Data Transmission', desc: 'Your resume is never sent anywhere. No backend, no API, no database.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24, color: '#10B981' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>),
    title: 'Browser-Only Storage', desc: 'Everything saved in localStorage. Only you can see it. Clear browser = clear data.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24, color: '#10B981' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>),
    title: 'No Tracking, No Analytics', desc: 'No Google Analytics, no Mixpanel, no cookies. We have no idea who you are.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24, color: '#10B981' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    title: 'No Account Required', desc: 'No email, no password, no sign-up. Open and start building. Your data is yours.',
  },
];

/* ─────────────────────────────────────────────
   Template Carousel — auto-scroll, pause on hover
───────────────────────────────────────────── */
function TemplateCarousel({ templates, isDark, cardBg, cardBdr, text, onEnterBuilder }: {
  templates: typeof TEMPLATES; isDark: boolean; cardBg: string; cardBdr: string; text: string; onEnterBuilder: () => void;
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const posRef    = useRef(0);
  const rafRef    = useRef<number>(0);
  const SPEED     = 0.55; // px per frame

  // duplicate for seamless loop
  const items = [...templates, ...templates, ...templates];

  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    const cardW = 220 + 16; // width + gap
    const loopW = templates.length * cardW;

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= loopW) posRef.current -= loopW;
        if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [templates.length]);

  return (
    <div
      style={{ overflow: 'hidden', position: 'relative', padding: '16px 0 24px' }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* left/right fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: `linear-gradient(to right, ${isDark ? '#070d18' : '#ffffff'}, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: `linear-gradient(to left, ${isDark ? '#070d18' : '#ffffff'}, transparent)`, pointerEvents: 'none' }} />
      <div
        ref={trackRef}
        style={{ display: 'flex', gap: 16, willChange: 'transform', paddingLeft: 40 }}
      >
        {items.map((tpl, i) => (
          <button
            key={`${tpl.name}-${i}`}
            onClick={onEnterBuilder}
            style={{
              flexShrink: 0, width: 220,
              borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${cardBdr}`,
              background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
              boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-8px) scale(1.03)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 48px rgba(16,185,129,0.22)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
              {tpl.svg}
              {/* hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0)', transition: 'background 0.25s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.48)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
              >
                <span style={{
                  padding: '7px 16px', borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#fff',
                  background: 'linear-gradient(135deg,#10B981,#0D9488)',
                  opacity: 0, transition: 'opacity 0.25s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >Use Template</span>
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: cardBg }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: text }}>{tpl.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: tpl.tagBg, color: tpl.tagColor }}>{tpl.tag}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feedback Form
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Custom Multi-Select Dropdown
───────────────────────────────────────────── */
function MultiSelect({ options, selected, onChange, placeholder, isDark, text, sub }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
  placeholder: string; isDark: boolean; text: string; sub: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  };

  const borderColor = isDark ? 'rgba(52,211,153,0.3)' : 'rgba(16,185,129,0.3)';
  const bgColor = isDark ? 'rgba(6,20,14,0.95)' : 'rgba(240,253,244,0.98)';
  const dropBg = isDark ? 'rgba(4,20,14,0.98)' : '#fff';

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
          border: `1.5px solid ${open ? '#10B981' : borderColor}`,
          background: bgColor, color: selected.length ? text : sub,
          fontSize: 13, fontFamily: 'inherit',
          boxShadow: open ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
          transition: 'all 0.2s ease', minHeight: 42,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {selected.length === 0 ? (
            <span style={{ color: sub, fontSize: 13 }}>{placeholder}</span>
          ) : (
            selected.map(s => (
              <span key={s} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'linear-gradient(135deg,#10B981,#0D9488)',
                color: '#fff', fontSize: 11, fontWeight: 600,
                borderRadius: 99, padding: '2px 8px',
              }}>
                {s}
                <span
                  onClick={e => { e.stopPropagation(); toggle(s); }}
                  style={{ cursor: 'pointer', opacity: 0.8, lineHeight: 1, fontSize: 13 }}
                >×</span>
              </span>
            ))
          )}
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" style={{
          width: 16, height: 16, flexShrink: 0, marginLeft: 8, color: '#10B981',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease',
        }}>
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 999,
          background: dropBg, border: `1.5px solid ${borderColor}`,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(16,185,129,0.12)',
          backdropFilter: 'blur(20px)',
          animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {options.map((opt, i) => {
            const checked = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                  color: checked ? '#10B981' : text,
                  background: checked
                    ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)')
                    : 'transparent',
                  borderBottom: i < options.length - 1
                    ? `1px solid ${isDark ? 'rgba(52,211,153,0.06)' : 'rgba(16,185,129,0.08)'}` : 'none',
                  transition: 'background 0.15s ease',
                  fontWeight: checked ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!checked)(e.currentTarget as HTMLDivElement).style.background =
                    isDark ? 'rgba(52,211,153,0.06)' : 'rgba(16,185,129,0.04)';
                }}
                onMouseLeave={e => {
                  if (!checked)(e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${checked ? '#10B981' : (isDark ? 'rgba(52,211,153,0.35)' : 'rgba(16,185,129,0.35)')}`,
                  background: checked ? 'linear-gradient(135deg,#10B981,#0D9488)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {checked && (
                    <svg viewBox="0 0 12 12" fill="none" style={{ width: 9, height: 9 }}>
                      <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ flex: 1 }}>{opt}</span>
                {checked && (
                  <svg viewBox="0 0 20 20" fill="#10B981" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedbackForm({ isDark, text, sub, cardBg, cardBdr }: {
  isDark: boolean; text: string; sub: string; cardBg: string; cardBdr: string;
}) {
  const [areas, setAreas] = useState<string[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const AREAS = ['Landing Page', 'Builder Editor', 'Resume Preview', 'Templates', 'AI Tools', 'LaTeX Export', 'PDF Print', 'Dark Mode', 'Performance', 'Other'];
  const ISSUES = ['Bug / Not Working', 'UI / Design', 'Missing Feature', 'Suggestion', 'General Feedback', 'Compliment'];

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
    border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.2)'}`,
    background: isDark ? 'rgba(15,25,20,0.6)' : 'rgba(255,255,255,0.9)',
    color: text, outline: 'none', fontFamily: 'inherit',
    backdropFilter: 'blur(8px)', transition: 'border-color 0.2s',
  };

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbywpBy7q2eef8zNP-SpV0kvXsfATWW6wFIacHwOytdAfujUpzE4jvZcxEwED3um5DY/exec";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!areas.length || !issues.length || !detail.trim()) return;

  setLoading(true);

  const payload = {
    areas:         areas.join(', '),    // → Areas column
    feedbackTypes: issues.join(', '),   // → Feedback Types column
    details:       detail,              // → Details column
    email:         email,               // → Email column
  };

  try {
    const res    = await fetch(SCRIPT_URL, {
      method: "POST",
      body:   JSON.stringify(payload),  // No Content-Type header — avoids CORS preflight
    });
    const result = await res.json();

    if (result.status === "success") {
      setSent(true);
    }
  } catch (err) {
    console.error("Feedback submission failed:", err);
  } finally {
    setLoading(false);
  }
};

  if (sent) {
    return (
      <div className="rounded-3xl p-12 text-center" style={{ background: cardBg, border: `1px solid ${cardBdr}`, backdropFilter: 'blur(12px)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg,#10B981,#0D9488)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} style={{ width: 28, height: 28 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black mb-3" style={{ color: text }}>Thank you!</h3>
        <p style={{ color: sub }} className="text-sm">Your feedback has been received. We'll review it and get back to you if needed.</p>
        <button onClick={() => { setSent(false); setAreas([]); setIssues([]); setDetail(''); setEmail(''); }}
          className="mt-6 text-sm font-semibold underline" style={{ color: '#10B981' }}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl p-8"
      style={{ background: cardBg, border: `1px solid ${cardBdr}`, backdropFilter: 'blur(12px)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
        {/* Area multi-select */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: sub }}>
            Which area? <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <MultiSelect
            options={AREAS} selected={areas} onChange={setAreas}
            placeholder="Select areas..." isDark={isDark} text={text} sub={sub}
          />
        </div>
        {/* Feedback type multi-select */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: sub }}>
            Type of feedback <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <MultiSelect
            options={ISSUES} selected={issues} onChange={setIssues}
            placeholder="Select type..." isDark={isDark} text={text} sub={sub}
          />
        </div>
      </div>
      {/* Detail */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2" style={{ color: sub }}>
          Describe in detail  <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          value={detail} onChange={e => setDetail(e.target.value)}
          placeholder="Tell us exactly what happened, what you expected, or what you'd love to see..."
          rows={4} style={{ ...inpStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#10B981'}
          onBlur={e => e.target.style.borderColor = isDark ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.2)'}
        />
      </div>
      {/* Email (optional) */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2" style={{ color: sub }}>
          Email <span className="font-normal opacity-60">(optional — only if you want a reply)</span>
        </label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={inpStyle}
          onFocus={e => e.target.style.borderColor = '#10B981'}
          onBlur={e => e.target.style.borderColor = isDark ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.2)'}
        />
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs" style={{ color: sub }}>
          No data is stored or sent to servers. This form will integrate with a backend later.
        </p>
        <button type="submit" disabled={!areas.length || !issues.length || !detail.trim() || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#10B981,#0D9488)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
          {loading ? (
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          {loading ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function LandingPage({ onEnterBuilder }: Props) {
  const { isDark } = useTheme();
  const [scrollY, setScrollY]         = useState(0);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [activeNav, setActiveNav]     = useState('');
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [hiredHov, setHiredHov]       = useState(false);


  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false); setActiveNav(id);
  }, []);

  const featuresRef  = useInView(0.05);
  const templatesRef = useInView(0.05);
  const stepsRef     = useInView(0.05);
  const privacyRef   = useInView(0.05);
  const statsRef     = useInView(0.05);
  const ctaRef       = useInView(0.05);

  const bg      = isDark ? '#070d18' : '#ffffff';
  const text    = isDark ? '#f1f5f9' : '#0f172a';
  const sub     = isDark ? '#94a3b8' : '#64748b';
  const cardBg  = isDark ? 'rgba(17,24,39,0.50)' : 'rgba(255,255,255,0.55)';
  const cardBdr = isDark ? 'rgba(52,211,153,0.10)' : 'rgba(16,185,129,0.13)';
  const navBg   = scrollY > 40
    ? isDark ? 'rgba(7,13,24,0.88)' : 'rgba(255,255,255,0.88)'
    : 'transparent';
  const glass = (a = 0.18) => isDark ? `rgba(7,13,24,${a})` : `rgba(255,255,255,${a})`;

  return (
    <div style={{ color: text, fontFamily: "'Inter', sans-serif", backgroundColor: bg }} className="min-h-screen overflow-x-hidden relative">

      {/* Shader background — fixed, full-page, very subtle */}
      <ShaderBackground isDark={isDark} />
      {/* Wireframe neural mesh — fixed, full-page */}
      <WireframeCanvas isDark={isDark} />

      {/* ════════════ NAVBAR ════════════ */}
      <nav
        className="fixed left-0 right-0 z-[100] transition-all duration-500"
        style={{
          top: 0,
          background: navBg,
          backdropFilter: scrollY > 40 ? 'blur(24px) saturate(180%)' : 'none',
          boxShadow: scrollY > 40 ? `0 1px 32px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(16,185,129,0.07)'}` : 'none',
          borderBottom: scrollY > 40 ? `1px solid ${isDark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.1)'}` : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo size="md" variant="full" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(item => {
              const id = item.toLowerCase().replace(/ /g, '-');
              const isActive = activeNav === id;
              return (
                <button
                  key={item}
                  onClick={() => scrollTo(id)}
                  className="relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group"
                  style={{ color: isActive ? '#10B981' : sub }}
                >
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)' }} />
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                      style={{ width: '60%', background: 'linear-gradient(90deg,#10B981,#34D399)' }} />
                  )}
                  <span className="relative group-hover:text-emerald-500 transition-colors duration-200">{item}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle variant="pill" />
            <HoverButton onClick={onEnterBuilder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Launch Builder
            </HoverButton>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              className="p-2 rounded-xl transition-all duration-200"
              style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(240,253,244,0.8)', border: `1px solid ${isDark ? '#1e3a2f' : '#a7f3d0'}` }}
              onClick={() => setMenuOpen(m => !m)}
            >
              <div className="w-5 space-y-1">
                <div className={`h-0.5 rounded-full transition-all duration-300 origin-center ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'} ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`h-0.5 rounded-full transition-all duration-300 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'} ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <div className={`h-0.5 rounded-full transition-all duration-300 origin-center ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'} ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: menuOpen ? '320px' : '0', opacity: menuOpen ? 1 : 0,
            background: isDark ? 'rgba(7,13,24,0.97)' : 'rgba(255,255,255,0.97)',
            borderTop: menuOpen ? `1px solid ${isDark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.1)'}` : 'none',
            backdropFilter: 'blur(20px)',
          }}>
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV.map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(/ /g, '-'))}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:text-emerald-500 transition-colors"
                style={{ color: sub }}>{item}</button>
            ))}
            <button onClick={onEnterBuilder} className="mt-3 px-5 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#10B981,#0D9488)' }}>Launch Builder</button>
          </div>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-20 overflow-visible"
        style={{ zIndex: 1, background: 'transparent', paddingTop: '160px' }}
      >
        {/* Construction banner — inside hero, below navbar, NOT covering navbar */}
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0 }}>
          <Banner isDark={isDark} />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
            style={{ background: isDark ? 'radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)' : 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)' }} />
        </div>

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide"
          style={{
            background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.25)'}`,
            color: '#10B981', animation: 'fadeInDown 0.7s ease-out', backdropFilter: 'blur(8px)',
          }}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ATS-Safe · LaTeX Ready · AI Powered · 100% Private
        </div>

        {/* Headline */}
        <h1
          className="relative text-center font-black tracking-tight max-w-5xl"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)', lineHeight: 1.08, animation: 'fadeInUp 0.7s ease-out 0.1s both' }}
        >
          {/* "Build resumes that" — per-word pop */}
          <span className="block select-none mb-2">
            {['Build', 'resumes', 'that'].map((word, wi) => (
              <span
                key={word}
                className="inline-block cursor-default"
                style={{ marginLeft: wi === 0 ? 0 : '0.22em' }}
                onMouseEnter={() => setHoveredWord(wi)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <span style={{
                  display: 'inline-block',
                  color: hoveredWord === wi ? '#10B981' : text,
                  transform: hoveredWord === wi ? 'scale(1.10) translateY(-4px)' : 'scale(1) translateY(0)',
                  textShadow: hoveredWord === wi
                    ? (isDark ? '0 0 40px rgba(16,185,129,0.5)' : '0 0 28px rgba(16,185,129,0.28)')
                    : 'none',
                  transition: 'color 0.22s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), text-shadow 0.22s ease',
                }}>
                  {word}
                </span>
              </span>
            ))}
          </span>

          {/* "get you hired" — hover pop + SVG wave */}
          <span
            className="block select-none cursor-default"
            style={{
              position: 'relative',
              display: 'inline-block',
              paddingBottom: '0.52em',
              paddingTop: '0.05em',
              lineHeight: 1.28,
              overflow: 'visible',
              transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={() => setHiredHov(true)}
            onMouseLeave={() => setHiredHov(false)}
          >
            {/* Gradient text — pops UP on hover */}
            <span style={{
              display: 'inline-block',
              backgroundImage: 'linear-gradient(110deg, #064E3B 0%, #10B981 35%, #34D399 65%, #0D9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transform: hiredHov ? 'scale(1.06) translateY(-7px)' : 'scale(1) translateY(0)',
              transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
              transformOrigin: 'center bottom',
            }}>
              get you hired
            </span>

            {/* Wave underline — drops DOWN on hover, separating from text */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%',
                display: 'block',
                lineHeight: 0,
                pointerEvents: 'none',
                width: '96%',
                bottom: hiredHov ? '-0.18em' : '0.06em',
                transform: hiredHov
                  ? 'translateX(-50%) translateY(8px)'
                  : 'translateX(-50%) translateY(0px)',
                transition: 'bottom 0.44s cubic-bezier(0.34,1.56,0.64,1), transform 0.44s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <svg
                viewBox="0 0 1000 80"
                fill="none"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '28px', display: 'block', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="wave-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#064E3B" />
                    <stop offset="25%"  stopColor="#10B981" />
                    <stop offset="55%"  stopColor="#34D399" />
                    <stop offset="80%"  stopColor="#0D9488" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </linearGradient>
                  <linearGradient id="wave-glow2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity="0" />
                    <stop offset="35%"  stopColor="#34D399" stopOpacity="0.55" />
                    <stop offset="65%"  stopColor="#10B981" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Ghost track */}
                <path
                  d="M 0 42 C 80 52, 160 66, 250 64 C 340 62, 420 52, 500 44 C 580 36, 650 28, 720 22 C 790 16, 860 12, 940 14 C 970 15, 990 18, 1000 20"
                  stroke="url(#wave-grad2)"
                  strokeWidth="5"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none" opacity="0.2"
                />
                {/* Glow bloom */}
                <path
                  d="M 0 42 C 80 52, 160 66, 250 64 C 340 62, 420 52, 500 44 C 580 36, 650 28, 720 22 C 790 16, 860 12, 940 14 C 970 15, 990 18, 1000 20"
                  stroke="url(#wave-glow2)"
                  strokeWidth={hiredHov ? 26 : 20}
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                  opacity={hiredHov ? 0.55 : 0.28}
                  style={{ transition: 'opacity 0.38s ease, stroke-width 0.38s ease' }}
                />
                {/* Main crisp wave */}
                <path
                  d="M 0 42 C 80 52, 160 66, 250 64 C 340 62, 420 52, 500 44 C 580 36, 650 28, 720 22 C 790 16, 860 12, 940 14 C 970 15, 990 18, 1000 20"
                  stroke="url(#wave-grad2)"
                  strokeWidth={hiredHov ? 11 : 9}
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                  opacity={hiredHov ? 1 : 0.88}
                  style={{ transition: 'opacity 0.38s ease, stroke-width 0.38s ease' }}
                />
              </svg>
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="relative mt-8 text-center max-w-2xl leading-relaxed"
          style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: sub, animation: 'fadeInUp 0.7s ease-out 0.2s both' }}>
          A professional resume builder with live preview, 7 templates, LaTeX / FAANG export,
          AI writing tools, and deep typography controls — all running locally in your browser.
        </p>

        {/* CTAs */}
        <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4" style={{ animation: 'fadeInUp 0.7s ease-out 0.3s both' }}>
          <HoverButton onClick={onEnterBuilder} large>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Start Building Free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </HoverButton>
          <OutlineButton onClick={() => scrollTo('how-it-works')} isDark={isDark}>
            See how it works
          </OutlineButton>
        </div>

        {/* Trust line */}
        <div className="relative mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2" style={{ animation: 'fadeInUp 0.7s ease-out 0.4s both' }}>
          {['No sign-up required', 'Data never leaves your browser', 'No tracking', 'Free forever'].map((t2, i) => (
            <span key={t2} className="flex items-center gap-1.5 text-xs" style={{ color: sub }}>
              {i > 0 && <span className="w-1 h-1 rounded-full" style={{ background: isDark ? '#334155' : '#d1d5db' }} />}
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, color: '#10B981' }}>
                <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t2}
            </span>
          ))}
        </div>

        {/* Hero app mockup */}
        <div className="relative mt-16 w-full max-w-5xl" style={{ animation: 'fadeInUp 0.9s ease-out 0.5s both' }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              border: `1px solid ${isDark ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.15)'}`,
              transform: `perspective(1200px) rotateX(${Math.min(scrollY * 0.018, 4)}deg)`,
              transition: 'transform 0.1s linear',
            }}>
            <div className="h-9 flex items-center px-4 gap-2"
              style={{ background: isDark ? '#111827' : '#f8fafc', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
              <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 opacity-80" />
              <div className="flex-1 mx-4 h-5 rounded-md border flex items-center px-3"
                style={{ background: isDark ? '#0a0f1a' : '#fff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                <span className="text-[10px]" style={{ color: sub }}>resumeengine.app</span>
              </div>
            </div>
            <div className="flex h-72 sm:h-96" style={{ background: isDark ? '#0a0f1a' : '#f1f5f9' }}>
              <div className="w-12 sm:w-44 border-r flex flex-col"
                style={{ background: isDark ? '#111827' : '#fff', borderColor: isDark ? 'rgba(52,211,153,0.08)' : '#e5e7eb' }}>
                <div className="h-11 flex items-center px-3 gap-2.5 border-b"
                  style={{ borderColor: isDark ? 'rgba(52,211,153,0.08)' : '#f0fdf4' }}>
                  <BrandLogo size="sm" variant="icon" />
                  <div className="hidden sm:block w-20 h-2 rounded-full" style={{ background: 'linear-gradient(90deg,#d1fae5,#a7f3d0)' }} />
                </div>
                {['Personal Info', 'Experience', 'Education', 'Skills', 'Projects'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2.5 px-3 py-2.5"
                    style={{ background: i === 1 ? isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4' : 'transparent', borderLeft: `2px solid ${i === 1 ? '#10B981' : 'transparent'}` }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: i === 1 ? '#10B981' : isDark ? '#334155' : '#d1d5db' }} />
                    <span className="hidden sm:block text-[10px] font-medium" style={{ color: i === 1 ? '#10B981' : sub }}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 border-r p-4 overflow-hidden"
                style={{ background: isDark ? '#0d1526' : '#fff', borderColor: isDark ? 'rgba(52,211,153,0.08)' : '#e5e7eb' }}>
                <div className="text-xs font-semibold mb-3" style={{ color: text }}>Work Experience</div>
                <div className="space-y-2.5">
                  {[['Job Title', 'Senior Software Engineer'], ['Company', 'Acme Corp'], ['Location', 'New York, NY']].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-[9px] mb-0.5 font-medium" style={{ color: sub }}>{l}</div>
                      <div className="h-6 rounded-lg border px-2 flex items-center"
                        style={{ background: isDark ? '#111827' : '#f8fafc', borderColor: isDark ? '#1e293b' : '#e5e7eb' }}>
                        <span className="text-[10px]" style={{ color: text }}>{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Resume preview mockup with logo + sample content */}
              <div className="hidden sm:flex flex-1 items-center justify-center p-4" style={{ background: isDark ? '#0a0f1a' : '#f1f5f9' }}>
                <div className="w-full max-w-[170px] rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '210/297', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                  {/* Resume header with gradient */}
                  <div className="flex flex-col items-center justify-center pt-3 pb-2 px-2"
                    style={{ background: 'linear-gradient(135deg,#10B981,#0D9488)', flexShrink: 0 }}>
                    {/* Mini logo */}
                    <svg width="14" height="14" viewBox="0 0 95 105" style={{ marginBottom: 3 }}>
                      <path d="M25 0 H85 A10 10 0 0 1 95 10 V95 A10 10 0 0 1 85 105 H10 A10 10 0 0 1 0 95 V25 Z" fill="rgba(255,255,255,0.25)"/>
                      <rect x="20" y="38" width="55" height="8" rx="4" fill="white" opacity="0.8"/>
                      <rect x="20" y="54" width="55" height="8" rx="4" fill="white" opacity="0.8"/>
                      <rect x="20" y="70" width="38" height="8" rx="4" fill="white" opacity="0.8"/>
                    </svg>
                     <div style={{ color: 'white', fontWeight: 700, fontSize: 8, letterSpacing: 0.3 }}>Nagababu Basa</div>
                     <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 6, marginTop: 1 }}>Senior Business Analyst</div>
                     <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 5, marginTop: 1 }}>nagababu.basa@gmail.com</div>
                  </div>
                  {/* Resume body lines */}
                  <div className="p-2 flex-1" style={{ overflow: 'hidden' }}>
                    {/* Experience section */}
                    <div style={{ fontSize: 5, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #10B981', paddingBottom: 2, marginBottom: 3, letterSpacing: 1, textTransform: 'uppercase' }}>Experience</div>
                    {[78, 55, 62, 48].map((w, i) => (
                      <div key={i} className="rounded-full mb-1" style={{ height: 4, width: `${w}%`, background: i === 0 ? '#064E3B' : i === 1 ? '#10b981' : '#e2e8f0' }} />
                    ))}
                    {/* Skills section */}
                    <div style={{ fontSize: 5, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #10B981', paddingBottom: 2, marginBottom: 3, marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {['React', 'TypeScript', 'Node.js', 'AWS', 'Python'].map(s => (
                        <div key={s} style={{ background: 'rgba(16,185,129,0.12)', color: '#064E3B', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 3, padding: '1px 3px', fontSize: 4, fontWeight: 600 }}>{s}</div>
                      ))}
                    </div>
                    {/* Education section */}
                    <div style={{ fontSize: 5, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #10B981', paddingBottom: 2, marginBottom: 3, marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Education</div>
                    {[65, 48].map((w, i) => (
                      <div key={i} className="rounded-full mb-1" style={{ height: 4, width: `${w}%`, background: i === 0 ? '#334155' : '#e2e8f0' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-8 -z-10 rounded-3xl blur-3xl"
            style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.06),rgba(13,148,136,0.04))', opacity: isDark ? 0.7 : 0.5 }} />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ animation: 'bounceY 2.5s ease-in-out infinite', opacity: 0.32 }}>
          <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: sub }}>Scroll</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 16, height: 16, color: '#10B981' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section style={{ position: 'relative', zIndex: 1, background: glass(0.14), borderTop: `1px solid ${cardBdr}`, borderBottom: `1px solid ${cardBdr}`, backdropFilter: 'blur(16px)' }}>
        <div ref={statsRef.ref} className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Resume Sections', val: 12, suffix: '+' },
            { label: 'Templates', val: 7, suffix: '' },
            { label: 'AI Tools', val: 3, suffix: '' },
            { label: '% Free', val: 100, suffix: '' },
          ].map(({ label, val, suffix }, i) => (
            <StatCard key={label} label={label} val={val} suffix={suffix} delay={i * 0.1} isDark={isDark} sub={sub} />
          ))}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" style={{ position: 'relative', zIndex: 1, background: glass(0.13), backdropFilter: 'blur(16px)' }} className="py-24 px-6">
        <div ref={featuresRef.ref} className="max-w-6xl mx-auto">
          <div className="text-center mb-16"
            style={{ opacity: featuresRef.visible ? 1 : 0, transform: featuresRef.visible ? 'translateY(0)' : 'translateY(36px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
              Everything you need
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: text }}>Packed with powerful features</h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: sub }}>
              Every tool you need to create a professional resume — beautifully designed, fully customizable, completely private.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const isAI = i >= 5; // Last 3 are AI tools
              return (
              <div key={f.title}
                className="group relative rounded-2xl p-6 cursor-default"
                style={{
                  background: isAI
                    ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)')
                    : cardBg,
                  border: isAI
                    ? `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.25)'}`
                    : `1px solid ${cardBdr}`,
                  backdropFilter: 'blur(8px)',
                  boxShadow: isAI ? `0 0 24px ${isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)'}` : 'none',
                  opacity: featuresRef.visible ? 1 : 0,
                  transform: featuresRef.visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
                  transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, box-shadow 0.3s`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.01)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = isAI
                    ? '0 8px 32px rgba(16,185,129,0.2)' : '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = isAI ? `0 0 24px ${isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)'}` : 'none';
                }}
              >
                {/* AI spark icon — top-left corner */}
                {isAI && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg,#10B981,#0D9488)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} style={{ width: 11, height: 11 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg,${f.grad[0]},${f.grad[1]})`,
                    boxShadow: isAI ? `0 4px 16px rgba(16,185,129,0.3)` : undefined,
                    marginTop: isAI ? 14 : 0,
                  }}>{f.icon}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color: text }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: sub }}>{f.desc}</p>
                {/* Animated gradient shimmer on AI cards */}
                {isAI && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'radial-gradient(ellipse at 20% 20%, rgba(52,211,153,0.12), transparent 60%)',
                      transition: 'opacity 0.4s ease',
                    }} />
                )}
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* ════════════ TEMPLATES — horizontal auto-scroll ════════════ */}
      <section id="templates"
        style={{ position: 'relative', zIndex: 1, background: glass(0.14), borderTop: `1px solid ${cardBdr}`, borderBottom: `1px solid ${cardBdr}`, backdropFilter: 'blur(16px)' }}
        className="py-24">
        <div ref={templatesRef.ref}>
          <div className="text-center mb-12 px-6"
            style={{ opacity: templatesRef.visible ? 1 : 0, transform: templatesRef.visible ? 'translateY(0)' : 'translateY(36px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
              {TEMPLATES.length} Templates
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: text }}>Choose your style</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: sub }}>
              From minimal & clean to bold & executive — or go full LaTeX for ATS-safe FAANG applications.
              <br /><span style={{ color: '#10B981', fontWeight: 400, fontSize: '0.78rem', fontStyle: 'italic', opacity: 0.8 }}>Hover to pause · click any to start building</span>
            </p>
          </div>
          {/* Auto-scrolling carousel */}
          <TemplateCarousel templates={TEMPLATES} isDark={isDark} cardBg={cardBg} cardBdr={cardBdr} text={text} onEnterBuilder={onEnterBuilder} />
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works"
        style={{ position: 'relative', zIndex: 1, background: glass(0.12), backdropFilter: 'blur(16px)' }}
        className="py-24 px-6">
        <div ref={stepsRef.ref} className="max-w-4xl mx-auto">
          <div className="text-center mb-16"
            style={{ opacity: stepsRef.visible ? 1 : 0, transform: stepsRef.visible ? 'translateY(0)' : 'translateY(36px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
              Simple process
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: text }}>Build your resume in minutes</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-8 bottom-8 w-0.5 hidden md:block"
              style={{ background: 'linear-gradient(to bottom, #10B981, #0D9488, rgba(13,148,136,0.1))' }} />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative flex gap-6 items-start"
                  style={{
                    opacity: stepsRef.visible ? 1 : 0,
                    transform: stepsRef.visible ? 'translateX(0)' : 'translateX(-32px)',
                    transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                  }}>
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg z-10"
                    style={{ background: 'linear-gradient(135deg,#10B981,#0D9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                    {s.n}
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="font-bold text-base mb-1" style={{ color: text }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: sub }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center"
            style={{ opacity: stepsRef.visible ? 1 : 0, transition: 'opacity 0.5s ease-out 0.5s' }}>
            <HoverButton onClick={onEnterBuilder} large>
              Get started now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </HoverButton>
          </div>
        </div>
      </section>

      {/* ════════════ AI FEATURES — merged into Features grid above ════════════ */}
      {(false) && <section id="ai-features"
        style={{ position:'relative', zIndex:1, background: isDark ? 'rgba(4,20,14,0.28)' : 'rgba(236,253,245,0.30)', borderTop:`1px solid ${isDark?'rgba(52,211,153,0.1)':'rgba(16,185,129,0.12)'}`, backdropFilter:'blur(20px)' }}
        className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: isDark?'rgba(16,185,129,0.12)':'rgba(16,185,129,0.08)', color:'#10B981', border:`1px solid ${isDark?'rgba(16,185,129,0.28)':'rgba(16,185,129,0.22)'}` }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{width:12,height:12}}>
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/>
              </svg>
              Built-in AI Tools
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{color:text}}>
              Your personal resume <span style={{background:'linear-gradient(135deg,#10B981,#34D399,#0D9488)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>AI assistant</span>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{color:sub}}>
              Three powerful AI-powered tools built directly into the editor — no extra subscriptions, no copy-pasting between tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Skills Extractor */}
            <div className="rounded-2xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
              style={{ background: isDark?'rgba(16,185,129,0.06)':'rgba(255,255,255,0.7)', border:`1px solid ${isDark?'rgba(16,185,129,0.15)':'rgba(16,185,129,0.18)'}`, backdropFilter:'blur(12px)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#064E3B,#10B981)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} style={{width:22,height:22}}>
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{color:text}}>Skills Extractor</h3>
                <p className="text-sm leading-relaxed" style={{color:sub}}>
                  Automatically scans your Work Experience, Summary, Certifications, and Achievements to detect and suggest relevant skills — technical, soft, and tools.
                </p>
              </div>
              <ul className="space-y-1.5">
                {['Reads all resume sections','Detects 150+ tech keywords','Suggests missing skill categories','One-click add to Skills section'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{color:sub}}>
                    <svg viewBox="0 0 20 20" fill="#10B981" style={{width:14,height:14,flexShrink:0}}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-block"
                  style={{background:'rgba(16,185,129,0.12)',color:'#10B981'}}>
                  Found in → Skills Section
                </div>
              </div>
            </div>

            {/* Summary Generator */}
            <div className="rounded-2xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
              style={{ background: isDark?'rgba(52,211,153,0.06)':'rgba(255,255,255,0.7)', border:`1px solid ${isDark?'rgba(52,211,153,0.15)':'rgba(52,211,153,0.2)'}`, backdropFilter:'blur(12px)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#0D9488,#34D399)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} style={{width:22,height:22}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{color:text}}>Summary Generator</h3>
                <p className="text-sm leading-relaxed" style={{color:sub}}>
                  Generates a compelling 3–4 line professional summary tailored to your experience, top skills, and career level — with multiple variations to choose from.
                </p>
              </div>
              <ul className="space-y-1.5">
                {['Uses your actual experience data','Calculates years of experience','10 unique opener variations','Regenerate until you love it'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{color:sub}}>
                    <svg viewBox="0 0 20 20" fill="#34D399" style={{width:14,height:14,flexShrink:0}}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-block"
                  style={{background:'rgba(52,211,153,0.12)',color:'#0D9488'}}>
                  Found in → Summary Section
                </div>
              </div>
            </div>

            {/* Content Rephraser */}
            <div className="rounded-2xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
              style={{ background: isDark?'rgba(190,242,100,0.04)':'rgba(255,255,255,0.7)', border:`1px solid ${isDark?'rgba(190,242,100,0.12)':'rgba(13,148,136,0.18)'}`, backdropFilter:'blur(12px)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#065f46,#0D9488)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} style={{width:22,height:22}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{color:text}}>Content Rephraser</h3>
                <p className="text-sm leading-relaxed" style={{color:sub}}>
                  Transforms weak, passive phrases into strong, action-oriented bullet points. Available on every description and text field throughout the editor.
                </p>
              </div>
              <ul className="space-y-1.5">
                {['Power action verb substitution','Removes filler words','Adds quantifier hints','Works on every text field'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{color:sub}}>
                    <svg viewBox="0 0 20 20" fill="#0D9488" style={{width:14,height:14,flexShrink:0}}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-block"
                  style={{background:'rgba(13,148,136,0.1)',color:'#0D9488'}}>
                  Found in → Every Text Field
                </div>
              </div>
            </div>
          </div>

          {/* AI disclaimer */}
          <div className="text-center">
            <p className="text-xs" style={{color:isDark?'rgba(156,163,175,0.7)':'rgba(107,114,128,0.8)'}}>
              All AI tools run locally in your browser using smart pattern matching — no API calls, no data sent anywhere, completely private.
            </p>
          </div>
        </div>
      </section>}

      {/* ════════════ PRIVACY ════════════ */}
      <section id="privacy"
        style={{ position: 'relative', zIndex: 1, background: isDark ? 'rgba(6,18,14,0.24)' : 'rgba(240,253,244,0.26)', borderTop: `1px solid ${isDark ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.15)'}`, backdropFilter: 'blur(20px)' }}
        className="py-24 px-6">
        <div ref={privacyRef.ref} className="max-w-5xl mx-auto">
          <div className="text-center mb-16"
            style={{ opacity: privacyRef.visible ? 1 : 0, transform: privacyRef.visible ? 'translateY(0)' : 'translateY(36px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold mb-6"
              style={{ background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              We literally cannot access your data
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: text }}>Your privacy is non-negotiable</h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: sub }}>
              Resume Engine has no backend, no database, and no analytics. Everything runs entirely in your browser.
              There is no way for us to see your data — even if we wanted to.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIVACY.map((p, i) => (
              <div key={p.title}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.75)',
                  border: `1px solid ${isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.15)'}`,
                  backdropFilter: 'blur(8px)',
                  opacity: privacyRef.visible ? 1 : 0,
                  transform: privacyRef.visible ? 'translateY(0)' : 'translateY(32px)',
                  transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
                }}>
                <div className="flex justify-center mb-3">{p.icon}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color: text }}>{p.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: sub }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3"
            style={{ opacity: privacyRef.visible ? 1 : 0, transition: 'opacity 0.6s ease-out 0.4s' }}>
            {['No servers', 'No accounts', 'No cookies', 'No telemetry', 'No ads', 'localStorage only', 'Always free'].map(chip => (
              <span key={chip}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12 }}>
                  <path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section style={{ position: 'relative', zIndex: 1, background: glass(0.10), backdropFilter: 'blur(16px)' }} className="py-24 px-6">
        <div ref={ctaRef.ref} className="max-w-3xl mx-auto text-center"
          style={{ opacity: ctaRef.visible ? 1 : 0, transform: ctaRef.visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="relative rounded-3xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#064E3B 0%,#0D9488 60%,#10B981 100%)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
              <svg style={{ width: '100%', height: '100%' }}>
                <defs><pattern id="cta-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.5" fill="#fff" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#cta-dots)" />
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                Your next job starts with<br />a great resume
              </h2>
              <p className="text-emerald-100 text-base mb-8 max-w-lg mx-auto">
                Join professionals building standout resumes with Resume Engine.
                No data shared. No account needed. Just results.
              </p>
              <div className="flex justify-center">
                <HoverButton onClick={onEnterBuilder} large>
                  Build My Resume — Free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 20, height: 20 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </HoverButton>
              </div>
              <p className="mt-4 text-emerald-200/70 text-xs">No sign-up · No tracking · Data stays in your browser</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FEEDBACK ════════════ */}
      <section id="feedback"
        style={{ position: 'relative', zIndex: 1, background: glass(0.13), borderTop: `1px solid ${cardBdr}`, backdropFilter: 'blur(16px)' }}
        className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
              We value your feedback
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: text }}>Help us improve</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: sub }}>
              Share what's working, what's broken, or what you'd love to see next. Every response is read personally.
            </p>
          </div>
          <FeedbackForm isDark={isDark} text={text} sub={sub} cardBg={cardBg} cardBdr={cardBdr} />
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer
        style={{
          position: 'relative', zIndex: 1,
          background: isDark ? 'rgba(4,8,14,0.60)' : 'rgba(248,255,254,0.60)',
          borderTop: `1px solid ${cardBdr}`,
          backdropFilter: 'blur(20px)',
        }}
        className="py-8 px-6"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: sub }}>
            Built with
            <svg viewBox="0 0 24 24" fill="#ef4444" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            by <span style={{ color: '#10B981', fontWeight: 700 }}>Nagababu Basa</span>
            &nbsp;· © 2026 Resume Engine. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)', color: '#10B981', border: '1px solid rgba(16,185,129,0.18)' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            100% private · no data leaves your browser
          </div>
        </div>
      </footer>

    </div>
  );
}
