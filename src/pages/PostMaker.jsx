"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2,
  CalendarClock,
  Sparkles,
  MessageSquare,
  Twitter,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PLATFORM_LABELS = {
  x: 'X',
  threads: 'Threads',
  reddit: 'Reddit',
};

const GOALS = [
  "Get comments",
  "Get signups", 
  "Get feedback",
  "Build authority",
  "Tell story",
];

function formatScheduledTime(dateStr) {
  const date = new Date(dateStr);
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return timeStr;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function PostMaker() {
  const { user, plan } = useAuth();
  const queryClient = useQueryClient();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  
  const [selectedChannel, setSelectedChannel] = useState('reddit');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetPlatform, setSheetPlatform] = useState('reddit');
  const [sheetGoal, setSheetGoal] = useState(null);
  const [sheetContent, setSheetContent] = useState('');
  const [sheetSubreddit, setSheetSubreddit] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);

  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

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
        const { data: planData } = await supabase.functions.invoke('generate-content-plan', {
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

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['post-maker-posts', user?.id, selectedChannel],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', selectedChannel)
        .order('scheduled_at', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newPost) => {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([newPost])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-maker-posts', user?.id, selectedChannel] });
      toast.success('Draft saved');
    },
  });

  const handleGenerateDraft = async () => {
    if (!sheetContent.trim()) return;
    
    setGeneratingDraft(true);
    try {
      const systemPrompt = `You are a viral content strategist for ${PLATFORM_LABELS[sheetPlatform]}. 
      Goal: ${sheetGoal}. 
      Context: ${sheetContent}.
      
      Brand Brain: ${JSON.stringify(brain)}
      
      Return ONLY a valid JSON object:
      {
        "title": "...",
        "body": "..."
      }`;

      const result = await generateAICall(systemPrompt, "Generate the post now.", null, 'post');
      const parsed = JSON.parse(result);
      const content = sheetPlatform === 'reddit' ? `${parsed.title}\n\n${parsed.body}` : parsed.body || '';

      await createMutation.mutateAsync({
        user_id: user.id,
        content,
        platform: sheetPlatform,
        subreddit: sheetPlatform === 'reddit' ? sheetSubreddit : null,
        scheduled_at: new Date().toISOString(),
        status: 'draft',
      });

      setIsSheetOpen(false);
      setSheetContent('');
      setSheetGoal(null);
      setSheetSubreddit('');
      supabase.rpc('increment_posts_generated', { user_uuid: user.id });
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate post.");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Scheduled' },
      published: { className: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Published' },
      failed: { className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Failed' },
      draft: { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Draft' },
    };
    const v = variants[status] || variants.draft;
    return <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', v.className)}>{v.label}</span>;
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'threads':
        return <span className="text-xs font-bold">@</span>;
      case 'reddit':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const todayString = useMemo(() => getTodayString(), []);

  const queuePosts = useMemo(() => {
    return posts.filter(p => p.status === 'scheduled' || p.status === 'draft');
  }, [posts]);

  const draftPosts = useMemo(() => {
    return posts.filter(p => p.status === 'draft');
  }, [posts]);

  const publishedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'published');
  }, [posts]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#F97316] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="text-sm font-bold text-white">Post Maker</h1>
          <Button
            size="sm"
            className="h-8 gap-2 text-[11px] font-bold bg-[#F97316] hover:bg-[#EA6C0A] text-white"
            onClick={() => setIsSheetOpen(true)}
          >
            + New Post
          </Button>
        </header>

        <div className="flex flex-col lg:flex-row min-h-0">
          <aside className="w-full lg:w-[220px] lg:border-r lg:border-[#1F1F1F] lg:min-h-screen lg:sticky lg:top-14 p-4 lg:p-6">
            <h2 className="text-xs font-bold text-[#52525B] uppercase tracking-wider mb-3 lg:mb-4">Channels</h2>
            <nav className="space-y-1">
              {['reddit', 'x', 'threads'].map((channel) => {
                const platform = {
                  reddit: { icon: MessageSquare, name: 'Reddit' },
                  x: { icon: Twitter, name: 'X' },
                  threads: { icon: MessageSquare, name: 'Threads' },
                }[channel];
                const isActive = selectedChannel === channel;
                return (
                  <button
                    key={channel}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold",
                      isActive 
                        ? "border-l-2 border-l-[#F97316] text-white bg-transparent" 
                        : "text-[#A1A1AA] hover:bg-[#1F1F1F]"
                    )}
                  >
                    <platform.icon className="w-5 h-5" />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 p-4 lg:p-6 min-w-0">
            <Tabs defaultValue="queue" className="space-y-4">
              <TabsList className="bg-[#111111] border border-[#1F1F1F] p-1 w-full sm:w-auto">
                <TabsTrigger value="queue" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white flex-1 sm:flex-initial">Queue</TabsTrigger>
                <TabsTrigger value="drafts" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white flex-1 sm:flex-initial">Drafts</TabsTrigger>
                <TabsTrigger value="published" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white flex-1 sm:flex-initial">Published</TabsTrigger>
              </TabsList>

              <TabsContent value="queue" className="mt-0 space-y-6">
                <h3 className="text-sm text-[#52525B]">
                  Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
                {postsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                  </div>
                ) : queuePosts.length === 0 ? (
                  <div className="text-center py-20">
                    <CalendarClock className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                    <p className="text-sm text-[#52525B]">Nothing here yet. Generate your first post.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queuePosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#A1A1AA]">
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{PLATFORM_LABELS[post.platform]}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-[#52525B]">{formatScheduledTime(post.scheduled_at)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
                          {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] font-bold text-[#A1A1AA] hover:text-white px-2"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] font-bold text-[#A1A1AA] hover:text-white px-2"
                            onClick={() => {
                              navigator.clipboard.writeText(post.content);
                              toast.success('Copied!');
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[10px] font-bold bg-[#F97316] hover:bg-[#EA6C0A] text-white"
                          >
                            Generate Post
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts" className="mt-0 space-y-6">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                  </div>
                ) : draftPosts.length === 0 ? (
                  <div className="text-center py-20">
                    <CalendarClock className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                    <p className="text-sm text-[#52525B]">Nothing here yet. Generate your first post.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {draftPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#A1A1AA]">
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white">{PLATFORM_LABELS[post.platform]}</span>
                              <p className="text-[10px] text-[#52525B] mt-0.5">
                                Created {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
                          {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] font-bold text-[#A1A1AA] hover:text-white px-2"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] font-bold text-[#A1A1AA] hover:text-white px-2"
                            onClick={() => {
                              navigator.clipboard.writeText(post.content);
                              toast.success('Copied!');
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[10px] font-bold bg-[#F97316] hover:bg-[#EA6C0A] text-white"
                          >
                            Generate Post
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="published" className="mt-0 space-y-6">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                  </div>
                ) : publishedPosts.length === 0 ? (
                  <div className="text-center py-20">
                    <CalendarClock className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                    <p className="text-sm text-[#52525B]">Nothing here yet. Generate your first post.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publishedPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-3 opacity-80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#A1A1AA]">
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white">{PLATFORM_LABELS[post.platform]}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-[#52525B]">{formatScheduledTime(post.scheduled_at)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
                          {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#0A0A0A] border-l border-[#1F1F1F] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-bold text-white">New Post</SheetTitle>
            <SheetDescription className="text-xs text-[#52525B]">
              Create a draft post for your channel.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {['reddit', 'x', 'threads'].map((p) => {
                  const platform = {
                    reddit: { icon: MessageSquare, name: 'Reddit' },
                    x: { icon: Twitter, name: 'X' },
                    threads: { icon: MessageSquare, name: 'Threads' },
                  }[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSheetPlatform(p)}
                      className={cn(
                        'h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2',
                        sheetPlatform === p
                          ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/5'
                          : 'border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B] bg-transparent'
                      )}
                    >
                      <platform.icon className="w-4 h-4" />
                      <span>{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Goal</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSheetGoal(goal)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                      sheetGoal === goal
                        ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/10'
                        : 'border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B]'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Content</Label>
              <Textarea
                value={sheetContent}
                onChange={(e) => setSheetContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px] bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] resize-none"
              />
            </div>

            {sheetPlatform === 'reddit' && (
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Subreddit</Label>
                <Input
                  value={sheetSubreddit}
                  onChange={(e) => setSheetSubreddit(e.target.value)}
                  placeholder="e.g. SaaS"
                  className="bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] h-10"
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleGenerateDraft}
                disabled={generatingDraft || !sheetContent.trim()}
                className="w-full h-11 text-xs font-bold bg-[#F97316] hover:bg-[#EA6C0A] text-white"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}