"use client";

import React, { useState } from 'react';

export default function XPostToggle() {
  const [on, setOn] = useState(false);

  const postOff = {
    title: 'Just launched my SaaS, check it out',
    body: 'Hey everyone, I just launched a new tool for marketing. It uses AI to help you write content. Let me know what you think!',
    note: 'Vague headline. No hook. No context. Easy to ignore.',
  };

  const postOn = {
    title: "Spent 5 months building a SaaS. Nobody came. Here's what I changed.",
    body: 'I had a solid product but my messaging was off. Nobody understood what it did or why they should care. Once I rewrote my positioning, the next Reddit post drove 40+ signups in 3 days. Happy to share what changed.',
    note: 'Clear hook. Specific pain. Story-driven. Platform-native format.',
  };

  const post = on ? postOn : postOff;

  return (
    <section id="xpost" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 40px' }} className="bg-[hsl(var(--background))]">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#9C2000', textTransform: 'uppercase', marginBottom: '12px' }}>See The Difference</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(26px,4vw,48px)', color: '#F2EDE8', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            The same idea. Two very different posts.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: '16px', color: '#7A7672', maxWidth: '480px', margin: '0 auto' }}>Toggle to see how Brand Brain context changes the output.</p>
        </div>

        {/* Toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#7A7672' }}>Without context</span>
          <button onClick={() => setOn(!on)}
          style={{
            width: '50px', height: '26px', borderRadius: '100px', cursor: 'pointer', position: 'relative',
            background: on ? '#9C2000' : '#1A1A22',
            border: `1px solid ${on ? '#9C2000' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: on ? '0 0 14px rgba(156,32,0,0.5)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            <span style={{
              position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
              left: on ? '27px' : '3px',
              transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)'
            }} />
          </button>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#9C2000' }}>With Brand Brain</span>
        </div>

        {/* Post Card */}
        <div className="xpost-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: '#0A0A0F', padding: '24px 28px', borderRadius: '14px',
            border: on ? '1px solid rgba(156,32,0,0.45)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: on ? '0 0 36px rgba(156,32,0,0.12)' : 'none',
            transition: 'border-color 0.35s, box-shadow 0.35s'
          }}>
            {/* Platform label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 600, color: '#FF4500', background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: '100px', padding: '3px 10px' }}>Reddit</span>
              <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#333' }}>r/SaaS</span>
            </div>

            {/* Title */}
            <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', color: '#F2EDE8', lineHeight: 1.4, marginBottom: '12px', transition: 'color 0.3s' }}>
              {post.title}
            </div>

            {/* Body */}
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#7A7672', lineHeight: 1.65, margin: '0 0 16px' }}>
              {post.body}
            </p>

            {/* Note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: on ? 'rgba(156,32,0,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${on ? 'rgba(156,32,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '8px', padding: '10px 14px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontFamily: 'Inter', fontSize: '12px', color: on ? '#E85D04' : '#44403C', lineHeight: 1.5 }}>
                {on ? '✓' : '✗'} {post.note}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: 'Inter', fontSize: '13px', textAlign: 'center', marginTop: '20px', color: '#333' }}>
          You review and post manually — no auto-publishing.
        </p>
      </div>
    </section>
  );
}