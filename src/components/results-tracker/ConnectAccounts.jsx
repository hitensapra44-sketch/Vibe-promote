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

const platforms = [
  { id: 'Reddit', name: 'Reddit', desc: 'Karma & engagement', icon: MessageSquare, color: '#FF4500' },
  { id: 'Product Hunt', name: 'Product Hunt', desc: 'Votes & comments', icon: Zap, color: '#DA552F' },
  { id: 'Twitter', name: 'X / Twitter', desc: 'Coming soon', icon: Twitter, color: '#333333', comingSoon: true },
  { id: 'Threads', name: 'Threads', desc: 'Coming soon', icon: AtSign, color: '#000000', comingSoon: true },
];

export default function ConnectAccounts({ onConnect }) {
  const { user } = useAuth();
  const [step, setStep] = useState('platform-select'); // 'platform-select', 'input', 'preview'
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedPosts, setFetchedPosts] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

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

  const fetchRedditPosts = async (userHandle) => {
    try {
      // Fetch posts and profile in parallel
      const [postsRes, aboutRes] = await Promise.all([
        fetch(`https://www.reddit.com/user/${encodeURIComponent(userHandle)}/submitted.json?limit=25&sort=new`, { headers: { 'Accept': 'application/json' } }),
        fetch(`https://www.reddit.com/user/${encodeURIComponent(userHandle)}/about.json`, { headers: { 'Accept': 'application/json' } })
      ]);

      if (postsRes.status === 403) throw new Error('This Reddit profile is private or Reddit is blocking the request.');
      if (postsRes.status === 404) throw new Error('Reddit user not found. Check the spelling.');
      if (postsRes.status === 429) throw new Error('Reddit is rate limiting. Try again in a few minutes.');
      if (!postsRes.ok) throw new Error(`Reddit returned an error: ${postsRes.status}`);

      const postsData = await postsRes.json();
      const aboutData = aboutRes.ok ? await aboutRes.json() : null;

      // Store profile summary
      const profile = aboutData?.data ? {
        totalKarma: aboutData.data.total_karma,
        postKarma: aboutData.data.link_karma,
        commentKarma: aboutData.data.comment_karma,
        accountAge: new Date(aboutData.data.created_utc * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
      } : null;

      const posts = (postsData.data?.children || []).map((child) => ({
        title: child.data.title,
        subreddit: child.data.subreddit_name_prefixed,
        score: child.data.score,
        num_comments: child.data.num_comments,
        engagement: child.data.score + child.data.num_comments,
        url: `https://reddit.com${child.data.permalink}`,
        created_at: new Date(child.data.created_utc * 1000).toISOString(),
        created_display: new Date(child.data.created_utc * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      }));

      if (posts.length === 0) throw new Error('This user has no submitted posts.');
      return { posts, profile };
    } catch (err) {
      throw err;
    }
  };

  const fetchProductHuntPosts = async (userHandle) => {
    const PH_TOKEN = "q1XgE1_GB8j1l5fV4ZZuUTsfXKI8nyXOPDgSN44VK3I";
    const query = `
      query FetchUserPosts($username: String!) {
        user(username: $username) {
          posts(first: 20) {
            edges {
              node {
                name
                votesCount
                commentsCount
                createdAt
                slug
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username: userHandle }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.user) {
        throw new Error('Product Hunt user not found.');
      }

      const posts = (result.data.user.posts.edges || []).map(edge => ({
        title: edge.node.name,
        subreddit: 'Product Hunt',
        score: edge.node.votesCount,
        num_comments: edge.node.commentsCount,
        engagement: edge.node.votesCount + edge.node.commentsCount,
        url: `https://www.producthunt.com/posts/${edge.node.slug}`,
        created_at: edge.node.createdAt
      }));

      if (posts.length === 0) throw new Error('This user has no posts on Product Hunt.');
      return { posts, profile: null };
    } catch (err) {
      throw err;
    }
  };

  const handleStartFetch = async (e) => {
    e?.preventDefault();
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result = { posts: [], profile: null };
      if (selectedPlatform.id === 'Reddit') {
        result = await fetchRedditPosts(username.trim());
      } else if (selectedPlatform.id === 'Product Hunt') {
        result = await fetchProductHuntPosts(username.trim());
      }
      
      setFetchedPosts(result.posts);
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
      // 1. Store account
      const { data: existingAccount } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', selectedPlatform.id)
        .maybeSingle();

      if (existingAccount) {
        await supabase
          .from('social_accounts')
          .update({ username: username.trim() })
          .eq('id', existingAccount.id);
      } else {
        await supabase
          .from('social_accounts')
          .insert({ user_id: user.id, platform: selectedPlatform.id, username: username.trim() });
      }

      // 2. Sync posts to DB
      await supabase.from('social_posts').delete().eq('user_id', user.id).eq('platform', selectedPlatform.id);

      const mappedPosts = fetchedPosts.map(p => ({
        user_id: user.id,
        platform: selectedPlatform.id,
        title: `${p.title}||${p.url}`, // Store URL in title for retrieval
        views: null,
        engagements: p.score,
        comments: p.num_comments,
        link_clicks: p.engagement, // Store calculated engagement in link_clicks
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
                    "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer flex flex-col items-center gap-2 text-center hover:border-orange-500/50 transition-all relative group",
                    p.comingSoon && "opacity-40 cursor-not-allowed",
                    isConnected && "border-green-500/30 bg-green-500/5"
                  )}
                >
                  {p.comingSoon && (
                    <span className="absolute top-2 right-2 bg-[#1F1F1F] text-zinc-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Soon</span>
                  )}
                  {isConnected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} className="text-green-500" />
                      <span className="text-green-500 text-[8px] font-bold uppercase">Connected</span>
                    </div>
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-1 transition-colors",
                    isConnected ? "bg-green-500/10" : "group-hover:bg-orange-500/10"
                  )}>
                    <p.icon size={20} className={cn(
                      "transition-colors",
                      isConnected ? "text-green-500" : "text-zinc-400 group-hover:text-orange-500"
                    )} />
                  </div>
                  <span className="text-white text-sm font-medium">{p.name}</span>
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
            className="bg-[#111111] border border-orange-500/30 rounded-2xl p-8"
          >
            <button 
              onClick={() => setStep('platform-select')}
              className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6 bg-transparent"
            >
              <ArrowLeft size={14} /> Back to platforms
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <selectedPlatform.icon size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">Connect {selectedPlatform.name}</h3>
                <p className="text-zinc-400 text-sm">Enter your username to track your performance.</p>
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
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all"
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
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: -0.95 }}
            className="bg-[#111111] border border-green-500/30 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Found {fetchedPosts.length} posts</h3>
                  <p className="text-zinc-400 text-xs">Previewing data for {selectedPlatform.id === 'Reddit' ? 'u/' : ''}{username}</p>
                </div>
              </div>
              <button 
                onClick={() => setStep('input')}
                className="text-zinc-500 hover:text-white text-xs font-bold bg-transparent"
              >
                Change User
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-8 scrollbar-hide">
              {fetchedPosts.map((post, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4 flex items-center justify-between group">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white text-sm font-medium truncate mb-1">{post.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <span className="text-orange-500">{post.subreddit}</span>
                      <span>•</span>
                      <span>{post.score} Upvotes</span>
                      <span>•</span>
                      <span>{post.num_comments} Comments</span>
                    </div>
                  </div>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-600 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-4 border border-[#1F1F1F] text-zinc-400 font-bold rounded-xl hover:bg-white/5 transition-all bg-transparent"
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

      <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-xs bg-[#111111] border border-[#1F1F1F] rounded-lg py-3 px-4">
        <Lock size={12} />
        <span>We only read performance data. We never post for you.</span>
      </div>
    </div>
  );
}