import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  CalendarClock,
  Calendar,
  Loader2,
  Copy,
  AlertCircle,
  Sparkles,
  MoreHorizontal,
  Twitter,
  MessageSquare,
  Hash,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  Plus,
  Pencil,
  RefreshCw,
  Minus,
  TrendingUp,
  Unlink,
  Link2,
  AtSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { generateAICall } from '@/lib/ai';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CHAR_LIMITS = {
  x: 280,
  threads: 500,
  reddit: Infinity,
};

const PLATFORM_LABELS = {
  x: 'X',
  threads: 'Threads',
  reddit: 'Reddit',
};

const AI_RECOMMENDED_TIMES = {
  x: { hour: 9, minute: 0 },
  threads: { hour: 10, minute: 0 },
  reddit: { hour: 11, minute: 0 },
};

const GOALS = [
  "Get comments",
  "Get signups", 
  "Get feedback",
  "Build authority",
  "Tell story",
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'published':
      return <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase border border-green-100">Published</span>;
    case 'scheduled':
      return <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase border border-orange-100">Scheduled</span>;
    case 'failed':
      return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100">Failed</span>;
    default:
      return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase border border-slate-200">Draft</span>;
  }
};

function getAIRecommendedTime(platform) {
  const now = new Date();
  const time = AI_RECOMMENDED_TIMES[platform] || { hour: 9, minute: 0 };
  const recommended = new Date(now);
  recommended.setHours(time.hour, time.minute, 0, 0);
  if (recommended < now) {
    recommended.setDate(recommended.getDate() + 1);
  }
  return recommended;
}

function formatRecommendedTime(hour, minute) {
  if (hour === undefined || minute === undefined) return '';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
}

