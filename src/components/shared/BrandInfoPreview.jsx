"use client";

import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrandInfoPreview({ appName, problem, audience }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMissingInfo = !appName || !problem || !audience;

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden mb-6">
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-zinc-400" />
          <span className="text-zinc-400 text-sm">Using your brand info</span>
          {isMissingInfo && (
            <span className="text-red-400 text-xs ml-2">Complete your brand info to unlock full features</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/onboarding" 
            className="text-orange-500 text-xs hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Edit →
          </Link>
          {isExpanded ? (
            <ChevronUp size={16} className="text-zinc-500" />
          ) : (
            <ChevronDown size={16} className="text-zinc-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
          {appName && (
            <span className="bg-[#1F1F1F] text-orange-400 text-xs rounded-full px-3 py-1">
              {appName}
            </span>
          )}
          {problem && (
            <span className="bg-[#1F1F1F] text-orange-400 text-xs rounded-full px-3 py-1">
              {problem}
            </span>
          )}
          {audience && (
            <span className="bg-[#1F1F1F] text-orange-400 text-xs rounded-full px-3 py-1">
              {audience}
            </span>
          )}
        </div>
      )}
    </div>
  );
}