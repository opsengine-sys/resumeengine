import { useTheme } from '../context/ThemeContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  forceLight?: boolean;
}

const SIZES = {
  sm:  { h: 28, iw: 20, ih: 24 },
  md:  { h: 36, iw: 26, ih: 31 },
  lg:  { h: 48, iw: 34, ih: 41 },
  xl:  { h: 64, iw: 46, ih: 55 },
};

export default function BrandLogo({ size = 'md', variant = 'full', className = '', forceLight }: BrandLogoProps) {
  const ctx = useTheme?.();
  const isDark = forceLight ? false : (ctx?.isDark ?? false);
  const { h, iw, ih } = SIZES[size];
  const fontSize = h * 0.44;
  const gap = h * 0.32;
  const totalW = variant === 'full' ? iw + gap + fontSize * 8.1 : iw + 4;

  const uid = `logo-${size}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${ih}`}
      height={h}
      className={className}
      aria-label="Resume Engine"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${uid}-icon`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#BEF264" />
          <stop offset="40%"  stopColor="#34D399" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={`${uid}-fold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0F766E" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={`${uid}-engine`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={isDark ? '#ffffff' : '#064E3B'} />
          <stop offset="100%" stopColor={isDark ? '#a7f3d0' : '#0D9488'} />
        </linearGradient>
      </defs>

      {/* Icon */}
      <g>
        {/* Main document */}
        <path
          d={`M${iw*0.27} 0 H${iw*0.93} A${iw*0.09} ${iw*0.09} 0 0 1 ${iw} ${iw*0.09}
              V${ih-iw*0.09} A${iw*0.09} ${iw*0.09} 0 0 1 ${iw*0.91} ${ih}
              H${iw*0.09} A${iw*0.09} ${iw*0.09} 0 0 1 0 ${ih-iw*0.09}
              V${iw*0.27} Z`}
          fill={`url(#${uid}-icon)`}
        />
        {/* Fold */}
        <path
          d={`M0 ${iw*0.27} L${iw*0.27} ${iw*0.27} L${iw*0.27} 0 Z`}
          fill={`url(#${uid}-fold)`}
          opacity="0.85"
        />
        {/* Lines */}
        <rect x={iw*0.21} y={ih*0.37} width={iw*0.58} height={ih*0.09} rx={ih*0.045} fill="#fff" fillOpacity="0.92"/>
        <rect x={iw*0.21} y={ih*0.52} width={iw*0.58} height={ih*0.09} rx={ih*0.045} fill="#fff" fillOpacity="0.92"/>
        <rect x={iw*0.21} y={ih*0.67} width={iw*0.4}  height={ih*0.09} rx={ih*0.045} fill="#fff" fillOpacity="0.92"/>
      </g>

      {/* Text */}
      {variant === 'full' && (
        <g transform={`translate(${iw + gap}, 0)`}>
          {/* "Resume" in emerald */}
          <text
            y={ih * 0.73}
            fontFamily="'Space Grotesk', Inter, sans-serif"
            fontSize={fontSize}
            fontWeight="500"
            fill="#10B981"
          >
            Resume
          </text>
          {/* "Engine" with gradient or dark-mode white */}
          <text
            y={ih * 0.73}
            x={fontSize * 4.02}
            fontFamily="'Space Grotesk', Inter, sans-serif"
            fontSize={fontSize}
            fontWeight="700"
            fill={`url(#${uid}-engine)`}
          >
            Engine
          </text>
        </g>
      )}
    </svg>
  );
}
