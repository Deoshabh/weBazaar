/**
 * LandingNavbar
 * 
 * Glassmorphism navigation bar with blur effect. Minimalist lines,
 * subtle hover animations, and organic feel matching the landing page.
 */
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import anime from 'animejs';
import { useScrollProgress } from './utils/animationUtils';

const NAV_LINKS = [
  { href: '#anatomy', label: 'The Shoe' },
  { href: '#features', label: 'Philosophy' },
  { href: '#collection', label: 'Collection' },
  { href: '#about', label: 'About' },
];

export default function LandingNavbar() {
  const navRef = useRef(null);
  const scrollProgress = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isScrolled = scrollProgress > 0.02;

  // Animate nav items on mount
  useEffect(() => {
    anime({
      targets: '.nav-item',
      opacity: [0, 1],
      translateY: [-15, 0],
      delay: anime.stagger(100, { start: 300 }),
      duration: 800,
      easing: 'easeOutExpo',
    });
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (!menuRef.current) return;

    if (menuOpen) {
      anime({
        targets: menuRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });
      anime({
        targets: '.mobile-nav-item',
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: anime.stagger(80, { start: 100 }),
        duration: 500,
        easing: 'easeOutExpo',
      });
    }
  }, [menuOpen]);

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: isScrolled ? 'blur(12px) saturate(1.4)' : 'blur(0px)',
        WebkitBackdropFilter: isScrolled ? 'blur(12px) saturate(1.4)' : 'blur(0px)',
        backgroundColor: isScrolled
          ? 'rgba(230, 226, 221, 0.75)'
          : 'transparent',
        borderBottom: isScrolled ? '1px solid rgba(212, 196, 176, 0.2)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/landing"
            className="nav-item flex items-center gap-2 group"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="text-xl font-light tracking-[0.15em] transition-colors duration-300"
              style={{
                color: isScrolled ? '#2C2B29' : '#E6E2DD',
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              WEBAZAAR
            </span>
            <span
              className="text-[8px] tracking-[0.3em] uppercase opacity-50 transition-colors duration-300"
              style={{ color: isScrolled ? '#2C2B29' : '#E6E2DD' }}
            >
              &middot; Vegan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="nav-item relative group"
                style={{
                  color: isScrolled ? '#2C2B29' : 'rgba(230, 226, 221, 0.85)',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
              >
                {link.label}
                {/* Underline hover effect */}
                <span
                  className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    backgroundColor: isScrolled ? '#8B7355' : '#D4C4B0',
                  }}
                />
              </a>
            ))}
          </div>

          {/* CTA + Menu */}
          <div className="flex items-center gap-6">
            {/* Cart icon */}
            <Link
              href="/cart"
              className="nav-item relative transition-colors duration-300"
              style={{ color: isScrolled ? '#2C2B29' : '#E6E2DD' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-px transition-all duration-300"
                  style={{
                    backgroundColor: isScrolled ? '#2C2B29' : '#E6E2DD',
                    transform: menuOpen
                      ? i === 0
                        ? 'rotate(45deg) translate(3px, 3px)'
                        : i === 1
                          ? 'scaleX(0)'
                          : 'rotate(-45deg) translate(3px, -3px)'
                      : 'none',
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-full left-0 right-0 py-8 px-6"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(230, 226, 221, 0.95)',
            borderBottom: '1px solid rgba(212, 196, 176, 0.3)',
          }}
        >
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="mobile-nav-item"
                style={{
                  color: '#2C2B29',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '18px',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