function formatScheduledTime(dateStr) {
  const date = new Date(dateStr);
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return timeStr;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function AutoPoster() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('today');
  const [activeChannel, setActiveChannel] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formContent, setFormContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['x']);

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const [formSubreddit, setFormSubreddit] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formRemindEmail, setFormRemindEmail] = useState(false);
  const [formRemindAt, setFormRemindAt] = useState('');
  const [scheduleMode, setScheduleMode] = useState('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [improvingPostId, setImprovingPostId] = useState(null);

  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [sheetGoal, setSheetGoal] = useState(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [brain, setBrain] = useState(null);
  const [generatingPlaceholder, setGeneratingPlaceholder] = useState(null);

  useEffect(() => {
    async function fetchPlanAndPayment() {
      if (!user) return;
      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('plan, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (paymentData?.plan && paymentData.plan !== 'free') {
          setIsPaid(true);
        }

        const { data: planData } = await supabase.functions.invoke('generate-content-plan', {
          method: 'GET'
        });
        if (planData?.plan_json) {
          setWeeklyPlan(planData.plan_json);
        }

        const { data: brainData } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (brainData) {
          setBrain(brainData);
        }
      } catch (err) {
        console.error("Error fetching weekly plan or payment:", err);
      } finally {
        setPlanLoading(false);
      }
    }
    fetchPlanAndPayment();
  }, [user]);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('social_post_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bufferAccounts = [] } = useQuery({
    queryKey: ['buffer-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .not('buffer_access_token', 'is', null)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newPost) => {
      const { data, error } = await supabase
        .from('social_post_queue')
        .insert([newPost])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('social_post_queue')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('social_post_queue')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', user?.id] });
      toast.success('Post deleted');
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ post_id, platform, content, scheduled_at, subreddit }) => {
      const { data, error } = await supabase.functions.invoke('schedule-post', {
        body: JSON.stringify({ post_id, platform, content, scheduled_at, subreddit }),
      });
      if (error) throw error;
      return data;
    },
  });

  const improveMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');

      const prompt = `Rewrite this post to ${action}. Return only the rewritten post, nothing else. Post: ${post.content}`;

      const { data, error } = await supabase.functions.invoke('ai-service', {
        body: {
          feature: 'post',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Rewrite the post now.' }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
      });

      if (error) throw error;
      if (!data?.choices?.[0]?.message?.content) throw new Error('Invalid AI response');

      const rewritten = data.choices[0].message.content;

      const { error: updateError } = await supabase
        .from('social_post_queue')
        .update({ content: rewritten })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      return rewritten;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', user?.id] });
    },
  });

  const handleConnectBuffer = async () => {
    try {
      const clientId = import.meta.env.VITE_BUFFER_CLIENT_ID;
      if (!clientId) {
        toast.error('Buffer OAuth is not configured');
        return;
      }

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = crypto.randomUUID();

      sessionStorage.setItem('buffer_code_verifier', codeVerifier);
      sessionStorage.setItem('buffer_oauth_state', state);

      const redirectUri = `${window.location.origin}/oauth/buffer/callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'posts:write posts:read account:read offline_access',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'consent',
      });

      window.location.href = `https://auth.buffer.com/auth?${params.toString()}`;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to connect Buffer account');
    }
  };

  function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  const handleDisconnectBuffer = async (accountId) => {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to disconnect account');
      return;
    }

    toast.success('Account disconnected');
    queryClient.invalidateQueries({ queryKey: ['buffer-accounts', user?.id] });
  };

  const todayString = useMemo(() => getTodayString(), []);

  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      days.push({ date: dateKey, dayName, dateObj: d });
    }
    return days;
  }, []);

  const upcomingWeekPosts = useMemo(() => {
    const activeChannels = activeChannel === 'all' ? ['reddit', 'x', 'threads'] : [activeChannel];
    
    return weekDays.map((day) => {
      const dayPosts = posts.filter(p => {
        const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
        return postDate === day.date && p.status !== 'published';
      });
      
      const slots = activeChannels.map(platform => {
        const existingPost = dayPosts.find(p => p.platform === platform);
        return {
          platform,
          post: existingPost || null,
          isPlaceholder: !existingPost,
        };
      });
      
      return { ...day, slots };
    });
  }, [posts, weekDays, activeChannel]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    
    if (activeChannel !== 'all') {
      result = result.filter(p => p.platform === activeChannel);
    }
    
    switch (activeTab) {
      case 'today':
        return result.filter(p => {
          const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
          return postDate === todayString;
        });
      case 'drafts':
        return result.filter(p => p.status === 'draft');
      case 'published':
        return result.filter(p => p.status === 'published');
      default:
        return [];
    }
  }, [posts, activeTab, activeChannel, todayString]);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'threads':
        return <AtSign className="w-4 h-4" />;
      case 'reddit':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const channels = [
    { id: 'all', label: 'All Channels', icon: <Hash className="w-4 h-4" /> },
    { id: 'x', label: 'X (Twitter)', icon: <Twitter className="w-4 h-4" /> },
    { id: 'threads', label: 'Threads', icon: <AtSign className="w-4 h-4" /> },
    { id: 'reddit', label: 'Reddit', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const resetForm = useCallback(() => {
    setFormContent('');
    setSelectedPlatforms(['x']);
    setFormSubreddit('');
    setFormScheduledAt('');
    setFormRemindEmail(false);
    setFormRemindAt('');
    setScheduleMode('ai');
    setEditingPost(null);
    setIsSubmitting(false);
    setSheetGoal(null);
  }, []);

  const openNewSheet = useCallback(() => {
    resetForm();
    setIsSheetOpen(true);
  }, [resetForm]);

  const openEditSheet = useCallback((post) => {
    setEditingPost(post);
    setFormContent(post.content);
    setSelectedPlatforms([post.platform]);
    setFormSubreddit(post.subreddit || '');
    setFormScheduledAt(new Date(post.scheduled_at).toISOString().slice(0, 16));
    setFormRemindEmail(post.remind_email || false);
    setFormRemindAt(post.remind_at ? new Date(post.remind_at).toISOString().slice(0, 16) : '');
    setScheduleMode('custom');
    setIsSheetOpen(true);
  }, []);

  const openScheduleNowSheet = useCallback((post) => {
    setEditingPost(post);
    setFormContent(post.content);
    setSelectedPlatforms([post.platform]);
    setFormSubreddit('');
    setFormScheduledAt('');
    setFormRemindEmail(post.remind_email || false);
    setFormRemindAt(post.remind_at ? new Date(post.remind_at).toISOString().slice(0, 16) : '');
    setScheduleMode('ai');
    setIsSheetOpen(true);
  }, []);

  useEffect(() => {
    if (selectedPlatforms.length > 0 && !formScheduledAt && scheduleMode === 'ai') {
      const aiTime = getAIRecommendedTime(selectedPlatforms[0]);
      setFormScheduledAt(aiTime.toISOString().slice(0, 16));
    }
  }, [selectedPlatforms, scheduleMode, formScheduledAt]);

  const handleGenerateDraft = async () => {
    if (!formContent.trim()) return;
    
    setGeneratingDraft(true);
    try {
      const systemPrompt = `You are a viral content strategist for ${PLATFORM_LABELS[selectedPlatforms[0]]}. 
      Goal: ${sheetGoal || 'Get signups'}. 
      Context: ${formContent}.
      
      Brand Brain: ${JSON.stringify(brain)}
      
      Return ONLY a valid JSON object:
      {
        "title": "...",
        "body": "..."
      }`;

      const result = await generateAICall(systemPrompt, "Generate the post now.", null, 'post');
      const parsed = JSON.parse(result);
      const content = selectedPlatforms[0] === 'reddit' ? `${parsed.title}\n\n${parsed.body}` : parsed.body || '';

      await createMutation.mutateAsync({
        user_id: user.id,
        content,
        platform: selectedPlatforms[0],
        subreddit: selectedPlatforms[0] === 'reddit' ? formSubreddit : null,
        scheduled_at: new Date().toISOString(),
        status: 'draft',
      });

      setIsSheetOpen(false);
      resetForm();
      toast.success('Draft saved');
      refetch();
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate post.");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleScheduleNow = async (e) => {
    e.preventDefault();
    if (!formContent.trim()) {
      toast.error('Please enter some content');
      return;
    }
    if (!formScheduledAt) {
      toast.error('Please select a time');
      return;
    }
    if (selectedPlatforms.includes('reddit') && !formSubreddit.trim()) {
      toast.error('Please enter a subreddit');
      return;
    }

    setIsSubmitting(true);

    const scheduledAtISO = new Date(formScheduledAt).toISOString();

    try {
      if (editingPost) {
        const updated = await updateMutation.mutateAsync({
          id: editingPost.id,
          updates: {
            content: formContent,
            platform: editingPost.platform,
            subreddit: editingPost.platform === 'reddit' ? formSubreddit : null,
            scheduled_at: scheduledAtISO,
            status: 'draft',
            remind_email: editingPost.platform === 'reddit' ? formRemindEmail : false,
            remind_at: editingPost.platform === 'reddit' && formRemindEmail && formRemindAt ? new Date(formRemindAt).toISOString() : null,
          },
        });

        const result = await scheduleMutation.mutateAsync({
          post_id: updated.id,
          platform: editingPost.platform,
          content: formContent,
          scheduled_at: scheduledAtISO,
          subreddit: editingPost.platform === 'reddit' ? formSubreddit : undefined,
        });

        if (!result.success) {
          toast.error(result.error || `Failed to schedule post for ${PLATFORM_LABELS[editingPost.platform]}`);
        }
      } else {
        for (const platform of selectedPlatforms) {
          const created = await createMutation.mutateAsync({
            user_id: user.id,
            content: formContent,
            platform: platform,
            subreddit: platform === 'reddit' ? formSubreddit : null,
            scheduled_at: scheduledAtISO,
            status: 'draft',
            remind_email: platform === 'reddit' ? formRemindEmail : false,
            remind_at: platform === 'reddit' && formRemindEmail && formRemindAt ? new Date(formRemindAt).toISOString() : null,
          });

          const result = await scheduleMutation.mutateAsync({
            post_id: created.id,
            platform: platform,
            content: formContent,
            scheduled_at: scheduledAtISO,
            subreddit: platform === 'reddit' ? formSubreddit : undefined,
          });

          if (!result.success) {
            toast.error(result.error || `Failed to schedule post for ${PLATFORM_LABELS[platform]}`);
          }
        }
      }

      toast.success('Post scheduled');
      setIsSheetOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      console.error('Schedule error:', err);
      toast.error('Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleRetry = async (post) => {
    const scheduledAtISO = new Date(post.scheduled_at).toISOString();
    try {
      const result = await scheduleMutation.mutateAsync({
        post_id: post.id,
        platform: post.platform,
        content: post.content,
        scheduled_at: scheduledAtISO,
        subreddit: post.subreddit || undefined,
      });

      if (result.success) {
        toast.success('Post rescheduled');
        refetch();
      } else {
        toast.error(result.error || 'Failed to retry');
      }
    } catch (err) {
      toast.error('Failed to retry');
    }
  };

  const handleImprove = async (postId, action) => {
    setImprovingPostId(postId);
    setOpenMenuId(null);
    try {
      const rewritten = await improveMutation.mutateAsync({ id: postId, action });
      toast.success('Post improved');
    } catch (err) {
      toast.error('Failed to improve post');
    } finally {
      setImprovingPostId(null);
    }
  };

  const handleCopy = async (content) => {
    await navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const handleGeneratePlaceholder = async (platform, dayDate) => {
    if (!brain) {
      toast.error('Brand Brain not loaded yet. Please refresh.');
      return;
    }

    const placeholderKey = `${platform}-${dayDate}`;
    setGeneratingPlaceholder(placeholderKey);
    try {
      const platformName = PLATFORM_LABELS[platform];
      const dateObj = new Date(dayDate);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

      const systemPrompt = `You are a viral content strategist for ${platformName}. 
      Posting on: ${dayName}.
      
      Brand Brain: ${JSON.stringify(brain)}
      
      Return ONLY a valid JSON object:
      {
        "title": "...",
        "body": "..."
      }`;

      const result = await generateAICall(systemPrompt, "Generate the post now.", null, 'post');
      const parsed = JSON.parse(result);
      const content = platform === 'reddit' ? `${parsed.title}\n\n${parsed.body}` : parsed.body || '';

      const time = AI_RECOMMENDED_TIMES[platform] || AI_RECOMMENDED_TIMES.x;
      const scheduledAt = new Date(dayDate);
      scheduledAt.setHours(time.hour, time.minute, 0, 0);

      setEditingPost(null);
      setFormContent(content);
      setSelectedPlatforms([platform]);
      setFormSubreddit('');
      setFormScheduledAt(scheduledAt.toISOString().slice(0, 16));
      setFormRemindEmail(false);
      setFormRemindAt('');
      setScheduleMode('custom');
      setIsSheetOpen(true);
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate post.");
    } finally {
      setGeneratingPlaceholder(null);
    }
  };

  const renderPostCard = (post, isFailed = false) => {
    const isReddit = post.platform === 'reddit';
    const isImproving = improvingPostId === post.id;
    const canEditDelete = post.status !== 'published';

    return (
      <motion.div
        layout
        key={post.id}
        className={cn(
          'rounded-2xl border bg-white p-5 space-y-4 transition-all border-slate-200 shadow-sm hover:shadow-md'
        )}
      >
        {isFailed && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider">{post.error_message || 'Failed to schedule'}</p>
            </div>
          </div>
        )}

        {isReddit && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100">
            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <p className="text-xs text-orange-600 font-bold leading-relaxed">
                Reddit requires manual posting. Copy your content and post to r/{post.subreddit || 'SaaS'}.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-black uppercase tracking-widest border-orange-200 text-orange-600 hover:bg-orange-100 px-3 bg-white rounded-lg"
                  onClick={() => handleCopy(post.content)}
                >
                  <Copy className="w-3 h-3 mr-1.5" />
                  Copy Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-black uppercase tracking-widest border-orange-200 text-orange-600 hover:bg-orange-100 px-3 bg-white rounded-lg"
                  onClick={() => window.open(`https://reddit.com/r/${post.subreddit || ''}/submit`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Go to Subreddit
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
              {getPlatformIcon(post.platform)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{PLATFORM_LABELS[post.platform]}</span>
                {post.subreddit && <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-widest">r/{post.subreddit}</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatScheduledTime(post.scheduled_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(post.status)}
            {canEditDelete && (
              <DropdownMenu open={openMenuId === post.id} onOpenChange={(open) => setOpenMenuId(open ? post.id : null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 rounded-xl shadow-xl p-1">
                  <DropdownMenuItem onClick={() => { openEditSheet(post); setOpenMenuId(null); }} className="text-[11px] font-black uppercase tracking-wider h-9 px-3 rounded-lg cursor-pointer">
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => handleImprove(post.id, 'be more engaging and viral')} className="text-[11px] font-black uppercase tracking-wider h-9 px-3 rounded-lg cursor-pointer text-orange-600">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    AI Optimize
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => { setDeleteConfirmId(post.id); setOpenMenuId(null); }} className="text-red-500 focus:text-red-500 focus:bg-red-50 text-[11px] font-black uppercase tracking-wider h-9 px-3 rounded-lg cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
            {isImproving ? (
              <span className="flex items-center gap-2 text-orange-600 font-bold">
                <Loader2 className="w-3 h-3 animate-spin" />
                Optimizing for virality...
              </span>
            ) : (
              post.content
            )}
          </p>
        </div>

        {isFailed && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-4"
              onClick={() => handleRetry(post)}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Retry Now
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
             <CalendarClock className="w-5 h-5 text-orange-500" />
             <h1 className="text-sm font-black uppercase tracking-widest text-slate-500">Auto Poster</h1>
          </div>
          <Button 
            size="sm" 
            className="h-9 gap-2 text-[11px] font-black uppercase tracking-widest bg-orange-500 text-white hover:bg-orange-600 transition-all rounded-xl shadow-lg shadow-orange-500/20 px-6" 
            onClick={openNewSheet}
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Post
          </Button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
            <div className="px-6 pt-8 pb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platforms</p>
            </div>
            <nav className="flex flex-col gap-1 px-3 pb-6">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all w-full text-left bg-transparent border-none cursor-pointer group',
                    activeChannel === ch.id
                      ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-500 pl-[14px]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span className={cn('w-4 h-4 flex items-center justify-center flex-shrink-0 transition-colors', activeChannel === ch.id ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600')}>
                    {ch.icon}
                  </span>
                  {ch.label}
                  {ch.id !== 'all' && (
                    <span className="ml-auto text-[10px] font-black opacity-50 bg-slate-100 px-1.5 py-0.5 rounded">
                      {posts.filter(p => p.platform === ch.id).length}
                    </span>
                  )}
                </button>
              ))}

              {bufferAccounts.length > 0 && (
                <>
                  <div className="px-4 pt-6 pb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Connected</p>
                  </div>
                  {bufferAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full group',
                        activeChannel === account.platform
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      <button
                        onClick={() => setActiveChannel(account.platform)}
                        className="flex items-center gap-2.5 flex-1 text-left bg-transparent border-none p-0 cursor-pointer font-black"
                      >
                        <span className={cn('w-3.5 h-3.5 flex items-center justify-center flex-shrink-0', activeChannel === account.platform ? 'text-orange-500' : 'text-slate-400')}>
                          {getPlatformIcon(account.platform)}
                        </span>
                        <span className="truncate max-w-[100px]">{account.buffer_channel_name}</span>
                      </button>
                      <button
                        onClick={() => handleDisconnectBuffer(account.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white text-slate-400 hover:text-red-500 transition-all bg-transparent border-none cursor-pointer"
                        title="Disconnect"
                      >
                        <Unlink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </nav>

            <div className="mt-auto p-4 border-t border-slate-100">
              <button
                onClick={handleConnectBuffer}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all bg-transparent cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                Link Accounts
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="p-8 sm:p-12 max-w-4xl mx-auto w-full pb-32">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Schedule for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h3>
                  <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl h-11">
                    <TabsTrigger value="today" className="text-[11px] font-black uppercase tracking-wider px-6 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">Today</TabsTrigger>
                    <TabsTrigger value="upcoming" className="text-[11px] font-black uppercase tracking-wider px-6 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">Calendar</TabsTrigger>
                    <TabsTrigger value="drafts" className="text-[11px] font-black uppercase tracking-wider px-6 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">Drafts</TabsTrigger>
                    <TabsTrigger value="published" className="text-[11px] font-black uppercase tracking-wider px-6 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">History</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="today" className="mt-0 space-y-6 animate-in fade-in duration-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[32px] shadow-sm">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                        <CalendarClock className="w-8 h-8 text-slate-200" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900">Your queue is empty</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto font-medium">Get ahead of the curve. Schedule your posts for today now.</p>
                      <Button className="mt-8 rounded-xl bg-orange-500 text-white font-black uppercase tracking-widest text-[11px] h-11 px-8 shadow-lg shadow-orange-500/20" onClick={openNewSheet}>Start Scheduling</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredPosts.map((post) => renderPostCard(post, post.status === 'failed'))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="drafts" className="mt-0 space-y-6 animate-in fade-in duration-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[32px] shadow-sm">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No drafts yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          layout
                          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                                {getPlatformIcon(post.platform)}
                              </div>
                              <div>
                                <span className="text-sm font-black text-slate-900">{PLATFORM_LABELS[post.platform]} Draft</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                  Saved {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 text-[11px] font-black uppercase tracking-widest text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50 px-5 rounded-lg transition-all"
                              onClick={() => openEditSheet(post)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 px-5 rounded-lg transition-all"
                              onClick={() => {
                                navigator.clipboard.writeText(post.content);
                                toast.success('Copied!');
                              }}
                            >
                              Copy
                            </Button>
                            <div className="flex-1" />
                            <Button
                              size="sm"
                              className="h-9 text-[11px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all rounded-xl px-6 shadow-lg shadow-slate-200"
                              onClick={() => openScheduleNowSheet(post)}
                            >
                              Schedule
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="published" className="mt-0 space-y-6 animate-in fade-in duration-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[32px] shadow-sm">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No published history.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          layout
                          className="bg-white border border-slate-200 rounded-2xl p-6 opacity-75 shadow-sm space-y-4 grayscale-[0.5]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                {getPlatformIcon(post.platform)}
                              </div>
                              <div>
                                <span className="text-sm font-black text-slate-900">{PLATFORM_LABELS[post.platform]}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatScheduledTime(post.scheduled_at)}</span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium italic">
                            {post.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-0 space-y-10 animate-in fade-in duration-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {upcomingWeekPosts.map((day) => {
                        return (
                          <div key={day.date} className="relative">
                            <div className="flex items-center justify-between mb-6 sticky top-[64px] bg-slate-50/95 backdrop-blur-sm py-2 z-20">
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                {day.dayName}
                              </h4>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{day.date}</span>
                            </div>
                            <div className="space-y-4">
                              {day.slots.map(({ platform, post, isPlaceholder }) => {
                                if (isPlaceholder) {
                                  const placeholderKey = `${platform}-${day.date}`;
                                  const aiTime = AI_RECOMMENDED_TIMES[platform] || AI_RECOMMENDED_TIMES.x;
                                  return (
                                    <button
                                      key={platform}
                                      onClick={() => handleGeneratePlaceholder(platform, day.date)}
                                      disabled={generatingPlaceholder === placeholderKey}
                                      className="w-full flex items-center justify-between p-5 rounded-2xl border border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all bg-white/50 text-left cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-orange-400 group-hover:border-orange-100 transition-all group-hover:shadow-sm">
                                          {getPlatformIcon(platform)}
                                        </div>
                                        <div>
                                          <span className="text-sm font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{PLATFORM_LABELS[platform]} Slot</span>
                                          <div className="flex items-center gap-1.5 mt-1">
                                            <Clock className="w-3 h-3 text-slate-200 group-hover:text-orange-300" />
                                            <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 uppercase tracking-widest">
                                              Rec: {formatRecommendedTime(aiTime.hour, aiTime.minute)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 text-[11px] font-black uppercase tracking-widest border-slate-200 text-slate-500 group-hover:border-orange-500 group-hover:text-orange-600 group-hover:bg-orange-50 rounded-xl px-6 transition-all"
                                        disabled={generatingPlaceholder === placeholderKey}
                                      >
                                        {generatingPlaceholder === placeholderKey ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                            Crafting...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                                            AI Draft
                                          </>
                                        )}
                                      </Button>
                                    </button>
                                  );
                                }
                                return (
                                  <div key={platform}>
                                    {renderPostCard(post, post.status === 'failed')}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm(); }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 overflow-y-auto p-0">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Schedule Post</SheetTitle>
              <SheetDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                Schedule a high-intent post across your channels. AI will optimize based on your Brand Brain.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="p-8 space-y-10">
            <div className="space-y-4">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {['reddit', 'x', 'threads'].map((p) => {
                  const platform = {
                    reddit: { icon: MessageSquare, name: 'Reddit' },
                    x: { icon: Twitter, name: 'X' },
                    threads: { icon: AtSign, name: 'Threads' },
                  }[p];
                  const isSelected = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        'h-12 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm',
                        isSelected
                          ? 'border-orange-500 text-orange-600 bg-orange-50 shadow-orange-500/5'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white hover:bg-slate-50'
                      )}
                    >
                      <platform.icon className={cn('w-4 h-4', isSelected ? 'text-orange-500' : 'text-slate-300')} />
                      <span>{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Goal</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSheetGoal(goal)}
                    className={cn(
                      'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer',
                      sheetGoal === goal
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-slate-200 text-slate-400 hover:border-slate-400 bg-white'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Context / Topic</Label>
              <div className="relative">
                <Textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="What should this post be about? Mention specific updates or pain points..."
                  className="min-h-[220px] bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 resize-none rounded-2xl focus-visible:ring-orange-500/10 focus-visible:border-orange-500 font-medium leading-relaxed p-5"
                />
                <div className={cn(
                  "absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest",
                  formContent.length > (CHAR_LIMITS[selectedPlatforms[0]] || 1000) ? "text-red-500" : "text-slate-300"
                )}>
                  {formContent.length} / {CHAR_LIMITS[selectedPlatforms[0]] || '∞'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Post Timing</Label>
              <div className="flex gap-3">
                <Input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 flex-1 rounded-xl focus-visible:ring-orange-500/10 font-bold"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const aiTime = getAIRecommendedTime(selectedPlatforms[0] || 'x');
                    setFormScheduledAt(aiTime.toISOString().slice(0, 16));
                  }}
                  className="h-12 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl whitespace-nowrap bg-white px-5"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-orange-500" />
                  AI Suggested
                </Button>
              </div>
            </div>

            {selectedPlatforms.includes('reddit') && (
              <div className="space-y-4">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Subreddit</Label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">r/</span>
                  <Input
                    value={formSubreddit}
                    onChange={(e) => setFormSubreddit(e.target.value)}
                    placeholder="SaaS"
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 pl-10 rounded-xl focus-visible:ring-orange-500/10 font-bold"
                  />
                </div>
              </div>
            )}

            <div className="pt-10 space-y-4 pb-20">
              <Button
                onClick={handleScheduleNow}
                disabled={isSubmitting || !formContent.trim() || !formScheduledAt}
                className="w-full h-14 text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all rounded-2xl shadow-xl shadow-slate-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-5 h-5 mr-3" />
                    Schedule Content
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateDraft}
                disabled={generatingDraft || !formContent.trim()}
                variant="outline"
                className="w-full h-14 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-2xl bg-white"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    AI Crafting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 text-orange-500" />
                    Save AI Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent className="bg-white border-slate-200 rounded-[32px] p-10 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Remove Content?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-base mt-2">
              This action cannot be undone. This post will be permanently removed from your content queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-3">
            <AlertDialogCancel className="h-12 px-8 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all bg-white cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteConfirmId)} className="h-12 px-8 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] border-none transition-all shadow-lg shadow-red-100 cursor-pointer">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}