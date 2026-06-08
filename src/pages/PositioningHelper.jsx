"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Brain, AlertCircle, Hash, Target, Zap, ShieldCheck, Quote } from 'lucide-react';
import { generateAICall } from '../lib/ai';
import { cn } from "@/lib/utils";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable fields state
  const [tagline, setTagline] = useState('');
  const [positioningStatement, setPositioningStatement] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [coreValue, setCoreValue] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');
  const [bestCommunities, setBestCommunities] = useState([
    { name: '', reason: '' },
    { name: '', reason: '' },
    { name: '', reason: '' },
    { name: '', reason: '' },
    { name: '', reason: '' }
  ]);
  const [keywords, setKeywords] = useState('');
  const [selectedChannels, setSelectedChannels] = useState(['Reddit', 'X', 'Threads']);
  const [cta, setCta] = useState('');
  const [marketInsight, setMarketInsight] = useState('');
  const [bestAcquisitionStrategy, setBestAcquisitionStrategy] = useState('');
  const [biggestGrowthOpportunity, setBiggestGrowthOpportunity] = useState('');

  const generatePositioning = async () => {
    if (!appData) return;
    
    setLoading(true);
    setError(null);

    const systemPrompt = `You are a world-class SaaS positioning strategist and market analyst.

Your goal is to generate positioning that feels like it came from an experienced founder and growth advisor, not a generic AI tool.

Analyze the provided company information deeply.

Focus on:
* Who the product is really for
* What painful problem it solves
* Why people would want it
* Where potential customers already spend time
* How the product should be positioned

WRITING STYLE:
* Write like a smart founder talking to another founder.
* Use simple, natural, human language.
* Keep sentences clear and easy to understand.
* Avoid corporate language.
* Avoid marketing jargon.
* Avoid buzzwords.
* Sound confident but not salesy.
* Be direct and practical.
* Prioritize clarity over cleverness.

NEVER USE WORDS LIKE:
* innovative
* revolutionary
* cutting-edge
* seamless
* all-in-one
* game-changing
* powerful solution
* streamline
* empower
* leverage
* robust
* optimize
* synergy

RULES:
* Be specific.
* Avoid generic startup language.
* Never write fluffy marketing copy.
* Focus on real problems and outcomes.
* Use language real customers would use.
* If the audience is broad, narrow it to the most likely early adopter.
* Never output placeholders.
* Never output example values.
* Never invent fake communities.
* Every field should feel personalized to the product.

COMMUNITY RULES:
* Prioritize Reddit communities (subreddits) that will be the perfect fit for the founder's product.
* Prefer high-intent subreddits over large generic ones.
* Explain why the audience is valuable.
* Return only genuinely relevant subreddits.

KEYWORD RULES:
* Keywords should reflect problems people are trying to solve.
* Prefer intent-driven keywords.
* Avoid broad marketing terms.
* Use phrases users would actually search.
* Return keywords as an array of individual strings, not as a single comma-separated string.

Return ONLY valid JSON.

{
  "suggestedTagline": "5-10 word outcome-focused tagline",
  "positioningStatement": "2-3 concise sentences explaining who the product helps, what problem it solves, and why people choose it.",
  "targetAudience": "One highly specific ICP.",
  "coreProblemSolved": "The exact frustrating situation users experience before using this product.",
  "coreValue": "The primary outcome users gain after using the product.",
  "competitiveAdvantage": "One sentence explaining what makes this product different from the most common alternative.",
  "bestCommunities": [
    {
      "name": "subreddit name ()",
      "reason": "Why people discussing this problem spend time here."
    },
    {
      "name": "subreddit name ()",
      "reason": "Why people discussing this problem spend time here."
    },
    {
      "name": "subreddit name ()",
      "reason": "Why people discussing this problem spend time here."
    },
    {
      "name": "subreddit name ()",
      "reason": "Why people discussing this problem spend time here."
    },
    {
      "name": "subreddit name ()",
      "reason": "Why people discussing this problem spend time here."
    }
  ],
  "audienceKeywords": [
    "keyword1",
    "keyword2",
    "keyword3",
    "keyword4",
    "keyword5"
  ],
  "recommendedGrowthChannel": {
    "channel": "single best channel",
    "explanation": "2-3 concise sentences explaining why this channel is the best fit for this audience."
  },
  "callToAction": "A short, punchy one-line statement that motivates the founder to take action. 5-12 words. Not salesy. No exclamation marks.","
}`;

    const userMessage = `Brand data: ${JSON.stringify(appData)}`;

    try {
      const result = await generateAICall(systemPrompt, userMessage, null, 'onboarding');
      const clean = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      
      setTagline(parsed.suggestedTagline || '');
      setPositioningStatement(parsed.positioningStatement || '');
      setTargetAudience(parsed.targetAudience || '');
      setCoreProblem(parsed.coreProblemSolved || '');
      setCoreValue(parsed.coreValue || '');
      setCompetitiveAdvantage(parsed.competitiveAdvantage || '');
      
      if (parsed.bestCommunities && Array.isArray(parsed.bestCommunities)) {
        const comms = [...parsed.bestCommunities];
        while (comms.length < 5) {
          comms.push({ name: '', reason: '' });
        }
        setBestCommunities(comms.slice(0, 5));
      }
      
      if (parsed.audienceKeywords && Array.isArray(parsed.audienceKeywords)) {
        setKeywords(parsed.audienceKeywords.join(', '));
      } else {
        setKeywords('');
      }

      // Set recommended growth channel
      const recChannel = parsed.recommendedGrowthChannel?.channel || '';
      const cleanChannel = recChannel.split('\n')[0].trim();
      const standardChannels = ['Reddit', 'X', 'Threads', 'Indie Hackers'];
      const matchedChannel = standardChannels.find(c => c.toLowerCase() === cleanChannel.toLowerCase());
      if (matchedChannel) {
        setSelectedChannels([matchedChannel]);
      } else {
        setSelectedChannels(['Reddit', 'X', 'Threads']);
      }

      // Set CTA
      setCta(parsed.callToAction || parsed.suggestedTagline || '');

      setMarketInsight(parsed.marketInsight || '');
      setBestAcquisitionStrategy(parsed.bestAcquisitionStrategy || '');
      setBiggestGrowthOpportunity(parsed.biggestGrowthOpportunity || '');
    } catch (err) {
      console.error("Generation Error:", err);
      setError("Failed to analyze positioning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePositioning();
  }, [appData]);

  const handleAdopt = () => {
    onComplete({
      type: 'ai',
      data: {
        suggestedTagline: tagline,
        positioningStatement,
        targetAudience,
        coreProblemSolved: coreProblem,
        coreValue,
        competitiveAdvantage,
        bestCommunities,
        audienceKeywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        selectedChannels,
        primary_cta: cta,
        marketInsight,
        bestAcquisitionStrategy,
        biggestGrowthOpportunity
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-poppins text-foreground">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-[#F97316]/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-foreground/5 border border-[#F97316]/30 flex items-center justify-center">
            <Brain className="w-10 h-10 text-[#F97316] animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing your positioning...</h2>
        <p className="text-zinc-500">Our elite strategist is crafting your unique market position.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-poppins text-foreground">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-zinc-500 mb-8">{error}</p>
        <button 
          onClick={generatePositioning}
          className="flex items-center gap-2 px-8 py-4 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#9e4a2a] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest">Expert Analysis Complete</span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4" style={{ letterSpacing: '-2px' }}>
            Your Sharpest Market Position
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-base">
            We've stripped away the fluff. Edit any details below to perfectly match your vision.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 shadow-2xl relative">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-foreground/40 text-[10px] tracking-widest font-bold uppercase">YOUR POSITIONING BRAIN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-foreground/60 text-xs">Building live</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* TAGLINE Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">TAGLINE</span>
              <input
                type="text"
                placeholder="Your suggested tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* POSITIONING STATEMENT Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">POSITIONING STATEMENT</span>
              <textarea
                rows={3}
                placeholder="Your positioning statement"
                value={positioningStatement}
                onChange={(e) => setPositioningStatement(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* TARGET AUDIENCE Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">TARGET AUDIENCE</span>
              <input
                type="text"
                placeholder="Your target audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* CORE PROBLEM Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">CORE PROBLEM</span>
              <input
                type="text"
                placeholder="The core problem solved"
                value={coreProblem}
                onChange={(e) => setCoreProblem(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* CORE VALUE Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">CORE VALUE</span>
              <input
                type="text"
                placeholder="The core value delivered"
                value={coreValue}
                onChange={(e) => setCoreValue(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* COMPETITIVE ADVANTAGE Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">COMPETITIVE ADVANTAGE</span>
              <input
                type="text"
                placeholder="Your competitive advantage"
                value={competitiveAdvantage}
                onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* BEST COMMUNITIES Section */}
            <div className="space-y-4 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">BEST COMMUNITIES</span>
              {bestCommunities.map((comm, idx) => (
                <div key={idx} className="space-y-2 p-4 rounded-xl bg-foreground/5 border border-foreground/10">
                  <span className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold block">Community {idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Community Name (e.g. r/SaaS)"
                    value={comm.name}
                    onChange={(e) => {
                      const updated = [...bestCommunities];
                      updated[idx].name = e.target.value;
                      setBestCommunities(updated);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <textarea
                    rows={2}
                    placeholder="Why high-intent buyers discuss this problem here"
                    value={comm.reason}
                    onChange={(e) => {
                      const updated = [...bestCommunities];
                      updated[idx].reason = e.target.value;
                      setBestCommunities(updated);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* KEYWORDS Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">KEYWORDS (comma separated)</span>
              <input
                type="text"
                placeholder="e.g. email outreach, cold email, lead generation"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* RECOMMENDED CHANNELS Section */}
            <div className="space-y-4 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">RECOMMENDED CHANNELS</span>
              <div className="flex flex-wrap gap-2">
                {['Reddit', 'X', 'Threads', 'Indie Hackers', 'Hacker News'].map((channel) => {
                  const isSelected = selectedChannels.includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        setSelectedChannels(prev => 
                          prev.includes(channel) 
                            ? prev.filter(c => c !== channel) 
                            : [...prev, channel]
                        );
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                        isSelected 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/20'
                      )}
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* CALL TO ACTION Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">CALL TO ACTION</span>
              <input
                type="text"
                placeholder="Your primary call to action"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* MARKET INSIGHT Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">MARKET INSIGHT</span>
              <textarea
                rows={3}
                placeholder="One non-obvious observation about the audience or market dynamics"
                value={marketInsight}
                onChange={(e) => setMarketInsight(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* BEST ACQUISITION STRATEGY Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">BEST ACQUISITION STRATEGY</span>
              <textarea
                rows={3}
                placeholder="The highest-leverage customer acquisition approach"
                value={bestAcquisitionStrategy}
                onChange={(e) => setBestAcquisitionStrategy(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-4" />

            {/* BIGGEST GROWTH OPPORTUNITY Section */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">BIGGEST GROWTH OPPORTUNITY</span>
              <textarea
                rows={3}
                placeholder="Where this product is most likely to acquire its next 100 users"
                value={biggestGrowthOpportunity}
                onChange={(e) => setBiggestGrowthOpportunity(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10 my-6" />

            {/* Footer inside card */}
            <div className="pt-2 flex gap-4">
              <button
                onClick={generatePositioning}
                className="flex-1 py-4 border border-foreground/10 text-foreground/60 font-bold rounded-xl hover:bg-white/5 transition-all bg-transparent"
              >
                Regenerate ↺
              </button>
              <button
                onClick={handleAdopt}
                className="flex-[2] py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Adopt this position
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}