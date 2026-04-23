"use client";

import React, { useState, useEffect } from 'react';
import { generateAICall } from '../lib/ai';

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
  primary_platform = "Twitter / X",
  onComplete 
}) {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generatePost = async (isRegen = false) => {
    if (isRegen) setRegenerating(true);
    else setLoading(true);
    setError(null);

    const systemPrompt = `You are a founder writing a single raw, human post on Twitter/X. You are not a marketer. You are a real person who found a real solution to a painful problem and you want to share it honestly. You write like someone who is done with corporate fluff and just wants to say something true that helps people exactly like them.

You must write ONE post following this exact 6-part structure. Each part is a separate short paragraph with a line break between them. Do not label the parts. Do not add any explanation before or after the post. 

Part 1 — HOOK: The very first line. This is the most important line in the entire post. It must use one of the exact pain phrases the founder provided in their own words. It must name the specific frustration so precisely that the target customer reads it and thinks someone wrote this about them personally. Maximum 12 words. No full stop at the end. No question mark unless it genuinely creates more tension. No hashtags. No emojis unless the brand tone is casual.

Part 2 — RELATE: One sentence that makes the hook personal. The founder is saying I know this because I lived it or I see this every single day. This builds immediate trust. It confirms the reader is in the right place.

Part 3 — TURN: One line. The shift from the problem to the discovery. Something changed. Something was found. Something clicked. Do not reveal the solution yet. Leave a small open loop that makes the reader want to keep reading.

Part 4 — PROOF: One to two sentences. Introduce the app and the unique differentiator. Do not use the app name like an ad. Use it like a founder casually mentioning what they built or found. The differentiator must be stated as a concrete fact not a vague claim. Never say game-changing, revolutionary, powerful, robust, seamless, or cutting-edge.

Part 5 — SPECIFICITY: One line with a concrete detail. A number, a timeframe, a specific outcome, or a before and after stat. This makes the post feel real and not theoretical. If the founder did not provide a specific number, invent a believable small one that fits the context. Keep it realistic for an early-stage product.

Part 6 — CTA: The final line. One sentence only. Use the founder's primary CTA exactly as they described it. Direct. No exclamation mark. No emoji. No asking for likes or follows.

Hard rules for the entire post:
- No hashtags anywhere in the post
- No em dashes
- No words: game-changing, revolutionary, disruptive, powerful, robust, seamless, leverage, synergy, unlock, supercharge, cutting-edge, innovative, crushing it, hustle
- No corporate language of any kind
- No more than 3 sentences per paragraph
- Total post length must be between 180 and 280 words
- Must sound like one specific human wrote it, not a content team
- The writing style and tone passed in by the founder must be respected throughout
- If the audience awareness level is low (they do not know a solution exists), the post must educate gently before pitching. If awareness is high (they have tried other tools), the post must differentiate immediately and skip the education.

Return the post in this JSON format: { "post": "..." }`;

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
Platform: ${primary_platform}

Write the post now. Return only the post. Nothing else.`;

    try {
      const result = await generateAICall(systemPrompt, userMessage);
      setPost(result.post);
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 font-poppins">
        <p className="text-white font-medium text-lg mb-4">Writing your post...</p>
        <div className="flex gap-2 mb-4">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:200ms]" />
          <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:400ms]" />
        </div>
        <p className="text-zinc-500 text-sm">Using your audience's exact words</p>
      </div>
    );
  }

  const handle = `@${app_name.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-poppins pt-12 pb-20 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Here's your first post.</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
          Written in your voice. Using your audience's exact language. Ready to copy and post right now.
        </p>

        {/* Tweet Card */}
        <div className="mt-8 relative">
          <div className={`bg-zinc-900 rounded-2xl border border-zinc-700 p-6 text-left transition-opacity duration-300 ${regenerating ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700" />
                <div>
                  <p className="text-white font-semibold text-sm">{app_name}</p>
                  <p className="text-zinc-500 text-sm">{handle}</p>
                </div>
              </div>
              <span className="bg-zinc-800 text-zinc-500 text-xs rounded-full px-3 py-1">Twitter / X</span>
            </div>

            {error ? (
              <div className="py-10 text-center">
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button 
                  onClick={() => generatePost()}
                  className="border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white rounded-xl px-6 py-2 text-sm transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : (
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {post}
              </p>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-zinc-600 text-sm">
              <span>💬 0</span>
              <span>🔁 0</span>
              <span>♡ 0</span>
              <span>👁 0</span>
            </div>
          </div>

          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Context Strip */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-3 py-1">🎯 Hook: Pain recognition</span>
          <span className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-3 py-1">🗣️ Tone: {brand_tone}</span>
          <span className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-3 py-1">📍 Platform: Twitter / X</span>
        </div>
        <p className="text-zinc-500 text-xs mt-3">
          First line uses your audience's exact language. Built to stop a founder mid-scroll.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors min-w-[120px]"
            >
              {copied ? "Copied ✓" : "Copy post"}
            </button>
            <button
              onClick={() => generatePost(true)}
              disabled={regenerating}
              className="border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white rounded-xl px-6 py-3 text-sm transition-colors"
            >
              Regenerate
            </button>
          </div>
          <button
            onClick={onComplete}
            className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4 transition-colors block"
          >
            Continue to dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}