"use client";

import React, { useState } from 'react';
import { Lock, Loader2, MessageSquare, Linkedin, Globe, Zap, Twitter, AtSign } from 'lucide-react';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Upvotes & reach', icon: MessageSquare, color: '#FF4500' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Impressions & clicks', icon: Linkedin, color: '#0A66C2' },
  { id: 'producthunt', name: 'Product Hunt', desc: 'Votes & comments', icon: Zap, color: '#DA552F' },
  { id: 'indiehackers', name: 'Indie Hackers', desc: 'Community engagement', icon: Globe, color: '#0EA5E9' },
  { id: 'twitter', name: 'X / Twitter', desc: 'Coming soon', icon: Twitter, color: '#333333', comingSoon: true },
  { id: 'threads', name: 'Threads', desc: 'Coming soon', icon: AtSign, color: '#000000', comingSoon: true },
];

export default function ConnectAccounts({ onConnect }) {
  const [loadingPlatform, setLoadingPlatform] = useState(null);
  const [connected, setConnected] = useState([]);

  const handleConnect = (id) => {
    if (platforms.find(p => p.id === id).comingSoon) return;
    
    setLoadingPlatform(id);
    setTimeout(() => {
      setConnected(prev => [...prev, id]);
      setLoadingPlatform(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {platforms.map((p) => {
          const isConnected = connected.includes(p.id);
          const isLoading = loadingPlatform === p.id;

          return (
            <div
              key={p.id}
              onClick={() => !isConnected && handleConnect(p.id)}
              className={cn(
                "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer flex flex-col items-center gap-2 text-center hover:border-zinc-600 transition-all relative",
                isConnected && "border-green-500/50 bg-green-500/5",
                p.comingSoon && "opacity-40 cursor-not-allowed"
              )}
            >
              {p.comingSoon && (
                <span className="absolute top-2 right-2 bg-[#1F1F1F] text-zinc-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Soon</span>
              )}
              
              <div className={cn(
                "w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-1",
                isConnected ? "text-green-500" : "text-zinc-400"
              )}>
                {isLoading ? <Loader2 size={20} className="animate-spin text-orange-500" /> : <p.icon size={20} />}
              </div>
              
              <span className="text-white text-sm font-medium">{p.name}</span>
              <span className="text-zinc-500 text-xs">{isConnected ? "Connected ✓" : p.desc}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs bg-[#111111] border border-[#1F1F1F] rounded-lg py-3 px-4">
        <Lock size={12} />
        <span>We only read performance data. We never post for you.</span>
      </div>

      {connected.length > 0 && (
        <button
          onClick={onConnect}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 py-2.5 mt-2 transition-colors"
        >
          View My Results →
        </button>
      )}
    </div>
  );
}