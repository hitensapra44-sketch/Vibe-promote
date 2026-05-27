"use client";

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import NavBar from '../components/landing/navbar';
import Footer from '../components/landing/fottersection';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const LANDING_PAGES_DATA = {
  'ai-marketing-tool': {
    title: 'Best AI Marketing Tool for SaaS Founders & Indie Hackers | Vibe Promote',
    description: 'Automate your SaaS marketing with the best AI marketing tool. Position your app, find high-intent users on Reddit, and write authentic content in seconds.',
    h1: 'The AI Marketing Tool Built for Builders, Not Marketers',
    subheading: 'Stop wasting hours staring at a blank page. Vibe Promote is the AI marketing tool that learns your product, finds your audience, and writes content that actually converts.',
    intro: 'As a founder, your time is best spent building product, not struggling with marketing copy or guessing where your audience hangs out. Vibe Promote acts as your automated marketing department, translating your technical features into high-converting positioning and platform-native content.',
    benefits: [
      'Instant Brand Brain: Drop your URL and let AI extract your core positioning, target audience, and pain points automatically.',
      'High-Intent Lead Discovery: Scan Reddit and Hacker News for people actively asking for solutions to the problems you solve.',
      'Platform-Native Content: Generate Reddit stories, X threads, and LinkedIn posts that sound like a human founder, not a generic chatbot.'
    ],
    faq: [
      { q: 'How does this AI marketing tool learn about my product?', a: 'Vibe Promote builds a custom "Brand Brain" by analyzing your landing page or asking a few simple questions. It uses this context to ensure all generated content and strategy recommendations are highly specific to your niche.' },
      { q: 'Is this just another wrapper around ChatGPT?', a: 'No. Unlike generic AI writers that start from scratch every time, Vibe Promote integrates your product positioning, target audience, and real-time community search to deliver highly targeted, platform-native marketing assets.' }
    ]
  },
  'saas-marketing-tool': {
    title: 'SaaS Marketing Tool for Early-Stage Growth | Vibe Promote',
    description: 'The ultimate SaaS marketing tool for bootstrapped founders. Automate audience discovery, position your product clearly, and track organic growth in one place.',
    h1: 'The Only SaaS Marketing Tool You Need to Get Your First 100 Users',
    subheading: 'No marketing team? No problem. Vibe Promote automates audience discovery, content creation, and growth strategy so you can focus on building.',
    intro: 'Most SaaS marketing tools are built for enterprise marketing teams with massive budgets. Vibe Promote is built specifically for solo founders and indie hackers who need to find their first users, refine their messaging, and post consistently without losing hours of development time.',
    benefits: [
      'Automated Audience Spotting: Find real people discussing the exact pain points your SaaS solves in real-time.',
      'Viral Post Templates: Use proven, high-traction formats optimized for SaaS communities like r/SaaS and Indie Hackers.',
      'Brutally Honest Analytics: Track upvotes, comments, and engagement across platforms and get actionable advice on what to improve.'
    ],
    faq: [
      { q: 'Can I use this SaaS marketing tool if I have zero marketing experience?', a: 'Absolutely. Vibe Promote is designed specifically for technical founders. It removes the guesswork by telling you exactly what to post, where to post, and how to frame your product value.' },
      { q: 'Which SaaS platforms does it support?', a: 'We focus on the platforms where organic SaaS growth actually happens: Reddit, X (Twitter), LinkedIn, and Indie Hackers.' }
    ]
  },
  'indie-hacker-marketing': {
    title: 'Indie Hacker Marketing Guide & Automation Tool | Vibe Promote',
    description: 'Master indie hacker marketing without sounding like a corporate ad. Find your target audience, write authentic founder stories, and build in public.',
    h1: 'Indie Hacker Marketing That Doesn\'t Feel Cringe',
    subheading: 'The developer-friendly way to market your product. Share your journey, find high-intent users, and build in public on autopilot.',
    intro: 'Indie hackers hate traditional marketing—and so do their customers. Vibe Promote helps you write authentic, story-driven content that resonates with builders and developers. No corporate buzzwords, no hype, just real value and transparent updates.',
    benefits: [
      'Build in Public Templates: Turn your milestones, failures, and lessons into high-traction posts for Indie Hackers and Reddit.',
      'Zero-Hype Copywriting: Our AI is trained to write in a casual, founder-to-founder tone that builds trust and avoids the spam filter.',
      'Community-First Discovery: Find developers and creators who are actively looking for workarounds to the problems your tool solves.'
    ],
    faq: [
      { q: 'Why is indie hacker marketing different?', a: 'Indie hacker communities value transparency, vulnerability, and technical depth. Traditional marketing pitches get downvoted or deleted. Vibe Promote helps you share your journey in a way that earns respect and users.' },
      { q: 'How does the Post Maker help with building in public?', a: 'It includes specific templates like "The Milestone Full Breakdown" and "The Failure Autopsy" designed to turn your real building journey into engaging, high-value community content.' }
    ]
  },
  'reddit-marketing-tool': {
    title: 'Reddit Marketing Tool for SaaS Founders | Vibe Promote',
    description: 'Find customers on Reddit without getting banned. Scan subreddits for buying intent, get suggested replies, and write high-value posts.',
    h1: 'The Reddit Marketing Tool That Actually Works (And Won\'t Get You Banned)',
    subheading: 'Scan subreddits for high-intent buying signals, get natural suggested replies, and write value-first posts that drive organic traffic.',
    intro: 'Reddit is the goldmine for early-stage SaaS growth, but it is incredibly protective. If you post a generic ad, you will get banned instantly. Vibe Promote helps you find real conversations where people are asking for help, and drafts helpful, non-promotional replies that respect subreddit rules.',
    benefits: [
      'Intent-Based Subreddit Scanning: Monitor r/SaaS, r/startups, and other communities for users describing problems you solve.',
      'Natural Suggested Replies: Get AI-drafted replies that focus on solving the user\'s problem first, mentioning your product only as a side note.',
      'Safe Promotion: Learn the best times to post, which subreddits to target, and how to structure your posts to earn upvotes and saves.'
    ],
    faq: [
      { q: 'Will using a Reddit marketing tool get my account banned?', a: 'Not if you use Vibe Promote. We do not automate posting or spam subreddits. We find relevant threads and help you write high-value, helpful replies that comply with community guidelines.' },
      { q: 'Which subreddits should I target for my SaaS?', a: 'Vibe Promote automatically suggests relevant subreddits based on your Brand Brain, such as r/SaaS, r/startups, r/SideProject, and r/indiehackers.' }
    ]
  },
  'marketing-copilot': {
    title: 'AI Marketing Copilot for Startups & Founders | Vibe Promote',
    description: 'Meet your 24/7 AI marketing copilot. Get personalized growth strategies, landing page headlines, and platform-specific advice based on your Brand Brain.',
    h1: 'Your 24/7 AI Marketing Copilot',
    subheading: 'An AI strategist that actually knows your product. Get personalized growth tactics, copywriting ideas, and positioning advice on demand.',
    intro: 'Generic AI tools give generic advice. Vibe Promote is the only AI marketing copilot that is deeply integrated with your Brand Brain. It knows your target audience, your core value proposition, and your competitors, allowing it to give highly specific, actionable marketing guidance.',
    benefits: [
      'Personalized Strategy: Ask your copilot how to pitch on Reddit, write onboarding emails, or differentiate from competitors.',
      'Context-Aware Copywriting: Generate landing page headlines, email subject lines, and social hooks that match your exact brand voice.',
      'Data-Driven Insights: Let your copilot analyze your current analytics and suggest concrete changes to your content strategy.'
    ],
    faq: [
      { q: 'How is this different from standard AI chatbots?', a: 'Standard chatbots start from zero every time and do not know your product. Your Vibe Promote copilot has read your Brand Brain and has access to your performance data, giving you highly tailored advice.' },
      { q: 'Can the copilot help me write my landing page copy?', a: 'Yes. You can ask the copilot to generate headlines, value propositions, and feature descriptions optimized for your target audience.' }
    ]
  },
  'startup-marketing-tool': {
    title: 'Startup Marketing Tool for Bootstrapped Founders | Vibe Promote',
    description: 'The essential startup marketing tool to find product-market fit. Automate audience discovery, refine your positioning, and write high-converting content.',
    h1: 'The Startup Marketing Tool Built for Lean Teams',
    subheading: 'No marketing budget? No problem. Vibe Promote helps bootstrapped startups find product-market fit, refine their messaging, and acquire users organically.',
    intro: 'Early-stage startups do not need complex enterprise marketing suites. They need to talk to users, validate their positioning, and get consistent visibility. Vibe Promote is the lean startup marketing tool designed to automate these exact workflows in under 5 minutes a day.',
    benefits: [
      'Positioning Validation: Test different value propositions and taglines to see what resonates best with your target audience.',
      'Organic Lead Generation: Find and engage with potential users on Reddit and Hacker News who are actively experiencing the pain you solve.',
      'Consistent Content Engine: Keep your startup visible on social channels with high-traction, founder-led content formats.'
    ],
    faq: [
      { q: 'Is this startup marketing tool suitable for pre-launch products?', a: 'Yes. It is perfect for pre-launch. You can use the User Finder to do market research, find early beta testers, and build an email waitlist before you write a single line of code.' },
      { q: 'How much time does it take to use Vibe Promote daily?', a: 'We designed the workflows to take under 5 minutes a day. You can review new leads, generate a post, and check your progress quickly.' }
    ]
  },
  'bootstrapped-founder-marketing': {
    title: 'Bootstrapped Founder Marketing Playbook & Tools | Vibe Promote',
    description: 'The ultimate marketing playbook for bootstrapped founders. Learn how to find users, write authentic content, and grow your SaaS on a $0 budget.',
    h1: 'The Bootstrapped Founder Marketing Playbook',
    subheading: 'How to grow your SaaS to $10k MRR on a $0 marketing budget. Find high-intent users, write authentic content, and build a consistent growth engine.',
    intro: 'Bootstrapped founders cannot afford to waste money on paid ads or expensive marketing agencies. You need to leverage organic channels like Reddit, X, and Indie Hackers. Vibe Promote gives you the exact tools and templates to execute a high-converting organic marketing playbook consistently.',
    benefits: [
      'Zero-Budget Lead Generation: Find and reply to users who are actively looking for alternatives to expensive, clunky competitors.',
      'Founder-Led Storytelling: Turn your daily building struggles, milestones, and lessons into content that builds a loyal audience.',
      'Actionable Growth Checklist: Follow a simple, step-by-step daily marketing plan designed to build consistency and momentum.'
    ],
    faq: [
      { q: 'Can I really grow my SaaS with a $0 marketing budget?', a: 'Yes. Most successful indie SaaS products grew entirely through organic community engagement, building in public, and word-of-mouth. Vibe Promote automates the painful parts of this playbook.' },
      { q: 'How does the daily marketing plan work?', a: 'We provide a Task Widget that gives you 3-4 highly focused, platform-specific marketing tasks every day to help you build a consistent growth habit.' }
    ]
  },
  'how-to-market-your-saas': {
    title: 'How to Market Your SaaS: The Organic Growth Guide | Vibe Promote',
    description: 'Learn how to market your SaaS organically. Step-by-step guide to finding your target audience, writing high-converting posts, and building in public.',
    h1: 'How to Market Your SaaS Without a Marketing Team',
    subheading: 'A step-by-step guide to organic SaaS growth. Learn how to find your target audience, write authentic content, and build a consistent marketing habit.',
    intro: 'The biggest mistake founders make is building in silence and hoping users will magically find them. Marketing your SaaS does not have to be complicated or expensive. By focusing on high-intent communities and sharing your authentic journey, you can build a highly effective organic growth engine.',
    benefits: [
      'Step 1: Define Your Brand Brain: Clarify your core value proposition, target audience, and the exact pain points you solve.',
      'Step 2: Find High-Intent Conversations: Monitor subreddits and developer forums for people actively discussing the problem you solve.',
      'Step 3: Share Value-First Content: Write platform-native posts that teach, share lessons, or tell honest stories instead of pitching.'
    ],
    faq: [
      { q: 'What is the most effective organic channel for SaaS?', a: 'For early-stage SaaS, Reddit and Hacker News are incredibly powerful because you can find users who are actively experiencing the problem right now. X and LinkedIn are great for building a long-term personal brand.' },
      { q: 'How often should I post about my SaaS?', a: 'Consistency is more important than frequency. Posting 3-5 times a week with high-value, authentic content is much better than spamming generic updates daily.' }
    ]
  },
  'best-ai-marketing-tools-for-founders': {
    title: 'Best AI Marketing Tools for Founders in 2026 | Vibe Promote',
    description: 'Compare the best AI marketing tools for solo founders and indie hackers. Learn why Vibe Promote is the top choice for organic SaaS growth.',
    h1: 'The Best AI Marketing Tools for Solo Founders & Indie Hackers',
    subheading: 'Stop wasting time on generic AI writers. Compare the top AI marketing tools and learn why a product-aware co-pilot is the key to organic growth.',
    intro: 'Most AI marketing tools are designed for professional copywriters or social media managers. They generate generic, high-volume content that sounds robotic and fails to convert. For solo founders, the best AI marketing tool is one that deeply understands your product, target audience, and organic growth channels.',
    benefits: [
      'Product-Aware AI: Vibe Promote builds a custom Brand Brain so it never writes generic, off-topic marketing copy.',
      'Community-First Focus: Unlike tools that focus on scheduling posts to empty social accounts, we help you find and join active conversations.',
      'Founder-Led Voice: Our templates are specifically optimized to write in an authentic, casual, founder-to-founder tone.'
    ],
    faq: [
      { q: 'Why do standard AI writers fail for SaaS founders?', a: 'Standard AI writers do not have context about your product, target audience, or competitors. They generate generic marketing fluff that sophisticated communities like Reddit and Hacker News instantly reject.' },
      { q: 'What makes Vibe Promote the best choice for solo founders?', a: 'Vibe Promote combines product-aware AI, real-time community lead discovery, and platform-specific templates into a single, streamlined workflow that takes under 5 minutes a day.' }
    ]
  }
};

