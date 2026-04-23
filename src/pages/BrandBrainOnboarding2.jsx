"use client";

import React, { useState, useRef } from 'react';

const BrandToneOptions = [
  { name: "Professional & credible", desc: "I want people to trust me immediately" },
  { name: "Conversational & relatable", desc: "I want to sound like a real person, not a company" },
  { name: "Edgy & bold", desc: "I want to make people stop and react" },
  { name: "Friendly & encouraging", desc: "I want to feel warm and approachable" },
  { name: "Direct & no-BS", desc: "Cut to the point, no fluff" }
];

const WritingStyleOptions = [
  { name: "Short & punchy", desc: "Bullets, short sentences, Twitter-brained" },
  { name: "Long-form storytelling", desc: "Build context, take them on a journey" },
  { name: "Data & proof first", desc: "Lead with numbers and results" },
  { name: "Humor & wit", desc: "Make them laugh, then make the point" },
  { name: "Mix it up", desc: "Different every post, whatever fits the moment" }
];

const CurrentStageOptions = [
  { name: "Pre-launch", desc: "Building and collecting waitlist signups" },
  { name: "Just launched", desc: "Live but still finding my first customers" },
  { name: "Early traction", desc: "Have some users, working toward growth" },
  { name: "Growing", desc: "Scaling up, focused on getting more customers" }
];

const PostingFrequencyOptions = ["1-2x", "3-4x", "5-7x", "Daily+"];

const PrimaryCTAOptions = [
  { name: "Visit my landing page", desc: "Drive traffic to your site or sign up page" },
  { name: "Join my waitlist", desc: "Build your list before launch" },
  { name: "Follow me for more", desc: "Grow your audience first" },
  { name: "Reply and start a conversation", desc: "Build relationships, not just followers" },
  { name: "Book a demo", desc: "Get on calls with potential customers" },
  { name: "Something else", desc: "I'll type my own" }
];

