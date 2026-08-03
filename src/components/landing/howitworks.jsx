import React from 'react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    num: '01',
    title: 'Build your brand brain',
    desc: 'Drop your website link or answer a few questions about your brand. Vibe Promote learns your product, audience, positioning, and brand voice so every post feels like its just for your ICP.',
    label: 'Product Onboarding',
    video: '/videos/video1.mp4'
  },
  {
    num: '02',
    title: 'Get better positioning and content',
    desc: 'It will sharpen your messaging, generate stronger hooks, and create posts for Reddit, X, and LinkedIn that sound like you and attracts the right users.',
    label: 'Positioning And Content Engine',
    video: '/videos/postioningvideo.mp4'
  },
  {
    num: '03',
    title: 'It starts finding potential users posts, tracking analytics, and improves your strategy',
    desc: 'It discover where your audience hangs out, connect your accounts, track what’s performing across platforms, and chat with your copilot to improve your content strategy using current analytics',
    label: 'Growth Dashboard',
    video: '/videos/app-video.mp4'
  },
];

function VideoPlayer({ src, label }) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        background: '#f4f4f5',
        border: '1px solid #e4e4e7',
        aspectRatio: '16/9',
      }}
    >
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Orange gradient overlay */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(249,115,22,0.1), transparent 70%)' }} />

      {/* Label */}
      <div className="absolute bottom-3 left-3">
        <span className="font-dm text-xs text-zinc-600 px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e4e4e7' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #f4f4f5' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-dm text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold">How It Works</span>
          <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl text-zinc-900 mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Go from building in silence to getting users in 3 steps
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, i) => {
            const reversed = i === 1;
            return (
              <ScrollReveal key={step.num}>
                <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 md:gap-16 items-center`}>
                  {/* Text */}
                  <div className="flex-1 space-y-5">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center font-syne text-2xl text-orange-600"
                      style={{
                        fontWeight: 800,
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.3)',
                      }}
                    >
                      {step.num}
                    </div>
                    <h3 className="font-syne text-2xl sm:text-3xl text-zinc-900" style={{ fontWeight: 700 }}>
                      {step.title}
                    </h3>
                    <p className="font-dm text-zinc-500 leading-relaxed text-base">
                      {step.desc}
                    </p>
                  </div>
                  {/* Video */}
                  <div className="flex-1 w-full">
                    <VideoPlayer src={step.video} label={step.label} />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}