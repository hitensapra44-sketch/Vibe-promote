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
  Link2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
  threads: { hour: 15, minute: 0 },
  reddit: { hour: 20, minute: 0 },
};

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generatePKCE() {
  const verifier = generateRandomString(64);
  const hashed = await sha256(verifier);
  const challenge = base64urlencode(hashed);
  sessionStorage.setItem('buffer_code_verifier', verifier);
  return { verifier, challenge };
}

function getAIRecommendedTime(platform) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = AI_RECOMMENDED_TIMES[platform] || AI_RECOMMENDED_TIMES.x;
  tomorrow.setHours(time.hour, time.minute, 0, 0);
  return tomorrow;
}

function formatScheduledTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
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
  const [formPlatform, setFormPlatform] = useState('x');
  const [formSubreddit, setFormSubreddit] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formRemindEmail, setFormRemindEmail] = useState(false);
  const [formRemindAt, setFormRemindAt] = useState('');
  const [scheduleMode, setScheduleMode] = useState('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [improvingPostId, setImprovingPostId] = useState(null);

  const [showFullWeek, setShowFullWeek] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (!user) return;
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
    }
    fetchPlan();
  }, [user]);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('scheduled_posts')
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
        .from('scheduled_posts')
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
        .from('scheduled_posts')
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
        .from('scheduled_posts')
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
        .from('scheduled_posts')
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
    const clientId = import.meta.env.VITE_BUFFER_OAUTH_CLIENT_ID;
    if (!clientId) {
      toast.error('Buffer OAuth is not configured');
      return;
    }

    const { challenge } = await generatePKCE();
    const redirectUri = 'https://vibepromote.tech/oauth/buffer/callback';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      scope: 'read,write',
    });

    window.location.href = `https://bufferapp.com/oauth2/authorize?${params.toString()}`;
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
      case 'upcoming':
        return result.filter(p => {
          const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
          return postDate > todayString && p.status !== 'published';
        });
      case 'drafts':
        return result.filter(p => p.status === 'draft');
      case 'published':
        return result.filter(p => p.status === 'published');
      default:
        return [];
    }
  }, [posts, activeTab, activeChannel, todayString]);

  const next7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const handleGenerateFromPlaceholder = (platform, date) => {
    const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const planEntry = weeklyPlan?.days?.find(d => d.day === weekdayName && d.platform === (platform === 'x' ? 'twitter' : platform));
    
    const route = {
      reddit: '/post-maker/reddit',
      x: '/post-maker/x',
      threads: '/post-maker/threads',
    }[platform];

    if (route) {
      navigate(route, { state: { planEntry } });
    }
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
    setFormPlatform('x');
    setFormSubreddit('');
    setFormScheduledAt('');
    setFormRemindEmail(false);
    setFormRemindAt('');
    setScheduleMode('ai');
    setEditingPost(null);
    setIsSubmitting(false);
  }, []);

  const openNewSheet = useCallback(() => {
    resetForm();
    setIsSheetOpen(true);
  }, [resetForm]);

  const openEditSheet = useCallback((post) => {
    setEditingPost(post);
    setFormContent(post.content);
    setFormPlatform(post.platform);
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
    setFormPlatform(post.platform);
    setFormSubreddit(post.subreddit || '');
    setFormScheduledAt('');
    setFormRemindEmail(post.remind_email || false);
    setFormRemindAt(post.remind_at ? new Date(post.remind_at).toISOString().slice(0, 16) : '');
    setScheduleMode('ai');
    setIsSheetOpen(true);
  }, []);

  useEffect(() => {
    if (formPlatform && !formScheduledAt && scheduleMode === 'ai') {
      const aiTime = getAIRecommendedTime(formPlatform);
      setFormScheduledAt(aiTime.toISOString().slice(0, 16));
    }
  }, [formPlatform, scheduleMode, formScheduledAt]);

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
    if (formPlatform === 'reddit' && !formSubreddit.trim()) {
      toast.error('Please enter a subreddit');
      return;
    }

    setIsSubmitting(true);

    const scheduledAtISO = new Date(formScheduledAt).toISOString();

    try {
      let postId;
      if (editingPost) {
        const updated = await updateMutation.mutateAsync({
          id: editingPost.id,
          updates: {
            content: formContent,
            platform: formPlatform,
            subreddit: formPlatform === 'reddit' ? formSubreddit : null,
            scheduled_at: scheduledAtISO,
            status: 'draft',
            remind_email: formPlatform === 'reddit' ? formRemindEmail : false,
            remind_at: formPlatform === 'reddit' && formRemindEmail && formRemindAt ? new Date(formRemindAt).toISOString() : null,
          },
        });
        postId = updated.id;
      } else {
        const created = await createMutation.mutateAsync({
          user_id: user.id,
          content: formContent,
          platform: formPlatform,
          subreddit: formPlatform === 'reddit' ? formSubreddit : null,
          scheduled_at: scheduledAtISO,
          status: 'draft',
          remind_email: formPlatform === 'reddit' ? formRemindEmail : false,
          remind_at: formPlatform === 'reddit' && formRemindEmail && formRemindAt ? new Date(formRemindAt).toISOString() : null,
        });
        postId = created.id;
      }

      const result = await scheduleMutation.mutateAsync({
        post_id: postId,
        platform: formPlatform,
        content: formContent,
        scheduled_at: scheduledAtISO,
        subreddit: formPlatform === 'reddit' ? formSubreddit : undefined,
      });

      if (result.success) {
        toast.success('Post scheduled');
        setIsSheetOpen(false);
        resetForm();
        refetch();
      } else {
        toast.error(result.error || 'Failed to schedule post');
      }
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

  const charCount = formContent.length;
  const charLimit = CHAR_LIMITS[formPlatform];
  const showCharWarning = charLimit !== Infinity && charCount > charLimit;

  const renderPostCard = (post, isUpcomingFailed = false) => {
    const isReddit = post.platform === 'reddit';
    const isFailed = post.status === 'failed';
    const isImproving = improvingPostId === post.id;
    const canEditDelete = post.status !== 'published';

    return (
      <motion.div
        layout
        key={post.id}
        className={cn(
          'rounded-xl border bg-[#111111] p-5 space-y-3 transition-all',
          isFailed && isUpcomingFailed ? 'border-l-2 border-l-red-500 border-[#1F1F1F]' : 'border-[#1F1F1F]'
        )}
      >
        {isFailed && isUpcomingFailed && (
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
              <p className="text-xs text-amber-200/80">
                Reddit doesn't support auto-publishing. Copy your post and paste it manually.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] font-bold border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                  onClick={() => handleCopy(post.content)}
                >
                  <Copy className="w-3 h-3 mr-1.5" />
                  Copy Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] font-bold border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
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
            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#A1A1AA]">
              {getPlatformIcon(post.platform)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{PLATFORM_LABELS[post.platform]}</span>
                {post.subreddit && <span className="text-[10px] text-[#52525B]">r/{post.subreddit}</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-[#52525B]" />
                <span className="text-[10px] text-[#52525B]">{formatScheduledTime(post.scheduled_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(post.status)}
            {canEditDelete && (
              <DropdownMenu open={openMenuId === post.id} onOpenChange={(open) => setOpenMenuId(open ? post.id : null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#52525B] hover:text-white">
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
          <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
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

        {isFailed && isUpcomingFailed && (
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
              className="h-8 text-[10px] font-bold text-[#52525B] hover:text-white"
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
      <Sidebar isPaid={true} />

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
          <h1 className="text-sm font-bold text-foreground">Auto Poster</h1>
          <Button size="sm" className="h-8 gap-2 text-[11px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all" onClick={openNewSheet}>
            <Plus className="w-3.5 h-3.5" />
            New Post
          </Button>
        </header>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Channel list (Buffer-style) ── */}
          <aside className="w-56 flex-shrink-0 border-r border-[#1F1F1F] bg-background flex flex-col overflow-y-auto">
            <div className="px-4 pt-5 pb-2">
              <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Channels</p>
            </div>
            <nav className="flex flex-col gap-0.5 px-2 pb-4">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left',
                    activeChannel === ch.id
                      ? 'bg-[#1F1F1F] text-white border-l-2 border-[#F97316] pl-[10px]'
                      : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
                  )}
                >
                  <span className={cn('w-4 h-4 flex items-center justify-center flex-shrink-0', activeChannel === ch.id ? 'text-[#F97316]' : 'text-[#52525B]')}>
                    {ch.icon}
                  </span>
                  {ch.label}
                  {ch.id !== 'all' && (
                    <span className="ml-auto text-[10px] text-[#52525B] font-normal">
                      {posts.filter(p => p.platform === ch.id).length}
                    </span>
                  )}
                </button>
              ))}

              {bufferAccounts.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Buffer Accounts</p>
                  </div>
                  {bufferAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full',
                        activeChannel === account.platform
                          ? 'bg-[#1F1F1F] text-white border-l-2 border-[#F97316] pl-[10px]'
                          : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
                      )}
                    >
                      <button
                        onClick={() => setActiveChannel(account.platform)}
                        className="flex items-center gap-3 flex-1 text-left bg-transparent border-none p-0"
                      >
                        <span className={cn('w-4 h-4 flex items-center justify-center flex-shrink-0', activeChannel === account.platform ? 'text-[#F97316]' : 'text-[#52525B]')}>
                          {getPlatformIcon(account.platform)}
                        </span>
                        <span className="truncate">{account.buffer_channel_name}</span>
                      </button>
                      <button
                        onClick={() => handleDisconnectBuffer(account.id)}
                        className="p-1 rounded hover:bg-[#1F1F1F] text-[#52525B] hover:text-red-400 transition-all bg-transparent border-none"
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold bg-[#111111] border border-[#1F1F1F] text-[#A1A1AA] hover:text-white hover:border-[#52525B] transition-all bg-transparent"
              >
                <Link2 className="w-3.5 h-3.5" />
                Connect Account
              </button>
            </div>
          </aside>

          {/* ── RIGHT: Queue ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-[#111111] border border-[#1F1F1F] p-1">
                  <TabsTrigger value="today" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">Today</TabsTrigger>
                  <TabsTrigger value="upcoming" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">Upcoming</TabsTrigger>
                  <TabsTrigger value="drafts" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">Drafts</TabsTrigger>
                  <TabsTrigger value="published" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">Published</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#F97316]" />
                      <span className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Today's Post Plan</span>
                    </div>
                    {!planLoading && weeklyPlan && (
                      <button
                        onClick={() => setShowFullWeek(!showFullWeek)}
                        className="text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all bg-transparent"
                      >
                        {showFullWeek ? 'Hide Full Week' : 'View Full Week →'}
                      </button>
                    )}
                  </div>

                  {showFullWeek && weeklyPlan && (
                    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 space-y-3">
                      {weeklyPlan.week_overview && (
                        <p className="text-xs text-[#A1A1AA] mb-3">{weeklyPlan.week_overview}</p>
                      )}
                      <div className="space-y-2">
                        {weeklyPlan.days?.map((dayEntry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
                            <span className="text-xs font-bold text-[#A1A1AA]">{dayEntry.day}</span>
                            <span className="text-xs text-[#52525B]">{dayEntry.active ? dayEntry.format_name : 'No post scheduled'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showFullWeek && (() => {
                    const platformsToShow = activeChannel === 'all' ? ['reddit', 'x', 'threads'] : [activeChannel];
                    const platformsWithPosts = new Set(posts.filter(p => {
                      const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
                      return postDate === todayString && p.platform && p.status !== 'published';
                    }).map(p => p.platform));

                    const hasAnyNonPublishedPosts = platformsWithPosts.size > 0;
                    const emptyPlatforms = platformsToShow.filter(p => !platformsWithPosts.has(p));

                    if (!hasAnyNonPublishedPosts && emptyPlatforms.length > 0) {
                      return (
                        <div className="space-y-3">
{emptyPlatforms.map((platform) => (
                <div key={platform} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-[#1F1F1F] bg-[#111111]/30 hover:bg-[#111111]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#52525B]">
                      {getPlatformIcon(platform)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#A1A1AA] capitalize">{PLATFORM_LABELS[platform]} Post</p>
                      <p className="text-[10px] text-[#52525B] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Recommended: {AI_RECOMMENDED_TIMES[platform]?.hour || 9}:{(AI_RECOMMENDED_TIMES[platform]?.minute || 0) === 0 ? '00' : AI_RECOMMENDED_TIMES[platform].minute} {(AI_RECOMMENDED_TIMES[platform]?.hour || 9) >= 12 ? 'PM' : 'AM'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[11px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all gap-1"
                    onClick={() => handleGenerateFromPlaceholder(platform, new Date())}
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate
                  </Button>
                </div>
              ))}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {filteredPosts.map(post => renderPostCard(post, post.status === 'failed'))}
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-6 mt-0">
                  {next7Days.map((day) => {
                    const dateStr = day.toISOString().slice(0, 10);
                    const platformsToShow = activeChannel === 'all' ? ['reddit', 'x', 'threads'] : [activeChannel];
                    
                    return (
                      <div key={dateStr} className="space-y-3">
                        <h3 className="text-xs font-bold text-[#52525B] uppercase tracking-wider sticky top-0 bg-background py-2">
                          {formatDateLabel(day.toISOString())}
                        </h3>
                        <div className="space-y-3">
                          {platformsToShow.map((platform) => {
                            const platformPosts = posts.filter(p => {
                              const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
                              return postDate === dateStr && p.platform === platform && p.status !== 'published';
                            });

                            if (platformPosts.length > 0) {
                              return platformPosts.map(post => renderPostCard(post, post.status === 'failed'));
                            }

return (
                            <div key={platform} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-[#1F1F1F] bg-[#111111]/30 hover:bg-[#111111]/50 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#52525B]">
                                  {getPlatformIcon(platform)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#A1A1AA] capitalize">{PLATFORM_LABELS[platform]} Post</p>
                                  <p className="text-[10px] text-[#52525B] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    Recommended: {AI_RECOMMENDED_TIMES[platform]?.hour || 9}:{(AI_RECOMMENDED_TIMES[platform]?.minute || 0) === 0 ? '00' : AI_RECOMMENDED_TIMES[platform].minute} {(AI_RECOMMENDED_TIMES[platform]?.hour || 9) >= 12 ? 'PM' : 'AM'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-[11px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all gap-1"
                                onClick={() => handleGenerateFromPlaceholder(platform, day)}
                              >
                                <Sparkles className="w-3 h-3" />
                                Generate
                              </Button>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4 mt-0">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <Pencil className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                      <p className="text-sm text-[#52525B]">No drafts saved.</p>
                    </div>
                  ) : (
                    filteredPosts.map(post => (
                      <motion.div layout key={post.id} className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 space-y-3">
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
                          {post.content}
                        </p>
                        <div className="flex justify-end">
<Button
                             size="sm"
                             variant="outline"
                             className="h-8 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
                             onClick={() => openScheduleNowSheet(post)}
                           >
                             <CalendarClock className="w-3 h-3 mr-1.5" />
                             Schedule Now
                           </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="published" className="space-y-4 mt-0">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CheckCircle2 className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                      <p className="text-sm text-[#52525B]">No published posts yet.</p>
                    </div>
                  ) : (
                    filteredPosts.map(post => (
                      <motion.div layout key={post.id} className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 space-y-3 opacity-80">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#A1A1AA]">
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white">{PLATFORM_LABELS[post.platform]}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-[#52525B]" />
                                <span className="text-[10px] text-[#52525B]">{formatScheduledTime(post.scheduled_at)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm(); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-background border-l border-foreground/5 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">{editingPost ? 'Edit Post' : 'Create New Post'}</SheetTitle>
            <SheetDescription className="text-xs text-[#52525B]">
              Write, schedule, and publish your content.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleScheduleNow} className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'threads', 'reddit'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormPlatform(p)}
                    className={cn(
                      'h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2',
                      formPlatform === p
                        ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/5'
                        : 'border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B] bg-transparent'
                    )}
                  >
                    {getPlatformIcon(p)}
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Content</Label>
                <span className={cn('text-[10px] font-bold', showCharWarning ? 'text-red-400' : 'text-[#52525B]')}>
                  {charCount}{charLimit !== Infinity && ` / ${charLimit}`}
                </span>
              </div>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="What's on your mind?"
                className={cn(
                  'min-h-[200px] bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] resize-none',
                  showCharWarning && 'border-red-500'
                )}
              />
            </div>

            {formPlatform === 'reddit' && (
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Subreddit</Label>
                <Input
                  value={formSubreddit}
                  onChange={(e) => setFormSubreddit(e.target.value)}
                  placeholder="e.g. SaaS"
                  className="bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] h-10"
                />
              </div>
            )}

            {formPlatform === 'reddit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Remind me by email</Label>
                  <Switch
                    checked={formRemindEmail}
                    onCheckedChange={setFormRemindEmail}
                  />
                </div>
                {formRemindEmail && (
                  <Input
                    type="datetime-local"
                    value={formRemindAt}
                    onChange={(e) => setFormRemindAt(e.target.value)}
                    className="bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] h-10"
                  />
                )}
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Schedule</Label>
              <RadioGroup value={scheduleMode} onValueChange={setScheduleMode} className="space-y-3">
                <div className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                  scheduleMode === 'ai' ? 'border-[#F97316] bg-[#F97316]/5' : 'border-[#1F1F1F] bg-transparent'
                )}>
                  <RadioGroupItem value="ai" id="mode-ai" className="mt-0.5" />
                  <div className="flex-1" onClick={() => setScheduleMode('ai')}>
                    <Label htmlFor="mode-ai" className="text-xs font-bold text-white cursor-pointer">
                      AI Recommended
                    </Label>
                    <p className="text-[10px] text-[#52525B] mt-1">
                      {PLATFORM_LABELS[formPlatform]} → Tomorrow {AI_RECOMMENDED_TIMES[formPlatform]?.hour || 9}:{(AI_RECOMMENDED_TIMES[formPlatform]?.minute || 0) === 0 ? '00' : AI_RECOMMENDED_TIMES[formPlatform].minute} {(AI_RECOMMENDED_TIMES[formPlatform]?.hour || 9) >= 12 ? 'PM' : 'AM'}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                  scheduleMode === 'custom' ? 'border-[#F97316] bg-[#F97316]/5' : 'border-[#1F1F1F] bg-transparent'
                )}>
                  <RadioGroupItem value="custom" id="mode-custom" className="mt-0.5" />
                  <div className="flex-1" onClick={() => setScheduleMode('custom')}>
                    <Label htmlFor="mode-custom" className="text-xs font-bold text-white cursor-pointer">
                      Custom Time
                    </Label>
                    {scheduleMode === 'custom' && (
                      <Input
                        type="datetime-local"
                        value={formScheduledAt}
                        onChange={(e) => setFormScheduledAt(e.target.value)}
                        className="mt-2 bg-[#111111] border-[#1F1F1F] text-white placeholder-[#52525B] h-9 text-xs"
                      />
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            <SheetFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-background border-foreground/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">Delete this post?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#52525B]">
              This action cannot be undone. The post will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-xs font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="h-9 text-xs font-bold bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}