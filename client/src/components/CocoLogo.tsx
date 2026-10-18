import React from 'react';

interface CocoLogoProps {
  variant?: 'full' | 'symbol' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
}

export const CocoLogo: React.FC<CocoLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const strokeColor = isDark ? '#FFFFFF' : '#000000';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const redColor = '#E50914';

  const sizeDimensions = {
    xs: { symbol: 24, text: 'text-[9px]' },
    sm: { symbol: 32, text: 'text-[11px]' },
    md: { symbol: 42, text: 'text-xs' },
    lg: { symbol: 56, text: 'text-sm' },
    xl: { symbol: 76, text: 'text-lg' },
  };

  const currentSize = sizeDimensions[size];

  // SVG Symbol representing the interlocking circles with red centers
  const SymbolSVG = ({ width = 48, height = 48 }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Top-Left Ring */}
      <circle
        cx="44"
        cy="40"
        r="28"
        stroke={strokeColor}
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Bottom-Right Ring */}
      <circle
        cx="76"
        cy="58"
        r="28"
        stroke={strokeColor}
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Left Center Red Dot */}
      <circle cx="44" cy="40" r="9" fill={redColor} />
      {/* Right Center Red Dot */}
      <circle cx="76" cy="58" r="9" fill={redColor} />
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <SymbolSVG width={currentSize.symbol} height={currentSize.symbol} />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center space-x-2.5 ${className}`}>
        <SymbolSVG width={currentSize.symbol} height={currentSize.symbol} />
        <div className="flex flex-col">
          <span
            className={`font-black tracking-wider uppercase leading-none ${
              isDark ? 'text-white' : 'text-black'
            } ${currentSize.text === 'text-[9px]' ? 'text-xs' : 'text-sm'}`}
          >
            COCO <span className="text-[#E50914]">MEDIA</span>
          </span>
          <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-bold">
            BUSINESS OS
          </span>
        </div>
      </div>
    );
  }

  // Full stacked logo variant (matching user reference image)
  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <SymbolSVG width={currentSize.symbol * 1.3} height={currentSize.symbol * 1.1} />
      <span
        style={{ letterSpacing: '0.22em' }}
        className={`font-black uppercase mt-1 ${currentSize.text} ${
          isDark ? 'text-white' : 'text-black'
        }`}
      >
        MEDIA
      </span>
    </div>
  );
};