export default function BrandBrainOnboarding2({ app_name, app_description, target_customer, core_problem, onComplete }) {
  const [unique_differentiator, setUniqueDifferentiator] = useState('');
  const [pain_phrases, setPainPhrases] = useState('');
  const [brand_tone, setBrandTone] = useState('');
  const [writing_style, setWritingStyle] = useState('');
  const [current_stage, setCurrentStage] = useState('');
  const [posting_frequency, setPostingFrequency] = useState('');
  const [primary_cta, setPrimaryCTA] = useState('');
  const [custom_cta, setCustomCTA] = useState('');
  const [errors, setErrors] = useState({});

  const refs = {
    unique_differentiator: useRef(null),
    pain_phrases: useRef(null),
    brand_tone: useRef(null),
    writing_style: useRef(null),
    current_stage: useRef(null),
    posting_frequency: useRef(null),
    primary_cta: useRef(null)
  };

  const validate = () => {
    const newErrors = {};
    if (!unique_differentiator.trim()) newErrors.unique_differentiator = "This field is required";
    if (!pain_phrases.trim()) newErrors.pain_phrases = "This field is required";
    if (!brand_tone) newErrors.brand_tone = "Please select an option";
    if (!writing_style) newErrors.writing_style = "Please select an option";
    if (!current_stage) newErrors.current_stage = "Please select an option";
    if (!posting_frequency) newErrors.posting_frequency = "Please select an option";
    if (!primary_cta) newErrors.primary_cta = "Please select an option";
    if (primary_cta === "Something else" && !custom_cta.trim()) newErrors.custom_cta = "This field is required";

    setErrors(newErrors);

    const firstError = Object.keys(newErrors)[0];
    if (firstError && refs[firstError]?.current) {
      refs[firstError].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({
        unique_differentiator,
        pain_phrases,
        brand_tone,
        writing_style,
        current_stage,
        posting_frequency,
        primary_cta: primary_cta === "Something else" ? custom_cta : primary_cta
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-poppins py-12 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-violet-400 text-xs font-medium tracking-widest uppercase block mb-2">Step 2 of 3</span>
          <div className="h-1 bg-zinc-800 rounded-full w-full mb-6">
            <div className="h-full bg-violet-600 rounded-full w-2/3 transition-all duration-500" />
          </div>
          <h1 className="text-2xl font-bold">Now let's build your voice.</h1>
          <p className="text-zinc-400 text-sm mt-1">This is what stops the AI from sounding like every other GPT output.</p>
        </div>

        {/* Questions */}
        <div className="space-y-12">
          {/* Q5 */}
          <div ref={refs.unique_differentiator} className="space-y-2">
            <label className="text-white text-sm font-medium block">What makes you different from everything else out there?</label>
            <p className="text-zinc-500 text-xs">Don't say 'easier to use'. Say what you actually do that nothing else does.</p>
            <textarea
              rows={2}
              value={unique_differentiator}
              onChange={(e) => setUniqueDifferentiator(e.target.value)}
              placeholder="e.g. Unlike Buffer, we don't just schedule posts — we find where your exact audience already is and tell you what to say to them."
              className={`bg-zinc-900 border ${errors.unique_differentiator ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600 resize-none`}
            />
            {errors.unique_differentiator && <p className="text-red-400 text-xs">{errors.unique_differentiator}</p>}
          </div>

          {/* Q6 */}
          <div ref={refs.pain_phrases} className="space-y-2">
            <label className="text-white text-sm font-medium block">What do your customers say when they complain about this problem?</label>
            <p className="text-zinc-500 text-xs">Exact words. The phrases they actually use — not how you'd describe it.</p>
            <textarea
              rows={3}
              value={pain_phrases}
              onChange={(e) => setPainPhrases(e.target.value)}
              placeholder="e.g. 'posting into the void', 'nobody sees my stuff', 'I tried Twitter and got nothing', 'I have no idea who my audience is'"
              className={`bg-zinc-900 border ${errors.pain_phrases ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600 resize-none`}
            />
            {errors.pain_phrases && <p className="text-red-400 text-xs">{errors.pain_phrases}</p>}
          </div>

          {/* Q7 */}
          <div ref={refs.brand_tone} className="space-y-2">
            <label className="text-white text-sm font-medium block">What's your brand tone?</label>
            <p className="text-zinc-500 text-xs">This gets injected into every piece of content we write for you.</p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {BrandToneOptions.map((opt) => (
                <div
                  key={opt.name}
                  onClick={() => setBrandTone(opt.name)}
                  className={`${brand_tone === opt.name ? 'bg-violet-600/20 border-violet-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'} border rounded-xl px-4 py-3 cursor-pointer transition-all`}
                >
                  <p className="text-white text-sm font-medium">{opt.name}</p>
                  <p className="text-zinc-400 text-xs">{opt.desc}</p>
                </div>
              ))}
            </div>
            {errors.brand_tone && <p className="text-red-400 text-xs">{errors.brand_tone}</p>}
          </div>

          {/* Q8 */}
          <div ref={refs.writing_style} className="space-y-2">
            <label className="text-white text-sm font-medium block">How do you write?</label>
            <p className="text-zinc-500 text-xs">Controls the structure and length of every post we generate.</p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {WritingStyleOptions.map((opt) => (
                <div
                  key={opt.name}
                  onClick={() => setWritingStyle(opt.name)}
                  className={`${writing_style === opt.name ? 'bg-violet-600/20 border-violet-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'} border rounded-xl px-4 py-3 cursor-pointer transition-all`}
                >
                  <p className="text-white text-sm font-medium">{opt.name}</p>
                  <p className="text-zinc-400 text-xs">{opt.desc}</p>
                </div>
              ))}
            </div>
            {errors.writing_style && <p className="text-red-400 text-xs">{errors.writing_style}</p>}
          </div>

          {/* Q9 */}
          <div ref={refs.current_stage} className="space-y-2">
            <label className="text-white text-sm font-medium block">Where are you right now?</label>
            <p className="text-zinc-500 text-xs">This changes the tone and CTA of everything we write.</p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {CurrentStageOptions.map((opt) => (
                <div
                  key={opt.name}
                  onClick={() => setCurrentStage(opt.name)}
                  className={`${current_stage === opt.name ? 'bg-violet-600/20 border-violet-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'} border rounded-xl px-4 py-3 cursor-pointer transition-all`}
                >
                  <p className="text-white text-sm font-medium">{opt.name}</p>
                  <p className="text-zinc-400 text-xs">{opt.desc}</p>
                </div>
              ))}
            </div>
            {errors.current_stage && <p className="text-red-400 text-xs">{errors.current_stage}</p>}
          </div>

          {/* Q10 */}
          <div ref={refs.posting_frequency} className="space-y-2">
            <label className="text-white text-sm font-medium block">How often do you want to post per week?</label>
            <p className="text-zinc-500 text-xs">Be honest. Consistency beats volume.</p>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PostingFrequencyOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => setPostingFrequency(opt)}
                  className={`${posting_frequency === opt ? 'bg-violet-600/20 border-violet-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'} border rounded-xl py-3 text-center text-white text-sm cursor-pointer transition-all`}
                >
                  {opt}
                </div>
              ))}
            </div>
            {errors.posting_frequency && <p className="text-red-400 text-xs">{errors.posting_frequency}</p>}
          </div>

          {/* Q11 */}
          <div ref={refs.primary_cta} className="space-y-2">
            <label className="text-white text-sm font-medium block">What do you want people to do after seeing your content?</label>
            <p className="text-zinc-500 text-xs">Every post ends with this. Pick the one that matches where you are right now.</p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {PrimaryCTAOptions.map((opt) => (
                <div
                  key={opt.name}
                  onClick={() => setPrimaryCTA(opt.name)}
                  className={`${primary_cta === opt.name ? 'bg-violet-600/20 border-violet-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'} border rounded-xl px-4 py-3 cursor-pointer transition-all`}
                >
                  <p className="text-white text-sm font-medium">{opt.name}</p>
                  <p className="text-zinc-400 text-xs">{opt.desc}</p>
                </div>
              ))}
            </div>
            {primary_cta === "Something else" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={custom_cta}
                  onChange={(e) => setCustomCTA(e.target.value)}
                  placeholder="Describe your CTA..."
                  className={`bg-zinc-900 border ${errors.custom_cta ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600`}
                />
                {errors.custom_cta && <p className="text-red-400 text-xs mt-1">{errors.custom_cta}</p>}
              </div>
            )}
            {errors.primary_cta && <p className="text-red-400 text-xs">{errors.primary_cta}</p>}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-4 w-full text-sm transition-colors mt-8"
          >
            Generate my post →
          </button>
        </div>
      </div>
    </div>
  );
}