"use client";

import React, { useState } from 'react';
import { Lock, Loader2, MessageSquare, Linkedin, Globe, Zap, Twitter } from 'lucide-react';
import PlatformCard from '../shared/PlatformCard';

export default function ConnectAccounts() {
  const [connections, setConnections] = useState({
    reddit: 'available',
    linkedin: 'available',
    producthunt: 'available',
    indiehackers: 'available',
    twitter: 'coming-soon'
  });

  const [loadingPlatform, setLoadingPlatform] = useState(null);
  const [showInput, setShowInput] = useState(null);
  const [usernames, setUsernames] = useState({ ph: '', ih: '' });

  const handleConnect = (platform) => {
    if (platform === 'producthunt' || platform === 'indiehackers') {
      setShowInput(platform);
      return;
    }

    setLoadingPlatform(platform);
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [platform]: 'connected' }));
      setLoadingPlatform(null);
    }, 1500);
  };

  const handleSaveUsername = (platform) => {
    setConnections(prev => ({ ...prev, [platform]: 'connected' }));
    setShowInput(null);
  };

  return (
    <div className="max-w-[640px] mx-auto py-10 flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-white text-xl font-semibold">Connect Your Accounts</h2>
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
          <Lock size={14} />
          <span>We only read your performance data. We never post on your behalf.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <PlatformCard 
            name="Reddit"
            description="Upvotes, comments, post reach"
            icon={<MessageSquare size={20} />}
            status={loadingPlatform === 'reddit' ? 'connecting' : connections.reddit}
            onClick={() => handleConnect('reddit')}
          />
          {loadingPlatform === 'reddit' && (
            <div className="flex items-center justify-center gap-2 text-orange-500 text-xs font-medium">
              <Loader2 size={12} className="animate-spin" /> Connecting...
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PlatformCard 
            name="LinkedIn"
            description="Impressions, clicks, followers gained"
            icon={<Linkedin size={20} />}
            status={loadingPlatform === 'linkedin' ? 'connecting' : connections.linkedin}
            onClick={() => handleConnect('linkedin')}
          />
          {loadingPlatform === 'linkedin' && (
            <div className="flex items-center justify-center gap-2 text-orange-500 text-xs font-medium">
              <Loader2 size={12} className="animate-spin" /> Connecting...
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PlatformCard 
            name="Product Hunt"
            description="Enter your username, no login needed"
            icon={<Zap size={20} />}
            status={connections.producthunt}
            onClick={() => handleConnect('producthunt')}
          />
          {showInput === 'producthunt' && (
            <div className="p-3 bg-[#111111] border border-[#1F1F1F] rounded-xl flex gap-2">
              <input 
                type="text" 
                placeholder="Enter your username"
                className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                value={usernames.ph}
                onChange={(e) => setUsernames({...usernames, ph: e.target.value})}
              />
              <button 
                onClick={() => handleSaveUsername('producthunt')}
                className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PlatformCard 
            name="Indie Hackers"
            description="Enter your IH username"
            icon={<Globe size={20} />}
            status={connections.indiehackers}
            onClick={() => handleConnect('indiehackers')}
          />
          {showInput === 'indiehackers' && (
            <div className="p-3 bg-[#111111] border border-[#1F1F1F] rounded-xl flex gap-2">
              <input 
                type="text" 
                placeholder="Enter your username"
                className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                value={usernames.ih}
                onChange={(e) => setUsernames({...usernames, ih: e.target.value})}
              />
              <button 
                onClick={() => handleSaveUsername('indiehackers')}
                className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>

        <PlatformCard 
          name="X / Twitter"
          description="Coming soon"
          icon={<Twitter size={20} />}
          status="coming-soon"
        />
      </div>
    </div>
  );
}