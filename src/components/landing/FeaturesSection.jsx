import React, { useState, useEffect, useRef, useCallback } from 'react';
import ScrollReveal from './ScrollReveal';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', color: '#E85D04' },
  { id: 'userfinder', label: 'User Finder', color: '#F97316' },
  { id: 'postmaker', label: 'Post Maker', color: '#00ba7c' },
  { id: 'analytics', label: 'Analytics', color: '#1d9bf0' },
  { id: 'copilot', label: 'Co-pilot', color: '#a855f7' },
];

const tabContent = {
  dashboard: {
    tag: 'Dashboard',
    title: 'Track everything from one place',
    desc: 'Track your audience insights, content performance, connected accounts, and growth activity from a single dashboard. So, you dont waste time tracking everything manualy',
    bullets: [
      'Real-time activity: posts generated, audience found, channels connected',
      'One-click access to every tool from a single view',
      'Brand Brain status and quick update prompt if your product changes',
      'Target audience, platform, and marketing goal always visible',
    ],
  },
  userfinder: {
    tag: 'User Finder',
    title: 'Find people that are talking about the problem your app/saas solves',
    desc: "Stop guessing who your customers are. User Finder scans Reddit and hacker news communities in real-time to surface people actively asking for what you built.",
    bullets: [
      'AI-generated keyword list from your Brand Brain, no manual setup',
      'Scans Reddit threads and posts for intent signals',
      "See potential users' posts, engagement levels, and subreddit context",
      'Re-scan anytime as your targeting evolves',
    ],
  },
  postmaker: {
    tag: 'Post Maker',
    title: 'Create content that sounds like you and converts.',
    desc: 'Generate Reddit posts, X threads, and LinkedIn content — scored, structured, and CTA-ready. All written to sound like you and to convert your ICP.',
    bullets: [
      'AI scores your post 0–100 before you publish',
      'Platform-specific format: Reddit storytelling, X threads, LinkedIn thought leadership',
      'Copy, Regenerate, or Try Different Template with one click',
      'CTA automatically embedded in your brand voice',
    ],
  },
  analytics: {
    tag: 'Analytics',
    title: "Make better stratgies using your current analytics.",
    desc: 'Track performance across Redditd (X an LinkedIn coming soon) in real-time. Karma, upvotes, comments, engagement — all in one place.',
    bullets: [
      'Weekly, monthly, and custom date range views',
      'Per-post breakdown: upvotes, comments, engagement score',
      'Connect your Reddit account to pull live data automatically',
      'AI co-pilot can analyze your analytics and suggest next steps',
    ],
  },
  copilot: {
    tag: 'Co-pilot',
    title: 'Your 24/7 AI marketing strategist for your app/saas.',
    desc: "Ask anything about your marketing. The Co-pilot has read your Brand Brain and knows your product — it gives advice specific to you, not generic tips.",
    bullets: [
      'Pre-loaded with your Brand Brain: knows your niche, audience, and goals',
      '"How should I pitch on Reddit?" — get a product-specific answer',
      'Quick-start prompts for common founder marketing questions',
      "Tied to your analytics — ask what's working and what to change",
    ],
  },
};

