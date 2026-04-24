"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateAICall } from '../lib/ai';
import { motion } from 'framer-motion';
import { MessageCircle, Repeat2, Heart, Eye, Copy, RefreshCw, Check, ArrowRight } from 'lucide-react';

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
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [engagement, setEngagement] = useState({
    comments: Math.floor(Math.random() * 500) + 50,
    reposts: Math.floor(Math.random() * 300) + 30,
    likes: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 5000) + 1000
  });
  const [countedEngagement, setCountedEngagement] = useState({
    comments: 0,
    reposts: 0,
    likes: 0,
    views: 0
  });
  const [heartPulse, setHeartPulse] = useState(false);
  const [counterFinished, setCounterFinished] = useState(false);
  const hasAnimated = useRef(false);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
  };

  useEffect(() => {
    if (!hasAnimated.current && post) {
      hasAnimated.current = true;
      setCounterFinished(false);
      
      // Animate engagement counters with improved easing
      const duration = 2000;
      const stagger = 300;
      let finishedCounters = 0;
      
      const animateCounter = (key, target, delay) => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Improved easing function (easeOutBack)
          const easeOutBack = (x) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
          };
          
          const easedProgress = easeOutBack(progress);
          const current = Math.floor(target * easedProgress);
          
          setCountedEngagement(prev => ({
            ...prev,
            [key]: Math.min(current, target)
          }));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            finishedCounters++;
            if (key === 'likes') {
              setHeartPulse(true);
              setTimeout(() => setHeartPulse(false), 500);
            }
            
            // All counters finished
            if (finishedCounters === 4) {
              setCounterFinished(true);
            }
          }
        };
        
        setTimeout(animate, delay);
      };
      
      animateCounter('comments', engagement.comments, 0);
      animateCounter('reposts', engagement.reposts, stagger);
      animateCounter('likes', engagement.likes, stagger * 2);
      animateCounter('views', engagement.views, stagger * 3);
    }
  }, [post, engagement]);

  const generatePost = async (isRegen = false) => {
    if (isRegen) setRegenerating(true);
    else setLoading(true);
    setError(null);
    hasAnimated.current = false;
    setCounterFinished(false);

    const systemPrompt = `You are a real founder. Not a marketer. Not a content strategist. A person who built or found something that genuinely helped them, and now wants to tell other people about it in plain, honest words.

You are writing ONE post for Twitter/X. It must feel like something a real human typed on their phone after a long day — not something that came out of a content calendar. Raw. Direct. True.

Follow this exact 6-part structure. Each part is its own short paragraph. One blank line between each part. Do not label the parts. Do not add anything before or after the post. Return only the post text.

---

PART 1 — HOOK
This is the only line that decides if anyone reads the rest. Use one of the exact pain phrases the founder gave you, in their own words or very close to it. Name the frustration so specifically that the right person reads it and feels like someone finally said it out loud. Maximum 12 words. No period at the end. No hashtags. No emojis unless the founder's tone is genuinely casual. If a question adds real tension, use it — otherwise don't.

PART 2 — RELATE
One sentence. The founder is saying: I know this pain because I lived it, or I see it every day in the people I talk to. This is not sympathy — it is proof that the founder is one of them. It makes the reader feel like they are in the right place.

PART 3 — TURN
One line only. Something shifted. Something was discovered. Do not name the solution yet. Just signal that a door opened. This creates a small open loop that pulls the reader forward. It should feel like the moment before a reveal, not the reveal itself.

PART 4 — PROOF
One to two sentences. Now introduce the product — but casually, the way a founder mentions something they built or stumbled onto, not the way an ad talks about a product. State the single biggest differentiator as a plain fact. Concrete and specific beats vague and impressive every time. Do not use any of these words: game-changing, revolutionary, powerful, robust, seamless, cutting-edge, innovative, disruptive, supercharge, unlock, leverage, synergy, crushing it, hustle.

PART 5 — SPECIFICITY
One line. Drop one real, concrete detail — a number, a timeframe, a before-and-after, a specific result. This is what makes the post feel like a true story and not a pitch. If the founder did not provide a specific number, create a believable, modest one that fits an early-stage product. Do not exaggerate. Small and real is better than big and suspicious.

PART 6 — CTA
One sentence. Use the founder's call to action exactly as they described it. Keep it direct and low-pressure. No exclamation mark. No emoji. No asking for likes, shares, or follows. Just tell them what to do next.

---

HARD RULES — these apply to every word in the post:

- No hashtags anywhere
- No em dashes
- No corporate or hype language of any kind
- No more than 3 sentences in any paragraph
- Total word count must be between 180 and 280 words
- The entire post must sound like one specific person wrote it — not a team, not a tool
- Fully respect the writing tone and style the founder described
- If the target audience has LOW awareness (they do not yet know a solution like this exists): educate them gently in Parts 2 and 3 before introducing the product
- If the target audience has HIGH awareness (they have already tried other tools and been disappointed): skip the education, differentiate immediately, and speak to why this is different from what they already tried

- make the post under 280 words`;

    const userMessage = `Here is everything you need to write the post:

App name: ${app_name}
What the app does: ${app_description}
Target customer: ${target_customer}
Core problem the app solves: ${core_problem}
What makes it different from alternatives: ${unique_differentiator}
How aware the audience is of solutions like this: ${audience_awareness}
Exact words the audience uses to describe their pain: ${pain_phrases}
Brand tone: ${brand_tone}
Writing style: ${writing_style}
Primary CTA: ${primary_cta}

Write the post now. Return only the post. Nothing else.`;

    try {
      const result = await generateAICall(systemPrompt, userMessage);
      // The AI returns plain text, not JSON
      setPost(result);
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Something went wrong generating your post.");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    generatePost();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handle = `@${app_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const timestamp = "2h ago";

  return (
    <div className="min-h-screen bg-black text-white font-poppins pt-12 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Here's your first post.</h1>
          <p className="text-gray-500 text-sm">
            Written in your voice. Using your audience's exact language. Ready to copy and post right now.
          </p>
        </div>

        {/* Twitter/X Post Card */}
        <div className="relative mb-8">
          <div className={`bg-[#0f0f0f] rounded-2xl border border-[#2f3336] overflow-hidden transition-opacity duration-300 ${regenerating ? 'opacity-40' : 'opacity-100'}`}>
            {/* Profile Header */}
            <div className="p-4 border-b border-[#2f3336]">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3" />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-bold text-white text-base">{app_name}</span>
                    <svg className="w-5 h-5 text-[#1d9bf0] ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.66 2.19-1.91 2.19-3.34z" />
                    </svg>
                  </div>
                  <div className="text-[#71767b] text-sm">{handle}</div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              {error ? (
                <div className="py-10 text-center">
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <button 
                    onClick={() => generatePost()}
                    className="border border-[#2f3336] text-gray-400 hover:border-[#1d9bf0] hover:text-white rounded-xl px-6 py-2 text-sm transition-colors"
                  >
                    Try again
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

            {/* Engagement Bar */}
            <div className="px-4 py-3 border-t border-[#2f3336]">
              <div className="flex justify-between max-w-md">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-[#71767b]" />
                  <motion.span 
                    className="text-[#71767b] text-sm"
                    animate={counterFinished ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {formatNumber(countedEngagement.comments)}
                  </motion.span>
                </div>
                <div className="flex items-center space-x-2">
                  <Repeat2 className="w-5 h-5 text-[#71767b]" />
                  <motion.span 
                    className="text-[#71767b] text-sm"
                    animate={counterFinished ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {formatNumber(countedEngagement.reposts)}
                  </motion.span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={heartPulse ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className={`w-5 h-5 ${countedEngagement.likes > 0 ? 'text-[#f91880] fill-[#f91880]' : 'text-[#71767b]'}`} />
                  </motion.div>
                  <motion.span 
                    className="text-[#71767b] text-sm"
                    animate={counterFinished ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {formatNumber(countedEngagement.likes)}
                  </motion.span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-[#71767b]" />
                  <motion.span 
                    className="text-[#71767b] text-sm"
                    animate={counterFinished ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    {formatNumber(countedEngagement.views)}
                  </motion.span>
                </div>
              </div>
            </div>
          </div>

          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Context Strip */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="bg-[#1d9bf0]/10 text-[#1d9bf0] text-xs rounded-full px-3 py-1">🎯 Hook: Pain recognition</span>
          <span className="bg-[#2f3336] text-gray-300 text-xs rounded-full px-3 py-1">🗣️ Tone: {brand_tone}</span>
          <span className="bg-[#2f3336] text-gray-300 text-xs rounded-full px-3 py-1">📍 Platform: Twitter / X</span>
          <span className="bg-[#2f3336] text-gray-300 text-xs rounded-full px-3 py-1">📝 Style: {writing_style}</span>
        </div>
        <p className="text-gray-500 text-xs text-center mb-10">
          First line uses your audience's exact language. Built to stop a founder mid-scroll.
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors min-w-[120px] flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy post"}
            </button>
            <button
              onClick={() => generatePost(true)}
              disabled={regenerating}
              className="border border-[#2f3336] text-gray-400 hover:border-[#1d9bf0] hover:text-white rounded-xl px-6 py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
          <button
            onClick={onComplete}
            className="text-[#1d9bf0] hover:text-[#1a8cd8] text-sm underline underline-offset-4 transition-colors flex items-center gap-1"
          >
            Continue to dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}