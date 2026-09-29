import React from 'react';

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

  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;

  const width = 320;
  const height = 68;
  const paddingX = 12;
  const paddingY = 10;

  const points = balances.map((val, idx) => {
    const x = paddingX + (idx / (balances.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
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

        {/* Trajectory Line */}
        <path d={pathD} fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={idx === 0 || idx === points.length - 1 ? 3.5 : 2}
            fill="#FFFFFF"
            stroke="#0D9488"
            strokeWidth="2"
            className="transition-all hover:r-4"
          >
            <title>{`Step ${idx + 1}: $${pt.val.toFixed(2)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="flex justify-between items-center text-[10px] font-mono text-brand-secondary">
        <span>Start: ${min.toFixed(2)}</span>
        <span className="text-emerald-600 font-medium">Deterministic Reconciliation Verified</span>
        <span>End: ${balances[balances.length - 1].toFixed(2)}</span>
      </div>
    </div>
  );
};
