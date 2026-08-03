"use client";

import React from 'react';
import { Clock, Compass } from 'lucide-react';

export default function PostingTips({ platform }) {
  const getTip = () => {
    switch (platform) {
      case 'Reddit': return "Tuesday to Thursday · 9AM–11AM EST · Avoid weekends for SaaS topics";
      case 'X': return "Tuesday & Wednesday · 8–10AM or 6–8PM your timezone · Reply to your own post within 30 mins to boost reach";
      case 'Threads': return "Weekday mornings · 7–9AM · Short posts under 150 chars reshare more";
      case 'LinkedIn': return "Tuesday to Thursday · 8–10AM · Never post Friday afternoon";
      case 'Indie Hackers': return "Any weekday · Milestone posts get 5x more traction — frame this around your journey";
      case 'Product Hunt': return "Tuesday to Thursday · 12:01AM PST · Earlier you launch the more votes you get";
      default: return "";
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="bg-[#111111] border-l-4 border-l-orange-500 border border-[#1F1F1F] rounded-xl px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-orange-500" />
          <span className="text-white text-sm font-medium">Best time to post</span>
        </div>
        <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
          {getTip()}
        </p>
      </div>

      {platform === 'Reddit' && (
        <div className="bg-[#111111] border-l-4 border-l-orange-500 border border-[#1F1F1F] rounded-xl px-5 py-4">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-orange-500" />
            <span className="text-white text-sm font-medium">Best subreddits to post in</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['r/SaaS', 'r/entrepreneur', 'r/startups', 'r/indiehackers', 'r/growmybusiness'].map(sub => (
              <span key={sub} className="bg-[#1F1F1F] text-zinc-400 text-[10px] font-bold rounded-full px-3 py-1 border border-[#2A2A2A] uppercase tracking-wider">
                {sub}
              </span>
            ))}
          </div>
          <p className="text-zinc-500 text-[10px] mt-2 leading-relaxed">
            💡 Check each subreddit's rules before posting. Avoid posting the same content to more than 2 subreddits at once.
          </p>
        </div>
      )}
    </div>
  );
}