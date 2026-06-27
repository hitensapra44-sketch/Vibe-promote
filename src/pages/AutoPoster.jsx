"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  CalendarClock,
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
  TrendingUp
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

  const [activeTab, setActiveTab] = useState('today');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formContent, setFormContent] = useState('');
  const [formPlatform, setFormPlatform] = useState('x');
  const [formSubreddit, setFormSubreddit] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [scheduleMode, setScheduleMode] = useState('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [improvingPostId, setImprovingPostId] = useState(null);

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

  const todayString = useMemo(() => getTodayString(), []);

  const filteredPosts = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return posts.filter(p => {
          const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
          return postDate === todayString;
        });
      case 'upcoming':
        return posts.filter(p => {
          const postDate = new Date(p.scheduled_at).toISOString().slice(0, 10);
          return postDate > todayString && p.status !== 'published';
        });
      case 'drafts':
        return posts.filter(p => p.status === 'draft');
      case 'published':
        return posts.filter(p => p.status === 'published');
      default:
        return [];
    }
  }, [posts, activeTab, todayString]);

  const groupedUpcoming = useMemo(() => {
    const groups = {};
    filteredPosts.forEach(p => {
      const dateKey = new Date(p.scheduled_at).toISOString().slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPosts]);

  const resetForm = useCallback(() => {
    setFormContent('');
    setFormPlatform('x');
    setFormSubreddit('');
    setFormScheduledAt('');
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
    setScheduleMode('custom');
    setIsSheetOpen(true);
  }, []);

  const openScheduleNowSheet = useCallback((post) => {
    setEditingPost(post);
    setFormContent(post.content);
    setFormPlatform(post.platform);
    setFormSubreddit(post.subreddit || '');
    setFormScheduledAt('');
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
        return <Hash className="w-4 h-4" />;
    }
  };

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
              post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Auto Poster</h1>
          </div>
          <Button
            size="sm"
            className="h-8 gap-2 text-[11px] font-bold"
            onClick={openNewSheet}
          >
            <Plus className="w-3.5 h-3.5" />
            New Post
          </Button>
        </header>

        <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#111111] border border-[#1F1F1F] p-1">
              <TabsTrigger value="today" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">
                Today
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="drafts" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">
                Drafts
              </TabsTrigger>
              <TabsTrigger value="published" className="text-xs font-medium data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white">
                Published
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <CalendarClock className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                  <p className="text-sm text-[#52525B]">Nothing scheduled for today. Create your first post.</p>
                </div>
              ) : (
                filteredPosts.map(post => renderPostCard(post, post.status === 'failed'))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <CalendarClock className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                  <p className="text-sm text-[#52525B]">No upcoming posts. Plan your week.</p>
                </div>
              ) : (
                groupedUpcoming.map(([dateKey, groupPosts]) => (
                  <div key={dateKey} className="space-y-3">
                    <h3 className="text-xs font-bold text-[#52525B] uppercase tracking-wider sticky top-14 bg-background py-2">
                      {formatDateLabel(dateKey)}
                    </h3>
                    <div className="space-y-3">
                      {groupPosts.map(post => renderPostCard(post, post.status === 'failed'))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <Pencil className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                  <p className="text-sm text-[#52525B]">No drafts saved.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <motion.div
                    layout
                    key={post.id}
                    className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 space-y-3"
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
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] font-bold border-[#1F1F1F] text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white"
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
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle2 className="w-10 h-10 text-[#52525B] mx-auto mb-4" />
                  <p className="text-sm text-[#52525B]">No published posts yet.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <motion.div
                    layout
                    key={post.id}
                    className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 space-y-3 opacity-80"
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
                            <Clock className="w-3 h-3 text-[#52525B]" />
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
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

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
                          {formPlatform === 'x' ? 'X' : formPlatform === 'threads' ? 'Threads' : 'Reddit'} → Tomorrow {AI_RECOMMENDED_TIMES[formPlatform]?.hour || 9}:{(AI_RECOMMENDED_TIMES[formPlatform]?.minute || 0) === 0 ? '00' : AI_RECOMMENDED_TIMES[formPlatform].minute} {(AI_RECOMMENDED_TIMES[formPlatform]?.hour || 9) >= 12 ? 'PM' : 'AM'}
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
