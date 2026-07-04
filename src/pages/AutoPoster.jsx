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

async function generatePKCE() {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  const verifier = Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  
  sessionStorage.setItem('buffer_code_verifier', verifier);

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { challenge: base64, verifier };
}

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
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) {
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
      const clientId = import.meta.env.VITE_BUFFER_OAUTH_CLIENT_ID;
      if (!clientId) {
        toast.error('Buffer OAuth is not configured');
        return;
      }

      const { challenge } = await generatePKCE();
      const redirectUri = `${window.location.origin}/oauth/buffer/callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        scope: 'read,write',
      });

      const redirectUrl = `https://bufferapp.com/oauth2/authorize?${params.toString()}`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to connect Buffer account');
    }
  };

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
        return <span className="text-xs font-bold">@</span>;
      case 'reddit':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const channels = [
    { id: 'all', label: 'All Channels', icon: <Hash className="w-4 h-4" /> },
    { id: 'x', label: 'X', icon: <Twitter className="w-4 h-4" /> },
    { id: 'threads', label: 'Threads', icon: <span className="text-xs font-bold">@</span> },
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
          'rounded-xl border bg-foreground/5 p-5 space-y-3 transition-all border-foreground/10'
        )}
      >
        {isFailed && (
          <div className="flex items-start gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium">{post.error_message || 'Failed to schedule'}</p>
            </div>
          </div>
        )}

        {isReddit && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <p className="text-xs text-amber-600">
                Reddit doesn't support auto-publishing. Copy your post and paste it manually.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-bold border-orange-500/20 text-orange-500 hover:bg-orange-500/10 px-2"
                  onClick={() => handleCopy(post.content)}
                >
                  <Copy className="w-3 h-3 mr-1.5" />
                  Copy Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] font-bold border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
                  onClick={() => window.open(`https://reddit.com/r/${post.subreddit || ''}/submit`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Open Reddit
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/60">
              {getPlatformIcon(post.platform)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{PLATFORM_LABELS[post.platform]}</span>
                {post.subreddit && <span className="text-[10px] text-foreground/60">r/{post.subreddit}</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-foreground/40" />
                <span className="text-[10px] text-foreground/40">{formatScheduledTime(post.scheduled_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(post.status)}
            {canEditDelete && (
              <DropdownMenu open={openMenuId === post.id} onOpenChange={(open) => setOpenMenuId(open ? post.id : null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/40 hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { openEditSheet(post); setOpenMenuId(null); }}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setDeleteConfirmId(post.id); setOpenMenuId(null); }} className="text-red-400 focus:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleImprove(post.id, 'be more engaging and viral')}>
                    <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    Improve Hook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImprove(post.id, 'be shorter and more concise')}>
                    <Minus className="w-3.5 h-3.5 mr-2" />
                    Make Shorter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImprove(post.id, 'be more engaging and include a stronger hook')}>
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    More Engaging
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
            {isImproving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-[#F97316]" />
                Improving...
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
              className="h-8 text-[10px] font-bold border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => handleRetry(post)}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[10px] font-bold text-foreground/40 hover:text-foreground"
              onClick={() => window.open('https://buffer.com', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              Open Buffer
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
          <h1 className="text-sm font-bold text-foreground">Auto Poster</h1>
          <Button size="sm" className="h-8 gap-2 text-[11px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all" onClick={openNewSheet}>
            <Plus className="w-3.5 h-3.5" />
            Schedule Post
          </Button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-56 flex-shrink-0 border-r border-foreground/5 bg-background flex flex-col overflow-y-auto">
            <div className="px-4 pt-5 pb-2">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Channels</p>
            </div>
            <nav className="flex flex-col gap-0.5 px-2 pb-4">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left bg-transparent border-none cursor-pointer',
                    activeChannel === ch.id
                      ? 'bg-foreground/5 text-foreground border-l-2 border-[#F97316] pl-[10px]'
                      : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                  )}
                >
                  <span className={cn('w-4 h-4 flex items-center justify-center flex-shrink-0', activeChannel === ch.id ? 'text-[#F97316]' : 'text-foreground/40')}>
                    {ch.icon}
                  </span>
                  {ch.label}
                  {ch.id !== 'all' && (
                    <span className="ml-auto text-[10px] text-foreground/40 font-normal">
                      {posts.filter(p => p.platform === ch.id).length}
                    </span>
                  )}
                </button>
              ))}

              {bufferAccounts.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Buffer Accounts</p>
                  </div>
                  {bufferAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full',
                        activeChannel === account.platform
                          ? 'bg-foreground/5 text-foreground border-l-2 border-[#F97316] pl-[10px]'
                          : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                      )}
                    >
                      <button
                        onClick={() => setActiveChannel(account.platform)}
                        className="flex items-center gap-3 flex-1 text-left bg-transparent border-none p-0 cursor-pointer"
                      >
                        <span className={cn('w-4 h-4 flex items-center justify-center flex-shrink-0', activeChannel === account.platform ? 'text-[#F97316]' : 'text-foreground/40')}>
                          {getPlatformIcon(account.platform)}
                        </span>
                        <span className="truncate">{account.buffer_channel_name}</span>
                      </button>
                      <button
                        onClick={() => handleDisconnectBuffer(account.id)}
                        className="p-1 rounded hover:bg-foreground/5 text-foreground/40 hover:text-red-400 transition-all bg-transparent border-none cursor-pointer"
                        title="Disconnect"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </nav>

            <div className="px-4 pt-2 pb-4">
              <button
                onClick={handleConnectBuffer}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold bg-foreground/5 border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-all bg-transparent cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                Connect Account
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-foreground/5 border border-foreground/10 p-1">
                  <TabsTrigger value="today" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Today</TabsTrigger>
                  <TabsTrigger value="drafts" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Drafts</TabsTrigger>
                  <TabsTrigger value="published" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Published</TabsTrigger>
                  <TabsTrigger value="upcoming" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-0 space-y-6">
                  <h3 className="text-sm text-foreground/40">
                    Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPosts.map((post) => renderPostCard(post, post.status === 'failed'))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="drafts" className="mt-0 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          layout
                          className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/60">
                                {getPlatformIcon(post.platform)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-foreground">{PLATFORM_LABELS[post.platform]}</span>
                                <p className="text-[10px] text-foreground/40 mt-0.5">
                                  Created {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                            {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] font-bold text-foreground/60 hover:text-foreground px-2"
                              onClick={() => openEditSheet(post)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] font-bold text-foreground/60 hover:text-foreground px-2"
                              onClick={() => {
                                navigator.clipboard.writeText(post.content);
                                toast.success('Copied!');
                              }}
                            >
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
                              onClick={() => openScheduleNowSheet(post)}
                            >
                              Schedule Now
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="published" className="mt-0 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          layout
                          className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 space-y-3 opacity-80"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/60">
                                {getPlatformIcon(post.platform)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-foreground">{PLATFORM_LABELS[post.platform]}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-foreground/40">{formatScheduledTime(post.scheduled_at)}</span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                            {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-0 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingWeekPosts.map((day) => {
                        const hasAnyPosts = day.slots.some(s => !s.isPlaceholder);
                        return (
                          <div key={day.date} className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider">{day.dayName}</h4>
                              <span className="text-[10px] text-foreground/40">{day.date}</span>
                            </div>
                            <div className="space-y-2">
                              {day.slots.map(({ platform, post, isPlaceholder }) => {
                                if (isPlaceholder) {
                                  const placeholderKey = `${platform}-${day.date}`;
                                  const aiTime = AI_RECOMMENDED_TIMES[platform] || AI_RECOMMENDED_TIMES.x;
                                  return (
                                    <button
                                      key={platform}
                                      onClick={() => handleGeneratePlaceholder(platform, day.date)}
                                      disabled={generatingPlaceholder === placeholderKey}
                                      className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-foreground/15 hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all bg-transparent text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/40">
                                          {getPlatformIcon(platform)}
                                        </div>
                                        <div>
                                          <span className="text-xs font-bold text-foreground/70">{PLATFORM_LABELS[platform]} post</span>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3 h-3 text-foreground/30" />
                                            <span className="text-[10px] text-foreground/40">
                                              {formatRecommendedTime(aiTime.hour, aiTime.minute)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-[10px] font-bold text-[#F97316] hover:text-[#F97316] hover:bg-[#F97316]/10 px-2"
                                        disabled={generatingPlaceholder === placeholderKey}
                                      >
                                        {generatingPlaceholder === placeholderKey ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                            Generating...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-3 h-3 mr-1.5" />
                                            Generate
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
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-foreground/10 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">Schedule Post</SheetTitle>
            <SheetDescription className="text-xs text-foreground/60">
              Create and schedule a post for your channel.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Platform</Label>
              <div className="flex flex-wrap gap-2">
                {['reddit', 'x', 'threads'].map((p) => {
                  const platform = {
                    reddit: { icon: MessageSquare, name: 'Reddit' },
                    x: { icon: Twitter, name: 'X' },
                    threads: { icon: MessageSquare, name: 'Threads' },
                  }[p];
                  const isSelected = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        'h-10 px-4 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                        isSelected
                          ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/5'
                          : 'border-foreground/10 text-foreground/60 hover:border-foreground/30 bg-transparent'
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
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Goal</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSheetGoal(goal)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
                      sheetGoal === goal
                        ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/10'
                        : 'border-foreground/10 text-foreground/60 hover:border-foreground/30 bg-transparent'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Content</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px] bg-foreground/5 border-foreground/10 text-foreground placeholder-foreground/40 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Schedule Time</Label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder-foreground/40 h-10 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const aiTime = getAIRecommendedTime(selectedPlatforms[0] || 'x');
                    setFormScheduledAt(aiTime.toISOString().slice(0, 16));
                  }}
                  className="h-10 text-xs font-bold border-foreground/10 text-foreground/60 hover:text-foreground whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  AI Recommend
                </Button>
              </div>
              {selectedPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {selectedPlatforms.map(p => {
                    const time = AI_RECOMMENDED_TIMES[p];
                    if (!time) return null;
                    return (
                      <span key={p} className="text-[10px] text-foreground/40">
                        {PLATFORM_LABELS[p]}: {formatRecommendedTime(time.hour, time.minute)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedPlatforms.includes('reddit') && (
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Subreddit</Label>
                <Input
                  value={formSubreddit}
                  onChange={(e) => setFormSubreddit(e.target.value)}
                  placeholder="e.g. SaaS"
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder-foreground/40 h-10"
                />
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button
                onClick={handleScheduleNow}
                disabled={isSubmitting || !formContent.trim() || !formScheduledAt}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateDraft}
                disabled={generatingDraft || !formContent.trim()}
                variant="outline"
                className="w-full h-11 text-xs font-bold border-foreground/10 text-foreground/60 hover:text-foreground transition-all"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your scheduled post draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteConfirmId)} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}