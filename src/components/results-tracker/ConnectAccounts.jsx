"use client";

import React, { useState } from 'react';
import { Lock, Loader2, MessageSquare, Linkedin, Globe, Zap, Twitter, AtSign, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../lib/AuthContext';

const platforms = [
  { id: 'Reddit', name: 'Reddit', desc: 'Upvotes & reach', icon: MessageSquare, color: '#FF4500' },
  { id: 'Product Hunt', name: 'Product Hunt', desc: 'Votes & comments', icon: Zap, color: '#DA552F' },
  { id: 'LinkedIn', name: 'LinkedIn', desc: 'Impressions & clicks', icon: Linkedin, color: '#0A66C2', comingSoon: true },
  { id: 'Indie Hackers', name: 'Indie Hackers', desc: 'Community engagement', icon: Globe, color: '#0EA5E9', comingSoon: true },
  { id: 'Twitter', name: 'X / Twitter', desc: 'Coming soon', icon: Twitter, color: '#333333', comingSoon: true },
  { id: 'Threads', name: 'Threads', desc: 'Coming soon', icon: AtSign, color: '#000000', comingSoon: true },
];

export default function ConnectAccounts({ onConnect }) {
  const { user } = useAuth();
  const [loadingPlatform, setLoadingPlatform] = useState(null);
  const [activeInput, setActiveInput] = useState(null);
  const [username, setUsername] = useState('');

  const fetchRedditPosts = async (username) => {
    const response = await fetch(`https://www.reddit.com/user/${username}/submitted.json`, {
      headers: {
        'User-Agent': 'VibePromote/1.0'
      }
    });
    if (!response.ok) throw new Error('Reddit user not found');
    const data = await response.json();
    return (data.data.children || []).map(child => ({
      title: child.data.title,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_at: new Date(child.data.created_utc * 1000).toISOString()
    }));
  };

  const fetchProductHuntPosts = async (username) => {
    // Mocking Product Hunt fetch as requested for placeholder data
    return [
      { title: `${username}'s Awesome Launch`, score: 120, num_comments: 15, created_at: new Date().toISOString() },
      { title: "Secondary Tool Update", score: 45, num_comments: 8, created_at: new Date(Date.now() - 86400000).toISOString() }
    ];
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim() || !activeInput || !user) return;

    const platform = activeInput;
    setLoadingPlatform(platform);

    try {
      // 1. Store account - Manual Upsert to avoid "no unique constraint" error
      const { data: existingAccount } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .maybeSingle();

      let accountError;
      if (existingAccount) {
        const { error } = await supabase
          .from('social_accounts')
          .update({ username: username.trim() })
          .eq('id', existingAccount.id);
        accountError = error;
      } else {
        const { error } = await supabase
          .from('social_accounts')
          .insert({ user_id: user.id, platform, username: username.trim() });
        accountError = error;
      }

      if (accountError) throw accountError;

      // 2. Fetch posts
      let posts = [];
      if (platform === 'Reddit') {
        posts = await fetchRedditPosts(username.trim());
      } else if (platform === 'Product Hunt') {
        posts = await fetchProductHuntPosts(username.trim());
      }

      // 3. Delete existing posts for this platform to refresh data
      await supabase
        .from('social_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

      // 4. Insert new posts
      if (posts.length > 0) {
        const mappedPosts = posts.map(p => ({
          user_id: user.id,
          platform,
          title: p.title,
          views: p.score * 3,
          engagements: p.score,
          comments: p.num_comments,
          link_clicks: Math.floor(p.score * 0.2),
          created_at: p.created_at
        }));

        const { error: insertError } = await supabase
          .from('social_posts')
          .insert(mappedPosts);

        if (insertError) throw insertError;
      }

      setActiveInput(null);
      setUsername('');
      onConnect(); // Refresh parent
    } catch (err) {
      console.error("Connection error:", err);
      alert("Failed to fetch data. Please check the username and try again.");
    } finally {
      setLoadingPlatform(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {platforms.map((p) => {
          const isLoading = loadingPlatform === p.id;

          return (
            <div
              key={p.id}
              onClick={() => !p.comingSoon && !isLoading && setActiveInput(p.id)}
              className={cn(
                "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer flex flex-col items-center gap-2 text-center hover:border-zinc-600 transition-all relative",
                activeInput === p.id && "border-orange-500 bg-orange-500/5",
                p.comingSoon && "opacity-40 cursor-not-allowed"
              )}
            >
              {p.comingSoon && (
                <span className="absolute top-2 right-2 bg-[#1F1F1F] text-zinc-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Soon</span>
              )}
              
              <div className={cn(
                "w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-1",
                activeInput === p.id ? "text-orange-500" : "text-zinc-400"
              )}>
                {isLoading ? <Loader2 size={20} className="animate-spin text-orange-500" /> : <p.icon size={20} />}
              </div>
              
              <span className="text-white text-sm font-medium">{p.name}</span>
              <span className="text-zinc-500 text-xs">{p.desc}</span>
            </div>
          );
        })}
      </div>

      {activeInput && (
        <form onSubmit={handleConnect} className="bg-[#111111] border border-orange-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-bold">Connect {activeInput}</h3>
            <button type="button" onClick={() => setActiveInput(null)} className="text-zinc-500 hover:text-white bg-transparent">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Enter your ${activeInput} username`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              required
              disabled={!!loadingPlatform}
            />
            <button
              type="submit"
              disabled={!!loadingPlatform || !username.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg px-6 py-2 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loadingPlatform ? <Loader2 size={14} className="animate-spin" /> : "Connect"}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs bg-[#111111] border border-[#1F1F1F] rounded-lg py-3 px-4">
        <Lock size={12} />
        <span>We only read performance data. We never post for you.</span>
      </div>
    </div>
  );
}