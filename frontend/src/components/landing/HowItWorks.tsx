import React, { useRef, useEffect } from 'react';
import desktopSvg from '../../assets/datavault-flow/datavault-flow-desktop.svg?raw';
import mobileSvg from '../../assets/datavault-flow/datavault-flow-mobile.svg?raw';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        el.classList.toggle('dv-paused', !e.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="dv-how-title"
      className="px-6 py-16 max-w-6xl mx-auto w-full"
    >
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-semibold">
          HOW IT WORKS
        </span>
        <h2
          id="dv-how-title"
          className="text-2xl sm:text-3xl font-bold text-brand-hero mt-1"
        >
          From intent to trusted data.
        </h2>
        <p className="text-xs text-brand-secondary mt-2 max-w-2xl leading-relaxed">
          DataVault understands your data or requirements, generates realistic
          synthetic datasets, evaluates the result, and improves it before you
          export.
        </p>
      </div>

      <div ref={ref} className="dv-flow-wrap">
        {/* Theme token bridge — maps site design tokens to SVG custom properties */}
        <div
          className="dv-flow-slot dv-flow-slot--desktop"
          dangerouslySetInnerHTML={{ __html: desktopSvg }}
        />
        <div
          className="dv-flow-slot dv-flow-slot--mobile"
          dangerouslySetInnerHTML={{ __html: mobileSvg }}
        />
      </div>
    </section>
  );
};
