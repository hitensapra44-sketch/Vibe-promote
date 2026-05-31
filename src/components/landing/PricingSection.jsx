import React from 'react';

export default function PricingSection() {
  const features = [
    'Full Brand Brain setup',
    'Unlimited post generation',
    'User Finder scans',
    'Analytics dashboard',
    'Co-pilot AI strategist',
    'All future updates',
    '14-day money back guarantee'
  ];

  const Check = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <section id="pricing" style={{ borderTop: '1px solid #f4f4f5', padding: '100px 40px', background: '#ffffff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#F97316', textTransform: 'uppercase', marginBottom: '12px' }}>Pricing</div>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: '#18181b', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Simple, honest pricing.</h2>
        <p style={{ fontFamily: 'Inter', fontSize: '17px', color: '#71717a', marginBottom: '48px' }}>No tiers. No monthly billing. Just full access.</p>
        
        <div className="spotlight-card" style={{ maxWidth: '480px', margin: '0 auto', borderColor: 'rgba(249,115,22,0.35)', borderRadius: '16px', padding: '48px', textAlign: 'left', background: '#fbfbfb' }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '100px', padding: '4px 14px' }}>Lifetime Access</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '24px 0 28px' }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '64px', color: '#18181b', lineHeight: 1 }}>$49</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#71717a' }}>one-time</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check />
                <span style={{ fontFamily: 'Inter', fontSize: '15px', color: '#18181b' }}>{f}</span>
              </div>
            ))}
          </div>
          <a href="/auth" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '16px', background: '#F97316', color: '#fff', fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.25s ease', boxSizing: 'border-box' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'linear-gradient(135deg,#F97316,#EA580C)';e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.45)';}} onMouseLeave={(e) => {e.currentTarget.style.background = '#F97316';e.currentTarget.style.boxShadow = 'none';}}> Start for Free</a>
          <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#71717a', textAlign: 'center', marginTop: '16px' }}>14-day refund. No questions asked.</p>
        </div>
      </div>
    </section>
  );
}