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
      bestFor: ["Authority", "Validation", "Traffic"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["Indie Hackers"],
      structure: [
        {
          name: "Milestone",
          description: "Headline milestone plus time taken.",
          example: '"We hit $10k MRR in 12 months. Here is the full breakdown."'
        }
      ],
      whyItWorks: "Indie Hackers community runs on transparency and real numbers.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Keep it focused on the journey, not a hard pitch.",
      realExampleUrl: "https://www.indiehackers.com",
      formula: ["Milestone", "The Journey", "Lessons", "CTA"]
    }
  ]
};

export const subredditTemplates = {
  "SaaS": [
    {
      id: "reddit-saas-milestone",
      name: "Personal Milestone/Validation Story",
      description: "Share a milestone or validation story with proof of a metric/win.",
      purpose: "Build credibility and share real SaaS metrics.",
      bestFor: ["Authority", "Validation", "Traffic"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SaaS"],
      structure: [
        {
          name: "Hook",
          description: "Emotional 'doesn't feel real' hook + proof of a metric/win.",
          example: '"I just crossed $5,000 MRR after one month. It still doesn\'t feel real."'
        }
      ],
      whyItWorks: "SaaS founders love real numbers and validation stories.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the journey, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1u1tbml/i_just_crossed_0000_mrr_after_one_month_heres_how/",
      formula: ["Emotional Hook", "Metric Proof", "The Journey", "Lessons", "CTA"]
    },
    {
      id: "reddit-saas-antihype",
      name: "Reality Check / Anti-Hype",
      description: "Bold contrarian claim about a common SaaS myth + evidence.",
      purpose: "Challenge conventional wisdom and spark discussion.",
      bestFor: ["Engagement", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/SaaS"],
      structure: [
        {
          name: "Hook",
          description: "Bold contrarian claim about a common SaaS myth + evidence.",
          example: '"Unpopular opinion: Building in public is a waste of time for 90% of SaaS founders."'
        }
      ],
      whyItWorks: "Contrarian hooks drive high engagement and debate.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible opinion.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on industry ideas and strategy.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1tnnyd4/reality_check_no_one_is_going_to_pay_for_your/",
      formula: ["Contrarian Hook", "Evidence", "The Reframe", "CTA"]
    },
    {
      id: "reddit-saas-discovery",
      name: "Channel/Growth Discovery Story",
      description: "Share an unexpected growth channel discovery.",
      purpose: "Share tactical growth insights.",
      bestFor: ["Traffic", "Authority"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SaaS"],
      structure: [
        {
          name: "Hook",
          description: '"I accidentally discovered X channel was working."',
          example: '"I accidentally discovered that answering questions on Reddit was driving 80% of our signups."'
        }
      ],
      whyItWorks: "Tactical growth wins are highly valued by SaaS builders.",
      difficulty: "Easy",
      difficultyExplanation: "Simple storytelling format.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the tactic, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/SaaS/comments/1tsam1y/i_accidentally_discovered_that_chatgpt_was/",
      formula: ["Discovery Hook", "The Tactic", "The Result", "CTA"]
    }
  ],
  "startups": [
    {
      id: "reddit-startups-cautionary",
      name: "Cautionary Tale / External Setback",
      description: "Dramatic loss + reflection, 'I will not promote.'",
      purpose: "Share a hard lesson and build deep trust.",
      bestFor: ["Authority", "Validation"],
      expectedOutcome: ["High Upvotes", "High Comments"],
      worksBestIn: ["r/startups"],
      structure: [
        {
          name: "Hook",
          description: "Dramatic loss + reflection, 'I will not promote.'",
          example: '"Google just killed my $1M ARR startup because of a single API change. I will not promote anything here, just sharing the lesson."'
        }
      ],
      whyItWorks: "Vulnerability and hard lessons build massive trust.",
      difficulty: "Hard",
      difficultyExplanation: "Requires a real, painful setback story.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Radical transparency, no promotion.",
      realExampleUrl: "https://www.reddit.com/r/startups/comments/1twro01/google_just_killed_my_1m_arr_startup_because_a/",
      formula: ["Dramatic Hook", "The Setback", "The Lesson", "CTA"]
    },
    {
      id: "reddit-startups-mythbusting",
      name: "Contrarian Myth-Busting",
      description: "'[common belief] is like [analogy]' + debate.",
      purpose: "Challenge startup myths and spark debate.",
      bestFor: ["Engagement", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/startups"],
      structure: [
        {
          name: "Hook",
          description: "'[common belief] is like [analogy]' + debate.",
          example: '"Founding a tech startup to get rich is like buying a lottery ticket with extra steps."'
        }
      ],
      whyItWorks: "Analogies and contrarian takes drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible analogy.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on industry ideas and strategy.",
      realExampleUrl: "https://www.reddit.com/r/startups/comments/1tm33jr/founding_a_tech_startup_to_get_rich_is_like/",
      formula: ["Analogy Hook", "The Argument", "The Debate", "CTA"]
    },
    {
      id: "reddit-startups-critique",
      name: "Industry Slop Critique",
      description: "Diagnosis of a trend + examples + ask for alternatives.",
      purpose: "Critique industry trends and ask for community input.",
      bestFor: ["Engagement", "Feedback"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/startups"],
      structure: [
        {
          name: "Hook",
          description: "Diagnosis of a trend + examples + ask for alternatives.",
          example: '"What is up with the absolute slop coming out of YC these days?"'
        }
      ],
      whyItWorks: "Critiques of popular trends drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple opinion-based format.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on industry trends.",
      realExampleUrl: "https://www.reddit.com/r/startups/comments/1th2mr2/what_is_up_with_the_absolute_slop_from_yc_these/",
      formula: ["Critique Hook", "The Trend", "The Ask", "CTA"]
    }
  ],
  "SideProject": [
    {
      id: "reddit-sideproject-demo",
      name: "Fun/Playful Build + Demo",
      description: "'I built [quirky/fun thing]' + invite feedback/roast.",
      purpose: "Showcase a fun build and get feedback.",
      bestFor: ["Feedback", "Awareness"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SideProject"],
      structure: [
        {
          name: "Hook",
          description: "'I built [quirky/fun thing]' + invite feedback/roast.",
          example: '"I built a free full-length movie streaming site for my friends. Roast my UI."'
        }
      ],
      whyItWorks: "Playful builds and roasts drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple showcase format.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the build, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/SideProject/comments/1tdf6hr/i_built_a_free_fulllength_nsfw_movie_streaming/",
      formula: ["Build Hook", "The Demo", "The Roast", "CTA"]
    },
    {
      id: "reddit-sideproject-update",
      name: "Prototype-to-Product Update",
      description: "'X weeks ago I posted [prototype], here's the finished version.'",
      purpose: "Share progress and build a loyal audience.",
      bestFor: ["Validation", "Traffic"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SideProject"],
      structure: [
        {
          name: "Hook",
          description: "'X weeks ago I posted [prototype], here's the finished version.'",
          example: '"Update: 1 month ago I posted my prototype here and got roasted. Here is the finished version."'
        }
      ],
      whyItWorks: "Updates build a loyal audience over time.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a previous prototype or milestone.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the progress, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/SideProject/comments/1t3uytg/update_1_month_ago_i_posted_my_prototype_here_and/",
      formula: ["Update Hook", "The Progress", "The Result", "CTA"]
    },
    {
      id: "reddit-sideproject-contrast",
      name: "Revenue/Validation Contrast",
      description: "Unexpected earnings comparison + lesson learned.",
      purpose: "Share unexpected results and lessons.",
      bestFor: ["Authority", "Validation"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SideProject"],
      structure: [
        {
          name: "Hook",
          description: "Unexpected earnings comparison + lesson learned.",
          example: '"My side project made $500 last month. Here is why that surprised me."'
        }
      ],
      whyItWorks: "Unexpected results and lessons drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the lesson, not a hard pitch.",
      realExampleUrl: "",
      formula: ["Contrast Hook", "The Result", "The Lesson", "CTA"]
    }
  ],
  "WebDev": [
    {
      id: "reddit-webdev-warning",
      name: "Security/Risk Warning",
      description: "Threat + mechanism + impact + mitigation steps.",
      purpose: "Share a technical warning and build authority.",
      bestFor: ["Authority", "Awareness"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/WebDev"],
      structure: [
        {
          name: "Hook",
          description: "Threat + mechanism + impact + mitigation steps.",
          example: '"89 npm packages got compromised again. Delete your node_modules now."'
        }
      ],
      whyItWorks: "Technical warnings and security alerts drive high engagement.",
      difficulty: "Hard",
      difficultyExplanation: "Requires technical knowledge and a real threat.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on security and technical advice.",
      realExampleUrl: "https://www.reddit.com/r/webdev/comments/1u1zoi3/89_npm_packages_got_compromised_again_deleting/",
      formula: ["Warning Hook", "The Threat", "The Mitigation", "CTA"]
    },
    {
      id: "reddit-webdev-opinion",
      name: "Industry/AI Disruption Opinion",
      description: "Strong stance on a tech trend + implication.",
      purpose: "Share a strong technical opinion and spark debate.",
      bestFor: ["Engagement", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/WebDev"],
      structure: [
        {
          name: "Hook",
          description: "Strong stance on a tech trend + implication.",
          example: '"I\'m calling it now: The adoption of AI agents into webdev is going to kill junior roles."'
        }
      ],
      whyItWorks: "Strong technical opinions drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible technical opinion.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on industry trends and technology.",
      realExampleUrl: "https://www.reddit.com/r/webdev/comments/1tvsfgj/im_calling_it_now_the_adoption_of_ai_agents_into/",
      formula: ["Opinion Hook", "The Implication", "The Debate", "CTA"]
    },
    {
      id: "reddit-webdev-showcase",
      name: "Personal Build/Frustration Showcase",
      description: "Technical build story or learning journey + reaction.",
      purpose: "Showcase a technical build and get feedback.",
      bestFor: ["Feedback", "Validation"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/WebDev"],
      structure: [
        {
          name: "Hook",
          description: "Technical build story or learning journey + reaction.",
          example: '"I spent 3 weeks building a custom state manager because Redux was driving me crazy."'
        }
      ],
      whyItWorks: "Technical build stories and learning journeys drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple showcase format.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the build, not a hard pitch.",
      realExampleUrl: "",
      formula: ["Build Hook", "The Technicals", "The Reaction", "CTA"]
    }
  ],
  "Marketing": [
    {
      id: "reddit-marketing-pain",
      name: "Platform Pain / Workflow Breakdown",
      description: "Exact failure chain on a tool/platform + missing fix.",
      purpose: "Share a workflow frustration and build authority.",
      bestFor: ["Authority", "Engagement"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/Marketing"],
      structure: [
        {
          name: "Hook",
          description: "Exact failure chain on a tool/platform + missing fix.",
          example: '"Navigating the absolute hell that is Meta Business Suite in 2026."'
        }
      ],
      whyItWorks: "Workflow frustrations and platform pain drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple opinion-based format.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on workflow and platform pain.",
      realExampleUrl: "https://www.reddit.com/r/marketing/comments/1tj7ea3/navigating_the_hell_that_is_meta_business_suite/",
      formula: ["Pain Hook", "The Failure Chain", "The Fix", "CTA"]
    },
    {
      id: "reddit-marketing-trend",
      name: "Contrarian Trend Take",
      description: "'[old tactic] is dead, [new tactic] is where leverage is.'",
      purpose: "Challenge marketing trends and build authority.",
      bestFor: ["Engagement", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/Marketing"],
      structure: [
        {
          name: "Hook",
          description: "'[old tactic] is dead, [new tactic] is where leverage is.'",
          example: '"5 years in SEO is outdated. 3 months in AEO is visionary."'
        }
      ],
      whyItWorks: "Contrarian marketing trends drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible marketing opinion.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on marketing trends and strategy.",
      realExampleUrl: "https://www.reddit.com/r/marketing/comments/1u6azdi/5_years_in_seo_outdated_3_months_in_aeo_visionary/",
      formula: ["Trend Hook", "The Shift", "The Leverage", "CTA"]
    },
    {
      id: "reddit-marketing-frustration",
      name: "Agency/Service Frustration",
      description: "Bad experience + promised vs delivered + ask for advice.",
      purpose: "Share a bad experience and ask for community input.",
      bestFor: ["Engagement", "Feedback"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/Marketing"],
      structure: [
        {
          name: "Hook",
          description: "Bad experience + promised vs delivered + ask for advice.",
          example: '"Dishonest agencies are killing startups one after another."'
        }
      ],
      whyItWorks: "Agency frustrations and bad experiences drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple opinion-based format.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on agency frustrations.",
      realExampleUrl: "https://www.reddit.com/r/marketing/comments/1tfx9d9/dishonest_agencies_one_after_another/",
      formula: ["Frustration Hook", "The Experience", "The Ask", "CTA"]
    }
  ],
  "GrowthHacking": [
    {
      id: "reddit-growthhacking-casestudy",
      name: "No-Budget Acquisition Case Study",
      description: "Constraint → tactic → result → exact sequence.",
      purpose: "Share a tactical growth win and build authority.",
      bestFor: ["Authority", "Traffic"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/GrowthHacking"],
      structure: [
        {
          name: "Hook",
          description: "Constraint → tactic → result → exact sequence.",
          example: '"I\'m an engineer with zero marketing skills. Here is how I got 100 users in 3 days with $0."'
        }
      ],
      whyItWorks: "Tactical growth wins and case studies drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the tactic, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1txl1w4/im_an_engineer_with_zero_marketing_skills_heres/",
      formula: ["Constraint Hook", "The Tactic", "The Result", "CTA"]
    },
    {
      id: "reddit-growthhacking-obituary",
      name: "Contrarian Obituary of Old Playbook",
      description: "'[old tactic] is dead because [market shift].'",
      purpose: "Challenge growth hacking trends and build authority.",
      bestFor: ["Engagement", "Authority"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/GrowthHacking"],
      structure: [
        {
          name: "Hook",
          description: "'[old tactic] is dead because [market shift].'",
          example: '"Unpopular opinion: Growth hacking died around 2020. Here is what replaced it."'
        }
      ],
      whyItWorks: "Contrarian growth hacking trends drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible growth hacking opinion.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on growth hacking trends and strategy.",
      realExampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1tny72q/unpopular_opinion_growth_hacking_died_around_2020/",
      formula: ["Obituary Hook", "The Shift", "The Replacement", "CTA"]
    },
    {
      id: "reddit-growthhacking-milestone",
      name: "Milestone + Launch Combo",
      description: "Revenue context + launch action + ask.",
      purpose: "Share a milestone and launch action.",
      bestFor: ["Validation", "Traffic"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/GrowthHacking"],
      structure: [
        {
          name: "Hook",
          description: "Revenue context + launch action + ask.",
          example: '"After making $200k ARR, we launched on Product Hunt today. Here is why."'
        }
      ],
      whyItWorks: "Milestones and launch actions drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the milestone, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1thnbbz/after_making_200k_arr_we_launched_on_product_hunt/",
      formula: ["Milestone Hook", "The Launch", "The Ask", "CTA"]
    }
  ],
  "SEO": [
    {
      id: "reddit-seo-update",
      name: "Official Update/News + Implication",
      description: "Platform change → what breaks → tactical response.",
      purpose: "Share SEO news and build authority.",
      bestFor: ["Authority", "Awareness"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SEO"],
      structure: [
        {
          name: "Hook",
          description: "Platform change → what breaks → tactical response.",
          example: '"Google FAQ rich results are no longer appearing. Here is what that means for your traffic."'
        }
      ],
      whyItWorks: "SEO news and platform changes drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires technical knowledge and a real update.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on SEO news and technical advice.",
      realExampleUrl: "https://www.reddit.com/r/SEO/comments/1t7di79/google_faq_rich_results_are_no_longer_appearing/",
      formula: ["Update Hook", "The Implication", "The Response", "CTA"]
    },
    {
      id: "reddit-seo-win",
      name: "Personal Proof/Ranking Win",
      description: "Proof of ranking/result + approach used.",
      purpose: "Share a ranking win and build authority.",
      bestFor: ["Authority", "Validation"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/SEO"],
      structure: [
        {
          name: "Hook",
          description: "Proof of ranking/result + approach used.",
          example: '"I\'m beating almost every web design agency in my city on Google. Here is the exact strategy."'
        }
      ],
      whyItWorks: "Ranking wins and case studies drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the strategy, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/SEO/comments/1t207d3/im_beating_almost_every_web_design_agency_and/",
      formula: ["Win Hook", "The Strategy", "The Proof", "CTA"]
    },
    {
      id: "reddit-seo-discussion",
      name: "Tool/Workflow Discussion",
      description: "'Anyone using [tool] for [task]?' + curiosity ask.",
      purpose: "Ask for tool recommendations and spark discussion.",
      bestFor: ["Engagement", "Feedback"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/SEO"],
      structure: [
        {
          name: "Hook",
          description: "'Anyone using [tool] for [task]?' + curiosity ask.",
          example: '"Anyone using Screaming Frog for large-scale site audits?"'
        }
      ],
      whyItWorks: "Tool recommendations and workflow discussions drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple question-based format.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on tool recommendations.",
      realExampleUrl: "",
      formula: ["Discussion Hook", "The Workflow", "The Ask", "CTA"]
    }
  ],
  "Sales": [
    {
      id: "reddit-sales-wisdom",
      name: "Veteran Wisdom Dump",
      description: "Career summary → lessons → tactical rules.",
      purpose: "Share sales wisdom and build authority.",
      bestFor: ["Authority", "Engagement"],
      expectedOutcome: ["High Upvotes", "High Comments"],
      worksBestIn: ["r/Sales"],
      structure: [
        {
          name: "Hook",
          description: "Career summary → lessons → tactical rules.",
          example: '"I\'ll give you everything I learned over 30 years in enterprise sales in one post."'
        }
      ],
      whyItWorks: "Sales wisdom and career lessons drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires sales experience and lessons.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on sales wisdom and advice.",
      realExampleUrl: "https://www.reddit.com/r/sales/comments/1tw6tts/ill_give_you_everything_i_learned_over_30_years/",
      formula: ["Wisdom Hook", "The Lessons", "The Rules", "CTA"]
    },
    {
      id: "reddit-sales-milestone",
      name: "Commission/Quota Milestone",
      description: "Context → trajectory → why it matters.",
      purpose: "Share a sales milestone and build authority.",
      bestFor: ["Authority", "Validation"],
      expectedOutcome: ["High Upvotes", "Medium Comments"],
      worksBestIn: ["r/Sales"],
      structure: [
        {
          name: "Hook",
          description: "Context → trajectory → why it matters.",
          example: '"Just closed the biggest deal of my life. $60k gross commission. Here is how it happened."'
        }
      ],
      whyItWorks: "Sales milestones and commission stories drive high engagement.",
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics or validation signals.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Keep it focused on the journey, not a hard pitch.",
      realExampleUrl: "https://www.reddit.com/r/sales/comments/1t8x2v8/just_closed_my_biggest_deal_of_my_life_60k_gross/",
      formula: ["Milestone Hook", "The Deal", "The Trajectory", "CTA"]
    },
    {
      id: "reddit-sales-exit",
      name: "Exit/Career-Change Narrative",
      description: "Why I left → tradeoffs → next step.",
      purpose: "Share a career change story and spark discussion.",
      bestFor: ["Engagement", "Feedback"],
      expectedOutcome: ["High Comments", "Medium Upvotes"],
      worksBestIn: ["r/Sales"],
      structure: [
        {
          name: "Hook",
          description: "Why I left → tradeoffs → next step.",
          example: '"I did it. I\'m out. Why I left my tech sales job after 5 years."'
        }
      ],
      whyItWorks: "Career change stories and exit narratives drive high engagement.",
      difficulty: "Easy",
      difficultyExplanation: "Simple storytelling format.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on career change.",
      realExampleUrl: "https://www.reddit.com/r/sales/comments/1tk1n6h/i_did_it_im_out/",
      formula: ["Exit Hook", "The Tradeoffs", "The Next Step", "CTA"]
    }
  ]
};