"use client";

import React from 'react';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  MessageSquare, 
  Award 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TemplateDetailCard({ template, onSelect }) {
  if (!template) return null;

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="p-6 sm:p-8 border-b border-[#1F1F1F] bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Proven Format</span>
          </div>
          <button
            onClick={onSelect}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Use This Template
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">{template.name}</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">{template.description}</p>
      </div>

      {/* Metadata Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#1F1F1F] bg-[#161616]/30">
        {/* Left Column Metadata */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Purpose</span>
            <p className="text-zinc-300 text-sm font-medium">{template.purpose}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Best For</span>
            <div className="flex flex-wrap gap-1.5">
              {template.bestFor.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Expected Outcome</span>
            <div className="flex flex-wrap gap-1.5">
              {template.expectedOutcome.map((outcome) => (
                <span key={outcome} className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Metadata */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Works Best In</span>
            <div className="flex flex-wrap gap-1.5">
              {template.worksBestIn.map((sub) => (
                <span key={sub} className="px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Difficulty</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  template.difficulty === 'Easy' ? "text-green-400" :
                  template.difficulty === 'Medium' ? "text-yellow-400" : "text-red-400"
                )}>
                  {template.difficulty}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">{template.difficultyExplanation}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Promotion Risk</span>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  template.promotionRisk === 'Low' ? "text-green-400" :
                  template.promotionRisk === 'Medium' ? "text-yellow-400" : "text-red-400"
                )}>
                  {template.promotionRisk}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">{template.promotionRiskExplanation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generation Formula */}
      <div className="p-6 sm:p-8 border-b border-[#1F1F1F] bg-[#111111]">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">AI Generation Formula</span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {template.formula.map((stepName, idx) => (
            <React.Fragment key={idx}>
              <div className="px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 text-xs font-bold">
                {stepName}
              </div>
              {idx < template.formula.length - 1 && (
                <span className="text-zinc-600 font-bold">↓</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Post Structure Section */}
      <div className="p-6 sm:p-8 space-y-6 border-b border-[#1F1F1F]">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Post Structure</span>
        <div className="space-y-6">
          {template.structure.map((section, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-orange-500/20 hover:border-orange-500/50 transition-colors py-1">
              <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-orange-500" />
              <h4 className="text-sm font-bold text-white mb-1">{section.name}</h4>
              <p className="text-zinc-400 text-xs mb-3 leading-relaxed">{section.description}</p>
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4 font-mono text-xs text-zinc-300 leading-relaxed">
                {section.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Works Section */}
      <div className="p-6 sm:p-8 space-y-4 border-b border-[#1F1F1F] bg-[#161616]/20">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Why This Works</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed font-medium">{template.whyItWorks}</p>
      </div>

      {/* Real Example & Action Footer */}
      <div className="p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 bg-[#111111]">
        {template.realExampleUrl ? (
          <a 
            href={template.realExampleUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Real Example
          </a>
        ) : (
          <div />
        )}
        <button
          onClick={onSelect}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          Use This Template
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}