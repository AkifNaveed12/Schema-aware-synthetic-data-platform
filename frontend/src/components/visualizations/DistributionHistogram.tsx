import React from 'react';

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
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {bins.map((freq, idx) => {
          const barHeight = Math.max(3, (freq / maxFreq) * (height - 12));
          const x = idx * (barWidth + 3);
          const y = height - barHeight;

          return (
            <g key={idx} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill="url(#tealBarGrad)"
                className="transition-all duration-300 hover:brightness-110"
              />
              <title>{`Bin ${idx + 1}: ${freq} records ($${Math.round(min + idx * binWidth)} - $${Math.round(min + (idx + 1) * binWidth)})`}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between items-center text-[10px] font-mono text-brand-secondary px-0.5">
        <span>${Math.round(min)}</span>
        <span className="text-brand-teal font-medium">Log-Normal Skewed</span>
        <span>${Math.round(max)}</span>
      </div>
    </div>
  );
};
