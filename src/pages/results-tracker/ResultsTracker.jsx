"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ConnectAccounts from '../../components/results-tracker/ConnectAccounts';
import { ExternalLink, MessageSquare, ArrowBigUp, Zap, AlertCircle } from 'lucide-react';

export default function ResultsTracker() {
  const [username, setUsername] = useState(() => localStorage.getItem('reddit_tracker_username') || '');
  const [posts, setPosts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchRedditPosts = async (userHandle) => {
    if (!userHandle) return;
    
    setIsFetching(true);
    setError(null);
    
    try {
      const res = await fetch(`https://www.reddit.com/user/${userHandle}/submitted.json?limit=25&sort=new`);
      
      if (!res.ok) {
        throw new Error("Could not load posts. Your Reddit profile may be private, or try again in a moment.");
      }

      const data = await res.json();
      const children = data?.data?.children || [];
      
      if (children.length === 0) {
        setPosts([]);
      } else {
        const mappedPosts = children.map(child => ({
          id: child.data.id,
          title: child.data.title,
          url: `https://reddit.com${child.data.permalink}`,
          subreddit: child.data.subreddit_name_prefixed,
          upvotes: child.data.score,
          comments: child.data.num_comments,
          engagement: child.data.score + child.data.num_comments,
          date: new Date(child.data.created_utc * 1000).toLocaleDateString()
        }));
        setPosts(mappedPosts);
      }
      
      setUsername(userHandle);
      localStorage.setItem('reddit_tracker_username', userHandle);
    } catch (err) {
      console.error("Reddit fetch error:", err);
      setError("Could not load posts. Your Reddit profile may be private, or try again in a moment.");
      setPosts([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch on mount if username exists
  useEffect(() => {
    if (username) {
      fetchRedditPosts(username);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-24">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Reddit Post Tracker</h1>
            <p className="text-zinc-400 text-sm">Track your Reddit performance in real-time.</p>
          </div>

          <div className="max-w-md">
            <ConnectAccounts 
              onFetch={fetchRedditPosts} 
              isFetching={isFetching} 
              initialUsername={username}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-white text-sm font-semibold">Recent Submissions</h3>
                <span className="text-zinc-500 text-xs font-medium">{posts.length} posts found</span>
              </div>

              <div className="grid gap-4">
                {posts.map((post) => (
                  <div 
                    key={post.id}
                    className="bg-[#111111] border border-white/5 rounded-xl p-5 hover:border-orange-500/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">
                            {post.subreddit}
                          </span>
                          <span className="text-zinc-600 text-xs">{post.date}</span>
                        </div>
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white font-medium text-base hover:text-orange-500 transition-colors flex items-center gap-2 group/link"
                        >
                          {post.title}
                          <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </div>

                      <div className="flex items-center gap-6 sm:gap-8">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                            <ArrowBigUp size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upvotes</span>
                          </div>
                          <span className="text-white font-bold">{post.upvotes}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                            <MessageSquare size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Comments</span>
                          </div>
                          <span className="text-white font-bold">{post.comments}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                            <Zap size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Engagement</span>
                          </div>
                          <span className="text-orange-500 font-bold">{post.engagement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isFetching && posts.length === 0 && !error && username && (
            <div className="text-center py-20 bg-[#111111] border border-white/5 rounded-2xl">
              <p className="text-zinc-500 text-sm">No posts found for this user.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}