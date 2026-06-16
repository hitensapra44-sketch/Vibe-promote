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
  Calendar
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
  { id: 'ph', name: 'Product Hunt', desc: 'Make your launch land.', icon: Zap, color: '#da552f', available: true },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional + personal mix.', icon: Layout, color: '#0077b5', available: true },
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
  const { user } = useAuth();
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

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#F97316] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-[720px] mx-auto w-full">
          
          {step === 'platform' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Weekly Plan Section */}
              {!planLoading && (
                <div className="mb-8">
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
                    <div className="p-6 rounded-xl border border-[#1F1F1F] bg-[#111111] space-y-4">
                      <div className="flex items-center justify-between">
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
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] uppercase">
                                  {todayEntry.platform}
                                </span>
                                {todayEntry.subreddit && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                                    {todayEntry.subreddit}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-white">{todayEntry.format_name}</h4>
                              <p className="text-sm text-[#A1A1AA] leading-relaxed">{todayEntry.angle}</p>
                              {todayEntry.hook && (
                                <p className="text-xs text-[#A1A1AA] italic bg-white/5 p-3 rounded-lg border border-[#1F1F1F]">
                                  Hook idea: "{todayEntry.hook}"
                                </p>
                              )}
                              <button
                                onClick={() => {
                                  const matchedPlatform = platforms.find(p => p.id === (todayEntry.platform === 'twitter' ? 'twitter' : todayEntry.platform === 'reddit' ? 'reddit' : todayEntry.platform));
                                  setSelectedPlatform(matchedPlatform || platforms[0]);
                                  setSelectedFormat({
                                    id: 'plan',
                                    name: todayEntry.format_name,
                                    desc: todayEntry.angle,
                                    traction: 'High',
                                    engagement: 80,
                                    why: todayEntry.expected_outcome
                                  });
                                  setContext(todayEntry.hook || '');
                                  generatePost();
                                }}
                                className="w-full py-2.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" /> Generate This Post
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <p className="text-sm text-[#A1A1AA]">No post scheduled today — check your full week plan</p>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-12">
                <h1 className="text-2xl font-semibold text-white">Post Maker</h1>
                <p className="text-[#A1A1AA] text-sm">Where are you posting today?</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    disabled={p.comingSoon}
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      "relative p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3",
                      p.comingSoon ? "opacity-40 cursor-not-allowed bg-[#111111] border-[#1F1F1F]" : 
                      selectedPlatform?.id === p.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                    )}
                  >
                    {p.comingSoon && (
                      <span className="absolute top-2 right-2 bg-[#1F1F1F] text-[#52525B] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Coming Soon</span>
                    )}
                    <p.icon className={cn("w-6 h-6", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-white")} />
                    <div>
                      <p className={cn("text-sm font-bold", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-white")}>{p.name}</p>
                      <p className="text-[#A1A1AA] text-[10px] mt-1">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPlatform && (
                <button
                  onClick={() => setStep('format')}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue with {selectedPlatform.name} →
                </button>
              )}
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div>
                <h2 className="text-2xl font-bold text-white">Your Weekly Plan</h2>
                <p className="text-[#A1A1AA] text-sm mt-1">{weeklyPlan.week_overview}</p>
              </div>

              <div className="space-y-4">
                {weeklyPlan.days?.map((dayEntry, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-6 rounded-xl border border-[#1F1F1F] bg-[#111111] space-y-4",
                      !dayEntry.active && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{dayEntry.day}</h3>
                      {dayEntry.active ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] uppercase">
                            {dayEntry.platform}
                          </span>
                          {dayEntry.subreddit && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                              {dayEntry.subreddit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#A1A1AA]">No post scheduled</span>
                      )}
                    </div>

                    {dayEntry.active && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white">{dayEntry.format_name}</h4>
                        <p className="text-xs text-[#A1A1AA] leading-relaxed">{dayEntry.angle}</p>
                        {dayEntry.hook && (
                          <p className="text-xs text-[#A1A1AA] italic bg-white/5 p-3 rounded-lg border border-[#1F1F1F]">
                            Hook idea: "{dayEntry.hook}"
                          </p>
                        )}
                        <button
                          onClick={() => {
                            const matchedPlatform = platforms.find(p => p.id === (dayEntry.platform === 'twitter' ? 'twitter' : dayEntry.platform === 'reddit' ? 'reddit' : dayEntry.platform));
                            setSelectedPlatform(matchedPlatform || platforms[0]);
                            setSelectedFormat({
                              id: 'plan',
                              name: dayEntry.format_name,
                              desc: dayEntry.angle,
                              traction: 'High',
                              engagement: 80,
                              why: dayEntry.expected_outcome
                            });
                            setContext(dayEntry.hook || '');
                            generatePost();
                          }}
                          className="w-full py-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generate This Post
                        </button>
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