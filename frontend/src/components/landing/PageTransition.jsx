/**
 * PageTransition
 * 
 * An SVG overlay wipe that creates a curtain-of-water / falling-fabric
 * transition effect between sections. Uses SVG paths with smooth curves
 * animated by Anime.js.
 */
'use client';

import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import anime from 'animejs';

const PageTransition = forwardRef(function PageTransition(
  { color = '#2C2B29', duration = 1200 },
  ref
) {
  const overlayRef = useRef(null);
  const pathRef = useRef(null);

  const play = useCallback(
    (direction = 'in') => {
      return new Promise((resolve) => {
        if (!pathRef.current) {
          resolve();
          return;
        }

        const overlay = overlayRef.current;
        overlay.style.display = 'block';

        if (direction === 'in') {
          // Curtain falls in — fabric/water wave
          anime({
            targets: pathRef.current,
            d: [
              {
                value:
                  'M 0 0 V 0 Q 25 0 50 0 Q 75 0 100 0 V 0 H 0 Z',
              },
              {
                value:
                  'M 0 0 V 50 Q 25 65 50 50 Q 75 35 100 50 V 0 H 0 Z',
              },
              {
                value:
                  'M 0 0 V 100 Q 25 100 50 100 Q 75 100 100 100 V 0 H 0 Z',
              },
            ],
            duration: duration,
            easing: 'easeInOutSine',
            complete: () => resolve(),
          });
        } else {
          // Curtain lifts out — reverse wave
          anime({
            targets: pathRef.current,
            d: [
              {
                value:
                  'M 0 0 V 100 Q 25 100 50 100 Q 75 100 100 100 V 0 H 0 Z',
              },
              {
                value:
                  'M 0 100 V 50 Q 25 35 50 50 Q 75 65 100 50 V 100 H 0 Z',
              },
              {
                value:
                  'M 0 100 V 100 Q 25 100 50 100 Q 75 100 100 100 V 100 H 0 Z',
              },
            ],
            duration: duration,
            easing: 'easeInOutSine',
            complete: () => {
              overlay.style.display = 'none';
              resolve();
            },
          });
        }
      });
    },
    [duration]
  );

  // Expose play method to parent
  useImperativeHandle(ref, () => ({ play }), [play]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{ display: 'none' }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          ref={pathRef}
          d="M 0 0 V 0 Q 25 0 50 0 Q 75 0 100 0 V 0 H 0 Z"
          fill={color}
        />
      </svg>
    </div>
  );
});

export default PageTransition;
