"use client";

import React from 'react';
import { useTheme } from '../../lib/ThemeContext';

const TESTIMONIALS = [
  { name: 'Jake', role: 'Founder', company: 'SpendKeep', location: 'US', platform: 'Reddit', text: 'ngl this made marketing feel way less annoying. stopped overthinking every post.' },
  { name: 'Aman', role: 'Founder', company: 'Heliora AI', location: 'India', platform: 'X', text: 'lowkey helped me explain my product way better. positioning was solid.' },
  { name: 'Hassan', role: 'Founder', company: 'ScoutJob.me', location: 'Pakistan', platform: 'Threads', text: 'finding real convos instead of random noise is actually useful fr.' },
  { name: 'Noah', role: 'Founder', company: 'LaunchVideo', location: 'US', platform: 'Instagram', text: 'feels built for devs tbh. i just wanna ship, not think about content all day.' },
  { name: 'Rohan', role: 'Founder', company: 'LateranAI', location: 'India', platform: 'Reddit', text: 'the content feels human lol. way less robotic than other ai tools ive tried.' },
  { name: 'Bilal', role: 'Founder', company: 'Slotably', location: 'Pakistan', platform: 'X', text: 'saved me from staring at a blank page every time i wanted to post.' },
  { name: 'Ethan', role: 'Founder & CEO', company: 'RiskQuilt', location: 'US', platform: 'Threads', text: 'finally something that helps with marketing without making it feel like homework.' },
  { name: 'Sufyan', role: 'Founder', company: 'ScrapScout', location: 'Pakistan', platform: 'Reddit', text: 'user finder is lowkey the best part. found ppl already talking about my problem.' },
  { name: 'Arjun', role: 'Founder', company: 'RankQuest', location: 'India', platform: 'Instagram', text: 'marketing still sucks lol but this makes it way more manageable.' },
  { name: 'Ryan', role: 'Founder', company: 'Dashbee', location: 'US', platform: 'X', text: 'the positioning suggestions were surprisingly good ngl.' },
  { name: 'Daniel', role: 'Founder', company: 'Giftime', location: 'US', platform: 'Reddit', text: 'used to spend hours thinking what to post. now i tweak and ship it.' },
  { name: 'Hamza', role: 'Founder', company: 'Navi', location: 'Pakistan', platform: 'Threads', text: 'lowkey helped me stop sounding robotic online lol.' },
  { name: 'Kabir', role: 'Founder', company: 'Jotley', location: 'India', platform: 'X', text: 'felt less lost with marketing after using this. simple but useful.' },
  { name: 'Mason', role: 'Founder', company: 'NutriBalance', location: 'US', platform: 'Reddit', text: 'honestly just nice not having to think so hard before posting.' },
  { name: 'Zayan', role: 'Founder', company: 'StockArithm', location: 'Pakistan', platform: 'Instagram', text: 'the reddit angle is smart fr. saves a ton of digging.' },
  { name: 'Aryan', role: 'Founder', company: 'CookSlate', location: 'India', platform: 'Threads', text: 'finally posting consistently because it takes less mental energy.' },
  { name: 'Chris', role: 'Founder', company: 'RoleSense', location: 'US', platform: 'X', text: 'feels practical. not just another ai writer throwing random content.' },
  { name: 'Ahmed', role: 'Founder', company: 'Principal Task', location: 'Pakistan', platform: 'Reddit', text: 'fr the user finder part alone saved me hours every week.' },
  { name: 'Dev', role: 'Founder', company: 'QueryDeck', location: 'India', platform: 'X', text: 'the hook suggestions are solid. posts feel more clear now.' },
  { name: 'Logan', role: 'Founder', company: 'LifeOrder', location: 'US', platform: 'Threads', text: 'more like a growth helper than another generic ai thing tbh.' },
  { name: 'Taha', role: 'Founder', company: 'StorageZen', location: 'Pakistan', platform: 'Instagram', text: 'found actual ppl talking about my niche. thats kinda huge ngl.' },
  { name: 'Yash', role: 'Founder', company: 'Taskomon', location: 'India', platform: 'Reddit', text: 'finally something that gets builder problems and keeps things simple.' },
  { name: 'Eli', role: 'Founder', company: 'HumanFound', location: 'US', platform: 'X', text: 'positioning part was lowkey the biggest win for me.' },
  { name: 'Ayaan', role: 'Founder', company: 'MemberPass', location: 'India', platform: 'Threads', text: 'marketing still isnt fun lol but now it feels doable.' },
  { name: 'Usman', role: 'Founder', company: 'IntentiQS', location: 'Pakistan', platform: 'Reddit', text: 'fr this removed a lot of the mental friction around marketing.' },
  { name: 'Liam', role: 'Founder', company: 'Voicepad', location: 'US', platform: 'Instagram', text: 'helped me explain what my app actually does way better.' },
  { name: 'Faizan', role: 'Founder', company: 'WebUtilBox', location: 'Pakistan', platform: 'X', text: 'not magic lol but makes marketing feel less messy tbh.' },
  { name: 'Karan', role: 'Founder', company: 'Onpilot', location: 'India', platform: 'Threads', text: 'content feels less robotic than most ai tools ive tried.' },
  { name: 'Owen', role: 'Founder', company: 'UptimeGuard', location: 'US', platform: 'Reddit', text: 'honestly just nice having less mental load around content.' },
  { name: 'Saad', role: 'Founder', company: 'RenderPix', location: 'Pakistan', platform: 'X', text: 'lowkey made me post more because i stopped overthinking everything.' }
];

