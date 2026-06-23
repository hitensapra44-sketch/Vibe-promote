"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Calendar, User, Clock, BookOpen } from 'lucide-react';
import NavBar from '../components/landing/navbar';
import Footer from '../components/landing/fottersection';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';
import SEO, { getBreadcrumbSchema } from '../components/shared/SEO';
import Breadcrumbs from '../components/shared/Breadcrumbs';

export const BLOG_POSTS = [
  {
    slug: 'how-i-got-16-downloads-in-8-months',
    title: 'How I Spent 8 Months Building a SaaS and Got Exactly 16 Users',
    description: 'The brutally honest story of my first SaaS failure, and the exact marketing lessons that changed how I build products forever.',
    date: 'May 20, 2026',
    readTime: '5 min read',
    author: 'Jake',
    category: 'Founder Story',
    excerpt: 'I did what every developer does: I locked myself in a room, wrote code for 12 hours a day, and assumed that if I built it, they would come. They didn\'t. Here is the autopsy of my first SaaS failure.',
    tags: ['SaaS', 'Indie Hacker', 'Lessons Learned']
  },
  {
    id: 'reddit-saas-playbook',
    slug: 'how-to-find-saas-users-on-reddit-without-getting-banned',
    title: 'How to Find Your First 100 SaaS Users on Reddit (Without Getting Banned)',
    description: 'Reddit is a goldmine for early-stage SaaS growth, but only if you know the rules. Learn the exact value-first reply formula that drives organic signups.',
    purpose: "Drive high-quality traffic and signups from Reddit organically.",
    bestFor: ["Traffic", "Leads", "Validation"],
    expectedOutcome: ["High Signups", "Medium Upvotes"],
    worksBestIn: ["r/SaaS", "r/startups", "r/indiehackers"],
    intro: 'Reddit is the single most powerful organic channel for early-stage SaaS growth. But it is also the most protective. If you post a generic ad, you will get banned instantly. Here is the exact playbook we used to find high-intent users and drive consistent traffic without spending a dime.',
    benefits: [
      'Find high-intent conversations where people are actively crying for help.',
      'Write replies that focus on solving the user\'s problem first, mentioning your product only as a side note.',
      'Structure your posts to earn upvotes and saves instead of downvotes and bans.'
    ],
    faq: [
      { q: 'Will this get my Reddit account banned?', a: 'No. We do not automate posting or spam subreddits. We find relevant threads and help you write high-value, helpful replies that comply with community guidelines.' },
      { q: 'Which subreddits should I target?', a: 'Focus on subreddits where your target audience hangs out, such as r/SaaS, r/startups, r/SideProject, and r/indiehackers.' }
    ]
  },
  {
    id: 'saas-positioning-guide',
    title: 'SaaS Positioning: How to Explain Your Product So People Actually Buy It',
    description: 'Stop using generic startup jargon. Learn how to clarify your value proposition, define your target audience, and write copy that converts.',
    h1: 'SaaS Positioning That Converts',
    subheading: 'Your product is good, but if your landing page is vague, you are losing users. Learn how to sharpen your messaging in 3 simple steps.',
    intro: 'The biggest mistake founders make is explaining their product in terms of features instead of outcomes. Customers don\'t care about your tech stack; they care about their own problems. Vibe Promote helps you translate your technical features into clear, high-converting positioning.',
    benefits: [
      'Clarify your core value proposition and unique differentiator.',
      'Define your ideal customer profile (ICP) with laser precision.',
      'Write landing page headlines and hooks that instantly resonate.'
    ],
    faq: [
      { q: 'What is the difference between a tagline and a positioning statement?', a: 'A tagline is a short, catchy phrase focused on the outcome. A positioning statement is a concise explanation of who you help, what problem you solve, and why they choose you.' },
      { q: 'How often should I update my positioning?', a: 'You should review your positioning whenever your product, audience, or competitors change. Keep it in sync with your latest features.' }
    ]
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-24">
          
          <header className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Founder Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ letterSpacing: '-1.5px' }}>
              Marketing Resources & Guides
            </h1>
            <p className="text-zinc-500 text-sm">
              Actionable, zero-hype playbooks to help you grow your SaaS organically.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Landing Pages Links */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">SEO Growth Hub</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Deep-dive guides on AI marketing, SaaS growth, and platform-specific strategies.
              </p>
              <div className="space-y-3">
                {[
                  { path: '/ai-marketing-tool', label: 'AI Marketing Tool Guide' },
                  { path: '/saas-marketing-tool', label: 'SaaS Marketing Tool Guide' },
                  { path: '/indie-hacker-marketing', className: 'text-zinc-500 hover:text-orange-500 transition-colors', label: 'Indie Hacker Marketing' },
                  { path: '/reddit-marketing-tool', label: 'Reddit Marketing Tool' },
                  { path: '/marketing-copilot', label: 'AI Marketing Copilot' },
                  { path: '/startup-marketing-tool', label: 'Startup Marketing Tool' },
                  { path: '/bootstrapped-founder-marketing', label: 'Bootstrapped Founder Marketing' },
                  { path: '/how-to-market-your-saas', label: 'How to Market Your SaaS' },
                  { path: '/best-ai-marketing-tools-for-founders', label: 'Best AI Marketing Tools' }
                ].map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="flex items-center justify-between p-3 rounded-xl border border-foreground/5 bg-foreground/5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-xs font-bold text-foreground/80 group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Blog Posts List */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white px-2">Latest Articles</h2>
              <div className="space-y-4">
                {BLOG_POSTS.map((post) => (
                  <div 
                    key={post.slug}
                    className="p-6 rounded-2xl border border-foreground/10 bg-foreground/5 hover:border-primary/30 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date || 'May 26, 2026'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime || '5 min read'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {post.category || 'SaaS Growth'}
                      </span>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        Read Article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}