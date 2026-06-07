import React, { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try the core tools. Upgrade when ready.',
    price: 0,
    period: '',
    cta: 'Get Started Free',
    ctaHref: '/auth',
    featured: false,
    features: [
      { label: 'Positioning Helper', value: '1 use' },
      { label: 'User Finder', value: '5 searches/month' },
      { label: 'Post Maker', value: '8 posts/month' },
      { label: 'Co-Pilot', value: '8 chats/month' },
      { label: 'Analytics', value: 'Locked', locked: true },
      { label: 'Connected Accounts', value: '1' },
      { label: 'Brand Profiles', value: '1' },
      { label: 'PDF Guide', value: 'Reddit + X guidebook' },
      { label: 'Support', value: 'Email' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For founders getting first users.',
    monthlyPrice: 15,
    annualPrice: 12,
    annualTotal: 144,
    annualSavings: 36,
    monthlyHref: 'https://checkout.dodopayments.com/buy/pdt_0NeC9rFODkRRQYNQOlHlH?quantity=1',
    annualHref: 'https://checkout.dodopayments.com/buy/pdt_0NeC9rFODkRRQYNQOlHlH?quantity=1',
    period: '/month',
    cta: 'Start 3-day free trial',
    featured: false,
    features: [
      { label: 'Positioning Helper', value: '10 uses' },
      { label: 'User Finder', value: '50 searches/month' },
      { label: 'Post Maker', value: '60 posts/month' },
      { label: 'Co-Pilot', value: '40 uses/month' },
      { label: 'Analytics', value: 'Basic' },
      { label: 'Connected Accounts', value: '2' },
      { label: 'Brand Profiles', value: '2' },
      { label: 'PDF Guide', value: 'Reddit, X, LinkedIn, IndieHackers' },
      { label: 'Support', value: 'Priority Email' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For founders serious about growth.',
    monthlyPrice: 29,
    annualPrice: 23,
    annualTotal: 276,
    annualSavings: 72,
    monthlyHref: 'https://checkout.dodopayments.com/buy/pdt_0Ne1moGR0X9lBvhgme2rO?quantity=1',
    annualHref: 'https://checkout.dodopayments.com/buy/pdt_0Ne1moGR0X9lBvhgme2rO?quantity=1',
    period: '/month',
    cta: 'Start 3-day free trial',
    featured: true,
    badge: 'Most Popular',
    features: [
      { label: 'Positioning Helper', value: 'Unlimited' },
      { label: 'User Finder', value: '200 searches/month' },
      { label: 'Post Maker', value: '250 posts/month' },
      { label: 'Co-Pilot', value: '200 uses/month' },
      { label: 'Analytics', value: 'Full access + AI insights' },
      { label: 'Connected Accounts', value: 'All platforms' },
      { label: 'Brand Profiles', value: '5' },
      { label: 'PDF Guide', value: 'Every platform' },
      { label: 'Support', value: 'Priority Support' },
    ],
  },
];

const PRICING_TESTIMONIALS = [
  { name: 'Ethan', role: 'Founder & CEO', company: 'Heliora AI', location: 'US', platform: 'Reddit', text: 'ngl almost skipped paying for it, but saving hours every week made it worth it fast.' },
  { name: 'Rohit', role: 'Founder', company: 'RiskQuilt', location: 'India', platform: 'X', text: 'felt expensive at first tbh, then realized i wasted more time overthinking marketing.' },
  { name: 'Ahmed', role: 'Founder', company: 'LaunchSaaS', location: 'Pakistan', platform: 'Threads', text: 'the user finder + positioning combo alone made me keep the subscription fr.' },
  { name: 'Mason', role: 'Founder', company: 'LateranAI', location: 'US', platform: 'Reddit', text: 'one of the few tools i kept paying for because it actually removed friction.' }
];

const FAQS = [
  {
    q: 'Is Vibe Promote worth it for an early-stage founder?',
    a: 'If marketing is taking hours every week or stopping you from shipping, Vibe Promote is built to help you create content faster without starting from scratch every time. The goal is to save time and make consistent marketing easier.'
  },
  {
    q: 'Can I try before paying?',
    a: 'Yes. You can start free and try the workflow before committing. Paid plans also include a 3-day Pro trial so you can see if it fits your process.'
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription anytime from your account settings. Your plan stays active until the end of the billing period.'
  },
  {
    q: 'What happens after the free trial ends?',
    a: 'After your trial ends, your subscription continues on the selected plan unless canceled before renewal.'
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade your plan anytime based on your needs.'
  },
  {
    q: 'What if Vibe Promote isn’t for me?',
    a: 'Try the free plan or trial first to see if it fits your workflow. If you run into issues, support is available to help you get set up and make the most of the product.'
  }
];

function CheckIcon({ color = '#F97316' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#44403C" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(-1);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 18px rgba(249,115,22,0.1), 0 0 36px rgba(249,115,22,0.05); }
          50% { box-shadow: 0 0 28px rgba(249,115,22,0.2), 0 0 56px rgba(249,115,22,0.1); }
        }

        .pricing-card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }
        .pricing-card::before {
          content:'';
          position:absolute;
          inset:0;
          border-radius:inherit;
          opacity:0;
          transition:opacity 0.4s ease;
          background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(249,115,22,0.05) 0%, transparent 60%);
          pointer-events:none;
          z-index:0;
        }
        .pricing-card:hover::before { opacity:1; }
        .pricing-card > * { position:relative; z-index:1; }
        .pricing-card:hover { transform: translateY(-4px); }

        .pro-card {
          background: linear-gradient(160deg, #FFF7ED 0%, #ffffff 40%);
          border: 1px solid rgba(249,115,22,0.3) !important;
          box-shadow: 0 0 60px rgba(249,115,22,0.05), 0 0 120px rgba(249,115,22,0.02);
        }
        .pro-card:hover {
          border-color: rgba(249,115,22,0.5) !important;
          box-shadow: 0 0 80px rgba(249,115,22,0.1), 0 20px 60px rgba(0,0,0,0.1) !important;
        }

        .pro-badge {
          background: linear-gradient(90deg, #F97316, #E85D04, #F97316);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-btn {
          display:block; width:100%; text-align:center;
          padding:13px 20px;
          font-family:'Inter',sans-serif; font-weight:700; font-size:14px;
          border-radius:10px; text-decoration:none;
          transition:all 0.25s ease;
          cursor:pointer; border:none;
        }
        .cta-btn-default {
          background: transparent;
          color: #6B7280;
          border: 1px solid rgba(0,0,0,0.08);
        }
        .cta-btn-default:hover {
          border-color: rgba(0,0,0,0.15);
          color: #111111;
        }
        .cta-btn-pro {
          background: #F97316;
          color: #fff;
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        .cta-btn-pro:hover {
          background: linear-gradient(135deg, #F97316, #E85D04);
          box-shadow: 0 8px 28px rgba(249,115,22,0.3);
          animation: none;
        }

        .feature-row {
          display:flex; align-items:flex-start; justify-content:space-between;
          gap:12px; padding: 9px 0;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .feature-row:last-child { border-bottom: none; }

        .social-proof-bar {
          animation: fadeUp 0.6s ease 0.2s both;
        }

        @media(max-width:900px) {
          .plans-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:600px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .pricing-header { padding: 60px 20px 40px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '60px', display: 'flex', alignItems: 'center', padding: '0 40px',
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <a href="/" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '18px', color: '#111111', textDecoration: 'none', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Vibe Promote Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          Vibe<span style={{ color: '#F97316' }}>Promote</span>
        </a>
        <div style={{ flex: 1 }} />
        <a href="/" style={{
          fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#6B7280',
          textDecoration: 'none', marginRight: '24px', transition: 'color 0.2s'
        }}
          onMouseEnter={e => e.target.style.color = '#111111'}
          onMouseLeave={e => e.target.style.color = '#6B7280'}>
          Back to home
        </a>
        <a href="/auth" style={{
          fontFamily: 'Inter', fontWeight: 600, fontSize: '14px',
          background: '#F97316', color: '#fff', padding: '9px 20px', borderRadius: '8px',
          textDecoration: 'none', transition: 'all 0.25s ease'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#F97316,#E85D04)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.boxShadow = 'none'; }}>
          Get Started
        </a>
      </nav>

      {/* HEADER */}
      <div className="pricing-header" style={{ paddingTop: '120px', paddingBottom: '56px', textAlign: 'center', padding: '120px 40px 56px' }}>

        {/* Social proof bar */}
        <div className="social-proof-bar" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)',
          borderRadius: '100px', padding: '8px 18px', mb: '32px', marginBottom: '32px'
        }}>
          {/* Avatars */}
          <div style={{ display: 'flex', marginRight: '4px' }}>
            {['MR', 'SP', 'JK', 'AL'].map((ini, i) => (
              <div key={ini} style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: i % 2 === 0 ? '#F97316' : '#E85D04',
                border: '2px solid #fff',
                marginLeft: i === 0 ? 0 : '-6px',
                display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center',
                fontFamily: 'Inter', fontWeight: 700, fontSize: '9px', color: '#fff'
              }}>{ini}</div>
            ))}
          </div>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px', color: '#111111' }}>
            1100 + builders went Pro and automated their marketing
          </span>
          <span className="pulse-dot" style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#F97316',
            display: 'inline-block', animation: 'pulse 2s infinite'
          }} />
        </div>

        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#F97316', textTransform: 'uppercase', marginBottom: '14px' }}>
          Pricing
        </div>
        <h1 style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(36px,5vw,64px)',
          letterSpacing: '-0.04em', lineHeight: 1,
          color: '#111111', marginBottom: '16px'
        }}>
          Pick your plan.<br />
          <span style={{ color: '#F97316' }}>Remove Marketing Headache today.</span>
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: '17px', color: '#6B7280', maxWidth: '460px', margin: '0 auto', lineHeight: 1.6 }}>
          Refund anytime. No hidden fees. Cancel anytime.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', gap: '14px', marginTop: '32px' }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '14px', fontWeight: isAnnual ? 400 : 600,
            color: isAnnual ? '#9CA3AF' : '#111111', transition: 'color 0.2s'
          }}>Monthly</span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            style={{
              width: '48px', height: '26px', borderRadius: '100px', border: 'none', cursor: 'pointer',
              background: isAnnual ? '#F97316' : 'rgba(0,0,0,0.08)',
              position: 'relative', transition: 'background 0.3s ease', flexShrink: 0
            }}
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: isAnnual ? '25px' : '3px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#fff', transition: 'left 0.3s ease',
              display: 'block'
            }} />
          </button>

          <span style={{
            fontFamily: 'Inter', fontSize: '14px', fontWeight: isAnnual ? 600 : 400,
            color: isAnnual ? '#111111' : '#9CA3AF', transition: 'color 0.2s'
          }}>
            Yearly
            <span style={{
              marginLeft: '8px', fontFamily: 'Inter', fontSize: '11px', fontWeight: 700,
              background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: '100px', padding: '2px 8px', color: '#E85D04'
            }}>Save 20%</span>
          </span>
        </div>
      </div>

      {/* PLANS GRID */}
      <div style={{ padding: '0 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="plans-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', alignItems: 'start' }}
          onMouseMove={e => {
            document.querySelectorAll('.pricing-card').forEach(card => {
              const rect = card.getBoundingClientRect();
              card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
              card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
            });
          }}
        >
          {PLANS.map(plan => {
            const isPro = plan.id === 'pro';
            return (
              <div
                key={plan.id}
                className={`pricing-card ${isPro ? 'pro-card' : ''}`}
              >
                {/* Pro top accent line */}
                {isPro && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '60%', height: '2px',
                    background: 'linear-gradient(90deg, transparent, #F97316, #E85D04, #F97316, transparent)'
                  }} />
                )}

                <div style={{ padding: '28px 24px' }}>
                  {/* Badge */}
                  {plan.badge && (
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{
                        fontFamily: 'Inter', fontWeight: 700, fontSize: '11px',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '100px', padding: '4px 12px',
                        color: '#E85D04'
                      }}>{plan.badge}</span>
                    </div>
                  )}

                  {/* Plan name & tagline */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontFamily: 'Inter', fontWeight: 800, fontSize: '20px',
                      color: '#111111',
                      letterSpacing: '-0.02em', marginBottom: '4px'
                    }}>
                      {isPro ? (
                        <span style={{
                          background: 'linear-gradient(135deg, #111111 40%, #E85D04 100%)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>{plan.name}</span>
                      ) : plan.name}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>{plan.tagline}</div>
                  </div>

                  {/* Price */}
                  {plan.id === 'free' ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '44px', letterSpacing: '-0.04em', lineHeight: 1, color: '#111111' }}>Free</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '48px', letterSpacing: '-0.04em', lineHeight: 1, color: '#111111' }}>
                          ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#9CA3AF' }}>/month</span>
                      </div>

                      {isAnnual ? (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6B7280' }}>
                            Billed ${plan.annualTotal}/year
                          </div>
                          <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#E85D04', fontWeight: 600, marginTop: '2px' }}>
                            2.5 months free — save ${plan.annualSavings}
                          </div>
                          <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                            {plan.id === 'starter' ? 'Less than 45¢ a day' : 'Less than 90¢ a day'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#9CA3AF' }}>
                            {plan.id === 'starter' ? 'Less than 50¢ a day' : 'Less than $1 a day'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={plan.id === 'free' ? plan.ctaHref : (isAnnual ? plan.annualHref : plan.monthlyHref)}
                    className={`cta-btn ${isPro ? 'cta-btn-pro' : 'cta-btn-default'}`}
                    style={{ marginBottom: '24px' }}
                  >
                    {plan.cta}
                  </a>

                  {/* Divider */}
                  <div style={{ height: '1px', background: isPro ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.04)', marginBottom: '20px' }} />

                  {/* Features */}
                  <div>
                    {plan.features.map((f, i) => (
                      <div key={i} className="feature-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ flexShrink: 0 }}>
                            {f.locked ? <LockIcon /> : <CheckIcon color={isPro ? '#E85D04' : '#F97316'} />}
                          </span>
                          <span style={{
                            fontFamily: 'Inter', fontSize: '13px',
                            color: f.locked ? '#9CA3AF' : '#6B7280'
                          }}>{f.label}</span>
                        </div>
                        <span style={{
                          fontFamily: 'Inter', fontSize: '12px', fontWeight: 500,
                          color: f.locked ? '#9CA3AF' : isPro ? '#E85D04' : '#111111',
                          textAlign: 'right', maxWidth: '100px'
                        }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom strip */}
        <div style={{
          marginTop: '48px', padding: '28px 32px',
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { icon: '✓', text: 'Refund available' },
              { icon: '✓', text: 'Cancel anytime' },
              { icon: '✓', text: 'Instant access on signup' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#F97316', fontWeight: 700, fontSize: '14px' }}>{item.icon}</span>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#111111' }}>{item.text}</span>
              </div>
            ))}
          </div>
          <a href="mailto:vibepromote@gmail.com" style={{
            fontFamily: 'Inter', fontSize: '13px', color: '#111111',
            textDecoration: 'none', transition: 'color 0.2s'
          }}
            onMouseEnter={e => e.target.style.color = '#F97316'}
            onMouseLeave={e => e.target.style.color = '#ffffff'}>
            Questions? Contact us
          </a>
        </div>

        {/* Testimonial strip */}
        <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }} className="grid grid-cols-1 md:grid-cols-2">
          {PRICING_TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px', padding: '20px 22px',
              display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: '#F97316',
                display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center',
                fontFamily: 'Inter', fontWeight: 800, fontSize: '12px', color: '#fff', flexShrink: 0
              }}>{t.name[0]}</div>
              <div>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px', color: '#111111', marginBottom: '4px' }}>{t.name} ({t.role} at {t.company})</div>
                <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6B7280', lineHeight: 1.55, margin: 0 }}>"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: '80px', maxWidth: '760px', margin: '80px auto 0' }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: '28px', color: '#111111', textAlign: 'center', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIdx === i;
              return (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifycontent: 'space-between', justifyContent: 'space-between',
                      padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', outline: 'none'
                    }}
                  >
                    <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: '#111111' }}>{faq.q}</span>
                    <span style={{ color: '#F97316', fontSize: '18px', fontWeight: 'bold' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px', fontFamily: 'Inter', fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '28px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifycontent: 'space-between', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: '#111111', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Vibe Promote Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            Vibe<span style={{ color: '#F97316' }}>Promote</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/privacy" style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#6B7280'} onMouseLeave={e => e.target.style.color = '#9CA3AF'}>Privacy</a>
            <a href="/terms" style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#6B7280'} onMouseLeave={e => e.target.style.color = '#9CA3AF'}>Terms</a>
            <a href="mailto:vibepromote@gmail.com" style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#F97316'} onMouseLeave={e => e.target.style.color = '#9CA3AF'}>Support</a>
            <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9CA3AF' }}>2026 Vibe Promote</span>
          </div>
        </div>
      </footer>
    </div>
  );
}