"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Loader2, 
  Zap,
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Twitter,
  Globe,
  Layout,
  Calendar,
  Target,
  Award,
  Compass
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
];

const formats = [
  { 
    id: 'struggle', 
    name: 'The Relatable Struggle', 
    desc: 'I was X, until I did Y', 
    traction: 'High', 
    engagement: 78,
    why: 'People comment because they\'ve been there too'
  },
  { 
    id: 'hot-take', 
    name: 'Hot Take + Proof', 
    desc: 'Unpopular opinion: [your insight]', 
    traction: 'High', 
    engagement: 85,
    why: 'Controversial hooks drive 3x more replies'
  },
  { 
    id: 'learned', 
    name: 'What I Learned After Z', 
    desc: 'After [milestone], here\'s what actually worked', 
    traction: 'Medium', 
    engagement: 62,
    why: 'Authority + story = shares'
  },
];

export default function PostMaker() {
  const { user, plan } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('platform'); // 'platform', 'format', 'output'
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState(null);
  const [tone, setTone] = useState('Authentic Founder');
  const [context, setContext] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [wizardStep, setWizardStep] = useState(0); // 0=goal, 1=comfort, 2=frequency, 3=platforms, 4=subreddits
  const [planAnswers, setPlanAnswers] = useState({ goal: null, comfort_level: null, posting_frequency: null, platforms: [], selected_subreddits: [] });
  const [generatingPlan, setGeneratingPlan] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      
      if (paymentData?.payment_status) {
        setIsPaid(true);
      }

      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setBrain(data);

      try {
        const { data: planData, error: planError } = await supabase.functions.invoke('generate-content-plan', {
          method: 'GET'
        });
        if (planData?.plan_json) {
          setWeeklyPlan(planData.plan_json);
        }
      } catch (err) {
        console.error("Error fetching weekly plan:", err);
      } finally {
        setPlanLoading(false);
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  async function generateWeeklyPlan() {
    setGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        method: 'POST',
        body: planAnswers
      });
      if (error) throw error;
      setWeeklyPlan(data.plan_json);
      setStep('platform');
      toast.success("Your weekly plan is ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate your plan.");
    } finally {
      setGeneratingPlan(false);
    }
  }

  const generatePost = async () => {
    setStep('output');
    setGenerating(true);
    
    const systemPrompt = `You are a viral content strategist for ${selectedPlatform.name}. 
    Format: ${selectedFormat.name}. Tone: ${tone}.
    Context: ${context}.
    
    Brand Brain: ${JSON.stringify(brain)}
    
    Return ONLY a valid JSON object:
    {
      "title": "...",
      "body": "..."
    }`;

    try {
      const result = await generateAICall(systemPrompt, "Generate the post now.", null, 'post');
      const parsed = JSON.parse(result);
      setPost(parsed);
      supabase.rpc('increment_posts_generated', { user_uuid: user.id });
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate post.");
    } finally {
      setGenerating(false);
    }
  };

  const renderContentCard = (dayEntry) => {
    if (!dayEntry || !dayEntry.active) return null;

    const formatDescription = dayEntry.format_description || dayEntry.angle || "A custom format tailored to your audience.";
    const goalText = dayEntry.goal || "Build trust and drive organic engagement.";
    const outcomeTypes = dayEntry.outcome_types || [dayEntry.expected_outcome || 'Engagement'];
    const whyThisPost = dayEntry.why_this_post || "This post is scheduled to build consistent momentum and trust with your audience.";
    const whyThisFormat = dayEntry.why_this_format || "This format is chosen because it encourages authentic discussion and avoids promotional filters.";
    
    let whyThisPlatform = dayEntry.why_this_platform;
    if (!whyThisPlatform) {
      if (dayEntry.platform === 'reddit') {
        whyThisPlatform = `r/${dayEntry.subreddit || 'SaaS'} responds well to founder experiences and lessons learned.`;
      } else if (dayEntry.platform === 'twitter') {
        whyThisPlatform = "X performs well for short founder insights and contrarian observations.";
      } else if (dayEntry.platform === 'threads') {
        whyThisPlatform = "Threads rewards relatable founder experiences and conversation starters.";
      } else {
        whyThisPlatform = `${dayEntry.platform} is a great channel to reach builders and founders organically.`;
      }
    }

    return (
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Day</span>
          <p className="text-lg font-bold text-white">{dayEntry.day}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Post Title</span>
          <p className="text-base font-bold text-orange-500">{dayEntry.format_name}</p>
          <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{formatDescription}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Goal</span>
          <p className="text-zinc-300 text-sm leading-relaxed">{goalText}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Outcome Type</span>
          <div className="flex flex-wrap gap-2">
            {outcomeTypes.map((type, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                {type}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Why This Post</span>
          <p className="text-zinc-300 text-sm leading-relaxed">{whyThisPost}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Why This Format</span>
          <p className="text-zinc-300 text-sm leading-relaxed">{whyThisFormat}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Why This Platform</span>
          <p className="text-zinc-300 text-sm leading-relaxed">{whyThisPlatform}</p>
        </div>

        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Platform</span>
          <p className="text-sm font-bold text-white capitalize">{dayEntry.platform === 'twitter' ? 'X' : dayEntry.platform}</p>
          {dayEntry.subreddit && (
            <p className="text-xs text-zinc-400 mt-1">Subreddit: <span className="text-orange-400 font-semibold">{dayEntry.subreddit}</span></p>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              if (dayEntry.platform === 'reddit') {
                navigate('/post-maker/reddit', { state: { planEntry: dayEntry } });
              } else if (dayEntry.platform === 'twitter') {
                navigate('/post-maker/x');
              } else if (dayEntry.platform === 'ih') {
                navigate('/post-maker/indiehackers');
              } else if (dayEntry.platform === 'threads') {
                navigate('/post-maker/threads');
              }
            }}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Generate Post
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#F97316] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-[720px] mx-auto w-full">
          
          {step === 'platform' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Weekly Plan Section */}
              {!planLoading && (
                <div className="space-y-6">
                  {weeklyPlan === null ? (
                    <button
                      onClick={() => setStep('weeklyPlanQuestions')}
                      className="w-full p-6 rounded-xl border border-[#1F1F1F] bg-[#111111] hover:border-[#F97316]/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#F97316] transition-colors">Get Your Weekly Content Plan</h3>
                          <p className="text-[#A1A1AA] text-xs mt-1">Tell us your goals, get 7 days of content ideas — done.</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#A1A1AA] group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" />
                    </button>
                  ) : (
                    <div className="space-y-6">
                      {/* Weekly Strategy Section */}
                      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-xl font-bold text-white">This Week's Strategy</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs block mb-1">Goal</span>
                          {weeklyPlan.week_overview || "Build consistent momentum and trust with your target audience."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#F97316]" />
                          <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Today's Post Plan</span>
                        </div>
                        <button
                          onClick={() => setStep('weeklyPlanFull')}
                          className="text-xs font-bold text-[#F97316] hover:underline bg-transparent"
                        >
                          View Full Week →
                        </button>
                      </div>

                      {(() => {
                        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                        const todayEntry = weeklyPlan.days?.find(d => d.day === todayName);
                        if (todayEntry && todayEntry.active) {
                          return renderContentCard(todayEntry);
                        } else {
                          return (
                            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center">
                              <p className="text-sm text-[#A1A1AA]">No post scheduled today — check your full week plan</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 border-t border-[#1F1F1F]">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold text-white">Post Maker</h1>
                  <p className="text-[#A1A1AA] text-sm">Where are you posting today?</p>
                </div>

                {/* Larger platform boxes in a 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      disabled={p.comingSoon}
                      onClick={() => {
                        if (p.id === 'reddit') {
                          navigate('/post-maker/reddit');
                        } else if (p.id === 'twitter') {
                          navigate('/post-maker/x');
                        } else if (p.id === 'threads') {
                          navigate('/post-maker/threads');
                        } else if (p.id === 'ih') {
                          navigate('/post-maker/indiehackers');
                        }
                      }}
                      className={cn(
                        "relative p-8 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-4 min-h-[160px]",
                        p.comingSoon ? "opacity-40 cursor-not-allowed bg-[#111111] border-[#1F1F1F]" : 
                        "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                      )}
                    >
                      <p.icon className="w-8 h-8 text-white" />
                      <div>
                        <p className="text-base font-bold text-white">{p.name}</p>
                        <p className="text-[#A1A1AA] text-xs mt-1.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'weeklyPlanQuestions' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
              {wizardStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white">What's your main goal right now?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Get first users",
                      "Get more signups",
                      "Get product feedback",
                      "Validate my idea",
                      "Build authority",
                      "Grow an audience"
                    ].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => {
                          setPlanAnswers({ ...planAnswers, goal });
                          setWizardStep(1);
                        }}
                        className="p-5 rounded-xl border border-[#1F1F1F] bg-[#111111] hover:border-[#F97316]/50 text-left text-sm font-bold text-white transition-all"
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setWizardStep(0)}
                    className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-xl font-bold text-white">How comfortable are you sharing your journey publicly?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Very comfortable",
                      "Somewhat comfortable",
                      "Prefer educational content",
                      "Prefer product-focused content"
                    ].map((comfort) => (
                      <button
                        key={comfort}
                        onClick={() => {
                          setPlanAnswers({ ...planAnswers, comfort_level: comfort });
                          setWizardStep(2);
                        }}
                        className="p-5 rounded-xl border border-[#1F1F1F] bg-[#111111] hover:border-[#F97316]/50 text-left text-sm font-bold text-white transition-all"
                      >
                        {comfort}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-xl font-bold text-white">How much can you realistically post?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Daily",
                      "3-5 times per week",
                      "1-2 times per week"
                    ].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => {
                          setPlanAnswers({ ...planAnswers, posting_frequency: freq });
                          setWizardStep(3);
                        }}
                        className="p-5 rounded-xl border border-[#1F1F1F] bg-[#111111] hover:border-[#F97316]/50 text-left text-sm font-bold text-white transition-all"
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-xl font-bold text-white">Which platforms?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((p) => {
                      const isSelected = planAnswers.platforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            const nextPlatforms = isSelected
                              ? planAnswers.platforms.filter(id => id !== p.id)
                              : [...planAnswers.platforms, p.id];
                            setPlanAnswers({ ...planAnswers, platforms: nextPlatforms });
                          }}
                          className={cn(
                            "p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3 bg-transparent",
                            isSelected ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                          )}
                        >
                          <p.icon className={cn("w-6 h-6", isSelected ? "text-[#F97316]" : "text-white")} />
                          <p className={cn("text-sm font-bold", isSelected ? "text-[#F97316]" : "text-white")}>{p.name}</p>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      if (planAnswers.platforms.includes('reddit')) {
                        setWizardStep(4);
                      } else {
                        generateWeeklyPlan();
                      }
                    }}
                    disabled={planAnswers.platforms.length === 0 || generatingPlan}
                    className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next →"}
                  </button>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-xl font-bold text-white">Which subreddits?</h2>
                  {(() => {
                    let communities = [];
                    if (brain?.audience_communities) {
                      try {
                        communities = JSON.parse(brain.audience_communities);
                      } catch (e) {
                        if (typeof brain.audience_communities === 'string') {
                          communities = brain.audience_communities.split(',').map(c => c.trim()).filter(Boolean);
                        }
                      }
                    }
                    if (!Array.isArray(communities)) {
                      communities = [];
                    }
                    return (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {communities.map((sub) => {
                            const isSelected = planAnswers.selected_subreddits.includes(sub);
                            return (
                              <button
                                key={sub}
                                onClick={() => {
                                  const nextSubs = isSelected
                                    ? planAnswers.selected_subreddits.filter(s => s !== sub)
                                    : [...planAnswers.selected_subreddits, sub];
                                  setPlanAnswers({ ...planAnswers, selected_subreddits: nextSubs });
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-full text-xs font-bold border transition-all bg-transparent",
                                  isSelected ? "bg-[#F97316]/10 border-[#F97316] text-[#F97316]" : "border-[#1F1F1F] text-[#A1A1AA] hover:border-white/20"
                                )}
                              >
                                r/{sub}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={generateWeeklyPlan}
                          disabled={generatingPlan}
                          className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {generatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate My Plan"}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {step === 'weeklyPlanFull' && weeklyPlan && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <button
                onClick={() => setStep('platform')}
                className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              {/* Weekly Strategy Section */}
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 sm:p-8 space-y-3">
                <h2 className="text-xl font-bold text-white">This Week's Strategy</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs block mb-1">Goal</span>
                  {weeklyPlan.week_overview || "Build consistent momentum and trust with your target audience."}
                </p>
              </div>

              <div className="space-y-6">
                {weeklyPlan.days?.map((dayEntry, idx) => (
                  <div key={idx} className={cn(!dayEntry.active && "opacity-40")}>
                    {dayEntry.active ? (
                      renderContentCard(dayEntry)
                    ) : (
                      <div className="bg-[#111111]/50 border border-[#1F1F1F]/50 rounded-2xl p-6 flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-500">{dayEntry.day}</span>
                        <span className="text-xs text-zinc-600 font-medium">No post scheduled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'format' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep('platform')} className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-white">What's working on {selectedPlatform.name} right now</h2>
                <p className="text-[#A1A1AA] text-sm">Formats getting traction in your niche</p>
              </div>

              <div className="space-y-4 mb-12">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f)}
                    className={cn(
                      "w-full p-5 rounded-xl border text-left transition-all flex flex-col lg:flex-row justify-between gap-6",
                      selectedFormat?.id === f.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-white">{f.name}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                          f.traction === 'High' ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : "bg-[#1F1F1F] text-[#A1A1AA] border-[#1F1F1F]"
                        )}>
                          {f.traction === 'High' ? '🔥 High Traction' : '👀 Medium'}
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] text-sm mb-4">{f.why}</p>
                      
                      {/* Skeleton Preview */}
                      <div className="bg-[#1A1A1A] rounded-lg p-4 space-y-2 border border-[#1F1F1F]">
                        <div className="h-2 bg-[#1F1F1F] rounded w-3/4" />
                        <div className="h-2 bg-[#1F1F1F] rounded w-full" />
                        <div className="h-2 bg-[#1F1F1F] rounded w-1/2" />
                      </div>
                    </div>
                    
                    <div className="lg:w-32 flex flex-col justify-center">
                      <p className="text-[10px] text-[#52525B] font-bold uppercase tracking-widest mb-2">Engagement</p>
                      <div className="w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#F97316]" style={{ width: `${f.engagement}%` }} />
                      </div>
                      <p className="text-xs font-bold text-white">{f.engagement}%</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedFormat && (
                <button
                  onClick={generatePost}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Generate My Post →
                </button>
              )}
            </div>
          )}

          {step === 'output' && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Left Column - Controls */}
              <div className="lg:w-[280px] space-y-8">
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4">
                  <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-3">Brand Context</p>
                  <p className="text-white text-xs font-bold truncate">{brain?.app_name}</p>
                  <p className="text-[#A1A1AA] text-[10px] mt-1 line-clamp-2">{brain?.core_problem}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Authentic Founder', 'Educational', 'Punchy / Bold', 'Conversational'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "py-2.5 text-[10px] font-bold rounded-lg border transition-all",
                          tone === t ? "border-[#F97316] text-[#F97316] bg-[#F97316]/5" : "border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Anything to highlight?</label>
                  <input
                    type="text"
                    placeholder="e.g. 'just hit 100 users'..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-[#111111] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F97316]/50 placeholder-[#52525B]"
                  />
                </div>

                <button
                  onClick={generatePost}
                  disabled={generating}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Post
                </button>
              </div>

              {/* Right Column - Output */}
              <div className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                  {generating ? (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
                    >
                      <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-4" />
                      <h3 className="text-lg font-bold">Writing your post...</h3>
                      <p className="text-[#A1A1AA] text-sm">Matching your brand voice and {selectedPlatform.name} vibe.</p>
                    </motion.div>
                  ) : post ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Platform Preview Card */}
                      <div className={cn(
                        "bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden border-l-2",
                        selectedPlatform.id === 'reddit' ? "border-l-[#FF4500]" : 
                        selectedPlatform.id === 'ih' ? "border-l-[#0073b1]" : "border-l-[#da552f]"
                      )}>
                        <div className="p-4 border-b border-[#1F1F1F] flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                            <selectedPlatform.icon className="w-3 h-3 text-[#52525B]" />
                          </div>
                          <span className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">
                            {selectedPlatform.id === 'reddit' ? 'r/SaaS' : selectedPlatform.name} • Posted by u/you
                          </span>
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="text-lg font-bold text-white">{post.title}</h3>
                          <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                        </div>
                        <div className="px-6 py-3 bg-[#1A1A1A] flex items-center gap-4 text-[#52525B] text-[10px] font-bold">
                          <span>▲ 0</span>
                          <span>💬 0 comments</span>
                          <span>🔗 Share</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          <span className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">{post.body.length} chars</span>
                        </div>
                      </div>

                      <div className="bg-[#111111] border border-[#1F1F1F] border-l-2 border-l-[#F97316] p-4 rounded-lg">
                        <p className="text-[#A1A1AA] text-xs leading-relaxed">
                          <span className="text-white font-bold">💡 Tip:</span> Post between 9–11AM EST Tuesday for best reach. Don't add your link in the post — put it in the first comment after posting.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${post.title}\n\n${post.body}`);
                            toast.success("Post copied!");
                          }}
                          className="flex-1 h-11 bg-[#F97316] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" /> Copy Post
                        </button>
                        <button onClick={generatePost} className="flex-1 h-11 border border-[#1F1F1F] text-white font-bold rounded-lg text-xs hover:bg-[#111111]">
                          Regenerate ↺
                        </button>
                        <button onClick={() => setStep('format')} className="flex-1 h-11 border border-[#1F1F1F] text-white font-bold rounded-lg text-xs hover:bg-[#111111]">
                          Try Different Format
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
</dyad-file>

<dyad-write path="src/pages/post-maker/RedditPost.jsx" description="Updating RedditPost to land directly on the Subreddit Selector screen by default.">
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutTemplate, 
  PenLine, 
  Copy, 
  RefreshCw, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  ChevronLeft,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage, incrementUsage } from '../../lib/useUsage';
import { markTaskComplete } from '../../components/TaskWidget';
import TemplateDetailCard from '../../components/post-maker/TemplateDetailCard';
import { templatesData, subredditTemplates } from '../../components/post-maker/templatesData';

const selectedPlatform = "Reddit";

const SUBREDDIT_INTEL = {
  "SaaS": {
    tone: "Founder to founder, transparent, numbers-driven",
    avgLength: "300-700 words",
    downvoted: "Hard selling, vague hype without metrics, generic launch announcements"
  },
  "startups": {
    tone: "Direct, risk-aware, occasionally combative",
    avgLength: "200-500 words",
    downvoted: "Generic motivational posts, vague venting without specifics, self-promotion"
  },
  "SideProject": {
    tone: "Casual, playful, low-ego",
    avgLength: "150-400 words",
    downvoted: "Overly serious self-promotion, no visuals, generic \"check out my app\" posts"
  },
  "WebDev": {
    tone: "Technical, skeptical of hype, blunt",
    avgLength: "200-500 words",
    downvoted: "Marketing-flavored self-promotion, vague AI good/bad takes with no mechanism"
  },
  "Marketing": {
    tone: "Operator-focused, frustrated but constructive",
    avgLength: "150-400 words",
    downvoted: "Abstract \"marketing is changing\" posts with no specific platform or consequence"
  },
  "GrowthHacking": {
    tone: "Tactical, scrappy, numbers-first",
    avgLength: "150-400 words",
    downvoted: "Tool spam, low-trust promotional posts, vague growth-hack buzzwords"
  },
  "SEO": {
    tone: "Data-driven, practitioner-to-practitioner",
    avgLength: "150-400 words",
    downvoted: "Generic \"learn SEO\" questions, stale tactics, claims without proof"
  },
  "Sales": {
    tone: "Confident, numbers-anchored, candid",
    avgLength: "200-500 words",
    downvoted: "Abstract motivation posts with no numbers or lived experience"
  }
};

const postingTips = {
  Reddit: "Post between 9am-12pm EST on weekdays. Add a genuine comment yourself right after posting to start the conversation. Never reply to your own post with a link immediately."
};

export default function RedditPost() {
  const { user } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [step, setStep] = useState(3);
  const [selectedMode, setSelectedMode] = useState("template");
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customContext, setCustomContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("Authentic Founder");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brain, setBrain] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Copy Post");
  const [currentDay, setCurrentDay] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const planEntry = location.state?.planEntry || null;

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      if (paymentData?.payment_status) setIsPaid(true);

      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setBrain(data);
        if (planEntry) {
          setSelectedMode("template");
          const cleanSub = planEntry.subreddit ? planEntry.subreddit.replace(/^r\//i, '').trim() : null;
          setSelectedSubreddit(cleanSub);
          setSelectedTemplate({
            name: planEntry.format_name,
            why: planEntry.expected_outcome || "Matched to your weekly content plan.",
            structure: planEntry.angle
          });
          setCustomContext(planEntry.hook || "");
          setStep(4);
        }
      }

      // Fetch current day
      const { data: tasksData } = await supabase
        .from('user_tasks')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);
      if (tasksData && tasksData[0]) {
        const firstDate = new Date(tasksData[0].created_at);
        firstDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(4, diffDays + 1));
      }
    }
    fetchBrain();
  }, [user]);

  const getSubredditKey = (sub) => {
    if (!sub) return null;
    const clean = sub.replace(/^r\//i, '').trim().toLowerCase();
    const keys = Object.keys(subredditTemplates);
    return keys.find(k => k.toLowerCase() === clean) || null;
  };

  const getTemplatesToDisplay = () => {
    const subKey = selectedSubreddit;
    if (subKey && subredditTemplates[subKey]) {
      return subredditTemplates[subKey];
    }
    return templatesData.Reddit;
  };

  const handleBack = () => {
    if (step === 2) {
      navigate('/post-maker');
    } else if (step === 3) {
      if (selectedSubreddit) {
        setSelectedSubreddit(null);
      } else {
        setSelectedMode(null);
        setStep(2);
      }
    } else if (step === 4) {
      setSelectedTemplate(null);
      setStep(3);
    }
  };

  const generatePost = async () => {
    if (limits.postMaker !== "unlimited" && postsUsed >= limits.postMaker) {
      toast.error(`You've used all ${limits.postMaker} posts this month. Upgrade to get more.`);
      return;
    }
    setIsLoading(true);
    setStep(5);

    const subKey = selectedSubreddit;
    const subredditContextLine = subKey && SUBREDDIT_INTEL[subKey]
      ? `SUBREDDIT CONTEXT: Posting to r/${subKey}. Typical tone: ${SUBREDDIT_INTEL[subKey].tone}. Average length: ${SUBREDDIT_INTEL[subKey].avgLength}. Avoid: ${SUBREDDIT_INTEL[subKey].downvoted}.`
      : '';

    const prompt = `
You are a ghostwriter for indie founders. Write honest, value-first Reddit posts that feel like real experiences, not marketing.

BRAND:
${JSON.stringify(brain)}
${subredditContextLine}

TASK: Write one complete Reddit post using the "${selectedTemplate?.name || 'custom'}" template.

HARD RULES — break any of these and the post fails:
- Zero emojis. Zero hashtags.
- No corporate words (leverage, streamline, optimize, game-changer, revolutionize).
- No exclamation marks unless the story genuinely needs one.
- No em-dashes.
- Write like a frustrated or honest founder sharing a real experience.
- Simple everyday words only. If a word sounds like a LinkedIn post, replace it.
- 90% of the post = pure value, story, or insight. 10% max = product mention.
- The post must never feel like an ad.

HOOK (first paragraph):
Start with ONE of these — no exceptions:
- A specific painful moment with a detail ("I spent 3 hours on a Thursday...")
- A strong contrarian statement that makes people stop scrolling
Never open with: "I've been working on...", "I wanted to share...", "Has anyone else..."

STRUCTURE — follow this order:
1. Hook — pain point or contrarian opener
2. Context — what you built and who it's for (2-3 sentences max)
3. Struggle or insight — be specific, use real numbers or actions
4. Outcome or lesson — what changed or what you learned
5. CTA — a genuine question to the community OR a soft one-liner like "built X to fix this if anyone's curious"

PRODUCT MENTION RULES:
- Optional. If included: appears naturally inside the story, reads like a side note, max 1-2 lines.
- Never a pitch. Never a link unless CTA asks for it.

TEMPLATE: ${selectedTemplate?.structure || 'write a value-first Reddit post that fits the brand'}
TONE: ${selectedTone}
EXTRA CONTEXT: ${customContext || 'None'}

SCORING:
Score out of 100 on: hook strength, value ratio (90/10 rule), platform authenticity, CTA quality, no rule violations (emoji/hashtag = -30, feels like ad = -25), completeness.
scoreLabel: 75-100 = "Great Post", 50-74 = "Decent Post", 0-49 = "Needs Work"
scoreColor: "green" / "yellow" / "red"

Return ONLY valid JSON, no markdown, no backticks:
{
  "title": "hook line",
  "body": "full post body",
  "cta": "the call to action — one line, natural, no hype",
  "score": 82,
  "scoreLabel": "Great Post",
  "scoreColor": "green"
}
`;

    const attemptGeneration = async () => {
      try {
        const result = await generateAICall(prompt, "Generate the post now.", null, 'post');
        return JSON.parse(result);
      } catch (e) {
        return null;
      }
    };

    let parsed = await attemptGeneration();
    if (!parsed) parsed = await attemptGeneration();

    if (parsed) {
      setGeneratedPost(parsed);
      setIsLoading(false);
      setStep(6);
      await incrementUsage(supabase, user.id, 'post_maker');
      markTaskComplete(user.id, `reddit_post_d${currentDay}`, supabase);
    } else {
      toast.error("Couldn't generate post. Try again.");
      setIsLoading(false);
      setStep(4);
    }
  };

  const handleCopy = () => {
    const text = `${generatedPost.title}\n\n${generatedPost.body}\n\n${generatedPost.cta}`;
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Post"), 2000);
  };

  const resetAll = () => {
    setStep(3);
    setSelectedMode("template");
    setSelectedSubreddit(null);
    setSelectedTemplate(null);
    setCustomContext("");
    setSelectedTone("Authentic Founder");
    setGeneratedPost(null);
  };

  const templatesToDisplay = getTemplatesToDisplay();

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Progress Bar & Back Navigation */}
          {step >= 2 && step <= 4 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8">
                  <button 
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-foreground transition-all bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-foreground/50 text-xs font-medium">Step {step} of 4</span>
                <div className="w-8 h-8" />
              </div>
              <div className="w-full bg-foreground/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Mode Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-semibold text-foreground mb-8">How do you want to create your Reddit post?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedMode("template"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 relative group"
                >
                  <div className="absolute top-4 right-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                  <LayoutTemplate className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-foreground text-lg font-bold">Use a Proven Template</h3>
                  <p className="text-foreground/60 text-sm mt-2">Pick from templates that are working right now on Reddit</p>
                </div>
                <div
                  onClick={() => { setSelectedMode("write"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 group"
                >
                  <PenLine className="w-8 h-8 text-foreground/50 group-hover:text-orange-500 mb-4 transition-colors" />
                  <h3 className="text-foreground text-lg font-bold">Write It Yourself + AI Enhance</h3>
                  <p className="text-foreground/60 text-sm mt-2">Write your own draft and let AI improve it for Reddit</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Template or Write */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {selectedMode === "template" ? (
                <>
                  {!selectedSubreddit ? (
                    /* Subreddit Selection List */
                    <div className="space-y-6">
                      <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-foreground">Select a Subreddit</h1>
                        <p className="text-foreground/60 text-sm">Choose a community to see proven formats tailored for it</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(SUBREDDIT_INTEL).map((sub) => (
                          <div
                            key={sub}
                            onClick={() => setSelectedSubreddit(sub)}
                            className="p-6 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 cursor-pointer transition-all flex items-center gap-4"
                          >
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-foreground text-sm font-bold">r/{sub}</h3>
                              <p className="text-foreground/60 text-xs mt-1">View proven formats</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Formats for Selected Subreddit */
                    <>
                      <div className="mb-8">
                        <button
                          onClick={() => setSelectedSubreddit(null)}
                          className="text-foreground/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 bg-transparent"
                        >
                          ← Back to subreddits
                        </button>
                        <h1 className="text-2xl font-semibold text-foreground">
                          Best formats for r/{selectedSubreddit}
                        </h1>
                        <p className="text-foreground/60 text-sm">
                          AI generated for your niche. Pick one to use.
                        </p>
                      </div>
                      <div className="space-y-8">
                        {templatesToDisplay.map((t) => (
                          <TemplateDetailCard 
                            key={t.id} 
                            template={t} 
                            onSelect={() => { setSelectedTemplate(t); setStep(4); }} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold text-foreground">Write your draft</h1>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="Write your rough draft here — AI will improve it for Reddit"
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-6 text-sm text-foreground min-h-[250px] focus:outline-none focus:border-orange-500 transition-all placeholder-zinc-600"
                  />
                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Customization */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl">
              <div className="mb-10">
                <h1 className="text-2xl font-semibold text-foreground">Make it yours</h1>
                <p className="text-foreground/60 text-sm">Both fields are optional — skip if you're happy</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-foreground text-sm font-medium block">Anything specific to add?</label>
                  <p className="text-foreground/50 text-xs">e.g. just hit 100 users, launching next week, got featured somewhere</p>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm text-foreground min-h-[100px] focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="Add extra context here..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-foreground text-sm font-medium block">Writing tone</label>
                  <div className="flex flex-wrap gap-3">
                    {["Authentic Founder", "Bold & Punchy", "Educational", "Conversational"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold border transition-all",
                          selectedTone === t 
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-zinc-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={generatePost}
                    className="flex-1 py-4 border border-foreground/10 text-foreground/60 font-bold rounded-xl hover:bg-white/5 transition-all bg-transparent"
                  >
                    Skip, just generate
                  </button>
                  <button
                    onClick={generatePost}
                    className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Generate My Post →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Loading Screen */}
          {step === 5 && (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">Crafting your post...</h2>
                <p className="text-foreground/60 text-sm">Using your brand info and the {selectedTemplate?.name || 'custom'} template</p>
              </div>
              <div className="w-64 bg-foreground/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  animate={{ width: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Result Screen */}
          {step === 6 && generatedPost && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border",
                  generatedPost.scoreColor === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  generatedPost.scoreColor === "yellow" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {generatedPost.scoreLabel}
                </div>
                <span className="text-foreground/60 text-sm">Score: <span className="text-foreground">{generatedPost.score}/100</span></span>
              </div>

              <div className="bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6">
                <div className="flex">
                  <span className="bg-foreground/5 text-foreground/60 text-xs font-medium rounded-full px-3 py-1">
                    Reddit
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">{generatedPost.title}</h2>
                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{generatedPost.body}</p>
                <div className="pt-4 border-t border-foreground/10">
                  <span className="text-foreground/50 text-xs uppercase tracking-wide block mb-1">Call to Action</span>
                  <p className="text-orange-400 text-sm font-medium">{generatedPost.cta}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  {copyStatus === "Copied!" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copyStatus}
                </button>
                <a 
                  href="https://www.reddit.com/submit/?type=TEXT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-orange-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Reddit
                </a>
                <button 
                  onClick={generatePost}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <button 
                  onClick={() => { setSelectedTemplate(null); setStep(3); }}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Try Different Template
                </button>
                <button 
                  onClick={resetAll}
                  className="text-foreground/50 text-xs font-medium hover:text-foreground/80 transition-colors bg-transparent"
                >
                  Start Over
                </button>
              </div>

              <div className="mt-10 bg-foreground/5 border-l-4 border-orange-500 border border-foreground/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-500 text-xs font-medium">💡 Posting tip</span>
                </div>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {postingTips.Reddit}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}