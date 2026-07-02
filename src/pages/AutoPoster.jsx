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
  const isTomorrow = date.toDateString() === tomorrow.slateDateString ? false : date.toDateString() === tomorrow.toDateString();

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

          {/* ── RIGHT: Queue ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-foreground/5 border border-foreground/10 p-1">
                  <TabsTrigger value="today" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Today</TabsTrigger>
                  <TabsTrigger value="drafts" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Drafts</TabsTrigger>
                  <TabsTrigger value="published" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Published</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-0 space-y-6">
                  <h3 className="text-sm text-foreground/40">
                    Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h3>
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : queuePosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {queuePosts.map((post) => (
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground">{PLATFORM_LABELS[post.platform]}</span>
                                </div>
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
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draftPosts.map((post) => (
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
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                    </div>
                  ) : publishedPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarClock className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                      <p className="text-sm text-foreground/40">Nothing here yet. Generate your first post.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {publishedPosts.map((post) => (
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
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm(); }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-foreground/10 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">New Post</SheetTitle>
            <SheetDescription className="text-xs text-foreground/60">
              Create a draft post for your channel.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Platform</Label>
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
                      onClick={() => setFormPlatform(p)}
                      className={cn(
                        'h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                        formPlatform === p
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
                value={sheetContent}
                onChange={(e) => setSheetContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px] bg-foreground/5 border-foreground/10 text-foreground placeholder-foreground/40 resize-none"
              />
            </div>

            {sheetPlatform === 'reddit' && (
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Subreddit</Label>
                <Input
                  value={sheetSubreddit}
                  onChange={(e) => setSheetSubreddit(e.target.value)}
                  placeholder="e.g. SaaS"
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder-foreground/40 h-10"
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleGenerateDraft}
                disabled={generatingDraft || !sheetContent.trim()}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
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

const GOALS = [
  "Get comments",
  "Get signups", 
  "Get feedback",
  "Build authority",
  "Tell story",
];