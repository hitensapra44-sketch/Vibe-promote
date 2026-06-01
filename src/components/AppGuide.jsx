import React, { useState, useEffect } from 'react';

const GUIDE_STEPS = [
  {
    id: 'welcome',
    tag: 'Welcome',
    title: 'Your AI marketing co-pilot is ready.',
    desc: 'Vibe Promote gives you everything you need to go from zero visibility to consistent traction — in minutes, not months.',
    mockup: 'welcome',
  },
  {
    id: 'dashboard',
    tag: 'Dashboard',
    title: 'Your marketing HQ at a glance.',
    desc: 'See every metric, every tool, and your Brand Brain status the moment you open the app. One click to any feature.',
    mockup: 'dashboard',
  },
  {
    id: 'brandbrain',
    tag: 'Brand Brain',
    title: 'Set up your Brand Brain in 5 minutes.',
    desc: 'Answer 8 quick questions about your product — or drop your URL. The AI extracts your positioning, audience, and tone automatically.',
    mockup: 'brandbrain',
  },
  {
    id: 'postmaker',
    tag: 'Post Maker',
    title: 'From idea to published in 60 seconds.',
    desc: 'Generate Reddit stories, X threads, and LinkedIn posts — all in your brand voice. Every post is scored 0-100 before you publish.',
    mockup: 'postmaker',
  },
  {
    id: 'userfinder',
    tag: 'User Finder',
    title: 'Find people already looking for your product.',
    desc: 'The AI scans Reddit and communities for real purchase intent signals — people actively asking for what you built.',
    mockup: 'userfinder',
  },
  {
    id: 'analytics',
    tag: 'Analytics',
    title: "Track what's actually working.",
    desc: 'Karma, upvotes, comments, engagement — all in one view. See which posts drive signups and double down on what works.',
    mockup: 'analytics',
  },
  {
    id: 'copilot',
    tag: 'Co-pilot',
    title: 'Your 24/7 AI marketing strategist.',
    desc: 'Ask anything. The Co-pilot knows your Brand Brain and gives advice specific to your product — not generic fluff.',
    mockup: 'copilot',
  },
];

