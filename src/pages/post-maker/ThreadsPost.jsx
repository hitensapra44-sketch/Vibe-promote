"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutTemplate, 
  PenLine, 
  Copy, 
  RefreshCw, 
  Check, 
  Loader2,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage, incrementUsage } from '../../lib/useUsage';
import { markTaskComplete } from '../../components/TaskWidget';
import TemplateDetailCard from '../../components/post-maker/TemplateDetailCard';
import { templatesData } from '../../components/post-maker/templatesData';

const selectedPlatform = "Threads";

const postingTips = {
  Threads: "Post on weekday mornings. Keep it short, conversational, and end with an open question to drive replies. Avoid hashtags — use topic tags instead."
};

export default function ThreadsPost() {
  const { user } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [step, setStep] = useState(2);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [format, setFormat] = useState('single'); // 'single' | 'thread'
  const [customContext, setCustomContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("Authentic Founder");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brain, setBrain] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Copy Post");
  const [currentDay, setCurrentDay] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  // AI Decide Flow States
  const [aiGoal, setAiGoal] = useState(null);
  const [aiHappening, setAiHappening] = useState(null);
  const [aiHappeningOther, setAiHappeningOther] = useState('');
  const [aiMention, setAiMention] = useState(null);

  // Editable Generated Post States
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedPosts, setEditedPosts] = useState([]);
  const [editedCta, setEditedCta] = useState('');

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
      if (data) setBrain(data);

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

  const handleBack = () => {
    if (step === 2) {
      navigate('/post-maker');
    } else if (step === 3) {
      setSelectedMode(null);
      setStep(2);
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

    const bodyFormula = format === 'single' ? selectedTemplate?.singleFormula : JSON.stringify(selectedTemplate?.threadFormula);

    const prompt = `
You are a ghostwriter for indie founders. Write conversational Threads posts. Sound like a real person, not a marketer.

BRAND:
${JSON.stringify(brain)}

TASK: Write one complete Threads ${format} using the "${selectedTemplate?.name || 'custom'}" template.

HARD RULES:
- Zero emojis. Zero hashtags.
- No corporate buzzwords.
- No exclamation marks.
- Product name only in the CTA line.
- Write lowercase where it feels natural. Short sentences only.

TEMPLATE SPECS:
- FORMAT: ${format}
- HOOK FORMULA: ${selectedTemplate?.hookFormula || 'Short and relatable'}
- BODY FORMULA: ${bodyFormula || 'Write in brand voice'}
- CTA FORMULA: ${selectedTemplate?.ctaFormula || 'Natural and inviting'}
- TONE: ${selectedTone}
- EXTRA CONTEXT: ${customContext || 'None'}

OUTPUT FORMAT:
Return ONLY valid JSON.
If format is single:
{ "title": "hook line", "body": "post body", "cta": "CTA line", "score": 82, "scoreLabel": "Great Post", "scoreColor": "green" }
If format is thread:
{ "title": "thread hook", "posts": ["post 1", "post 2", ...], "cta": "CTA line", "score": 82, "scoreLabel": "Great Post", "scoreColor": "green" }
`;

    const attemptGeneration = async () => {
      try {
        const result = await generateAICall(prompt, "Generate the content now.", null, 'post');
        return JSON.parse(result.replace(/```json|```/g, '').trim());
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
    } else {
      toast.error("Couldn't generate content. Try again.");
      setIsLoading(false);
      setStep(4);
    }
  };

  const handleCopy = () => {
    let text = `${generatedPost.title}\n\n`;
    if (format === 'single') {
      text += `${generatedPost.body}\n\n`;
    } else {
      text += generatedPost.posts.join('\n\n') + '\n\n';
    }
    text += generatedPost.cta;
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Post"), 2000);
  };

  const resetAll = () => {
    setStep(2);
    setSelectedMode(null);
    setSelectedTemplate(null);
    setFormat('single');
    setCustomContext("");
    setSelectedTone("Authentic Founder");
    setGeneratedPost(null);
    setAiGoal(null);
    setAiHappening(null);
    setAiHappeningOther('');
    setAiMention(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          
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

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-semibold text-foreground mb-8">How do you want to create your Threads post?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedMode("template"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 relative group"
                >
                  <div className="absolute top-4 right-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                  <LayoutTemplate className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-foreground text-lg font-bold">Use a Proven Template</h3>
                  <p className="text-foreground/60 text-sm mt-2">Pick from templates that are working right now on Threads</p>
                </div>
                <div
                  onClick={() => { setSelectedMode("write"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 group"
                >
                  <PenLine className="w-8 h-8 text-foreground/50 group-hover:text-orange-500 mb-4 transition-colors" />
                  <h3 className="text-foreground text-lg font-bold">Write It Yourself + AI Enhance</h3>
                  <p className="text-foreground/60 text-sm mt-2">Write your own draft and let AI improve it for Threads</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {selectedMode === "template" ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground text-center">Pick a template</h1>
                  </div>
                  <div className="space-y-8">
                    {templatesData.Threads.map((t) => (
                      <TemplateDetailCard 
                        key={t.id} 
                        template={t} 
                        onSelect={() => { setSelectedTemplate(t); setStep(4); }} 
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold text-foreground">Write your draft</h1>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="Write your rough draft here..."
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-6 text-sm text-foreground min-h-[250px] focus:outline-none focus:border-orange-500 transition-all"
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

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl">
              <div className="mb-10">
                <h1 className="text-2xl font-semibold text-foreground">Final details</h1>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-foreground text-sm font-medium block">Post Format</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'single', label: 'Single Post' },
                      { id: 'thread', label: 'Thread (Multi-post)' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold border transition-all bg-transparent",
                          format === f.id 
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-zinc-600"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-foreground text-sm font-medium block">Anything specific to add?</label>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm text-foreground min-h-[100px] focus:outline-none focus:border-orange-500"
                    placeholder="Extra context..."
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
                    className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Generate My Post →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">Writing your {format}...</h2>
                <p className="text-foreground/60 text-sm">Matching your brand voice and Threads vibe</p>
              </div>
            </div>
          )}

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

              <div className="bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6 relative">
                <div className="flex justify-between items-center">
                  <span className="bg-foreground/5 text-foreground/60 text-xs font-medium rounded-full px-3 py-1 uppercase tracking-widest">
                    Threads {format}
                  </span>
                  {!isEditingPost && (
                    <button
                      onClick={() => {
                        setEditedTitle(generatedPost.title);
                        if (format === 'single') setEditedBody(generatedPost.body);
                        else setEditedPosts([...generatedPost.posts]);
                        setEditedCta(generatedPost.cta);
                        setIsEditingPost(true);
                      }}
                      className="p-1.5 hover:bg-foreground/5 rounded-md transition-all bg-transparent text-foreground/60 hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditingPost ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Hook / Title</label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    {format === 'single' ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Body</label>
                        <textarea
                          rows={6}
                          value={editedBody}
                          onChange={(e) => setEditedBody(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editedPosts.map((p, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Post {i + 1}</label>
                            <textarea
                              rows={3}
                              value={p}
                              onChange={(e) => {
                                const next = [...editedPosts];
                                next[i] = e.target.value;
                                setEditedPosts(next);
                              }}
                              className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Call to Action</label>
                      <input
                        type="text"
                        value={editedCta}
                        onChange={(e) => setEditedCta(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setIsEditingPost(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 bg-transparent">Cancel</button>
                      <button
                        onClick={() => {
                          setGeneratedPost({
                            ...generatedPost,
                            title: editedTitle,
                            body: editedBody,
                            posts: editedPosts,
                            cta: editedCta
                          });
                          setIsEditingPost(false);
                          toast.success("Updated!");
                        }}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-foreground">{generatedPost.title}</h2>
                    {format === 'single' ? (
                      <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{generatedPost.body}</p>
                    ) : (
                      <div className="space-y-6">
                        {generatedPost.posts?.map((p, idx) => (
                          <div key={idx} className="relative pl-6 border-l border-foreground/10 py-1">
                            <div className="absolute -left-1 top-2.5 w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-bold text-foreground/40 uppercase mb-2 block">{idx + 1}/{generatedPost.posts.length}</span>
                            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{p}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-4 border-t border-foreground/10">
                      <span className="text-foreground/50 text-xs uppercase tracking-wide block mb-1">Call to Action</span>
                      <p className="text-orange-400 text-sm font-medium">{generatedPost.cta}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  {copyStatus === "Copied!" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copyStatus}
                </button>
                <a href="https://threads.net" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-orange-600 transition-all">
                  <ExternalLink className="w-4 h-4" /> Open Threads
                </a>
                <button onClick={generatePost} className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all">
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
                <button onClick={resetAll} className="text-foreground/50 text-xs font-medium hover:text-foreground/80 transition-colors bg-transparent">Start Over</button>
              </div>

              <div className="mt-10 bg-foreground/5 border-l-4 border-orange-500 border border-foreground/10 rounded-xl p-4">
                <p className="text-foreground/60 text-sm leading-relaxed">{postingTips.Threads}</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}