export default function SeoLandingPage() {
  const location = useLocation();
  const path = location.pathname.substring(1);
  const data = LANDING_PAGES_DATA[path];

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', data.description);
      }
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": `https://vibepromote.tech/${path}`,
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": data.faq.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins relative overflow-hidden">
      <GridBackground />
      <ParticleBackground />
      <NavBar />

      {/* Inject JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <header className="space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">SEO Growth Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight" style={{ letterSpacing: '-1.5px' }}>
            {data.h1}
          </h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {data.subheading}
          </p>
        </header>

        <section className="prose prose-invert max-w-none mb-16 space-y-6">
          <p className="text-base text-foreground/70 leading-relaxed">
            {data.intro}
          </p>

          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 space-y-6 my-8">
            <h2 className="text-xl font-bold text-white">Key Advantages for Founders</h2>
            <div className="space-y-4">
              {data.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-foreground/10 pt-16 mb-16">
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {data.faq.map((item, i) => (
              <div key={i} className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 space-y-2">
                <h3 className="text-base font-bold text-white">{item.q}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Linking Hub */}
        <section className="border-t border-foreground/10 pt-16">
          <h2 className="text-lg font-bold text-white mb-6">Explore More Marketing Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(LANDING_PAGES_DATA).map(([key, val]) => {
              if (key === path) return null;
              return (
                <Link 
                  key={key} 
                  to={`/${key}`}
                  className="p-4 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
                >
                  <span className="text-xs font-bold text-foreground/80 group-hover:text-white transition-colors">
                    {val.h1.split(' ').slice(0, 5).join(' ')}...
                  </span>
                  <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}