import React, { useState, useEffect } from 'react';

interface DistributionHistogramProps {
  data: number[];
  title?: string;
  className?: string;
}

export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({
  data,
  title = 'Numeric Distribution (Balances)',
  className = '',
}) => {
  if (!data || data.length === 0) return null;

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animId: number;
    const start = performance.now();
    const tick = (now: number) => {
      // Decent speed: not full speed, not slow (1.6 rad/s)
      setPhase(((now - start) / 1000) * 1.6);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binCount = 8;
  const binWidth = (max - min) / binCount || 1;

  const bins = new Array(binCount).fill(0);
  data.forEach((val) => {
    let binIdx = Math.floor((val - min) / binWidth);
    if (binIdx >= binCount) binIdx = binCount - 1;
    bins[binIdx]++;
  });

  const maxFreq = Math.max(...bins, 1);
  const height = 64;
  const width = 240;
  const barWidth = Math.floor((width - (binCount - 1) * 3) / binCount);

  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-lg border border-brand-border bg-white ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-brand-hero">{title}</span>
        <span className="font-mono text-[10px] text-brand-secondary">μ = ${Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="tealBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {bins.map((freq, idx) => {
          const barHeight = Math.max(3, (freq / maxFreq) * (height - 12));
          // Subtle harmonic breathing on the bars matching the curve
          const wave = Math.sin(phase + idx * 1.1) * 2;
          const dynamicHeight = Math.max(3, Math.min(height - 6, barHeight + wave));
          const x = idx * (barWidth + 3);
          const y = height - dynamicHeight;

          return (
            <g key={idx} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={dynamicHeight}
                rx={2}
                fill="url(#tealBarGrad)"
                className="transition-all duration-300 hover:brightness-110"
              />
              <title>{`Bin ${idx + 1}: ${freq} records ($${Math.round(min + idx * binWidth)} - $${Math.round(min + (idx + 1) * binWidth)})`}</title>
            </g>
          );
        })}

        {/* Dynamic Semantic Density Curve Overlay in restrained amber/orange */}
        {(() => {
          const curvePts = bins.map((freq, idx) => {
            const baseX = idx * (barWidth + 3) + barWidth / 2;
            const baseY = height - Math.max(4, (freq / maxFreq) * (height - 12));
            // Dynamic undulating wave along the yellow density curve at decent speed
            const wave = Math.sin(phase + idx * 1.1) * 3.5;
            const y = Math.max(4, Math.min(height - 4, baseY + wave));
            return { x: baseX, y };
          });
          const curveD = curvePts.reduce((acc, pt, idx) => {
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
          }, '');
          return (
            <g>
              <path
                d={curveD}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-xs"
              />
              {/* Dynamic tracking vertices along the yellow curve */}
              {curvePts.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="2"
                  fill="#FFFFFF"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          );
        })()}
      </svg>
      <div className="flex justify-between items-center text-[10px] font-mono text-brand-secondary px-0.5">
        <span>${Math.round(min)}</span>
        <span className="flex items-center gap-1 text-brand-teal font-medium">
          <span className="inline-block w-2.5 h-0.5 bg-[#F59E0B] rounded animate-pulse"></span>
          <span>Log-Normal Skewed</span>
        </span>
        <span>${Math.round(max)}</span>
      </div>
    </div>
  );
};
