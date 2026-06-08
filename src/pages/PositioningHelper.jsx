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

    const systemPrompt = `You are a world-class SaaS positioning strategist, growth advisor, and market analyst.

Your job is not to write generic marketing copy.

Your job is to help a founder understand:

* Who their real customers are
* What problem they truly solve
* How they should position themselves
* Where their audience already hangs out
* How they are different from competitors
* What growth opportunity they should pursue first

Analyze the provided brand information deeply.

Silently choose the best positioning approach based on the product, market, competitors, and audience. Never mention frameworks or explain your reasoning.

RULES:

* Be highly specific.
* Avoid generic startup language.
* Never use words like: innovative, revolutionary, cutting-edge, seamless, all-in-one, game-changing, powerful solution, streamline, empower.
* Never describe benefits vaguely.
* Use the language real customers would use.
* Focus on outcomes, frustrations, and buying motivations.
* If the audience is broad, narrow it to the most likely early adopter.
* If competitors exist, clearly differentiate from them.
* Position against what users currently do today.
* Prioritize clarity over cleverness.
* Every insight should feel personalized to the product.

COMMUNITY SELECTION RULES:

* Prioritize communities where people actively discuss the problem.
* Prefer buyer communities over creator communities.
* Avoid generic communities unless they are genuinely relevant.
* Explain why the audience is valuable, not why the community is popular.

KEYWORD RULES:

* Use phrases people search for when experiencing the problem.
* Avoid product-category keywords.
* Prefer pain-driven and intent-driven keywords.

GROWTH INSIGHT RULES:

* Generate a specific observation about how this product can acquire users.
* Avoid generic marketing advice.
* Focus on where the audience already discusses the problem.
* The insight should feel like something a growth consultant would tell a founder.

Return ONLY a valid JSON object.

{
"suggestedTagline": "5-10 word tagline that immediately communicates the outcome",

"positioningStatement": "2-3 sentences. Specific, direct, differentiated, and focused on the user's situation before and after adopting the product.",

"targetAudience": "One highly specific ICP. Include role, company stage, situation, or context.",

"coreProblemSolved": "Describe the exact frustrating situation users experience before finding this product.",

"coreValue": "Describe the primary outcome users gain after adopting the product.",

"competitiveAdvantage": "One sentence explaining why someone would choose this over the most common alternative.",

"bestCommunities": [
{
"name": "community name",
"reason": "Why high-intent buyers discuss this problem here."
},
{
"name": "community name",
"reason": "Why high-intent buyers discuss this problem here."
},
{
"name": "community name",
"reason": "Why high-intent buyers discuss this problem here."
},
{
"name": "community name",
"reason": "Why high-intent buyers discuss this problem here."
},
{
"name": "community name",
"reason": "Why high-intent buyers discuss this problem here."
}
],

"audienceKeywords": [
"keyword",
"keyword",
"keyword",
"keyword",
"keyword"
],

"recommendedGrowthChannel": {
"channel": "Reddit, X, Threads, Indie Hackers, hacker news\\n explaining why this channel is the highest-leverage acquisition channel for this specific product and audience."
},

"marketInsight": "One non-obvious observation about the audience, buying behavior, or market dynamics.",

"bestAcquisitionStrategy": "One sentence describing the highest-leverage customer acquisition approach.",

"biggestGrowthOpportunity": "One highly specific opportunity where this product is most likely to acquire its next 100 users."
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

      // Set CTA to suggested tagline initially
      setCta(parsed.suggestedTagline || '');

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