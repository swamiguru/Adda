'use client';

import { useEffect, useRef } from 'react';

/**
 * The illustration plus its grain. One flat image per room for now - if a
 * scene later gets cut into planes, this is the only component that changes
 * and nothing else on the page needs to know.
 *
 * The drift should be close to subliminal. If you can consciously watch it
 * move, it's turned up too far.
 */
export default function Scene({
  src,
  mobileSrc,
  alt,
}: {
  src: string;
  mobileSrc?: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Motion here is decoration. Nobody who's asked the OS to stop it
    // should have to sit through it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Pointer drift is meaningless on touch and costs battery.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const tx = (e.clientX / window.innerWidth - 0.5) * -14;
      const ty = (e.clientY / window.innerHeight - 0.5) * -8;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `scale(1.04) translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scene">
      <div
        className="scene-img"
        ref={ref}
        role="img"
        aria-label={alt}
        // Both sources handed to CSS as custom properties; the media query
        // in globals.css picks one. Doing the switch in CSS rather than JS
        // means no flash of the wrong image and no resize listener.
        style={
          {
            '--scene': `url('${src}')`,
            '--scene-mobile': `url('${mobileSrc ?? src}')`,
          } as React.CSSProperties
        }
      />
      <svg className="grain" aria-hidden="true">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
      <div className="vignette" aria-hidden="true" />
    </div>
  );
}
