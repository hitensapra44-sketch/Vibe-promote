"use client";

import React, { useState } from 'react';
import { useTheme } from '../../lib/ThemeContext';

const BRANDS = [
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/6d03765e2_image.png', name: 'Brand 1' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/7b3358767_image.png', name: 'Brand 2' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/b8f98eabc_image.png', name: 'Brand 3' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/2b5282e8d_image.png', name: 'Brand 4' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/cdb03dbfe_image.png', name: 'Brand 5' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/c8a266830_cgw.jpg', name: 'Brand 6' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/b9973861f_image.png', name: 'LeadFilter' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/b0ff8644d_BilingualBeginnings.png', name: 'Bilingual Beginnings' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/1f178777e_image.png', name: 'StatScribe' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/e8f28a0d7_image.png', name: '10KV Games' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/cbda3dae0_image.png', name: 'Brand 11' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/891e22567_image.png', name: 'Brand 12' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/a6b408c95_image.png', name: 'Brand 13' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/ee94d4b1f_image.png', name: 'Brand 14' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/e73f910e4_image.png', name: 'Brand 15' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/90711122d_image.png', name: 'Brand 16' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/786cc4901_image.png', name: 'Brand 17' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/cb2bed70c_image.png', name: 'Brand 18' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/072fb4b61_ChatGPTImageMay11202606_15_10PM.png', name: 'VP' },
  { url: 'https://media.base44.com/images/public/69fdbbdfa45edc6cb1b91c40/10e167694_image.png', name: 'Brand 20' },
];

export default function BrandScroller() {
  const [clicked, setClicked] = useState(null);
  const { theme } = useTheme();
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section style={{
      borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      padding: '56px 0',
      background: theme === 'dark' ? '#000' : '#12141C',
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '13px',
          color: theme === 'dark' ? '#44403C' : '#a1a1aa',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: 0
        }}>
          1000+ SaaS<span style={{ color: '#9C2000', fontWeight: 700 }}>Automated</span> Their Marketing
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '120px',
          zIndex: 2,
          background: theme === 'dark' ? 'linear-gradient(to right, #000 0%, transparent 100%)' : 'linear-gradient(to right, #12141C 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '120px',
          zIndex: 2,
          background: theme === 'dark' ? 'linear-gradient(to left, #000 0%, transparent 100%)' : 'linear-gradient(to left, #12141C 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          gap: '0',
          animation: 'brandScroll 38s linear infinite',
          width: 'max-content',
        }}>
          {doubled.map((brand, i) => (
            <button
              key={i}
              onClick={() => setClicked(clicked === i ? null : i)}
              title={brand.name}
              style={{
                flexShrink: 0,
                width: '140px',
                height: '90px',
                margin: '0 22px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src={brand.url}
                alt={brand.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: clicked === i
                    ? 'grayscale(0%) brightness(1.1)'
                    : 'grayscale(100%) brightness(0.55)',
                  transition: 'filter 0.35s ease',
                  borderRadius: '6px',
                }}
                onMouseEnter={e => {
                  if (clicked !== i) {
                    e.currentTarget.style.filter =
                      'grayscale(30%) brightness(0.9)';
                  }
                }}
                onMouseLeave={e => {
                  if (clicked !== i) {
                    e.currentTarget.style.filter =
                      'grayscale(100%) brightness(0.55)';
                  }
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}