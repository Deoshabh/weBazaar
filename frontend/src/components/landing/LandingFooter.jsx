/**
 * LandingFooter
 *
 * Minimal, elegant footer matching the organic/meditative aesthetic.
 */
'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingFooter() {
  const footerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !contentRef.current) return;

    gsap.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative py-20 md:py-32"
      style={{ backgroundColor: '#2C2B29' }}
    >
      <div ref={contentRef} className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Top divider */}
        <div
          className="h-px mb-16 mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,196,176,0.3), transparent)',
            maxWidth: '200px',
          }}
        />

        {/* Brand */}
        <div className="text-center mb-16">
          <h3
            className="text-3xl md:text-4xl font-light mb-4 tracking-[0.1em]"
            style={{
              color: '#E6E2DD',
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            }}
          >
            WEBAZAAR
          </h3>
          <p
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(212, 196, 176, 0.5)' }}
          >
            Walk in Stillness
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            {
              title: 'Shop',
              links: ['The Wanderer', 'The Stillness', 'The Grounding', 'Gift Cards'],
            },
            {
              title: 'About',
              links: ['Our Story', 'Materials', 'Sustainability', 'Press'],
            },
            {
              title: 'Support',
              links: ['Sizing Guide', 'Care Instructions', 'Returns', 'Contact'],
            },
            {
              title: 'Connect',
              links: ['Instagram', 'Newsletter', 'Journal', 'Community'],
            },
          ].map((column) => (
            <div key={column.title}>
              <h4
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: 'rgba(212, 196, 176, 0.5)' }}
              >
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-300 hover:opacity-100"
                      style={{
                        color: 'rgba(230, 226, 221, 0.6)',
                        fontFamily: "'Cormorant Garamond', serif",
                        letterSpacing: '0.05em',
                        textDecoration: 'none',
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            borderTop: '1px solid rgba(212, 196, 176, 0.1)',
          }}
        >
          <p
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(212, 196, 176, 0.3)' }}
          >
            &copy; {new Date().getFullYear()} Webazaar. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Accessibility'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] tracking-[0.2em] uppercase transition-opacity hover:opacity-100"
                style={{
                  color: 'rgba(212, 196, 176, 0.3)',
                  textDecoration: 'none',
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
