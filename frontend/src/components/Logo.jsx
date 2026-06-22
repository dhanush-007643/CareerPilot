import React from 'react';

const Logo = ({ className = '', showText = true, size = 48 }) => {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* "The Launchpad Compass" Logo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform hover:scale-[1.04] hover:rotate-[-1deg] transition-all duration-500"
      >
        <defs>
          <linearGradient id="compassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient id="chartBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="jetFuselageLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="jetFuselageRight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="thrusterTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
            <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <g>
          {/* Compass Navigation Dial */}
          <circle cx="100" cy="100" r="62" stroke="url(#compassGrad)" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.5" />
          <circle cx="100" cy="100" r="54" stroke="url(#compassGrad)" strokeWidth="3.5" strokeLinecap="round" opacity="1" />
          
          <line x1="100" y1="41" x2="100" y2="48" stroke="url(#compassGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="159" x2="100" y2="152" stroke="url(#compassGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="159" y1="100" x2="152" y2="100" stroke="url(#compassGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="41" y1="100" x2="48" y2="100" stroke="url(#compassGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Growth Chart Bars */}
          <rect x="71" y="112" width="10" height="28" rx="2" fill="url(#chartBarGrad)" opacity="0.75" />
          <rect x="88" y="94" width="10" height="46" rx="2" fill="url(#chartBarGrad)" opacity="0.85" />
          <rect x="105" y="74" width="10" height="66" rx="2" fill="url(#chartBarGrad)" opacity="0.95" />

          {/* Thruster Trail */}
          <path d="M 50,135 Q 75,120 115,90" stroke="url(#thrusterTrailGrad)" strokeWidth="11" strokeLinecap="round" fill="none" />

          {/* Jet */}
          <g>
            <polygon points="162,48 108,82 129,81" fill="url(#jetFuselageLeft)" />
            <polygon points="162,48 129,81 138,98" fill="url(#jetFuselageRight)" />
            <path d="M 162,48 L 129,81" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          </g>
        </g>
      </svg>

      {/* Solid SaaS Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className="font-display font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl uppercase">
            Career<span className="text-blue-600 ml-1">Pilot</span>
          </span>
          <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-1">
            Navigate. Accelerate. Succeed.
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
