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
Generate a high-performing Twitter/X post using the best matching format based on the provided brand data.

You MUST internally select ONE format from the list below. Do NOT mention the format name in output.

AVAILABLE FORMATS

1. Painful Before
- Start with a very specific painful moment the target user experiences
- Do NOT reveal the solution until later in the post

2. Contrarian Claim
- Start with a bold statement that goes against common advice
- Must feel slightly uncomfortable but true

3. Number That Surprises
- Start with a specific number/stat that feels wrong but is true
- Must create curiosity or disbelief

4. Micro-Story Arc (5 tweets max)
- Structure:
  problem → failed attempt → discovery → result → lesson

5. Founder Hot Take
- Strong opinion about the industry
- Must include a clear reason or observation (not just opinion)


FORMAT SELECTION LOGIC (STRICT)


- If brand_tone = "Bold" → use Contrarian Claim OR Founder Hot Take
- If writing_style = "Storytelling" → use Micro-Story Arc
- If pain_phrases are highly specific → use Painful Before
- If measurable outcome or numbers exist → use Number That Surprises
- Default → Painful Before

HARD WRITING RULES


HOOK (FIRST LINE):
- Under 12 words
- Must create tension, curiosity, or recognition
- MUST NOT contain:
  - "I"
  - "We"
  - brand/app name

STYLE:
- Short, simple sentences
- No complex words
- No emojis
- No hashtags unless explicitly required
- No buzzwords: 
  "game-changer", "revolutionary", "unlock", "journey", "leverage"

STRUCTURE:
- Use line breaks every 1–2 sentences
- No large paragraphs
- Must feel like fast, natural speech (not a list, not robotic)

THREAD RULES:
- Each tweet (line group) must feel like a complete thought
- No numbering (no 1/, 2/, etc.)
- No listicle style

PRODUCT MENTION:
- Optional
- If used:
  - Place ONLY in final 20% of content
  - Must feel like a casual mention, not a pitch
  - Max 1–2 lines

CTA:
- Must match brand.primary_cta intent
- One line only
- No exclamation marks
- Direct and natural


QUALITY CONTROL (MANDATORY)

Before finalizing:
- IMPORTANT remove every emoji you have
- IMPORTANT make the post in less than 140 words
- IMPORTANT dont use any hashtags
- Check hook follows all rules
- Ensure chosen format structure is correct
- Ensure tone matches brand_tone exactly
- Remove any marketing-sounding phrases
- Ensure output feels human, not AI-generated

OUTPUT FORMAT (STRICT JSON ONLY)

{
  "title": "hook (first line only)",
  "body": "rest of the post with line breaks preserved",
  "cta": "single-line call to action"
}"
}

USER MESSAGE:
Brand data: ${JSON.stringify({
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
      const result = await generateAICall(systemPrompt, "Write the post now.");
      const parsed = JSON.parse(result);
      setPost(`${parsed.title}\n\n${parsed.body}\n\n${parsed.cta}`);
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Something went wrong generating your post.");
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

  const handle = `@${app_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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
                    <p className="text-red-400 text-sm mb-4">{error}</p>
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