const PLATFORM_COLORS = {
  Reddit: '#FF4500',
  X: '#18181b',
  Threads: '#71717a',
  Instagram: '#E1306C'
};

export default function SocialTestimonials() {
  const { theme } = useTheme();
  // Split testimonials into two rows
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const row1 = TESTIMONIALS.slice(0, half);
  const row2 = TESTIMONIALS.slice(half);

  const doubledRow1 = [...row1, ...row1];
  const doubledRow2 = [...row2, ...row2];

  return (
    <section
      style={{
        borderTop: '1px solid #f4f4f5',
        padding: '80px 0',
        background: '#ffffff',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes testiScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes testiScrollReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .testi-scroll-card {
          position: relative;
          background: #fbfbfb;
          border: 1px solid #e4e4e7;
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
            rgba(249,115,22,0.1) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }

        .testi-scroll-card:hover::before {
          opacity: 1;
        }

        .testi-scroll-card:hover {
          border-color: rgba(249,115,22,0.45);
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
            color: '#F97316',
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
            color: '#18181b',
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
            color: '#71717a',
            margin: 0
          }}
        >
          Unfiltered. Straight from the communities we built this for.
        </p>
      </div>

      {/* Scroller Container */}
      <div
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}
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
            background: 'linear-gradient(to right, #ffffff, transparent)',
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
            background: 'linear-gradient(to left, #ffffff, transparent)',
            pointerEvents: 'none'
          }}
        />

        {/* Row 1: Scrolling Left */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            animation: 'testiScroll 80s linear infinite',
            width: 'max-content',
            padding: '5px 0'
          }}
        >
          {doubledRow1.map((t, i) => (
            <div key={`row1-${i}`} className="testi-scroll-card">
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
                    color: PLATFORM_COLORS[t.platform] || '#71717a',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '100px',
                    padding: '3px 10px',
                    border: '1px solid #e4e4e7'
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
                  color: '#18181b',
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
                  borderTop: '1px solid #e4e4e7',
                  paddingTop: '12px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#F97316',
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
                      color: '#18181b'
                    }}
                  >
                    {t.name}
                  </div>

                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      color: '#71717a'
                    }}
                  >
                    {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Scrolling Right */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            animation: 'testiScrollReverse 80s linear infinite',
            width: 'max-content',
            padding: '5px 0'
          }}
        >
          {doubledRow2.map((t, i) => (
            <div key={`row2-${i}`} className="testi-scroll-card">
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
                    color: PLATFORM_COLORS[t.platform] || '#71717a',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '100px',
                    padding: '3px 10px',
                    border: '1px solid #e4e4e7'
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
                  color: '#18181b',
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
                  borderTop: '1px solid #e4e4e7',
                  paddingTop: '12px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#F97316',
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
                      color: '#18181b'
                    }}
                  >
                    {t.name}
                  </div>

                  <div
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      color: '#71717a'
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