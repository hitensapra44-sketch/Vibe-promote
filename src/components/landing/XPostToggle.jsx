import React, { useState, useRef, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

const offStats = { likes: 3, comments: 1, reposts: 0, views: 214 };
const onStats = { likes: 2847, comments: 143, reposts: 312, views: 94200 };

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}

function useAnimatedCount(target, duration, enabled) {
  const [value, setValue] = useState(target);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const to = target;
    startRef.current = null;
    
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setValue(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else fromRef.current = to;
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, enabled]);

  return value;
}

function StatItem({ icon, value, duration, enabled, colorOn }) {
  const animated = useAnimatedCount(value, duration, enabled);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{icon}</span>
      <span className="font-geist text-sm transition-colors duration-300" style={{ color: enabled ? colorOn : '#666' }}>
        {formatNum(animated)}
      </span>
    </div>
  );
}

export default function XPostToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-geist text-xs tracking-[0.2em] uppercase text-primary font-medium">See The Impact</span>
          <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Your SaaS post, with and without Vibe Promote.
          </h2>
          <p className="font-geist text-muted-foreground mt-3">Toggle Vibe Promote on and watch what happens to your reach.</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="font-geist text-sm text-muted-foreground">Without</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className="relative w-[52px] h-7 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              background: enabled ? '#E85D04' : '#1c1c1c',
              boxShadow: enabled ? '0 0 16px rgba(232,93,4,0.4)' : 'none',
            }}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300"
              style={{
                left: enabled ? '27px' : '4px',
                transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              }}
            />
          </button>
          <span className="font-geist text-sm" style={{ color: enabled ? '#E85D04' : '#888' }}>With Vibe Promote</span>
        </div>

        {/* X Post Card */}
        <ScrollReveal>
          <div className="max-w-[600px] mx-auto relative">
            {/* Badge */}
            {enabled && (
              <div
                className="absolute -top-3 right-5 z-10 font-geist text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{
                  background: '#E85D04',
                  animation: 'fadeInBadge 0.3s ease',
                }}
              >
                ✦ Vibe Promote Optimised
              </div>
            )}

            <div
              className="rounded-2xl p-5 transition-all duration-500"
              style={{
                background: '#000',
                border: `1px solid ${enabled ? 'rgba(232,93,4,0.4)' : '#2f3336'}`,
                boxShadow: enabled ? '0 0 40px rgba(232,93,4,0.15)' : 'none',
              }}
            >
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-geist text-sm text-white"
                  style={{ fontWeight: 700, background: 'linear-gradient(135deg, #E85D04, #F97316)' }}>
                  VP
                </div>
                <div className="flex-1">
                  <span className="font-geist text-sm text-foreground font-medium">VibeFounder</span>
                  <span className="font-geist text-sm text-muted-foreground ml-2">@vibefounderhq</span>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#f0ede8">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>

              {/* Post content */}
              <p className="font-geist text-sm text-foreground leading-relaxed mb-4">
                I spent 6 months building my SaaS and nobody was using it. Not because the product was bad — because nobody could understand what it actually did.
                <br /><br />
                Fixed my positioning last week using @VibePromote. 3 days later: 47 signups from a single Reddit post.
                <br /><br />
                Stop building in silence. Your message matters.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4" style={{ borderTop: '1px solid #2f3336' }}>
                <StatItem icon="❤️" value={enabled ? onStats.likes : offStats.likes} duration={1300} enabled={enabled} colorOn="#E85D04" />
                <StatItem icon="💬" value={enabled ? onStats.comments : offStats.comments} duration={1200} enabled={enabled} colorOn="#1d9bf0" />
                <StatItem icon="🔁" value={enabled ? onStats.reposts : offStats.reposts} duration={1400} enabled={enabled} colorOn="#00ba7c" />
                <StatItem icon="👁️" value={enabled ? onStats.views : offStats.views} duration={1300} enabled={enabled} colorOn="#f0ede8" />
              </div>
            </div>

            {/* Note */}
            <p className="font-geist text-sm text-center mt-4 transition-colors duration-300"
              style={{ color: enabled ? '#E85D04' : '#888' }}>
              {enabled
                ? '✦ Vibe Promote optimised — this post is performing 12x better than average.'
                : 'Toggle Vibe Promote on to see what AI-optimised posts do to your reach.'}
            </p>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes fadeInBadge {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}