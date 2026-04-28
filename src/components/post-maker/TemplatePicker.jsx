"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

export default function TemplatePicker({ platform, brandInfo, onSelectTemplate, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templatesByPlatform = {
    Reddit: [
      {
        id: 1,
        name: "The Implementation Asset",
        format: `How we [achieved result] by [doing specific thing] — free template inside\n\nMost people [common wrong approach].\n\nWe tried that. It didn't work.\n\nHere's the exact process that did:\n\n1. [Step with specific detail]\n2. [Step with specific detail]\n3. [Step with specific detail]\n\nThe result: [specific metric or outcome]\n\nTemplate in comments if anyone wants it.`,
        whyItWorks: "Posts that earn saves outperform posts that earn upvotes. Offering a template or checklist triggers saves and drives compounding traffic.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Honest Experiment",
        format: `We tested [X] vs [Y] for [time period]. Here are the actual numbers.\n\n[X] results:\n— [metric]: [number]\n— [metric]: [number]\n\n[Y] results:\n— [metric]: [number]\n— [metric]: [number]\n\nWhat surprised us: [unexpected finding]\n\nWhat we're doing now: [your conclusion]\n\nHappy to answer questions about the setup.`,
        whyItWorks: "Reddit rewards specificity. Real numbers + transparent methodology = trust. This format gets pulled into AI summaries and Google results.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Founder Lesson",
        format: `What I wish I knew before [milestone or decision]\n\n[Short context — 2 lines max]\n\nHere's what actually happened:\n\n[Honest story with a turning point]\n\nThe 3 things I'd do differently:\n\n1. [Specific lesson]\n2. [Specific lesson]\n3. [Specific lesson]\n\nStill figuring out [honest admission]. Anyone else been here?`,
        whyItWorks: "Vulnerability + specificity = comments. Ending with a genuine question triggers replies which boost Reddit distribution.",
        traction: "High"
      },
      {
        id: 4,
        name: "The Tool Comparison",
        format: `[Your app] vs [Competitor] — honest breakdown from someone who built one of them\n\n[Competitor] is great for: [genuine strength]\n\nWhere it falls short: [honest gap]\n\nWhat we built [Your app] to solve: [specific problem]\n\nWhere [Your app] is NOT the right choice: [honest admission]\n\nAsk me anything — I'll give you a straight answer.`,
        whyItWorks: "Including competitor strengths builds massive trust. Reddit users are allergic to bias — admitting your weaknesses makes your strengths credible.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Ask HN Format (Adapted for Reddit)",
        format: `Trying to understand how [your target audience] handle [problem you solve] — would love your input\n\nBuilding something for [audience] and want to make sure I'm solving the right problem.\n\nCurrently our users tell us: [pain point in their words]\n\nHow do you currently handle [problem]?\n\nWhat's the most frustrating part about it?\n\n(Happy to share what we've learned so far if helpful)`,
        whyItWorks: "Question-first posts get 3x more comments. Market research framing removes defensiveness. The soft mention at the end is optional and feels earned.",
        traction: "Medium"
      }
    ],

    X: [
      {
        id: 1,
        name: "The Tactical One-Liner + Proof",
        format: `[Specific result] by doing [specific thing].\n\nMost people do [common wrong approach].\n\nHere's the exact difference:\n\n[Concrete explanation in 2-3 lines]\n\nThe number that proved it: [metric]\n\nSave this.`,
        whyItWorks: "The best X format for SaaS founders is the tactical one-liner. Specific + credible + immediately useful. Under 280 chars if possible for max distribution.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Thread Hook",
        format: `[Bold claim or surprising result] 🧵\n\nHere's the exact playbook:\n\n1/ [First insight — self-contained, readable alone]\n\n2/ [Second insight — builds on first]\n\n3/ [Third insight — the pivot or twist]\n\n4/ [Fourth insight — the practical takeaway]\n\n5/ The lesson that changed everything:\n\n[Conclusion + soft CTA]\n\nRT if this was useful.`,
        whyItWorks: "Threads get 3x more engagement than single posts. Wednesday is the highest engagement day. Each tweet must stand alone — no filler transitions.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Hot Take",
        format: `Unpopular opinion: [conventional wisdom] is wrong.\n\n[Why in one sentence]\n\nWhat actually works:\n\n[Your contrarian take with 2-3 lines of reasoning]\n\nThe proof: [specific result or example]\n\nAgree or disagree?`,
        whyItWorks: "X rewards conversation starters not broadcasters. Posts that generate replies get exponentially more reach. Tension + invitation to disagree = reply bait.",
        traction: "High"
      },
      {
        id: 4,
        name: "The Milestone + Lesson",
        format: `[Milestone] today.\n\nTook [time]. Here's what finally worked:\n\n→ [Lesson 1]\n→ [Lesson 2]\n→ [Lesson 3]\n\nWhat I'd skip if starting over:\n\n→ [Honest mistake]\n\n[App name] is live if you're dealing with [problem]. Link in bio.`,
        whyItWorks: "Milestone posts from personal accounts get 3-5x more engagement than company accounts. Real numbers + what didn't work = authenticity signal.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Data Insight",
        format: `We analyzed [number] [things].\n\nThe result nobody expected:\n\n[Surprising finding]\n\nThe breakdown:\n\n[Data point 1]\n[Data point 2]\n[Data point 3]\n\nWhat this means for [your audience]:\n\n[Practical implication]\n\nFull breakdown → [link]`,
        whyItWorks: "Numbers add instant credibility. Data posts get bookmarked heavily — bookmarks are one of the strongest X algorithm signals in 2026.",
        traction: "Medium"
      }
    ],

    Threads: [
      {
        id: 1,
        name: "The Relatable Moment",
        format: `[Specific frustrating moment your audience has had]\n\nYou know the one.\n\n[One more line of relatability]\n\nWe built [app name] because we were tired of it too.\n\n[What changed — one sentence]`,
        whyItWorks: "Threads rewards short conversational posts under 150 chars per post. Relatability drives reshares. No hashtag spam — topic tags only at the end.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Honest Take",
        format: `Hot take: [your opinion on something in your niche]\n\n[Two lines expanding why]\n\n[What you do instead]\n\nChange my mind.`,
        whyItWorks: "Threads' algorithm weights meaningful replies heavily. 'Change my mind' ending is proven to trigger comment chains. Keep it under 300 chars total.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Mini Story",
        format: `[Specific moment — told like a story opening]\n\n[What happened next]\n\n[The turn]\n\n[What you learned or built because of it]\n\nStill think about this a lot.`,
        whyItWorks: "Threads is a storytelling platform at heart. Short personal stories with a clear arc outperform advice posts. No CTA needed — authenticity is the CTA.",
        traction: "High"
      },
      {
        id: 4,
        name: "The Question That Starts A Thread",
        format: `Genuine question for [your audience]:\n\n[Question about a real problem in your niche]\n\nAsking because [honest reason — building something, curious, had this happen]\n\nWhat's your experience been?`,
        whyItWorks: "Threads algorithm surfaces posts with early reply velocity. A genuine question from a founder gets replies fast. Don't mention your app — just listen.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Before / After",
        format: `Before [app name]:\n[Painful status quo — one line]\n\nAfter [app name]:\n[The improvement — one line]\n\n[Specific result if you have one]\n\nStill can't believe this wasn't easier before.`,
        whyItWorks: "Before/after is the simplest high-converting format on Threads. Concise contrast + specific result. Ends on an emotion not a pitch.",
        traction: "Medium"
      }
    ],

    LinkedIn: [
      {
        id: 1,
        name: "The Founder Vulnerability Post",
        format: `I [made a mistake / had a failure / almost gave up].\n\nHere's what happened:\n\n[Honest 3-4 line story with real context]\n\nWhat I learned:\n\n1. [Lesson with depth]\n2. [Lesson with depth]\n3. [Lesson with depth]\n\nIf you're building [thing], [honest advice].\n\nWhat's the hardest lesson you've learned building something?`,
        whyItWorks: "LinkedIn comments are weighted 15x more than likes by the algorithm. Vulnerability + question at end = comment magnet. First-person stories outperform company posts 8x.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Contrarian Hook",
        format: `[Common belief in your industry] is wrong.\n\nI said it.\n\nHere's the evidence:\n\n[Data point or story that challenges it]\n\nWhat actually works in 2026:\n\n[Your take — specific and defensible]\n\nThe founders I've seen win are doing [this] instead.\n\nAgree? I'd love to hear where I'm wrong.`,
        whyItWorks: "LinkedIn's algorithm rewards posts that challenge conventional wisdom. First 2 lines determine everything — hooks under 200 chars drive 'See more' clicks.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Numbers Post",
        format: `[Specific metric] in [time period].\n\nHere's the breakdown nobody asked for:\n\n[Number] → [what it means]\n[Number] → [what it means]\n[Number] → [what it means]\n\nThe one thing that moved the needle most:\n\n[Single honest answer]\n\nBuilding [app name] for [audience]. Happy to share more if useful.`,
        whyItWorks: "Statistics hooks grab attention faster than any other format on LinkedIn. Specific numbers + transparency = trust. Works especially well for founders building in public.",
        traction: "High"
      },
      {
        id: 4,
        name: "The Soft Showcase",
        format: `[Customer / user] came to us with [specific problem].\n\nThe situation:\n[2-3 lines of honest context about what they were struggling with]\n\nWhat we did:\n[How your app helped — lead with their result not your features]\n\nThe outcome:\n[Specific metric or qualitative result in their words]\n\nIf you're dealing with [problem], happy to show you how we approached it.`,
        whyItWorks: "Show don't sell. LinkedIn audiences are tuned to pitches — leading with customer problem and result removes defensiveness. Generates 'How did you do that?' comments.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Prediction Post",
        format: `By [timeframe], [bold specific prediction about your industry].\n\nHere's why I believe this:\n\n[Signal 1 you're seeing]\n[Signal 2 you're seeing]\n[Signal 3 you're seeing]\n\nThe founders who will win are already doing [this].\n\nThe ones who will struggle are still betting on [old approach].\n\nWhat are you seeing from your vantage point?`,
        whyItWorks: "Prediction posts generate rich comment threads because people want to agree or disagree. Bold specificity beats vague observations every time.",
        traction: "Medium"
      }
    ],

    "Indie Hackers": [
      {
        id: 1,
        name: "The Revenue Milestone Post",
        format: `[App name] just hit [specific MRR/revenue figure]\n\nHere's the honest breakdown:\n\nWhat worked:\n— [Specific channel or tactic with numbers]\n— [Specific channel or tactic with numbers]\n\nWhat didn't work:\n— [Honest failure]\n— [Honest failure]\n\nThe thing I wish I'd done earlier:\n[Single honest answer]\n\nHappy to go deep on any of this — ask me anything.`,
        whyItWorks: "Revenue posts with specific numbers get 30-50+ comments vs near-zero for vague updates. Indie Hackers rewards radical transparency — include failures or it reads as a brag.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Post-Mortem",
        format: `I tried [strategy/approach] for [time period]. It failed. Here's everything I learned.\n\nThe plan: [what you tried to do]\n\nWhat actually happened: [honest account with numbers]\n\nWhy it failed:\n1. [Root cause]\n2. [Root cause]\n\nWhat I'm doing instead now: [current approach]\n\nWould love to hear if anyone else hit this wall.`,
        whyItWorks: "Post-mortems with failure transparency outperform pure success stories on IH. The community values this content type above almost everything else.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Build In Public Update",
        format: `[App name] — [month] update\n\n[Key metric this month] vs [last month]\n\nWhat changed:\n→ [Specific thing that moved]\n→ [Specific thing that moved]\n\nBiggest challenge right now:\n[Honest current problem]\n\nWhat I'm focused on next:\n[Next milestone or experiment]\n\nAnyone else working on [related problem]?`,
        whyItWorks: "IH front page is dominated by build-in-public series. Monthly updates build an audience over time. Consistency compounds — one post doesn't work, a series does.",
        traction: "High"
      },
      {
        id: 4,
        name: "The Tactical Deep Dive",
        format: `How I [achieved specific result] without [expensive/hard thing]\n\nContext: [What you were trying to do, 2 lines]\n\nThe exact process:\n\n1. [Step with enough detail to replicate]\n2. [Step with enough detail to replicate]\n3. [Step with enough detail to replicate]\n\nThe result: [specific outcome]\n\nThe part that surprised me: [unexpected finding]\n\nCode/template/checklist in comments.`,
        whyItWorks: "IH users are technical and love replicable tactics. 'Without [expensive thing]' resonates with bootstrappers. Offering resources in comments drives engagement.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Founder Ask",
        format: `Building [app name] for [audience]. Hit a wall and need your brain.\n\nThe problem I'm trying to solve:\n[Specific challenge — honest, not vague]\n\nWhat I've tried:\n— [Attempt 1 + result]\n— [Attempt 2 + result]\n\nWhat I'm considering next:\n[Your current thinking]\n\nHas anyone navigated this? What would you do?`,
        whyItWorks: "IH community responds generously to genuine asks for help. Showing what you've tried demonstrates effort and gets better advice. Generates high-quality comments.",
        traction: "Medium"
      }
    ],

    "Product Hunt": [
      {
        id: 1,
        name: "The Launch Day Post",
        format: `🚀 [App name] is live on Product Hunt today.\n\n[App name] helps [specific audience] [do specific thing] — without [painful status quo].\n\nWe built this because [honest founder reason in 1-2 lines].\n\nWhat makes it different:\n→ [Differentiator 1]\n→ [Differentiator 2]\n→ [Differentiator 3]\n\nWould genuinely love your feedback — especially if this is a problem you've faced.\n\n👉 [Product Hunt link]`,
        whyItWorks: "PH launch posts need a clear tagline in the first line, a genuine founder story, and a direct ask. Ends with 'feedback' not 'upvotes' — less pushy, more engaging.",
        traction: "High"
      },
      {
        id: 2,
        name: "The Why We Built This",
        format: `We almost didn't build [app name].\n\n[Honest story of the problem you experienced personally — 3-4 lines]\n\nWe looked for a solution. The options were:\n— [Option 1 and why it wasn't right]\n— [Option 2 and why it wasn't right]\n\nSo we built our own.\n\n[App name] is [one sentence description].\n\nLaunching on Product Hunt today. We'd love to know if you've hit this wall too.`,
        whyItWorks: "PH community responds to founder authenticity. Personal origin stories with a real problem drive comments like 'this happened to me too' which boosts algorithm visibility.",
        traction: "High"
      },
      {
        id: 3,
        name: "The Before / After Launch",
        format: `Before [app name]:\n[Status quo for your user — specific and painful]\n\nAfter [app name]:\n[The new reality — specific and measurable]\n\nWe've been in beta for [time period].\n\nHere's what early users are saying:\n"[Real or representative quote]"\n"[Real or representative quote]"\n\nLive on Product Hunt now. Honest feedback welcome.`,
        whyItWorks: "Before/after is the clearest format for communicating value on PH. Real beta user quotes add social proof. 'Honest feedback welcome' disarms defensiveness.",
        traction: "High"
      },
      {
        id: 4,
        name: "The What We Learned Post",
        format: `We launched [app name] [time] ago. Here's what happened.\n\n[Key metric]: [result]\n[Key metric]: [result]\n\nWhat surprised us:\n[Honest unexpected finding]\n\nWhat we got wrong:\n[Honest mistake — be specific]\n\nWhat we're building next based on feedback:\n[Roadmap item that came from community]\n\nBack on PH today with [new feature/version]. Would love your thoughts.`,
        whyItWorks: "Post-launch transparency posts perform well on PH. Shows you listen to feedback. Returning with improvements is one of the highest-converting PH strategies.",
        traction: "Medium"
      },
      {
        id: 5,
        name: "The Problem First Post",
        format: `[Specific problem stated as a question or fact]\n\nIf you've ever [experienced this], you know how frustrating it is.\n\n[One more line of problem depth]\n\nWe spent [time] building [app name] to fix this for [specific audience].\n\nHow it works:\n1. [Step]\n2. [Step]\n3. [Result]\n\nLive today. What questions do you have?`,
        whyItWorks: "Leading with the problem before the solution is the highest-converting PH format. 'What questions do you have?' drives comments which are PH's primary engagement signal.",
        traction: "Medium"
      }
    ]
  };

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setTemplates(templatesByPlatform[platform] || [])
    }, 1500)
  }, [platform])

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