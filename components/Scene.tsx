'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The illustration, its placeholder, and the grain.
 *
 * The drift should be close to subliminal. If you can consciously watch it
 * move, it's turned up too far.
 */
export default function Scene({
  src,
  mobileSrc,
  placeholder,
  mobilePlaceholder,
  transitionName,
  alt,
}: {
  src: string;
  mobileSrc?: string;
  placeholder?: string;
  mobilePlaceholder?: string;
  /** Pairs with the hub card's artwork so the two morph across navigation. */
  transitionName?: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(!placeholder);

  // Decode the scene off-screen, then fade it over the blurred placeholder.
  // Without this the image pops in on a slow connection.
  useEffect(() => {
    if (!placeholder) return;

    const portrait = window.matchMedia('(orientation: portrait) and (max-width: 900px)').matches;
    const img = new Image();
    img.src = portrait && mobileSrc ? mobileSrc : src;

    if (img.complete) {
      setLoaded(true);
      return;
    }
    const done = () => setLoaded(true);
    img.addEventListener('load', done);
    img.addEventListener('error', done); // don't strand the page on a blurred stub
    return () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    };
  }, [src, mobileSrc, placeholder]);

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
      {placeholder && (
        <div
          className="scene-lqip"
          aria-hidden="true"
          style={
            {
              '--lqip': `url('${placeholder}')`,
              '--lqip-mobile': `url('${mobilePlaceholder ?? placeholder}')`,
            } as React.CSSProperties
          }
        />
      )}

      <div
        className={loaded ? 'scene-img is-loaded' : 'scene-img'}
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
            viewTransitionName: transitionName,
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
