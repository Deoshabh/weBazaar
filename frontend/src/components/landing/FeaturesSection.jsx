/**
 * FeaturesSection
 * 
 * Features/philosophy section with GSAP ScrollTrigger animations.
 * Large serif headings rise with staggered opacity fades.
 * Each feature card has parallax depth and connector lines.
 */
'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidBuyButton from './LiquidBuyButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  {
    number: '01',
    title: 'Meditative\nWalking',
    description:
      'Each shoe is engineered to slow you down. The sole responds to your pace — the slower you walk, the more support it provides. A shoe that rewards presence.',
    detail: 'Pressure-responsive sole adapts in real-time',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="16" cy="16" r="12" />
        <circle cx="16" cy="16" r="6" />
        <circle cx="16" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Zero\nChemicals',
    description:
      'No chromium, no formaldehyde, no petrochemicals. Our vegan leather is grown from mycelium and plant fibers — materials that breathe, age beautifully, and return to the earth.',
    detail: '100% biodegradable within 24 months',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 4c0 8-8 12-8 20h16c0-8-8-12-8-20z" />
        <path d="M12 28h8" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Foot\nHealth',
    description:
      'Designed with podiatrists who practice barefoot science. The anatomical last mirrors your foot\'s natural shape — wide toe box, zero heel drop, flexible sole.',
    detail: 'Endorsed by 40+ podiatrists worldwide',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M8 28c0-4 2-8 4-12s4-8 4-12" />
        <path d="M24 28c0-4-2-8-4-12s-4-8-4-12" />
        <path d="M8 20h16" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Living\nMaterial',
    description:
      'Our vegan leather develops a patina over time, like fine aged wine. It tells the story of your walks — through rain, sun, cobblestones, and grass.',
    detail: 'Each pair is unique after 6 months of wear',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 16c4-8 16-8 20 0" />
        <path d="M6 16c4 8 16 8 20 0" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
  },
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const card = cardRef.current;
    if (!card) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 75%',
        end: 'top 30%',
        toggleActions: 'play none none reverse',
      },
    });

    // Staggered reveal
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }
    )
      .fromTo(
        numberRef.current,
        { opacity: 0, x: -20 },
        { opacity: 0.3, x: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      );

    return () => tl.kill();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={cardRef}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center py-20 md:py-32 ${
        isEven ? '' : 'md:[direction:rtl]'
      }`}
    >
      {/* Left/Right content */}
      <div className={isEven ? '' : 'md:[direction:ltr]'}>
        {/* Top line */}
        <div
          ref={lineRef}
          className="h-px mb-8 origin-left"
          style={{
            background: 'linear-gradient(90deg, #8B7355, transparent)',
            transformOrigin: 'left center',
          }}
        />

        {/* Number */}
        <span
          ref={numberRef}
          className="block text-7xl md:text-8xl font-light mb-4"
          style={{
            color: '#2C2B29',
            opacity: 0.1,
            fontFamily: "'Cormorant Garamond', serif",
            lineHeight: 0.9,
          }}
        >
          {feature.number}
        </span>

        {/* Title */}
        <h3
          ref={titleRef}
          className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 whitespace-pre-line"
          style={{
            color: '#2C2B29',
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            letterSpacing: '0.02em',
            lineHeight: 1.15,
          }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <div ref={descRef}>
          <p
            className="text-sm md:text-base leading-relaxed mb-4 max-w-md"
            style={{ color: 'rgba(44, 43, 41, 0.7)' }}
          >
            {feature.description}
          </p>
          <p
            className="text-xs tracking-[0.2em] uppercase flex items-center gap-2"
            style={{ color: '#8B7355' }}
          >
            <span className="w-4 h-px bg-current" />
            {feature.detail}
          </p>
        </div>
      </div>

      {/* Icon/Visual side */}
      <div className={`flex justify-center ${isEven ? '' : 'md:[direction:ltr]'}`}>
        <div
          className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle, rgba(212,196,176,0.15) 0%, transparent 70%)',
          }}
        >
          <div
            className="absolute inset-4 rounded-full"
            style={{
              border: '1px solid rgba(139, 115, 85, 0.15)',
            }}
          />
          <div style={{ color: '#8B7355', opacity: 0.6 }}>{feature.icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !headerRef.current) return;

    // Header parallax
    gsap.fromTo(
      headerRef.current,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-20 md:py-32"
      style={{ backgroundColor: '#E6E2DD' }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-24">
          <p
            className="text-xs tracking-[0.5em] uppercase mb-4"
            style={{ color: 'rgba(44, 43, 41, 0.4)' }}
          >
            Our Philosophy
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-light"
            style={{
              color: '#2C2B29',
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              letterSpacing: '0.02em',
            }}
          >
            Designed for{' '}
            <em className="italic font-normal">Presence</em>
          </h2>
        </div>

        {/* Feature cards */}
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.number} feature={feature} index={index} />
        ))}

        {/* CTA section */}
        <div className="text-center py-20">
          <p
            className="text-sm mb-8 tracking-wider"
            style={{
              color: 'rgba(44, 43, 41, 0.6)',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Begin your meditative walk
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LiquidBuyButton variant="primary" size="lg">
              Shop the Collection
            </LiquidBuyButton>
            <LiquidBuyButton variant="secondary" size="lg">
              Our Story
            </LiquidBuyButton>
          </div>
        </div>
      </div>
    </section>
  );
}
