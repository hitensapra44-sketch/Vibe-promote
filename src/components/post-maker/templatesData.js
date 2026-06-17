"use client";

export const templatesData = {
  Reddit: [
    {
      id: "reddit-vulnerable-founder",
      name: "The Vulnerable Founder",
      description: "A founder story format designed to generate discussion, empathy, and trust.",
      purpose: "Build deep trust, generate comments, and establish authentic founder authority.",
      bestFor: ["Comments", "Engagement", "Validation", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes", "Low Direct Conversions"],
      worksBestIn: ["r/SaaS", "r/startups", "r/indiehackers", "r/SideProject"],
      structure: [
        {
          name: "Hook",
          description: "Open with a painful, highly specific founder moment.",
          example: '"I spent 6 months building this and got zero users."'
        },
        {
          name: "Context",
          description: "Explain what you built and who it is for.",
          example: '"I built an AI tool for SaaS founders to automate their marketing."'
        },
        {
          name: "Failure",
          description: "Describe what went wrong or the mistake you made.",
          example: '"I focused entirely on writing code instead of talking to users."'
        },
        {
          name: "Lesson",
          description: "Share the key insight or what you learned from the failure.",
          example: '"Marketing matters much earlier than I originally thought."'
        },
        {
          name: "Question",
          description: "End with a genuine, open-ended community question.",
          example: '"What mistake slowed your startup down the most?"'
        }
      ],
      whyItWorks: "Relatability drives engagement. Reddit users are allergic to self-promotion but love vulnerability and lessons learned from real failures.",
      difficulty: "Medium",
      difficultyExplanation: "Requires sharing a real personal mistake or struggle honestly.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Looks like a genuine founder discussion rather than marketing.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1u1tbml/i_just_crossed_0000_mrr_after_one_month_heres_how/",
      formula: ["Painful Moment", "Context", "Failure", "Lesson", "Question"]
    },
    {
      id: "reddit-transparent-numbers",
      name: "The Transparent Numbers Update",
      description: "A metrics-driven update sharing exact growth numbers and the tactics behind them.",
      purpose: "Establish high credibility, drive profile visits, and generate high-quality leads.",
      bestFor: ["Leads", "Traffic", "Authority", "Engagement"],
      expectedOutcome: ["High Profile Visits", "Medium Comments", "High Upvotes"],
      worksBestIn: ["r/SaaS", "r/indiehackers", "r/startups"],
      structure: [
        {
          name: "Hook",
          description: "State a surprising or impressive metric milestone and the timeframe.",
          example: '"We hit $4,200 MRR in 35 days with $0 ad spend. Here is the breakdown."'
        },
        {
          name: "The Setup",
          description: "Briefly explain what the product is and the starting point.",
          example: '"We launched Vibe Promote last month to help indie hackers find users on Reddit."'
        },
        {
          name: "What Worked",
          description: "List 2-3 specific, actionable tactics with numbers.",
          example: '"1. Answering 5 high-intent Reddit posts daily. 2. Sharing our build journey on X."'
        },
        {
          name: "What Failed",
          description: "Share what didn't work to maintain transparency and trust.",
          example: '"Cold emailing was a complete waste of time for us — 0% conversion rate."'
        },
        {
          name: "Next Steps",
          description: "Outline your next milestone goal and how you plan to reach it.",
          example: '"Our next goal is $10k MRR by doubling down on community-led growth."'
        }
      ],
      whyItWorks: "Radical transparency is highly valued. Real numbers and transparent methodology build instant trust and encourage saves.",
      difficulty: "Hard",
      difficultyExplanation: "Requires having real metrics, data, and specific lessons to share.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Highly valuable, but must ensure it doesn't read as a pure brag.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1u1tbml/i_just_crossed_0000_mrr_after_one_month_heres_how/",
      formula: ["Metric Hook", "Setup", "What Worked", "What Failed", "Next Steps"]
    },
    {
      id: "reddit-contrarian-insight",
      name: "The Contrarian Insight",
      description: "A bold, opinionated post challenging conventional wisdom in your industry.",
      purpose: "Spark intense discussion, generate comments, and build thought leadership.",
      bestFor: ["Comments", "Authority", "Engagement", "Validation"],
      expectedOutcome: ["High Comments", "Medium Upvotes", "Low Direct Conversions"],
      worksBestIn: ["r/SaaS", "r/startups", "r/Marketing"],
      structure: [
        {
          name: "Hook",
          description: "State a bold, controversial opinion that goes against common advice.",
          example: '"Unpopular opinion: Building in public is a waste of time for 90% of founders."'
        },
        {
          name: "The Mainstream View",
          description: "Acknowledge what everyone else says and why they say it.",
          example: '"Everyone tells you to share every milestone and tweet daily to build hype."'
        },
        {
          name: "The Reality",
          description: "Explain why the mainstream view is wrong based on your experience.",
          example: '"In reality, it creates an echo chamber of other founders, not actual buyers."'
        },
        {
          name: "What to Do Instead",
          description: "Provide a practical, alternative approach that actually works.",
          example: '"Spend that time finding high-intent conversations where people are crying for help."'
        },
        {
          name: "Invitation",
          description: "Invite the community to disagree or share their thoughts.",
          example: '"Change my mind. Where am I wrong?"'
        }
      ],
      whyItWorks: "Tension drives engagement. Challenging conventional wisdom forces readers to stop, think, and reply with their own stance.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible opinion and clear reasoning.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on industry ideas and strategy rather than pitching a product.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1tnnyd4/reality_check_no_one_is_going_to_pay_for_your/",
      formula: ["Contrarian Hook", "Mainstream View", "The Reality", "Alternative", "Invitation"]
    }
  ],
  X: [
    {
      id: "x-tactical-one-liner",
      name: "The Tactical One-Liner",
      description: "A short, punchy, high-impact post sharing a single actionable insight.",
      purpose: "Drive retweets, bookmarks, and profile visits.",
      bestFor: ["Traffic", "Engagement", "Authority"],
      expectedOutcome: ["High Retweets", "High Bookmarks", "Medium Profile Visits"],
      worksBestIn: ["X / Twitter"],
      structure: [
        {
          name: "Hook",
          description: "A bold, clear statement of a result or insight.",
          example: '"How to get your first 10 SaaS users in 48 hours without spending a dime:"'
        },
        {
          name: "The Tactic",
          description: "Explain the exact, simple step-by-step action.",
          example: '"1. Go to Reddit. 2. Search your core problem. 3. Reply with genuine help, not a pitch."'
        },
        {
          name: "The Proof",
          description: "Provide a quick metric or proof point.",
          example: '"This exact playbook got us our first 12 signups in 2 days."'
        },
        {
          name: "Takeaway",
          description: "End with a short, memorable rule or call to action.",
          example: '"Stop building in silence. Go help someone today."'
        }
      ],
      whyItWorks: "X rewards high signal-to-noise ratio. Short, highly actionable tips get bookmarked and shared instantly.",
      difficulty: "Easy",
      difficultyExplanation: "Can be written in under 5 minutes with a clear tip.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Provides immediate value first, making any soft mention feel earned.",
      realExampleUrl: "https://twitter.com",
      formula: ["Insight Hook", "Tactic", "Proof", "Takeaway"]
    },
    {
      id: "x-thread-hook",
      name: "The Thread Playbook",
      description: "A multi-post thread breaking down a complete process or case study.",
      purpose: "Build massive authority, drive bookmarks, and gain followers.",
      bestFor: ["Authority", "Traffic", "Leads", "Engagement"],
      expectedOutcome: ["High Bookmarks", "High Follows", "Medium Comments"],
      worksBestIn: ["X / Twitter"],
      structure: [
        {
          name: "Hook",
          description: "A compelling opening tweet with a big result and a thread emoji.",
          example: '"We analyzed 1,000 Reddit posts to find the perfect reply formula. Here is the exact playbook: 🧵"'
        },
        {
          name: "The Problem",
          description: "Set up the common mistake people make.",
          example: '"Most founders drop a link and get banned instantly. It is a waste of time."'
        },
        {
          name: "Step-by-Step",
          description: "Break down the solution into 3-4 clear, self-contained tweets.",
          example: '"Step 1: Solve the problem first. Step 2: Keep it casual. Step 3: Soft mention only."'
        },
        {
          name: "The Conclusion",
          description: "Summarize the main lesson and add a soft CTA.",
          example: '"If you want to automate this, we built Vibe Promote to do it for you. Link in bio."'
        }
      ],
      whyItWorks: "Threads get 3x more reach than single posts on X. Bookmarks are a massive algorithmic ranking signal.",
      difficulty: "Hard",
      difficultyExplanation: "Requires structuring a complete, high-value guide across multiple posts.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "The value must be extremely high to justify the soft pitch at the end.",
      realExampleUrl: "https://twitter.com",
      formula: ["Thread Hook", "Problem", "Steps", "Conclusion"]
    }
  ],
  Threads: [
    {
      id: "threads-relatable-moment",
      name: "The Relatable Moment",
      description: "A short, conversational post about a shared frustration in your niche.",
      purpose: "Generate friendly discussion, replies, and build a relatable brand.",
      bestFor: ["Comments", "Engagement", "Validation"],
      expectedOutcome: ["High Comments", "Medium Likes", "Low Direct Conversions"],
      worksBestIn: ["Threads"],
      structure: [
        {
          name: "Hook",
          description: "A short, highly relatable observation about a common pain point.",
          example: '"Nothing hurts more than spending 3 weeks on a feature no one uses."'
        },
        {
          name: "The Feeling",
          description: "Expand on the feeling or situation casually.",
          example: '"You think it is a game-changer, launch it, and... absolute silence. Ngl it is brutal."'
        },
        {
          name: "The Solution",
          description: "Mention how you are solving or handling it now.",
          example: '"We started using Vibe Promote to talk to users before coding. Saved us so much time."'
        },
        {
          name: "Question",
          description: "End with a casual question to invite replies.",
          example: '"How do you validate features before building?"'
        }
      ],
      whyItWorks: "Threads is highly conversational. Relatable, low-ego posts feel like a text message to a friend, which drives replies.",
      difficulty: "Easy",
      difficultyExplanation: "Very casual tone, can be written quickly.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Feels like a personal reflection rather than a marketing pitch.",
      realExampleUrl: "https://threads.net",
      formula: ["Relatable Hook", "The Feeling", "The Solution", "Question"]
    }
  ],
  "Indie Hackers": [
    {
      id: "ih-milestone-breakdown",
      name: "The Milestone Full Breakdown",
      description: "A transparent, detailed breakdown of a business milestone and the exact steps behind it.",
      purpose: "Build high authority, drive traffic, and get feedback from other builders.",
      bestFor: ["Authority", "Traffic", "Feedback", "Leads"],
      expectedOutcome: ["High Upvotes", "Medium Comments", "High Profile Visits"],
      worksBestIn: ["Indie Hackers"],
      structure: [
        {
          name: "Headline",
          description: "State the exact milestone and the timeframe clearly.",
          example: '"How we hit $2,500 MRR in 3 months with Vibe Promote"'
        },
        {
          name: "The Journey",
          description: "Briefly share the starting point and the core problem you solved.",
          example: '"We started with just a simple landing page and zero budget. Here is what worked:"'
        },
        {
          name: "The Playbook",
          description: "Provide a detailed, step-by-step breakdown of your growth channels.",
          example: '"1. Reddit community engagement. 2. Building in public on X. 3. Direct founder outreach."'
        },
        {
          name: "The Mistakes",
          description: "Share what went wrong or what you would skip if starting over.",
          example: '"We wasted 2 weeks on paid ads before realizing organic community was our goldmine."'
        },
        {
          name: "Ask",
          description: "End with a question or ask for feedback from the community.",
          example: '"What is your primary acquisition channel right now? Would love to compare notes."'
        }
      ],
      whyItWorks: "The Indie Hackers community values transparency and actionable playbooks. Sharing real numbers and mistakes builds massive trust.",
      difficulty: "Hard",
      difficultyExplanation: "Requires having a real milestone and detailed steps to share.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Highly valuable, but must ensure it focuses on sharing lessons rather than just bragging.",
      realExampleUrl: "https://www.indiehackers.com",
      formula: ["Milestone Headline", "The Journey", "The Playbook", "The Mistakes", "Ask"]
    }
  ]
};