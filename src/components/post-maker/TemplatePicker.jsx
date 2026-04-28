"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

export default function TemplatePicker({ platform, brandInfo, onSelectTemplate, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplates([
        {
          id: 1,
          name: "The Relatable Struggle",
          format: `I was struggling with ${brandInfo.problem}...\n\nTried everything.\n\nThen I built ${brandInfo.appName}.\n\nHere's what changed:`,
          whyItWorks: "People comment because they've been there.",
          traction: "High"
        },
        {
          id: 2,
          name: "Hot Take + Solution",
          format: `Unpopular opinion: [your insight about the problem]\n\nMost people [common wrong approach].\n\nWhat actually works:\n\n[your solution]`,
          whyItWorks: "Controversial hooks drive 3x more replies.",
          traction: "High"
        },
        {
          id: 3,
          name: "What I Learned After [milestone]",
          format: `After [milestone], here's what actually worked:\n\n1. [lesson]\n2. [lesson]\n3. [lesson]\n\n[soft CTA]`,
          whyItWorks: "Authority + story = shares.",
          traction: "Medium"
        }
      ]);
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [brandInfo]);

  return (
    <div className="max-w-[680px] mx-auto py-10 flex flex-col">
      <button 
        onClick={onBack}
        className="text-zinc-400 text-sm mb-6 cursor-pointer hover:text-zinc-200 transition-colors flex items-center gap-2 bg-transparent"
      >
        ← Back
      </button>

      <div className="space-y-1">
        <h2 className="text-white text-xl font-semibold">Templates that work on <span className="text-orange-400">{platform}</span></h2>
        <p className="text-zinc-400 text-sm mt-1">AI generated for your niche. Pick one to use.</p>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 animate-pulse space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={cn(
                "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition-all flex flex-col gap-3",
                selectedTemplate?.id === t.id && "border-orange-500 bg-orange-500/5"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-medium">{t.name}</h3>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                  t.traction === "High" 
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                )}>
                  {t.traction === "High" ? "🔥 High Traction" : "👀 Medium"}
                </span>
              </div>
              
              <div>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Why it works:</span>
                <p className="text-zinc-400 text-xs mt-0.5">{t.whyItWorks}</p>
              </div>

              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-3 mt-1">
                <p className="text-zinc-300 text-[10px] font-mono whitespace-pre-line leading-relaxed">
                  {t.format}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTemplate && (
        <button
          onClick={() => onSelectTemplate(selectedTemplate)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 py-2.5 mt-6 mx-auto block transition-colors"
        >
          Use this template →
        </button>
      )}
    </div>
  );
}