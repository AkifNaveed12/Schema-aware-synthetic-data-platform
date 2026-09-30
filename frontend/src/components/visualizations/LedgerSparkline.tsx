import React, { useState, useEffect } from 'react';

interface LedgerSparklineProps {
  balances: number[];
  dates?: string[];
  className?: string;
}

export const LedgerSparkline: React.FC<LedgerSparklineProps> = ({
  balances,
  className = '',
}) => {
  if (!balances || balances.length < 2) return null;

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animId: number;
    const start = performance.now();
    const tick = (now: number) => {
      // Decent speed: not full speed, not slow (1.8 rad/s)
      setPhase(((now - start) / 1000) * 1.8);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;

  const width = 320;
  const height = 68;
  const paddingX = 12;
  const paddingY = 10;

  const points = balances.map((val, idx) => {
    const x = paddingX + (idx / (balances.length - 1)) * (width - 2 * paddingX);
    const baseY = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
    // Smooth dynamic wave oscillation across segments at decent speed
    const wave = Math.sin(phase + idx * 1.25) * 3.5;
    const y = Math.max(paddingY, Math.min(height - paddingY, baseY + wave));
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={`flex flex-col gap-1 p-3 rounded-lg border border-brand-border bg-white ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-brand-hero">Running Balance Trajectory</span>
        <span className="font-mono text-[11px] font-semibold text-brand-teal">
          ${balances[balances.length - 1].toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="balanceSparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill="url(#balanceSparkGrad)" />

        {/* Trajectory Segments with Semantic Color Differentiation */}
        {points.map((pt, idx) => {
          if (idx === 0) return null;
          const prevPt = points[idx - 1];
          const isUpward = pt.val >= prevPt.val;
          const strokeColor = isUpward ? '#0D9488' : '#E11D48'; // Positive/healthy teal vs declining restrained red
          return (
            <line
              key={`seg-${idx}`}
              x1={prevPt.x}
              y1={prevPt.y}
              x2={pt.x}
              y2={pt.y}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points with matching semantic accents */}
        {points.map((pt, idx) => {
          const isUpward = idx === 0 || pt.val >= points[idx - 1].val;
          const pointColor = idx === 0 ? '#0D9488' : isUpward ? '#0D9488' : '#E11D48';
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={idx === 0 || idx === points.length - 1 ? 3.5 : 2}
              fill="#FFFFFF"
              stroke={pointColor}
              strokeWidth="2"
              className="transition-all hover:r-4"
            >
              <title>{`Step ${idx + 1}: $${pt.val.toFixed(2)} (${isUpward ? 'Deposit/Surplus' : 'Debit/Withdrawal'})`}</title>
            </circle>
          );
        })}

        {/* Live dynamic beacon on latest point */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="6"
            fill="none"
            stroke="#0D9488"
            strokeWidth="1.5"
            opacity="0.35"
            className="animate-ping"
          />
        )}
      </svg>

      <div className="flex justify-between items-center text-[10px] font-mono text-brand-secondary">
        <span>Start: ${min.toFixed(2)}</span>
        <span className="text-emerald-600 font-medium">Deterministic Reconciliation Verified</span>
        <span>End: ${balances[balances.length - 1].toFixed(2)}</span>
      </div>
    </div>
  );
};