function MockWelcome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: '20px' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #9C2000, #E85D04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'Inter', boxShadow: '0 0 40px rgba(156,32,0,0.4)' }}>VP</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '18px', color: '#F2EDE8', marginBottom: '8px' }}>Vibe<span style={{ color: '#9C2000' }}>Promote</span></div>
        <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#7A7672' }}>AI Marketing Co-pilot</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%' }}>
        {[['1,120+', 'Founders'], ['10k+', 'Leads Found'], ['4k+', 'Posts Made']].map(([n, l]) => (
          <div key={l} style={{ background: 'rgba(156,32,0,0.08)', border: '1px solid rgba(156,32,0,0.2)', borderRadius: '10px', padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '18px', color: '#E85D04' }}>{n}</div>
            <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#7A7672', marginTop: '3px' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockDashboard() {
  return (
    <div style={{ padding: '4px' }}>
      <div style={{ background: '#141419', borderRadius: '8px', padding: '12px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', color: '#F2EDE8', marginBottom: '10px' }}>Welcome back, Founder 👋</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          {[['25', 'Posts Made'], ['3.2k', 'Reach'], ['1', 'Channels']].map(([n, l]) => (
            <div key={l} style={{ background: '#1A1A22', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '18px', color: '#9C2000' }}>{n}</div>
              <div style={{ fontFamily: 'Inter', fontSize: '10px', color: '#7A7672', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[['Post Maker', '→ Create content'], ['User Finder', '→ Find audience'], ['Analytics', '→ Track growth'], ['Co-pilot', '→ Ask anything']].map(([t, sub]) => (
          <div key={t} style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', color: '#F2EDE8' }}>{t}</div>
            <div style={{ fontFamily: 'Inter', fontSize: '10px', color: '#9C2000', marginTop: '3px' }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBrainBrain() {
  return (
    <div style={{ padding: '4px' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', color: '#F2EDE8', marginBottom: '14px' }}>Brand Brain Setup</div>
      {[
        { q: 'What does your product do?', a: 'AI marketing co-pilot for SaaS founders' },
        { q: 'Who is your target audience?', a: 'Solo founders, indie hackers' },
        { q: 'What tone do you use?', a: 'Casual, direct, no-BS' },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <div style={{ fontFamily: 'Inter', fontSize: '10px', color: '#44403C', marginBottom: '4px' }}>{item.q}</div>
          <div style={{ background: '#141419', border: '1px solid rgba(156,32,0,0.2)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter', fontSize: '12px', color: '#F2EDE8' }}>{item.a}</div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', padding: '10px', background: 'rgba(156,32,0,0.08)', border: '1px solid rgba(156,32,0,0.25)', borderRadius: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9C2000', animation: 'pulse 2s infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#E85D04' }}>Brand Brain active — AI knows your product</span>
      </div>
    </div>
  );
}

function MockPostMaker() {
  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', color: '#fff', background: '#00ba7c', padding: '3px 10px', borderRadius: '100px' }}>Great Post</span>
        <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#7A7672' }}>Score: 82/100</span>
      </div>
      <div style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
        <div style={{ fontFamily: 'Inter', fontSize: '10px', color: '#9C2000', marginBottom: '5px' }}>Reddit</div>
        <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#F2EDE8', marginBottom: '6px' }}>When I spent 3 months building and nobody came...</div>
        <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#7A7672', lineHeight: 1.5, marginBottom: '6px' }}>Fixed my messaging last week. 3 days later: 47 signups from a single post.</div>
        <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#9C2000' }}>Built VibePromote to fix this — curious?</div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {['Copy Post', 'Regenerate'].map((b) => (
          <div key={b} style={{ fontFamily: 'Inter', fontSize: '10px', color: '#F2EDE8', border: '1px solid rgba(156,32,0,0.4)', borderRadius: '6px', padding: '4px 8px' }}>{b}</div>
        ))}
      </div>
    </div>
  );
}

function MockUserFinder() {
  return (
    <div style={{ padding: '4px' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px', color: '#F2EDE8', marginBottom: '10px' }}>User Finder</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {['#saas-marketing', '#indiehackers', '#growth'].map(t => (
          <span key={t} style={{ fontFamily: 'Inter', fontSize: '10px', color: '#7A7672', background: '#141419', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '100px', padding: '3px 8px' }}>{t}</span>
        ))}
      </div>
      {[
        { sub: 'r/SaaS', post: '"Anyone know a tool for SaaS marketing copy?"', score: '94% match', up: '47 upvotes' },
        { sub: 'r/indiehackers', post: '"Struggling with positioning my product..."', score: '88% match', up: '23 upvotes' },
      ].map((item, i) => (
        <div key={i} style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'Inter', fontSize: '10px', color: '#FF4500', marginBottom: '4px' }}>{item.sub}</div>
          <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#F2EDE8', marginBottom: '4px' }}>{item.post}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter', fontSize: '10px', color: '#9C2000' }}>{item.score}</span>
            <span style={{ fontFamily: 'Inter', fontSize: '10px', color: '#44403C' }}>{item.up}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockAnalytics() {
  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[['359', 'Karma', '#F2EDE8'], ['14', 'Upvotes', '#9C2000'], ['55', 'Comments', '#1D9BF0'], ['69', 'Eng.', '#00ba7c']].map(([n, l, c]) => (
          <div key={l} style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '16px', color: c }}>{n}</div>
            <div style={{ fontFamily: 'Inter', fontSize: '9px', color: '#7A7672', marginTop: '2px' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '7px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Inter', fontSize: '10px', color: '#44403C' }}>
          <span>POST</span><span>UP</span><span>ENG</span>
        </div>
        {[['Reddit launch post', '12', '47'], ['X product thread', '24', '62']].map(([p, u, e]) => (
          <div key={p} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '7px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Inter', fontSize: '10px' }}>
            <span style={{ color: '#F2EDE8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</span>
            <span style={{ color: '#7A7672' }}>{u}</span>
            <span style={{ color: '#9C2000' }}>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCopilot() {
  return (
    <div style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(156,32,0,0.2)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '9px', color: '#9C2000', fontWeight: 700, fontFamily: 'Inter' }}>AI</div>
        <div style={{ background: '#141419', borderRadius: '8px', padding: '8px 10px', fontFamily: 'Inter', fontSize: '11px', color: '#F2EDE8', lineHeight: 1.5 }}>
          Hey! I've studied your Brand Brain and I'm ready to help you grow.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: 'rgba(156,32,0,0.08)', border: '1px solid rgba(156,32,0,0.3)', borderRadius: '8px', padding: '8px 10px', fontFamily: 'Inter', fontSize: '11px', color: '#F2EDE8' }}>
          How do I pitch on Reddit?
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(156,32,0,0.2)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '9px', color: '#9C2000', fontWeight: 700, fontFamily: 'Inter' }}>AI</div>
        <div style={{ background: '#141419', borderRadius: '8px', padding: '8px 10px', fontFamily: 'Inter', fontSize: '11px', color: '#F2EDE8', lineHeight: 1.5 }}>
          For your SaaS, lead with a story about the pain. Don't pitch — share what happened to you first...
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {['Reddit pitch tips?', 'Better headlines?'].map(p => (
          <span key={p} style={{ fontFamily: 'Inter', fontSize: '10px', color: '#7A7672', background: '#141419', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '3px 8px' }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

const MOCKUP_MAP = {
  welcome: MockWelcome,
  dashboard: MockDashboard,
  brandbrain: MockBrainBrain,
  postmaker: MockPostMaker,
  userfinder: MockUserFinder,
  analytics: MockAnalytics,
  copilot: MockCopilot,
};

export default function AppGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const current = GUIDE_STEPS[step];
  const MockupComp = MOCKUP_MAP[current.mockup];
  const isLast = step === GUIDE_STEPS.length - 1;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isLast) setStep(s => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, isLast, onClose]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px', 
        animation: 'guideIn 0.25s ease', 
      }} 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes guideIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes guideSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

        @media (max-width: 640px) {
          .guide-container {
            max-height: 92vh !important;
            overflow-y: auto !important;
            margin: 10px !important;
            border-radius: 16px !important;
          }
          .guide-body {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .guide-mockup-col {
            display: none !important; /* Hide mockup on mobile to fit screen perfectly */
          }
          .guide-text-col {
            padding: 24px 20px !important;
            border-right: none !important;
          }
          .guide-tabs {
            padding: 12px 16px !important;
            gap: 4px !important;
          }
          .guide-header {
            padding: 14px 16px !important;
          }
          .guide-footer {
            padding: 14px 16px !important;
          }
        }
      `}</style>

      <div className="guide-container" style={{
        background: '#0A0A0F',
        border: '1px solid rgba(156,32,0,0.3)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '840px',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(156,32,0,0.15), 0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, #9C2000, #E85D04, #9C2000, transparent)' }} />

        {/* Header */}
        <div className="guide-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: '#F2EDE8' }}>
              Vibe<span style={{ color: '#9C2000' }}>Promote</span>
            </div>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#333' }} />
            <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#7A7672' }}>Quick Tour</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#44403C', fontSize: '20px', lineHeight: 1, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F2EDE8'}
            onMouseLeave={e => e.currentTarget.style.color = '#44403C'}>
            ✕
          </button>
        </div>

        {/* Step tabs */}
        <div className="guide-tabs" style={{ display: 'flex', gap: '6px', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {GUIDE_STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} style={{
              flexShrink: 0,
              fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
              padding: '5px 14px', borderRadius: '100px', cursor: 'pointer',
              background: i === step ? '#9C2000' : 'transparent',
              color: i === step ? '#fff' : i < step ? '#9C2000' : '#44403C',
              border: i === step ? '1px solid transparent' : i < step ? '1px solid rgba(156,32,0,0.35)' : '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.2s ease',
            }}>
              {i < step ? '✓ ' : ''}{s.tag}
            </button>
          ))}
        </div>

        {/* Body */}
        <div key={step} className="guide-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '360px', animation: 'guideSlide 0.3s ease' }}>
          {/* Left — text */}
          <div className="guide-text-col" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{
              display: 'inline-block',
              fontFamily: 'Inter', fontWeight: 700, fontSize: '11px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#E85D04', background: 'rgba(156,32,0,0.12)',
              border: '1px solid rgba(156,32,0,0.25)', borderRadius: '100px',
              padding: '4px 12px', marginBottom: '16px', alignSelf: 'flex-start'
            }}>{current.tag}</span>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(18px,2.5vw,24px)', color: '#F2EDE8', letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.2 }}>{current.title}</h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#7A7672', lineHeight: 1.7, margin: 0 }}>{current.desc}</p>

            {/* Step counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '28px' }}>
              {GUIDE_STEPS.map((_, i) => (
                <div key={i} onClick={() => setStep(i)} style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px', borderRadius: '100px',
                  background: i === step ? '#9C2000' : i < step ? 'rgba(156,32,0,0.4)' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>

          {/* Right — mockup */}
          <div className="guide-mockup-col" style={{ padding: '28px', background: '#06060A', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: '#0F0F14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', flex: 1 }}>
              <MockupComp />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="guide-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => step > 0 && setStep(s => s - 1)} style={{
            fontFamily: 'Inter', fontWeight: 500, fontSize: '14px',
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            color: step === 0 ? '#2A2A2A' : '#7A7672',
            padding: '9px 20px', borderRadius: '8px', cursor: step === 0 ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { if (step > 0) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
            ← Back
          </button>

          <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#333' }}>{step + 1} / {GUIDE_STEPS.length}</span>

          {isLast ? (
            <button onClick={onClose} style={{
              fontFamily: 'Inter', fontWeight: 700, fontSize: '14px',
              background: '#9C2000', color: '#fff',
              padding: '9px 24px', borderRadius: '8px', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 20px rgba(156,32,0,0.4)',
              border: 'none',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#9C2000,#E85D04)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(156,32,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#9C2000'; e.currentTarget.style.boxShadow = '0 0 20px rgba(156,32,0,0.4)'; }}>
              Start for Free →
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)} style={{
              fontFamily: 'Inter', fontWeight: 700, fontSize: '14px',
              background: '#9C2000', color: '#fff',
              padding: '9px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#9C2000,#E85D04)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(156,32,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#9C2000'; e.currentTarget.style.boxShadow = 'none'; }}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}