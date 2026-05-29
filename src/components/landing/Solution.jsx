import React from 'react';

export default function Solution() {
  const cards = [
    {
      title: 'Brand Brain',
      desc: 'You fill out an 8-question setup about your product, audience, and tone. That context is stored and used in every post, search, and co-pilot response — so nothing starts from scratch.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="9" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      title: 'Post Maker',
      desc: 'Generates Reddit posts, X threads, and LinkedIn content in your voice. Each post is scored before you review it. You copy and post manually — no auto-publishing.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    },
    {
      title: 'User Finder',
      desc: 'Scans communities for people actively looking for your product right now.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <circle cx="11" cy="11" r="3" />
        </svg>
      )
    },
    {
      title: 'Co-pilot',
      desc: '24/7 AI strategist that knows your Brand Brain. Ask anything about your marketing.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      title: 'Analytics',
      desc: 'Track karma, engagement, and post performance across all channels in one view.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      )
    },
    {
      title: 'One-time Price',
      desc: 'Pay once. Use forever. No subscription eating your runway.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C2000" strokeWidth="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    }
  ];

  return (
    <section id="solution" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#9C2000', textTransform: 'uppercase', marginBottom: '12px' }}>The Solution</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: '#F2EDE8', letterSpacing: '-0.03em', margin: 0 }}>One tool. Every marketing problem solved.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }} className="grid grid-cols-1 md:grid-cols-3">
          {cards.map((c, i) => (
            <div key={i} className="spotlight-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(156,32,0,0.12)', border: '1px solid rgba(156,32,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {c.icon}
              </div>
              <h4 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '17px', color: '#F2EDE8', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{c.title}</h4>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#7A7672', lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}