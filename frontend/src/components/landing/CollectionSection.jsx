/**
 * CollectionSection
 *
 * A minimal, editorial product grid with hover effects and staggered
 * scroll-triggered reveals. Each card features a subtle parallax depth shift.
 */
'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidBuyButton from './LiquidBuyButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const COLLECTION_ITEMS = [
  {
    id: 1,
    name: 'The Wanderer',
    tagline: 'For paths without names',
    price: '₹4,990',
    color: '#8B7355',
    accent: 'rgba(139, 115, 85, 0.1)',
  },
  {
    id: 2,
    name: 'The Stillness',
    tagline: 'Garden walks at dawn',
    price: '₹5,490',
    color: '#3D2F28',
    accent: 'rgba(61, 47, 40, 0.08)',
  },
  {
    id: 3,
    name: 'The Grounding',
    tagline: 'Earth beneath your feet',
    price: '₹5,990',
    color: '#6B8F71',
    accent: 'rgba(107, 143, 113, 0.1)',
  },
];

function ProductCard({ item, index }) {
  const cardRef = useRef(null);
  const imageAreaRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        delay: index * 0.15,
      }
    );
  }, [index]);

  return (
    <div ref={cardRef} className="group cursor-pointer">
      {/* Product image area */}
      <div
        ref={imageAreaRef}
        className="relative aspect-[3/4] mb-6 overflow-hidden rounded-sm flex items-center justify-center 
                   transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        style={{ backgroundColor: item.accent }}
      >
        {/* Abstract shoe silhouette placeholder */}
        <svg
          width="120"
          height="100"
          viewBox="0 0 200 160"
          fill="none"
          className="opacity-20 group-hover:opacity-30 transition-opacity duration-700"
          style={{ color: item.color }}
        >
          <path
            d="M 30 120 C 30 120 25 100 30 80 C 35 60 40 45 55 35 C 70 25 85 20 100 20 
               C 115 20 130 22 145 30 C 160 38 170 50 175 65 C 180 80 178 95 175 105 
               L 175 110 C 175 110 178 115 180 118 C 182 121 185 125 185 128 
               C 185 132 182 136 175 138 L 50 140 C 40 140 32 135 30 130 C 28 125 30 120 30 120 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.05"
          />
        </svg>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                     flex items-end justify-center pb-8"
        >
          <LiquidBuyButton variant="primary" size="sm">
            Quick Add
          </LiquidBuyButton>
        </div>

        {/* Product number */}
        <span
          className="absolute top-4 left-4 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(44, 43, 41, 0.3)' }}
        >
          No. {String(item.id).padStart(2, '0')}
        </span>
      </div>

      {/* Product info */}
      <div className="space-y-1">
        <h4
          className="text-lg font-light tracking-wide"
          style={{
            color: '#2C2B29',
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {item.name}
        </h4>
        <p
          className="text-xs tracking-wider italic"
          style={{ color: 'rgba(44, 43, 41, 0.5)' }}
        >
          {item.tagline}
        </p>
        <p
          className="text-sm tracking-wider pt-1"
          style={{ color: '#8B7355' }}
        >
          {item.price}
        </p>
      </div>
    </div>
  );
}

export default function CollectionSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
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
      id="collection"
      className="relative py-24 md:py-40"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-24">
          <p
            className="text-xs tracking-[0.5em] uppercase mb-4"
            style={{ color: 'rgba(44, 43, 41, 0.4)' }}
          >
            The Collection
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-light"
            style={{
              color: '#2C2B29',
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            }}
          >
            Three Paths,{' '}
            <em className="italic font-normal">One Journey</em>
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {COLLECTION_ITEMS.map((item, index) => (
            <ProductCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
