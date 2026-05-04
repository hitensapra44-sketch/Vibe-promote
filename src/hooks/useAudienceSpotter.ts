import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { generateAICall } from '../lib/ai';
import { useEffect } from 'react';

interface Signal {
  id?: string;
  platform: string;
  post_title: string;
  post_body: string;
  post_url: string;
  created_at: string;
  upvotes: number;
  author: string;
  subreddit?: string;
  intent_type: string;
  intent_score: number;
  suggested_reply: string;
  status: 'new' | 'replied' | 'dismissed';
  user_id: string;
}

export const useAudienceSpotter = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: signals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['audience_signals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audience_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Signal[];
    },
    enabled: !!userId,
  });

  const scanMutation = useMutation({
    mutationFn: async ({ keywords, platforms, communities }: { keywords: string[]; platforms: string[]; communities: string[] }) => {
      if (!userId) throw new Error("User not authenticated");

      // 1. Persist Config to LocalStorage
      const config = { keywords, platforms, communities, scanStartedAt: Date.now(), isScanning: true };
      localStorage.setItem('vh_audience_config', JSON.stringify(config));

      // 2. Persist Config to Brand Brains
      await supabase
        .from('brand_brains')
        .update({
          audience_keywords: JSON.stringify(keywords),
          audience_platforms: JSON.stringify(platforms),
          audience_communities: JSON.stringify(communities),
          pain_phrases: keywords.join(', '),
          primary_platform: communities.join(', ')
        })
        .eq('user_id', userId);

      // 3. Fetch Brand Brain for AI Context
      const { data: brain } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', userId)
        .single();

      const timestamp_24h_ago = Math.floor(Date.now() / 1000) - 86400;
      let rawPosts: any[] = [];

      // 4. Fetch from Reddit
      if (platforms.includes('reddit')) {
        const searchCommunities = communities.length > 0 ? communities : ['SaaS', 'startups', 'indiehackers'];
        for (const sub of searchCommunities) {
          for (const kw of keywords) {
            try {
              const res = await fetch(`https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&sort=new&t=day&limit=5&restrict_sr=true`, {
                headers: { 'User-Agent': 'VibePromote/1.0' }
              });
              if (res.ok) {
                const data = await res.json();
                const posts = (data.data?.children || []).map((child: any) => ({
                  platform: 'reddit',
                  post_title: child.data.title,
                  post_body: child.data.selftext || '',
                  post_url: `https://reddit.com${child.data.permalink}`,
                  created_at: new Date(child.data.created_utc * 1000).toISOString(),
                  upvotes: child.data.ups,
                  comment_count: child.data.num_comments,
                  author: child.data.author,
                  subreddit: child.data.subreddit,
                  user_id: userId,
                  status: 'new'
                }));
                rawPosts = [...rawPosts, ...posts];
              }
            } catch (e) { console.error("Reddit fetch error", e); }
          }
        }
      }

      // 5. Fetch from Hacker News
      if (platforms.includes('hn')) {
        for (const kw of keywords) {
          try {
            const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(kw)}&tags=story&numericFilters=created_at_i>${timestamp_24h_ago}`);
            if (res.ok) {
              const data = await res.json();
              const posts = (data.hits || []).map((hit: any) => ({
                platform: 'hacker_news',
                post_title: hit.title,
                post_body: hit.story_text || hit.comment_text || '',
                post_url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                created_at: new Date(hit.created_at_i * 1000).toISOString(),
                upvotes: hit.points,
                comment_count: hit.num_comments || 0,
                author: hit.author,
                subreddit: 'Hacker News',
                user_id: userId,
                status: 'new'
              }));
              rawPosts = [...rawPosts, ...posts];
            }
          } catch (e) { console.error("HN fetch error", e); }
        }
      }

      // 6. Deduplicate
      const uniquePosts = Array.from(new Map(rawPosts.map(p => [p.post_url, p])).values());
      
      // 7. AI Relevance Filtering
      const finalSignals: Signal[] = [];
      for (const post of uniquePosts.slice(0, 10)) {
        try {
          const systemPrompt = "You are a strict relevance filter. Given a SaaS product's target audience description and a Reddit/HN post, score how likely the post author is a potential customer. Return ONLY valid JSON: { \"score\": number between 1-100, \"reason\": \"string (max 10 words)\", \"isRelevant\": boolean }. Mark isRelevant: true only if score >= 65.";
          const userMsg = `Product: ${brain.app_name}. Target customer: ${brain.target_customer}. Core problem solved: ${brain.core_problem}.
Post title: ${post.post_title}
Post body (first 300 chars): ${post.post_body.substring(0, 300)}`;

          const aiResult = await generateAICall(systemPrompt, userMsg);
          const parsed = JSON.parse(aiResult);

          if (parsed.isRelevant) {
            const replyPrompt = `You are a helpful and knowledgeable community member. Write a reply to the post below that provides 90% genuine value or advice related to the user's specific question or pain point. Only in the final sentence, add a very soft, non-pushy mention of ${brain.app_name} (e.g., "Btw, I actually built a tool called ${brain.app_name} that handles [specific feature] if you want to check it out"). 

Rules:
- Max 4 sentences.
- No emojis.
- No hashtags.
- Tone: Casual, founder-to-founder.
- Focus on being helpful first.`;

            const reply = await generateAICall(replyPrompt, `Post: ${post.post_title}\n${post.post_body.substring(0, 300)}`);
            
            const signal: Signal = {
              ...post,
              intent_score: parsed.score,
              intent_type: parsed.reason,
              suggested_reply: reply,
            };
            
            const { data: savedSignal, error: saveError } = await supabase
              .from('audience_signals')
              .upsert(signal, { onConflict: 'post_url' })
              .select()
              .single();

            if (!saveError) finalSignals.push(savedSignal);
          }
        } catch (e) { console.error("AI filtering error", e); }
      }

      // 8. Update LocalStorage on completion
      const updatedConfig = { ...config, isScanning: false };
      localStorage.setItem('vh_audience_config', JSON.stringify(updatedConfig));

      return finalSignals;
    },
    onSuccess: () => {
      toast.success('Scan complete! New users found.');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Scan failed: ${error.message}`);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'replied' | 'dismissed' }) => {
      const { error } = await supabase
        .from('audience_signals')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return { id, status };
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['audience_signals', userId] });
      const previousSignals = queryClient.getQueryData(['audience_signals', userId]);
      queryClient.setQueryData(['audience_signals', userId], (old: Signal[] | undefined) => 
        old?.map(s => s.id === id ? { ...s, status } : s)
      );
      return { previousSignals };
    },
    onError: (err, variables, context) => {
      if (context?.previousSignals) {
        queryClient.setQueryData(['audience_signals', userId], context.previousSignals);
      }
    }
  });

  return {
    signals,
    isLoading: isLoading || scanMutation.isPending,
    isError,
    refetch,
    startScan: scanMutation.mutate,
    updateSignalStatus: updateStatusMutation.mutate
  };
};