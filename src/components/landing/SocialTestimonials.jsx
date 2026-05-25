"use client";

import React from 'react';

const TESTIMONIALS = [
  { name: 'Jake', location: 'US', platform: 'Reddit', text: 'bro this is actually useful as fuck. marketing always feels like a chore and this makes it way less painful.' },
  { name: 'Aman', location: 'India', platform: 'X', text: 'lol finally a tool that gets the dev pain. building is easy, marketing is the shit part.' },
  { name: 'Hassan', location: 'Pakistan', platform: 'Threads', text: 'this is kinda crazyyyyyy. finding people who actually care saves so much time.' },
  { name: 'Noah', location: 'US', platform: 'Instagram', text: "not gonna lie, this feels like something i'd actually keep using. clean idea." },
  { name: 'Rohan', location: 'India', platform: 'Reddit', text: 'shit bro, the "sounds human" part is the whole game. most tools fail right there.' },
  { name: 'Bilal', location: 'Pakistan', platform: 'X', text: "pretty damn solid. if it helps me find the right convo instead of random noise, i'm in." },
  { name: 'Ethan', location: 'US', platform: 'Threads', text: "lol this is the exact gap i've been annoyed by for months. builders need this more than 'another ai writer'." },
  { name: 'Sufyan', location: 'Pakistan', platform: 'Reddit', text: 'this looks good fr. not overcomplicated, which is rare these days.' },
  { name: 'Arjun', location: 'India', platform: 'Instagram', text: 'crazy how this turns marketing from "ugh" into something manageable. big W.' },
  { name: 'Ryan', location: 'US', platform: 'X', text: 'the positioning angle is smart. most tools just spam content and call it a day.' },
];

const PLATFORM_COLORS = {
  Reddit: '#FF4500',
  X: '#E7E9EA',
  Threads: '#aaaaaa',
  Instagram: '#E1306C'
};

export default function SocialTestimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 0',
        background: '#000',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes testiScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .testi-scroll-card {
          position: relative;
          background: #0A0A0F;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.25s ease;
          flex-shrink: 0;
          width: 280px;
          padding: 20px;
        }

        .testi-scroll-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: radial-gradient(
            500px circle at var(--mx, 50%) var(--my, 50%),
            rgba(156,32,0,0.15) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }

        .testi-scroll-card:hover::before {
          opacity: 1;
        }

        .testi-scroll-card:hover {
          border-color: rgba(156,32,0,0.45);
        }

        .testi-scroll-card > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '48px',
          padding: '0 40px'
        }}
      >
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: '#9C2000',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}
        >
          What founders are saying
        </div>

        <h2
          style={{
            fontFamily: 'Inter',
            fontWeight: 900,
            fontSize: 'clamp(28px,4vw,48px)',
            color: '#F2EDE8',
            letterSpacing: '-0.03em',
            margin: '0 0 12px'
          }}
        >
          Real feedback from real builders.
        </h2>

        <p
          style={{
            fontFamily: 'Inter',
            fontSize: '16px',
            color: '#7A7672',
            margin: 0
          }}
        >
          Unfiltered. Straight from the communities we built this for.
        </p>
      </div>

      {/* Scroller */}
      <div
        style={{ position: 'relative' }}
        onMouseMove={(e) => {
          document
            .querySelectorAll('.testi-scroll-card')
            .forEach((card) => {
              const rect = card.getBoundingClientRect();

              card.style.setProperty(
                '--mx',
                ((e.clientX - rect.left) / rect.width) * 100 + '%'
              );

              card.style.setProperty(
                '--my',
                ((e.clientY - rect.top) / rect.height) * 100 + '%'
              );
            });
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            zIndex: 2,
            background: 'linear-gradient(to right, #000, transparent)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            zIndex: 2,
            background: 'linear-gradient(to left, #000, transparent)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '14px',
            animation: 'testiScroll 120s linear infinite',
            width: 'max-content',
            padding: '10px 0'
          }}
        >
          {doubled.map((t, i) => (
            <div key={i} className="testi-scroll-card">
              {/* Platform badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    color: PLATFORM_COLORS[t.platform] || '#7A7672',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '100px',
                    padding: '3px 10px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {t.platform}
                </span>
              </div>

              {/* Quote */}
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#F2EDE8',
                  lineHeight: 1.65,
                  margin: '0 0 16px',
                  fontStyle: 'italic'
                }}
              >
                "{t.text}"
              </p>

              {/* Author */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '12px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#9C2000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter',
                    fontWeight: 800,
                    fontSize: '10px',
                    color: '#fff',
                    flexShrink: 0
                  }}
                >
                  {t.name[0]}
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#F2EDE8'
                    }}
                  >
                    {t.name}
                  </div>

                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      color: '#44403C'
                    }}
                  >
                    {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}