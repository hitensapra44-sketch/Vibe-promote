"use client";

import React, { useState } from 'react';
import BrandInfoPreview from '../shared/BrandInfoPreview';
import PostingTips from './PostingTips';
import { cn } from "@/lib/utils";

export default function PostOutput({ postData, brandInfo, onBack, onRegenerate }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(postData.postContent);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const charCount = editedContent.length;
  const getLimit = () => {
    switch (postData.platform) {
      case 'X': return 280;
      case 'Threads': return 500;
      case 'LinkedIn': return 3000;
      case 'Product Hunt': return 260;
      default: return Infinity;
    }
  };
  const limit = getLimit();
  const isOverLimit = charCount > limit;

  const platformColors = {
    Reddit: '#FF4500',
    X: '#333333',
    LinkedIn: '#0A66C2',
    Threads: '#000000',
    'Indie Hackers': '#0EA5E9',
    'Product Hunt': '#DA552F'
  };

  return (
    <div className="max-w-[900px] mx-auto py-10 flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN */}
      <div className="lg:w-[260px] flex flex-col">
        <button 
          onClick={onBack}
          className="text-zinc-400 text-sm mb-6 cursor-pointer hover:text-zinc-200 transition-colors flex items-center gap-2 bg-transparent"
        >
          ← Start over
        </button>

        <BrandInfoPreview 
          appName={brandInfo.appName}
          problem={brandInfo.problem}
          audience={brandInfo.audience}
        />

        <div className="mt-4 space-y-2">
          <div>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Tone used:</span>
            <p className="text-orange-400 text-xs font-bold">{postData.tone}</p>
          </div>
          {postData.specification && (
            <div>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Added context:</span>
              <p className="text-zinc-400 text-xs italic">{postData.specification}</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 flex flex-col">
        <div className="bg-[#111111] rounded-xl overflow-hidden border border-[#1F1F1F]">
          <div className="h-9 flex items-center px-4 gap-2 bg-[#1A1A1A]">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: platformColors[postData.platform] }} 
            />
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              {postData.platform} Preview
            </span>
            <span className="bg-[#1F1F1F] text-zinc-500 text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto uppercase tracking-wider">
              Preview
            </span>
          </div>

          <div className="px-5 py-4 border-t border-[#1F1F1F]">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white min-h-[160px] focus:border-orange-500 outline-none"
              />
            ) : (
              <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                {editedContent}
              </p>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-[#1F1F1F] mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              {postData.platform === 'Reddit' ? (
                <><span>▲ 0</span><span>💬 0 comments</span></>
              ) : postData.platform === 'X' ? (
                <><span>♥ 0</span><span>🔁 0</span><span>💬 0</span></>
              ) : (
                <><span>👍 0</span><span>💬 0</span></>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isOverLimit ? "text-red-400" : "text-zinc-500"
          )}>
            {charCount} chars
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isOverLimit ? "text-red-400" : "text-zinc-500"
          )}>
            {postData.platform === 'Reddit' || postData.platform === 'Indie Hackers' 
              ? "No limit" 
              : `${limit} chars max`}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 h-11 bg-orange-500 text-white text-sm font-bold rounded-lg transition-all"
              >
                Save Edit
              </button>
              <button 
                onClick={() => {
                  setEditedContent(postData.postContent);
                  setIsEditing(false);
                }}
                className="flex-1 h-11 border border-[#1F1F1F] text-zinc-400 text-sm font-bold rounded-lg hover:border-zinc-600 transition-all bg-transparent"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onRegenerate}
                className="flex-1 h-11 border border-[#1F1F1F] text-zinc-400 text-sm font-bold rounded-lg hover:border-zinc-600 transition-all bg-transparent"
              >
                Regenerate ↺
              </button>
              <button 
                onClick={handleCopy}
                className="flex-1 h-11 bg-orange-500 text-white text-sm font-bold rounded-lg transition-all"
              >
                {isCopied ? "Copied ✓" : "Copy Post ⎘"}
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 h-11 border border-[#1F1F1F] text-zinc-400 text-sm font-bold rounded-lg hover:border-zinc-600 transition-all bg-transparent"
              >
                Edit Post ✎
              </button>
            </>
          )}
        </div>

        <PostingTips platform={postData.platform} />
      </div>
    </div>
  );
}