function BrowserChrome({ url, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div style={{ marginLeft: '8px', flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '5px', padding: '3px 10px', fontFamily: 'Inter', fontSize: '11px', color: '#44403C' }} >
          <span style={{ color: '#333', marginRight: '4px' }}> 🔒 </span> vibepromote.tech
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="font-geist text-lg text-foreground" style={{ fontWeight: 700 }}>Welcome, Founder</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[['25', 'Posts Generated'], ['3', 'Audience Found'], ['1', 'Channels']].map(([n, l]) => (
            <div key={l} className="p-3 rounded-lg text-center" style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-geist text-xl text-primary" style={{ fontWeight: 800 }}>{n}</p>
              <p className="font-geist text-xs text-muted-foreground mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['Post Maker', 'User Finder'].map(t => (
          <div key={t} className="p-3 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-geist text-sm text-foreground font-medium">{t}</p>
            <p className="font-geist text-xs text-muted-foreground mt-1">Quick access →</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserFinderMockup() {
  return (
    <div className="flex flex-col items-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center animate-spin" style={{ border: '3px solid rgba(232,93,4,0.2)', borderTopColor: '#E85D04', animationDuration: '1.5s' }} />
      <p className="font-geist text-lg text-foreground" style={{ fontWeight: 700 }}>Scanning for potential users...</p>
      <p className="font-geist text-xs text-muted-foreground">Searching Reddit communities for intent signals</p>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {['#marketing-automation', '#saas-tools', '#growth-hacking', '#indiehackers'].map(tag => (
          <span key={tag} className="font-geist text-xs px-3 py-1.5 rounded-full text-muted-foreground"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function PostMakerMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-geist text-xs px-2.5 py-1 rounded-full text-white" style={{ background: '#00ba7c' }}>Great Post</span>
        <span className="font-geist text-xs text-muted-foreground">Score: 82/100</span>
      </div>
      <div className="p-4 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="font-geist text-xs text-primary">Reddit</span>
        <p className="font-geist text-sm text-foreground mt-2" style={{ fontWeight: 700 }}>
          When I spent 3 months searching for the perfect influencer...
        </p>
        <p className="font-geist text-xs text-muted-foreground mt-2 leading-relaxed">
          I was doing outreach for my SaaS and nothing was landing. The messaging was generic, the targeting was off, and I was burning hours every week...
        </p>
        <p className="font-geist text-xs text-primary mt-2">
          Built VibePromote to fix this – if anyone's curious
        </p>
      </div>
      <div className="flex gap-2">
        {['Copy Post', 'Regenerate', 'Try Different Template'].map(btn => (
          <button key={btn} className="font-geist text-xs px-3 py-2 rounded-lg text-foreground transition-colors"
            style={{ background: 'transparent', border: '1px solid rgba(232,93,4,0.3)' }}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[
          ['359', 'Total Karma', '#f0ede8'],
          ['14', 'Upvotes', '#E85D04'],
          ['55', 'Comments', '#1D9BF0'],
          ['69', 'Engagement', '#00ba7c'],
        ].map(([n, l, c]) => (
          <div key={l} className="p-3 rounded-lg text-center" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-geist text-lg" style={{ fontWeight: 800, color: c }}>{n}</p>
            <p className="font-geist text-xs text-muted-foreground mt-1">{l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg overflow-hidden" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-4 px-3 py-2 text-xs font-geist text-muted-foreground" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span>POST</span><span>↑</span><span>💬</span><span>ENG</span>
        </div>
        {[['Reddit launch post', '12', '8', '47'], ['X product thread', '24', '15', '62']].map(([p, u, c, e]) => (
          <div key={p} className="grid grid-cols-4 px-3 py-2.5 text-xs font-geist" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-foreground truncate">{p}</span>
            <span className="text-muted-foreground">{u}</span>
            <span className="text-muted-foreground">{c}</span>
            <span className="text-primary">{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopilotMockup() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(232,93,4,0.2)' }}>AI</div>
        <div className="p-3 rounded-lg font-geist text-xs text-foreground leading-relaxed" style={{ background: '#161616' }}>
          Hey! I've studied your Brand Brain and I'm ready to help you grow.
        </div>
      </div>
      <div className="flex justify-end">
        <div className="p-3 rounded-lg font-geist text-xs text-foreground max-w-[80%]"
          style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.3)' }}>
          improve my saas marketing strategy
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(232,93,4,0.2)' }}>AI</div>
        <div className="p-3 rounded-lg font-geist text-xs text-foreground leading-relaxed" style={{ background: '#161616' }}>
          Your core value: delivering faster, higher-ROI results by replacing guesswork with AI-powered positioning...
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {['How should I pitch my SaaS on Reddit?', 'What onboarding emails fit my product?', 'Ideas to differentiate from competitors?', 'Landing page headlines for my app'].map(p => (
          <span key={p} className="font-geist text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

const mockups = {
  dashboard: DashboardMockup,
  userfinder: UserFinderMockup,
  postmaker: PostMakerMockup,
  analytics: AnalyticsMockup,
  copilot: CopilotMockup,
};

export default function FeaturesSection() {
  const [active, setActive] = useState('dashboard');
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);
  const inactivityRef = useRef(null);

  const startAutoAdvance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => {
        const idx = tabs.findIndex(t => t.id === prev);
        return tabs[(idx + 1) % tabs.length].id;
      });
      setAnimKey(k => k + 1);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, [startAutoAdvance]);

  const handleTabClick = (id) => {
    setActive(id);
    setAnimKey(k => k + 1);
    if (timerRef.current) clearInterval(timerRef.current);
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => startAutoAdvance(), 8000);
  };

  const content = tabContent[active];
  const Mockup = mockups[active];

  return (
    <section id="features" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-geist text-xs tracking-[0.2em] uppercase text-primary font-medium">Features</span>
          <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Everything you need to automate marketing.
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="font-geist text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300"
              style={active === tab.id ? {
                background: 'linear-gradient(135deg, #E85D04, #F97316)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(232,93,4,0.3)',
              } : {
                background: '#161616',
                color: '#888888',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: active === tab.id ? '#fff' : tab.color }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <ScrollReveal key={animKey}>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Left text */}
            <div className="flex-1 space-y-4">
              <span className="font-geist text-xs px-3 py-1 rounded-full text-primary" style={{ background: 'rgba(232,93,4,0.12)', border: '1px solid rgba(232,93,4,0.3)' }}>
                {content.tag}
              </span>
              <h3 className="font-geist text-2xl sm:text-3xl text-foreground" style={{ fontWeight: 700 }}>
                {content.title}
              </h3>
              <p className="font-geist text-muted-foreground leading-relaxed">{content.desc}</p>
              <ul className="space-y-2.5 mt-4">
                {content.bullets.map((b, i) => (
                  <li key={i} className="font-geist text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Right mockup */}
            <div className="flex-1 w-full">
              <BrowserChrome url={`localhost:32110/${active === 'dashboard' ? 'dashboard' : active === 'userfinder' ? 'audience-spotter' : active === 'postmaker' ? 'post-maker' : active === 'analytics' ? 'dashboard/analytics' : 'marketing-buddy'}`}>
                <Mockup />
              </BrowserChrome>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}