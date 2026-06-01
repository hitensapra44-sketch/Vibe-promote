import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Sparkles } from 'lucide-react';
import NavBar from '../components/landing/navbar';
import HeroSection from '../components/landing/HeroSection';
import BrandScroller from '../components/landing/BrandScroller';
import HowItWorks from '../components/landing/howitworks';
import FeaturesSection from '../components/landing/FeaturesSection';
import BeforeAfter from '../components/landing/BeforeAfter';
import XPostToggle from '../components/landing/XPostToggle';
import Solution from '../components/landing/Solution';
import WhySection from '../components/landing/WhySection';
import SocialTestimonials from '../components/landing/SocialTestimonials';
import FAQ from '../components/landing/faqs';
import Footer from '../components/landing/fottersection';

export default function Home() {
  const navigate = useNavigate();
  const [ctaUrl, setCtaUrl] = useState('https://');

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!ctaUrl || ctaUrl === 'https://') return;
    localStorage.setItem('onboarding_url', ctaUrl);
    navigate('/auth');
  };

  useEffect(() => {
    // Spotlight card mouse tracking
    const onMouseMove = (e) => {
      document.querySelectorAll('.spotlight-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen font-geist">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        /* Spotlight card effect */
        .spotlight-card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          transition: border-color 0.25s ease;
          overflow: hidden;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(156,32,0,0.05) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .spotlight-card:hover::before { opacity: 1; }
        .spotlight-card:hover { border-color: rgba(156,32,0,0.45); }
        .spotlight-card > * { position: relative; z-index: 1; }

        @keyframes brandScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      <NavBar />
      <HeroSection />
      <BrandScroller />
      <HowItWorks />
      <FeaturesSection />
      <BeforeAfter />
      <XPostToggle />
      <Solution />
      <WhySection />
      <SocialTestimonials />
      <FAQ />
      
      {/* CTA Section */}
      <section id="cta" className="py-24 px-6" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="relative border border-orange-500/20 rounded-2xl p-12 sm:p-20 text-center overflow-hidden" style={{ background: '#ffffff' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-0.5 bg-[#9C2000]" />
            <span className="font-geist text-xs tracking-[0.2em] uppercase text-primary font-medium">Start Today</span>
            <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-foreground mt-4 mb-10" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stop overthinking your <span className="text-primary">marketing.</span>
            </h2>
            
            <form onSubmit={handleCtaSubmit} className="relative group w-full max-w-lg mx-auto mb-6" style={{ zIndex: 10 }}>
              <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all opacity-50" />
              <div className="relative flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="url"
                    placeholder="https://your-awesome-saas.com"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!ctaUrl || ctaUrl === 'https://'}
                  className="px-6 py-3.5 rounded-xl bg-white text-zinc-900 border-2 border-orange-500 hover:bg-orange-50 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-orange-500" /> Start for free
                </button>
              </div>
            </form>

            <div className="flex gap-6 flex-wrap justify-center mt-4 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">✓</span> no credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">✓</span> 100% private, no data to train models
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
</dyad-file>

<dyad-chat-summary>Updating the entire SaaS product UI to match the premium white design system.</dyad-chat-summary>

I have successfully updated all the specified pages and components to match the premium white design system, ensuring visual consistency across the entire product.<dyad-write path="src/components/results-tracker/ConnectAccounts.jsx" description="Updating ConnectAccounts component to use the premium white design system.">
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Loader2, 
  MessageSquare, 
  Zap, 
  Twitter, 
  AtSign, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const platforms = [
  { id: 'Reddit', name: 'Reddit', desc: 'Karma & engagement', icon: MessageSquare, color: '#FF4500' },
  { id: 'Product Hunt', name: 'Product Hunt', desc: 'Coming soon', icon: Zap, color: '#DA552F', comingSoon: true },
  { id: 'Twitter', name: 'X / Twitter', desc: 'Coming soon', icon: Twitter, color: '#333333', comingSoon: true },
  { id: 'Threads', name: 'Threads', desc: 'Coming soon', icon: AtSign, color: '#000000', comingSoon: true },
];

export default function ConnectAccounts({ onConnect }) {
  const { user, plan } = useAuth();
  const [step, setStep] = useState('platform-select'); 
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedPosts, setFetchedPosts] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  const isFree = plan === 'free';

  useEffect(() => {
    async function fetchConnected() {
      if (!user) return;
      const { data } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('user_id', user.id);
      if (data) {
        setConnectedPlatforms(data.map(a => a.platform));
      }
    }
    fetchConnected();
  }, [user]);

  const fetchRedditData = async (userHandle) => {
    const cleanHandle = userHandle.replace(/^u\//, '').trim();

    const [postsRes, aboutRes] = await Promise.all([
      fetch(`https://www.reddit.com/user/${cleanHandle}/submitted.json?limit=30&sort=new`, { headers: { 'Accept': 'application/json' } }),
      fetch(`https://www.reddit.com/user/${cleanHandle}/about.json`, { headers: { 'Accept': 'application/json' } })
    ]);

    if (postsRes.status === 404) throw new Error('Reddit user not found. Check the username.');
    if (postsRes.status === 403) throw new Error('This Reddit profile is private.');
    if (!postsRes.ok) throw new Error(`Reddit error: ${postsRes.status}. Try again in a moment.`);

    const json = await postsRes.json();
    const posts = (json?.data?.children ?? []).map(child => ({
      title: child.data.title,
      subreddit: child.data.subreddit_name_prefixed,
      score: child.data.score ?? 0,
      num_comments: child.data.num_comments ?? 0,
      url: `https://reddit.com${child.data.permalink}`,
      created_at: new Date(child.data.created_utc * 1000).toISOString(),
      engagement: (child.data.score ?? 0) + (child.data.num_comments ?? 0)
    }));

    let karma = 0;
    if (aboutRes.ok) {
      const aboutJson = await aboutRes.json();
      karma = aboutJson?.data?.total_karma ?? (aboutJson?.data?.link_karma || 0) + (aboutJson?.data?.comment_karma || 0);
    }

    return { posts, karma };
  };

  const handleStartFetch = async (e) => {
    e?.preventDefault();
    if (isFree) return;
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result = { posts: [], karma: 0 };
      if (selectedPlatform.id === 'Reddit') {
        result = await fetchRedditData(username.trim());
      }
      
      const postsWithKarma = result.posts;
      postsWithKarma._karma = result.karma ?? 0;
      setFetchedPosts(postsWithKarma);
      setStep('preview');
    } catch (err) {
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeConnection = async () => {
    setLoading(true);
    try {
      const { data: existingAccount } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', selectedPlatform.id)
        .maybeSingle();

      const karma = fetchedPosts._karma ?? 0;

      if (existingAccount) {
        await supabase
          .from('social_accounts')
          .update({ username: username.trim(), karma })
          .eq('id', existingAccount.id);
      } else {
        await supabase
          .from('social_accounts')
          .insert({ user_id: user.id, platform: selectedPlatform.id, username: username.trim(), karma });
      }

      await supabase.from('social_posts').delete().eq('user_id', user.id).eq('platform', selectedPlatform.id);

      const mappedPosts = fetchedPosts.map(p => ({
        user_id: user.id,
        platform: selectedPlatform.id,
        title: `${p.title}||${p.url}`,
        views: null,
        engagements: p.score,
        comments: p.num_comments,
        link_clicks: 0,
        created_at: p.created_at
      }));

      await supabase.from('social_posts').insert(mappedPosts);

      onConnect();
    } catch (err) {
      setError("Failed to save connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isFree) {
    return (
      <div className="bg-foreground/5 border border-orange-500/20 rounded-2xl p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-foreground font-bold text-xl mb-2">Connect Accounts is a Pro Feature</h3>
        <p className="text-zinc-500 text-sm max-w-sm mb-8">
          Upgrade to Pro to link your platforms and track your performance in real-time.
        </p>
        <Link 
          to="/pricing" 
          className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 'platform-select' && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {platforms.map((p) => {
              const isConnected = connectedPlatforms.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => !p.comingSoon && (setSelectedPlatform(p), setStep('input'))}
                  className={cn(
                    "bg-foreground/5 border border-foreground/10 rounded-xl p-5 cursor-pointer flex flex-col items-center gap-2 text-center hover:border-orange-500/50 transition-all relative group",
                    p.comingSoon && "opacity-40 cursor-not-allowed",
                    isConnected && "border-green-500/30 bg-green-500/5"
                  )}
                >
                  {p.comingSoon && (
                    <span className="absolute top-2 right-2 bg-foreground/5 text-zinc-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Soon</span>
                  )}
                  {isConnected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} className="text-green-500" />
                      <span className="text-green-500 text-[8px] font-bold uppercase">Connected</span>
                    </div>
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-1 transition-colors",
                    isConnected ? "bg-green-500/10" : "group-hover:bg-orange-500/10"
                  )}>
                    <p.icon size={20} className={cn(
                      "transition-colors",
                      isConnected ? "text-green-500" : "text-zinc-400 group-hover:text-orange-500"
                    )} />
                  </div>
                  <span className="text-foreground text-sm font-medium">{p.name}</span>
                  <span className="text-zinc-500 text-xs">{p.desc}</span>
                </div>
              );
            })}
          </motion.div>
        )}

        {step === 'input' && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-foreground/5 border border-orange-500/30 rounded-2xl p-8"
          >
            <button 
              onClick={() => setStep('platform-select')}
              className="text-zinc-500 hover:text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6 bg-transparent"
            >
              <ArrowLeft size={14} /> Back to platforms
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <selectedPlatform.icon size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-foreground text-xl font-bold">Connect {selectedPlatform.name}</h3>
                <p className="text-zinc-500 text-sm">Enter your username to track your performance.</p>
              </div>
            </div>

            <form onSubmit={handleStartFetch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  placeholder={`e.g. ${selectedPlatform.id === 'Reddit' ? 'spez' : 'maker_name'}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl px-5 py-4 text-foreground focus:outline-none focus:border-orange-500 transition-all"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 p-4 rounded-xl">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><TrendingUp size={20} /> Fetch Results</>}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: -0.95 }}
            className="bg-foreground/5 border border-green-500/30 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">Found {fetchedPosts.length} posts</h3>
                  <p className="text-zinc-500 text-xs">Previewing data for {selectedPlatform.id === 'Reddit' ? 'u/' : ''}{username}</p>
                </div>
              </div>
              <button 
                onClick={() => setStep('input')}
                className="text-zinc-500 hover:text-foreground text-xs font-bold bg-transparent"
              >
                Change User
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-8 scrollbar-hide">
              {fetchedPosts.map((post, i) => (
                <div key={i} className="bg-background border border-foreground/10 rounded-xl p-4 flex items-center justify-between group">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-foreground text-sm font-medium truncate mb-1">{post.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <span className="text-orange-500">{post.subreddit}</span>
                      <span>•</span>
                      <span>{post.score} Upvotes</span>
                      <span>•</span>
                      <span>{post.num_comments} Comments</span>
                    </div>
                  </div>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-600 hover:text-foreground transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-4 border border-foreground/10 text-zinc-500 font-bold rounded-xl hover:bg-foreground/5 transition-all bg-transparent"
              >
                Back
              </button>
              <button
                onClick={handleFinalizeConnection}
                disabled={loading}
                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm & Connect"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-xs bg-foreground/5 border border-foreground/10 rounded-lg py-3 px-4">
        <Lock size={12} />
        <span>We only read performance data. We never post for you.</span>
      </div>
    </div>
  );
}