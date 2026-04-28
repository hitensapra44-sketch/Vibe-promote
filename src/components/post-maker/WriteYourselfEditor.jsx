"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Tag, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function WriteYourselfEditor({ platform, brandInfo, template, onPostGenerated, onBack }) {
  const [content, setContent] = useState(template?.format || '');
  const [specification, setSpecification] = useState('');
  const [selectedTone, setSelectedTone] = useState('Authentic Founder');
  const [isPolishing, setIsPolishing] = useState(false);
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handlePolish = () => {
    if (isPolishing || !content.trim()) return;
    setIsPolishing(true);
    setTimeout(() => {
      setContent(prev => prev + " [AI polished]");
      setIsPolishing(false);
    }, 1500);
  };

  return (
    <div className="max-w-[680px] mx-auto py-10 flex flex-col">
      <button 
        onClick={onBack}
        className="text-zinc-400 text-sm mb-6 cursor-pointer hover:text-zinc-200 transition-colors flex items-center gap-2 bg-transparent"
      >
        ← Back
      </button>

      <div className="space-y-1">
        <h2 className="text-white text-xl font-semibold">
          {template ? "Customize your template" : "Write your post"}
        </h2>
        <div className="bg-[#1F1F1F] text-orange-400 text-[10px] font-bold rounded-full px-3 py-1 mt-2 inline-block uppercase tracking-widest">
          {platform}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-lg px-4 py-3 flex items-center gap-3 mt-6">
        <Tag size={12} className="text-zinc-400" />
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Using brand info:</span>
        <div className="flex gap-2">
          <span className="text-orange-400 text-[10px] font-bold">{brandInfo.appName}</span>
          <span className="text-zinc-400 text-[10px] truncate max-w-[150px]">{brandInfo.problem}</span>
        </div>
        <button className="ml-auto text-orange-500 text-[10px] font-bold hover:underline bg-transparent">
          Edit →
        </button>
      </div>

      <div className="relative mt-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          placeholder="Start writing your post..."
          className="w-full bg-[#111111] border border-[#1F1F1F] rounded-xl px-4 py-4 text-sm text-white min-h-[192px] resize-none focus:border-zinc-600 outline-none transition-all"
        />
        <button
          onClick={handlePolish}
          disabled={isPolishing || !content.trim()}
          className="absolute bottom-3 right-3 bg-[#1F1F1F] border border-[#1F1F1F] rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:border-zinc-600 transition-all disabled:opacity-50"
        >
          {isPolishing ? (
            <Loader2 size={14} className="text-orange-500 animate-spin" />
          ) : (
            <Sparkles size={14} className="text-orange-500" />
          )}
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Polish with AI</span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-1">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Anything specific to add? (optional)</label>
          <input
            type="text"
            placeholder="e.g. mention our new pricing, keep it under 300 chars..."
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            className="w-full bg-[#111111] border border-[#1F1F1F] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Tone</label>
          <div className="grid grid-cols-2 gap-2">
            {['Authentic Founder', 'Educational', 'Punchy / Bold', 'Conversational'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTone(t)}
                className={cn(
                  "py-2 text-sm font-medium rounded-lg border transition-all",
                  selectedTone === t 
                    ? "border-orange-500 text-orange-400 bg-orange-500/5" 
                    : "bg-[#111111] border-[#1F1F1F] text-zinc-400 hover:border-zinc-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onPostGenerated({
          postContent: content,
          tone: selectedTone,
          specification,
          platform,
          templateName: template?.name
        })}
        disabled={!content.trim()}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg h-11 w-full mt-8 transition-all flex items-center justify-center gap-2"
      >
        ✦ Generate Post
      </button>
    </div>
  );
}