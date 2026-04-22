import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target, 
  MessageSquare, 
  Twitter, 
  Globe, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const GROK_API_KEY = "REMOVED";
const GROK_MODEL = "grok-beta";

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .single();
      if (data) setBrain(data);
      setLoading(false);
    }
    fetchBrain();
  }, [user]);

  const startScan = async () => {
    setScanning(true);
    
    const systemPrompt = `You are a social listening and market research expert. Your job is to find the exact "watering holes" where a specific target audience hangs out online. 
    
    Based on the provided Brand Brain, identify:
    1. 5 specific Subreddits (e.g., r/SaaS, r/IndieHackers).
    2. 5 X (Twitter) keywords or hashtags that are currently relevant.
    3. 3 niche forums or communities (e.g., Indie Hackers, Product Hunt, specific Discord/Slack types).
    
    For each item, provide:
    - The name/link.
    - A "Vibe Check": Why this audience is there.
    - A "Hook Angle": What specific problem they are complaining about that this app solves.
    
    Return ONLY a valid JSON object:
    {
      "reddit": [{ "name": "r/...", "vibe": "...", "angle": "..." }],
      "twitter": [{ "tag": "#...", "vibe": "...", "angle": "..." }],
      "forums": [{ "name": "...", "vibe": "...", "angle": "..." }]
    }`;

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Brand Brain:\n${JSON.stringify(brain)}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setResults(parsed);
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-bg-base text-white font-poppins p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-xl bg-bg-surface border border-border-muted hover:bg-bg-elevated transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Audience Spotter</h1>
              <p className="text-text-secondary">Find exactly where your people are talking.</p>
            </div>
          </div>
          {!results && !scanning && (
            <button 
              onClick={startScan}
              className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Search className="w-5 h-5" />
              Start Deep Scan
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Scanning the social web...</h2>
              <p className="text-text-secondary max-w-md">We're looking through Reddit, X, and niche forums to find your target audience.</p>
            </motion.div>
          ) : results ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Reddit Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 w-fit">
                  <MessageSquare className="w-4 h-4 text-[#FF4500]" />
                  <span className="text-xs font-bold text-[#FF4500] uppercase tracking-widest">Reddit Hotspots</span>
                </div>
                {results.reddit.map((r, i) => (
                  <div key={i} className="bg-bg-surface border border-border-muted rounded-2xl p-6 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-white">{r.name}</h3>
                      <ExternalLink className="w-4 h-4 text-text-secondary/40" />
                    </div>
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed"><span className="text-primary font-bold">VIBE:</span> {r.vibe}</p>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Hook Angle</p>
                      <p className="text-sm text-white/80 italic">"{r.angle}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* X Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 w-fit">
                  <Twitter className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">X (Twitter) Trends</span>
                </div>
                {results.twitter.map((t, i) => (
                  <div key={i} className="bg-bg-surface border border-border-muted rounded-2xl p-6 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-primary">{t.tag}</h3>
                      <TrendingUp className="w-4 h-4 text-text-secondary/40" />
                    </div>
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed"><span className="text-primary font-bold">VIBE:</span> {t.vibe}</p>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Strategy</p>
                      <p className="text-sm text-white/80 italic">"{t.angle}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forums Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Niche Communities</span>
                </div>
                {results.forums.map((f, i) => (
                  <div key={i} className="bg-bg-surface border border-border-muted rounded-2xl p-6 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-white">{f.name}</h3>
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed"><span className="text-primary font-bold">VIBE:</span> {f.vibe}</p>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Entry Point</p>
                      <p className="text-sm text-white/80 italic">"{f.angle}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border-muted rounded-[2.5rem]">
              <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-text-secondary/20" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to find your audience?</h2>
              <p className="text-text-secondary max-w-xs mx-auto mb-8">Click the button above to start a deep scan of the social web based on your Brand Brain.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}