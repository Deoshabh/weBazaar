'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function HeroAnimate({
    children,
    backgroundUrl,
    animationType = 'stagger',
    className = ''
}) {
    const containerRef = useRef(null);
    const bgRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const explicitTargets = contentRef.current
            ? Array.from(contentRef.current.querySelectorAll('[data-hero-animate]'))
            : [];
        const contentChildren = explicitTargets.length > 0
            ? explicitTargets
            : (contentRef.current ? Array.from(contentRef.current.children) : []);

        if (contentChildren.length === 0) return;

        if (animationType === 'none') {
            anime.set(contentChildren, {
                opacity: 1,
                translateX: 0,
                translateY: 0,
            });
            return;
        }

        if (animationType === 'fade-up') {
            anime({
                targets: contentChildren,
                translateY: [30, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 900,
                delay: anime.stagger(120),
            });
            return;
        }

        if (animationType === 'slide-in') {
            anime({
                targets: contentChildren,
                translateX: [-48, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 900,
                delay: anime.stagger(120),
            });
            return;
        }

        if (animationType === 'typewriter') {
            const [firstChild, ...restChildren] = contentChildren;
            const timeline = anime.timeline({
                easing: 'easeOutCubic',
            });

            if (firstChild) {
                const firstElement = firstChild;
                firstElement.style.overflow = 'hidden';
                firstElement.style.whiteSpace = 'nowrap';

                anime.set(firstElement, {
                    width: 0,
                    opacity: 1,
                });

                timeline.add({
                    targets: firstElement,
                    width: [0, firstElement.scrollWidth || 600],
                    duration: 900,
                    complete: () => {
                        firstElement.style.width = '';
                        firstElement.style.overflow = '';
                        firstElement.style.whiteSpace = '';
                    },
                });
            }

            if (restChildren.length > 0) {
                timeline.add(
                    {
                        targets: restChildren,
                        translateY: [20, 0],
                        opacity: [0, 1],
                        duration: 700,
                        delay: anime.stagger(120),
                    },
                    '-=150',
                );
            }
            return;
        }

        if (contentChildren.length > 0) {
            anime({
                targets: contentChildren,
                translateY: [50, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 1000,
                delay: anime.stagger(150),
            });
        }
    }, [animationType]);

    // Parallax Effect
    useEffect(() => {
        const handleScroll = () => {
            if (!bgRef.current) return;
            const scrolled = window.scrollY;
            // Parallax: background moves at 40% speed of scroll
            // We use transform instead of background-position for better performance
            bgRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {/* Parallax Background Layer */}
            {backgroundUrl && (
                <div
                    ref={bgRef}
                    className="absolute inset-0 z-0 w-full h-[120%] -top-[10%] bg-cover bg-center pointer-events-none will-change-transform"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            {/* Content Layer */}
            <div ref={contentRef} className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
}
