"use client";

import { supabase } from '../supabaseClient';
import { markTaskComplete } from '../components/TaskWidget';

export const SEED_TASKS = [
  // ── DAY 1 ──────────────────────────────────────────────────────
  {
    day: 1, task_key: 'user_finder_d1',
    task_title: 'Find Your First Leads',
    task_description: 'Run User Finder and scan Reddit for people talking about your problem. Save the top 5 posts to reply to today.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 1, task_key: 'reddit_post_d1',
    task_title: 'Post Your Origin Story on Reddit',
    task_description: 'Write a "why I built this" post for r/indiehackers using the Vulnerable Founder template. Real story, zero pitch.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 1, task_key: 'reply_leads_d1',
    task_title: 'Reply to Your 5 Saved Posts',
    task_description: 'Go back to User Finder and reply to every post you saved. Be the most helpful person in the thread. No links.',
    task_time: '~15 min', route: '/audience-spotter'
  },
  {
    day: 1, task_key: 'add_goal_d1',
    task_title: 'Set Your 15-Day Goal',
    task_description: 'Add one goal you want to hit by Day 15 — first signup, 10 waitlist users, first paid user. One goal only.',
    task_time: '~3 min', route: '/progress'
  },

  // ── DAY 2 ──────────────────────────────────────────────────────
  {
    day: 2, task_key: 'x_post_d2',
    task_title: 'Tweet Your Problem Statement',
    task_description: 'Generate a hook-format X post about the pain your product solves — not what your product does. Copy and post it.',
    task_time: '~5 min', route: '/post-maker/x'
  },
  {
    day: 2, task_key: 'user_finder_d2',
    task_title: 'Find 5 Fresh Leads',
    task_description: 'Run User Finder with a different search angle than yesterday. Save the top 5 new posts.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 2, task_key: 'reply_leads_d2',
    task_title: 'Reply to Today\'s Saved Posts',
    task_description: 'Reply to the 5 new posts you just saved. Focus on genuinely solving their problem in your reply.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 3 ──────────────────────────────────────────────────────
  {
    day: 3, task_key: 'reddit_post_d3',
    task_title: 'Post a Problem-First Thread',
    task_description: 'Write a Reddit post asking the community if they face the exact problem your product solves. Genuine question, no pitch.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 3, task_key: 'user_finder_d3',
    task_title: 'Search for Your Exact ICP',
    task_description: 'Run User Finder searching for your specific ideal customer type — not just the problem. Save the top 5 posts.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 3, task_key: 'reply_leads_d3',
    task_title: 'Reply to Your ICP Posts',
    task_description: 'Reply to the ICP posts you just found. These are your future users — every reply is a potential conversation.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 4 ──────────────────────────────────────────────────────
  {
    day: 4, task_key: 'x_thread_d4',
    task_title: 'Write a 3-Tweet Thread',
    task_description: 'Generate a short thread: (1) the problem, (2) why existing solutions fail, (3) your approach. No product pitch.',
    task_time: '~10 min', route: '/post-maker/x'
  },
  {
    day: 4, task_key: 'user_finder_d4',
    task_title: 'Find Competitor Complaint Posts',
    task_description: 'Run User Finder searching for complaints about tools your users use today. Save the top 5. These are warm leads.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 4, task_key: 'reply_leads_d4',
    task_title: 'Reply to Competitor Complaint Posts',
    task_description: 'Reply helpfully to competitor complaint posts. Don\'t pitch — just solve their immediate problem.',
    task_time: '~15 min', route: '/audience-spotter'
  },
  {
    day: 4, task_key: 'analytics_d4',
    task_title: 'Check Your First Analytics',
    task_description: 'Open Analytics Buddy. What posts got the most engagement? Note the format and topic — double down on it tomorrow.',
    task_time: '~10 min', route: '/dashboard/results-tracker'
  },

  // ── DAY 5 ──────────────────────────────────────────────────────
  {
    day: 5, task_key: 'ih_post_d5',
    task_title: 'Post a Progress Update on Indie Hackers',
    task_description: 'Write a real update on IH — what you shipped, what you learned, what you\'re struggling with. Honest beats polished.',
    task_time: '~15 min', route: '/post-maker/indiehackers'
  },
  {
    day: 5, task_key: 'user_finder_d5',
    task_title: 'Go Deep in Your Top Subreddit',
    task_description: 'Run User Finder for the subreddit that gave you the best leads so far. Save 5 more posts from there.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 5, task_key: 'reply_leads_d5',
    task_title: 'Reply to All Saved Posts',
    task_description: 'Clear your saved post queue. Reply to every unsaved post. Consistency in replies builds your reputation fast.',
    task_time: '~20 min', route: '/audience-spotter'
  },

  // ── DAY 6 ──────────────────────────────────────────────────────
  {
    day: 6, task_key: 'reddit_contrarian_d6',
    task_title: 'Post a Contrarian Take on Reddit',
    task_description: 'Write a post challenging a common belief in your niche using the Contrarian Insight template. Controversial gets comments.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 6, task_key: 'x_post_d6',
    task_title: 'Tweet a Specific User Win',
    task_description: 'If anyone replied, gave feedback, or signed up — tweet about it with specifics. Real stories beat generic posts every time.',
    task_time: '~5 min', route: '/post-maker/x'
  },
  {
    day: 6, task_key: 'user_finder_d6',
    task_title: 'Find 5 Leads Using a New Keyword',
    task_description: 'Try a completely different search keyword in User Finder today. Fresh angle, fresh leads.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 6, task_key: 'reply_leads_d6',
    task_title: 'Reply to Today\'s Leads',
    task_description: 'Reply to the 5 new posts you found. Keep every reply helpful, specific to their situation.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 7 ──────────────────────────────────────────────────────
  {
    day: 7, task_key: 'analytics_week1_d7',
    task_title: 'Week 1 Analytics Review',
    task_description: 'Open Analytics Buddy and ask: "What worked this week and what should I stop?" Write down 3 insights before closing.',
    task_time: '~10 min', route: '/dashboard/results-tracker'
  },
  {
    day: 7, task_key: 'copilot_week2_d7',
    task_title: 'Ask Co-Pilot for Week 2 Strategy',
    task_description: 'Tell Co-Pilot your goal and what happened this week. Ask: "What should I focus on next week to get closer to my goal?"',
    task_time: '~10 min', route: '/marketing-buddy'
  },
  {
    day: 7, task_key: 'reddit_learnings_d7',
    task_title: 'Post Your Week 1 Learnings',
    task_description: 'Write a transparent post on r/indiehackers about what you learned in your first week of marketing. These always perform well.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },

  // ── DAY 8 ──────────────────────────────────────────────────────
  {
    day: 8, task_key: 'user_finder_d8',
    task_title: 'Find Leads in a New Community',
    task_description: 'Try User Finder on a subreddit you haven\'t used yet. Expand beyond your comfort zone — new community, new audience.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 8, task_key: 'reddit_howto_d8',
    task_title: 'Post a "How I Do X" Guide',
    task_description: 'Write a genuinely useful how-to post about something in your niche using the Deep Useful Breakdown template. No product mention needed.',
    task_time: '~20 min', route: '/post-maker/reddit'
  },
  {
    day: 8, task_key: 'reply_leads_d8',
    task_title: 'Reply to Today\'s Saved Posts',
    task_description: 'Reply to the new community posts you saved. First impressions in a new subreddit matter — be extra helpful.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 9 ──────────────────────────────────────────────────────
  {
    day: 9, task_key: 'x_counterintuitive_d9',
    task_title: 'Tweet a Counterintuitive Lesson',
    task_description: 'Share one thing you believed about marketing that turned out to be completely wrong. Honest, short, punchy.',
    task_time: '~5 min', route: '/post-maker/x'
  },
  {
    day: 9, task_key: 'user_finder_d9',
    task_title: 'Find Posts Asking for Tool Recommendations',
    task_description: 'Run User Finder searching for "recommend a tool for X" or "looking for X solution" posts. These are buyers. Save the top 5.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 9, task_key: 'reply_leads_d9',
    task_title: 'Reply to Tool Recommendation Posts',
    task_description: 'Reply to those posts mentioning your product naturally if it fits — or just be helpful if it doesn\'t. No hard pitching.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 10 ─────────────────────────────────────────────────────
  {
    day: 10, task_key: 'reddit_numbers_d10',
    task_title: 'Post a Real Numbers Update',
    task_description: 'Share real numbers: posts made, replies sent, signups, visitors. Use the Transparent Numbers template. Honesty builds trust.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 10, task_key: 'user_finder_d10',
    task_title: 'Find 5 Leads to Reply To',
    task_description: 'Run User Finder and save 5 posts. Today\'s angle: look for people expressing frustration, not just asking questions.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 10, task_key: 'reply_leads_d10',
    task_title: 'Reply to Frustration Posts',
    task_description: 'Reply to people expressing frustration. Empathize first, then solve. These replies convert to followers and users.',
    task_time: '~15 min', route: '/audience-spotter'
  },
  {
    day: 10, task_key: 'analytics_d10',
    task_title: 'Mid-Point Analytics Check',
    task_description: 'You\'re halfway through. Open Analytics Buddy and compare Week 1 vs Week 2 performance. What changed?',
    task_time: '~10 min', route: '/dashboard/results-tracker'
  },

  // ── DAY 11 ─────────────────────────────────────────────────────
  {
    day: 11, task_key: 'ih_milestone_d11',
    task_title: 'Post a Milestone on Indie Hackers',
    task_description: 'Share a milestone — first reply, first signup, first feedback, first anything. Celebrate publicly. It builds momentum.',
    task_time: '~15 min', route: '/post-maker/indiehackers'
  },
  {
    day: 11, task_key: 'user_finder_d11',
    task_title: 'Find Leads in Your Highest Performing Subreddit',
    task_description: 'Go back to whatever subreddit gave you the best replies or traction. Mine it again with a fresh keyword.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 11, task_key: 'reply_leads_d11',
    task_title: 'Reply to Today\'s Saved Posts',
    task_description: 'Reply to everything you saved. At this point your replies should feel natural — you\'ve done this 10 days in a row.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 12 ─────────────────────────────────────────────────────
  {
    day: 12, task_key: 'copilot_positioning_d12',
    task_title: 'Ask Co-Pilot to Refine Your Messaging',
    task_description: 'Share the feedback and comments you\'ve received so far. Ask Co-Pilot: "How should I update my positioning based on this?"',
    task_time: '~10 min', route: '/marketing-buddy'
  },
  {
    day: 12, task_key: 'reddit_best_format_d12',
    task_title: 'Repost Your Best Performing Format',
    task_description: 'Check what post format got the most engagement. Generate a fresh post using that same format for a different subreddit.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 12, task_key: 'user_finder_d12',
    task_title: 'Find 5 Leads Using Refined Keywords',
    task_description: 'Use the messaging insight from Co-Pilot to search with better, sharper keywords in User Finder today.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 12, task_key: 'reply_leads_d12',
    task_title: 'Reply to Today\'s Leads',
    task_description: 'Reply to today\'s saved posts using your refined positioning. Sharper messaging = better replies.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 13 ─────────────────────────────────────────────────────
  {
    day: 13, task_key: 'x_thread_d13',
    task_title: 'Write a "What I Learned" Thread on X',
    task_description: 'Generate a 4-tweet thread: (1) what you expected, (2) what actually worked, (3) what failed, (4) what\'s next.',
    task_time: '~10 min', route: '/post-maker/x'
  },
  {
    day: 13, task_key: 'user_finder_d13',
    task_title: 'Find Launch-Ready Leads',
    task_description: 'Run User Finder looking for people who recently asked about or discovered tools like yours. They\'re in buying mode.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 13, task_key: 'reply_leads_d13',
    task_title: 'Reply to Launch-Ready Posts',
    task_description: 'Reply to the launch-ready leads you found. If it fits naturally, mention your product. You\'ve earned the right by now.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 14 ─────────────────────────────────────────────────────
  {
    day: 14, task_key: 'ph_copilot_d14',
    task_title: 'Ask Co-Pilot: Ready for Product Hunt?',
    task_description: 'Share your 14-day results with Co-Pilot. Ask if now is the right time to launch on PH and what to prepare.',
    task_time: '~10 min', route: '/marketing-buddy'
  },
  {
    day: 14, task_key: 'reddit_launch_d14',
    task_title: 'Post a Pre-Launch Thread',
    task_description: 'Write a "I\'m launching soon" post using the Launch CTA template. Build anticipation before your final push.',
    task_time: '~15 min', route: '/post-maker/reddit'
  },
  {
    day: 14, task_key: 'user_finder_d14',
    task_title: 'Find 5 More Leads',
    task_description: 'Keep the lead engine running. Run User Finder one more time — different subreddit, different keyword angle.',
    task_time: '~10 min', route: '/audience-spotter'
  },
  {
    day: 14, task_key: 'reply_leads_d14',
    task_title: 'Reply to Today\'s Leads',
    task_description: 'Reply to all saved posts. You\'ve been doing this 14 days — your replies are 10x better than Day 1.',
    task_time: '~15 min', route: '/audience-spotter'
  },

  // ── DAY 15 ─────────────────────────────────────────────────────
  {
    day: 15, task_key: 'analytics_final_d15',
    task_title: 'Final 15-Day Analytics Review',
    task_description: 'Open Analytics Buddy. Full review: what posts performed, what subreddits worked, what to keep doing permanently.',
    task_time: '~10 min', route: '/dashboard/results-tracker'
  },
  {
    day: 15, task_key: 'reddit_final_d15',
    task_title: 'Post Your 15-Day Results',
    task_description: 'Write a full transparent post sharing everything — what you tried, real numbers, what worked. This is your best marketing asset.',
    task_time: '~20 min', route: '/post-maker/reddit'
  },
  {
    day: 15, task_key: 'copilot_next_d15',
    task_title: 'Plan Your Next 15 Days with Co-Pilot',
    task_description: 'Share your full results with Co-Pilot. Ask: "Based on everything, what should my next 15-day marketing plan look like?"',
    task_time: '~10 min', route: '/marketing-buddy'
  },
  {
    day: 15, task_key: 'goal_check_d15',
    task_title: 'Check Your Goal Progress',
    task_description: 'Open Progress and review the goal you set on Day 1. Did you hit it? Track the final number and set your next goal.',
    task_time: '~5 min', route: '/progress'
  }
];

/**
 * Automatically finds and completes a pending task matching the route and title prefix.
 */
export async function autoMarkTask(userId, route, titleStartsWith = null) {
  if (!userId) return;

  try {
    let query = supabase
      .from('user_tasks')
      .select('task_key')
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Robust route matching
    if (route.startsWith('/post-maker')) {
      query = query.ilike('route', '/post-maker%');
    } else {
      query = query.eq('route', route);
    }

    // Optional title matching
    if (titleStartsWith) {
      query = query.ilike('task_title', `${titleStartsWith}%`);
    }

    const { data: tasks } = await query.limit(1);

    if (tasks && tasks.length > 0) {
      await markTaskComplete(userId, tasks[0].task_key, supabase);
      window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { key: tasks[0].task_key } }));
    }
  } catch (err) {
    // Fail silently to avoid interrupting user flows
  }
}