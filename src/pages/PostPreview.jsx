"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateAICall } from '../lib/ai';
import { motion } from 'framer-motion';
import { MessageCircle, Repeat2, Heart, Eye, LayoutDashboard } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

export default function PostPreview({ 
  app_name, 
  app_description, 
  target_customer, 
  core_problem, 
  unique_differentiator, 
  audience_awareness = "High", 
  pain_phrases, 
  brand_tone, 
  writing_style, 
  primary_cta,
  onComplete 
}) {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [baseCount, setBaseCount] = useState(0);
  const [heartPulse, setHeartPulse] = useState(false);
  
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  const formatNumber = (num) => {
    const rounded = Math.floor(num);
    if (rounded >= 1000000) return "1M+";
    if (rounded >= 1000) {
      return (rounded / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return rounded.toString();
  };

  const INCREMENT_PER_SECOND = 100 / 3;

  useEffect(() => {
    if (post && !loading) {
      const animate = (time) => {
        if (lastTimeRef.current !== null) {
          const deltaTime = (time - lastTimeRef.current) / 1000;
          setBaseCount(prev => {
            const next = prev + (INCREMENT_PER_SECOND * deltaTime);
            if (Math.floor(next / 50) > Math.floor(prev / 50)) {
              setHeartPulse(true);
              setTimeout(() => setHeartPulse(false), 300);
            }
            return next > 1000000 ? 1000000 : next;
          });
        }
        lastTimeRef.current = time;
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [post, loading]);

  const generatePost = async () => {
    setLoading(true);
    setError(null);

    const systemPrompt = `TASK:
You are a sharp indie founder who writes Twitter/X posts for other founders.

Write ONE post that sounds like a real human who has lived the pain — not a chatbot summarizing it.

───────────────────────────────────────
STRICT LENGTH RULE
───────────────────────────────────────
- Total post MUST be under 160 words
- Aim for 100–130 words. Tight is better.
- Cut ruthlessly. Every word must earn its place.

───────────────────────────────────────
TEMPLATE SELECTION (pick ONE internally, never mention it)
───────────────────────────────────────

TEMPLATE 1 — "Painful Before"
Use when: pain_phrases are vivid, product is a workflow/tool fix
Structure:
  Line 1: The ugly truth about the problem (hook, max 10 words)
  Lines 2–3: What that pain looks like day-to-day (specific, grounded)
  Lines 4–5: The reframe or shift
  Line 6: Optional soft product mention (only if natural)
  Line 7: CTA

TEMPLATE 2 — "Contrarian Take"
Use when: brand_tone = Bold OR audience = marketers/growth people
Structure:
  Line 1: A claim most people disagree with (hook, max 10 words)
  Lines 2–3: Why the common belief is wrong, with specifics
  Lines 4–5: What actually works instead
  Line 6: Optional soft product mention (only if natural)
  Line 7: CTA

TEMPLATE 3 — "Number Drop"
Use when: app has outcomes, time-savings, or metrics to reference
Structure:
  Line 1: A specific number that stops the scroll (hook, max 10 words)
  Lines 2–3: What that number means in real life
  Lines 4–5: The root cause or insight
  Line 6: Optional soft product mention (only if natural)
  Line 7: CTA

───────────────────────────────────────
NON-NEGOTIABLE WRITING RULES
───────────────────────────────────────

HOOK (first line):
- Max 10 words
- No "I", "We", brand name, "here's how", "tired of", "struggling with"
- Must trigger recognition or a sharp reaction in the reader

BODY:
- Plain words only. No jargon, no buzzwords, no fluff.
- No emojis. No hashtags. Ever.
- Each line = one new idea. Zero filler sentences.
- 2–3 sentences per paragraph MAX, then a line break.
- DO NOT put a line break after every single sentence. Group related sentences together.

PRODUCT MENTION:
- Optional. Only if it fits naturally.
- Last 20% of post only. Max 1 line.
- Never the brand name as the only line. Weave it in.

───────────────────────────────────────
CTA RULES (critical)
───────────────────────────────────────
- Must be ONE line only
- No exclamation marks
- Must be specific to what the product actually does — not generic
- NEVER write: "Try [name]", "Check it out", "Learn more", "Sign up today"
- Instead write something like:
  - "If you're a [target user] dealing with [pain], [app name] was built for this."
  - "This is exactly what [app name] fixes — [one-line value prop]."
  - "We built [app name] so [target user] can [specific outcome]."
- Base it on brand.primary_cta and the app's actual value prop

───────────────────────────────────────
OUTPUT — STRICT JSON ONLY. NO MARKDOWN. NO PREAMBLE. NO EXTRA TEXT.
───────────────────────────────────────
{
  "title": "hook line only",
  "body": "2-3 sentence paragraphs separated by \n\n — never single lines with \n between every sentence",
  "cta": "one specific line that tells the reader exactly what the product does for them"
}`;

    const userMessage = `Brand data: ${JSON.stringify({
      app_name,
      app_description,
      target_customer,
      core_problem,
      unique_differentiator,
      pain_phrases,
      brand_tone,
      writing_style,
      primary_cta
    })}`;

    try {
      const result = await generateAICall(systemPrompt, userMessage, null, 'onboarding');
      
      // Clean the result in case the AI included markdown blocks
      const cleanResult = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanResult);
      
      if (parsed.title && parsed.body && parsed.cta) {
        setPost(`${parsed.title}\n\n${parsed.body}\n\n${parsed.cta}`);
      } else {
        throw new Error("Incomplete post data received");
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Something went wrong generating your post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePost();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-poppins">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-white font-medium text-lg mb-2">Writing your post...</p>
        <p className="text-gray-500 text-sm">Using your exact pain phrases and brand voice</p>
      </div>
    );
  }

  const handle = `@${app_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'founder'}`;
  const timestamp = "Just now";

  return (
    <div className="relative min-h-screen bg-transparent text-white font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #b55933 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #9e4a2a 0%, transparent 70%)' }} />

      <div className="relative z-10 pt-12 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 3</span>
            <h1 className="text-3xl font-bold mb-2">Here's your first post.</h1>
            <p className="text-text-secondary text-sm">Previewing how your app will vibe with the world.</p>
          </div>

          <div className="relative mb-8">
            <div className="bg-[#0f0f0f] rounded-2xl border border-[#2f3336] overflow-hidden">
              <div className="p-4 border-b border-[#2f3336]">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-bold text-white text-base">{app_name}</span>
                      <svg className="w-5 h-5 text-[#1d9bf0] ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.66 2.19-1.91-2.19-3.34z" />
                      </svg>
                    </div>
                    <div className="text-[#71767b] text-sm">{handle}</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {error ? (
                  <div className="py-10 text-center">
                    <p className="text-red-400 text-sm mb-4">Failed to generate: {error}</p>
                    <button 
                      onClick={generatePost}
                      className="text-xs text-primary hover:underline font-bold uppercase tracking-widest bg-transparent"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white text-[15px] leading-[1.5] whitespace-pre-wrap font-[system-ui,-apple-system]">
                      {post}
                    </p>
                    <div className="text-[#71767b] text-sm">{timestamp}</div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-[#2f3336]">
                <div className="flex justify-between max-w-md">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-[#71767b]" />
                    <span className="text-[#71767b] text-sm">{formatNumber(baseCount * 0.4)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Repeat2 className="w-5 h-5 text-[#71767b]" />
                    <span className="text-[#71767b] text-sm">{formatNumber(baseCount * 0.2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={heartPulse ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={`w-5 h-5 ${baseCount > 0 ? 'text-[#f91880] fill-[#f91880]' : 'text-[#71767b]'}`} />
                    </motion.div>
                    <span className="text-[#71767b] text-sm">{formatNumber(baseCount)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-[#71767b]" />
                    <span className="text-[#71767b] text-sm">{formatNumber(baseCount * 12)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <motion.button
              onClick={onComplete}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(181, 89, 51, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 text-white font-bold text-lg rounded-xl bg-gradient-to-r from-[#b55933] to-[#9e4a2a] transition-all duration-300 shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}