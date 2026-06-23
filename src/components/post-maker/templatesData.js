export const templatesData = {
  X: [
    {
      id: 'x-tactical-one-liner',
      name: "The Tactical One-Liner + Proof",
      description: "A short, punchy format that pairs a specific result with a clear, actionable insight.",
      purpose: "Drive bookmarks and retweets by sharing a highly specific, credible outcome.",
      bestFor: ["SaaS Founders", "Indie Hackers", "Growth Marketers"],
      expectedOutcome: ["High Bookmarks", "Profile Clicks"],
      worksBestIn: ["X (Twitter)"],
      difficulty: "Easy",
      difficultyExplanation: "Requires only a single clear metric and a simple reframe.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on value and proof rather than a direct pitch.",
      formula: ["Hook", "Contrast", "Proof", "CTA"],
      structure: [
        {
          name: "Hook",
          description: "A specific result under 10 words.",
          example: "How we got 47 signups in 3 days without spending a dollar."
        },
        {
          name: "Contrast",
          description: "Contrast the common wrong approach with what actually works.",
          example: "Most people spam generic ads. We found high-intent leads on Reddit instead."
        },
        {
          name: "Proof",
          description: "A concrete metric or insight.",
          example: "The difference: 4.2% click-through rate vs 0.1% on cold ads."
        },
        {
          name: "CTA",
          description: "A soft, natural link to the product.",
          example: "We built Vibe Promote to automate this. Free to try."
        }
      ],
      whyItWorks: "X rewards specificity and credibility. Sharing real numbers builds instant trust, while the tactical reframe encourages bookmarks.",
      realExampleUrl: "https://x.com/hitensapra11"
    },
    {
      id: 'x-contrarian-take',
      name: "The Contrarian Take",
      description: "Challenge conventional wisdom to spark discussion and replies.",
      purpose: "Drive high engagement and replies by questioning a common belief in your niche.",
      bestFor: ["Thought Leaders", "SaaS Founders"],
      expectedOutcome: ["High Replies", "Viral Reach"],
      worksBestIn: ["X (Twitter)", "LinkedIn"],
      difficulty: "Medium",
      difficultyExplanation: "Requires a strong, defensible opinion that challenges the status quo.",
      promotionRisk: "Medium",
      promotionRiskExplanation: "Can spark debate, but builds high authority when done right.",
      formula: ["Contrarian Hook", "Why It's Wrong", "The Reframe", "CTA"],
      structure: [
        {
          name: "Contrarian Hook",
          description: "A bold claim that goes against common belief.",
          example: "Unpopular opinion: Building in public is a waste of time if you don't validate first."
        },
        {
          name: "Why It's Wrong",
          description: "Explain why the common approach fails.",
          example: "Most founders spend months sharing updates to an empty audience instead of talking to buyers."
        },
        {
          name: "The Reframe",
          description: "What actually works instead.",
          example: "Find 10 people with the exact problem today. Solve it manually first."
        },
        {
          name: "CTA",
          description: "Soft product mention.",
          example: "This is exactly what Vibe Promote helps you automate."
        }
      ],
      whyItWorks: "Tension drives engagement. Challenging a common belief forces readers to stop scrolling and share their own opinion in the replies.",
      realExampleUrl: "https://x.com/hitensapra11"
    }
  ],
  Threads: [
    {
      id: 'threads-relatable-moment',
      name: "The Relatable Moment",
      description: "A short, highly conversational post that focuses on a shared frustration.",
      purpose: "Build a loyal audience by sharing a relatable, human moment.",
      bestFor: ["Solo Builders", "Indie Hackers"],
      expectedOutcome: ["High Likes", "Reshares"],
      worksBestIn: ["Threads"],
      difficulty: "Easy",
      difficultyExplanation: "Requires only a simple, honest story about a common struggle.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses entirely on the shared experience, making the CTA feel natural.",
      formula: ["Frustration Hook", "Relatability", "The Reframe", "CTA"],
      structure: [
        {
          name: "Frustration Hook",
          description: "A short, relatable opening about a common struggle.",
          example: "Nothing hurts more than spending 3 weeks on a feature no one uses."
        },
        {
          name: "Relatability",
          description: "Expand on the feeling casually.",
          example: "You think it is a game-changer, launch it, and... absolute silence. Ngl it is brutal."
        },
        {
          name: "The Reframe",
          description: "How you are handling or solving it now.",
          example: "We started using Vibe Promote to talk to users before coding. Saved us so much time."
        },
        {
          name: "CTA",
          description: "A casual question to invite replies.",
          example: "How do you validate features before building?"
        }
      ],
      whyItWorks: "Threads is a highly conversational platform. Relatable, low-ego posts feel like a text message to a friend, which drives replies.",
      realExampleUrl: "https://threads.net"
    }
  ],
  Reddit: [
    {
      id: 'reddit-builder-story',
      name: "The Builder Story",
      description: "A transparent, story-driven post sharing your journey, challenges, and lessons.",
      purpose: "Build trust and connection with other builders by sharing authentic progress.",
      bestFor: ["Indie Hackers", "SaaS Founders"],
      expectedOutcome: ["High Engagement", "Feedback"],
      worksBestIn: ["r/SaaS", "r/SideProject", "r/indiehackers"],
      difficulty: "Easy",
      difficultyExplanation: "Requires sharing your real building journey and lessons.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses on transparency and learning, which communities love.",
      formula: ["Journey Hook", "The Struggle", "The Lesson", "CTA"],
      structure: [
        {
          name: "Journey Hook",
          description: "A transparent opening about your building journey.",
          example: "I spent 3 months building in silence. Here is what happened when I finally launched."
        },
        {
          name: "The Struggle",
          description: "Describe the real challenges you faced.",
          example: "No one signed up. I realized my messaging was too complex and vague."
        },
        {
          name: "The Lesson",
          description: "What you learned and how you fixed it.",
          example: "I simplified the landing page to focus on one clear outcome. Signups doubled."
        },
        {
          name: "CTA",
          description: "A soft, natural mention of your product.",
          example: "I built Vibe Promote to help other founders with this. Let me know if you have questions."
        }
      ],
      whyItWorks: "Reddit communities value transparency and vulnerability. Sharing real struggles and lessons builds high trust.",
      realExampleUrl: "https://reddit.com"
    }
  ]
};

export const subredditTemplates = {
  SaaS: [
    {
      id: 'reddit-saas-milestone',
      name: "The Milestone Full Breakdown",
      description: "A detailed, numbers-driven breakdown of a specific SaaS milestone.",
      purpose: "Build authority and drive high-quality traffic by sharing transparent metrics.",
      bestFor: ["SaaS Founders", "Indie Hackers"],
      expectedOutcome: ["High Upvotes", "Saves"],
      worksBestIn: ["r/SaaS"],
      difficulty: "Medium",
      difficultyExplanation: "Requires real metrics and a clear breakdown of your growth channels.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Radical transparency removes promotional friction.",
      formula: ["Milestone Hook", "The Playbook", "What Failed", "CTA"],
      structure: [
        {
          name: "Milestone Hook",
          description: "A bold opening sharing a specific metric and time taken.",
          example: "We just crossed $2,000 MRR in 45 days. Here is the exact playbook we used."
        },
        {
          name: "The Playbook",
          description: "Step-by-step breakdown of what worked.",
          example: "1. We monitored Reddit for high-intent leads. 2. We wrote value-first replies."
        },
        {
          name: "What Failed",
          description: "Failures or mistakes to build credibility.",
          example: "Cold email was a complete waste of time for us. 0% conversion."
        },
        {
          name: "CTA",
          description: "A soft, natural link or mention.",
          example: "We built Vibe Promote to automate our Reddit strategy. Happy to answer questions."
        }
      ],
      whyItWorks: "r/SaaS runs on transparency. Sharing real numbers and actionable playbooks earns massive saves and upvotes.",
      realExampleUrl: "https://reddit.com/r/SaaS"
    }
  ],
  startups: [
    {
      id: 'reddit-startups-cautionary',
      name: "The Cautionary Tale",
      description: "A dramatic, lesson-focused story about a major setback or failure.",
      purpose: "Build high authority and discussion by sharing a critical startup lesson.",
      bestFor: ["SaaS Founders", "Tech Startups"],
      expectedOutcome: ["High Comments", "Discussion"],
      worksBestIn: ["r/startups"],
      difficulty: "Medium",
      difficultyExplanation: "Requires a compelling narrative and a clear, valuable takeaway.",
      promotionRisk: "Low",
      promotionRiskExplanation: "Focuses entirely on education and warning, with no direct pitch.",
      formula: ["Setback Hook", "The Story", "The Lesson", "CTA"],
      structure: [
        {
          name: "Setback Hook",
          description: "A dramatic opening about a major setback.",
          example: "How a single bad positioning decision cost us 3 months of growth."
        },
        {
          name: "The Story",
          description: "The narrative of what happened.",
          example: "We launched with vague marketing copy. Everyone visited but no one understood what we did."
        },
        {
          name: "The Lesson",
          description: "The critical takeaway for other founders.",
          example: "Never launch without testing your positioning on real users first."
        },
        {
          name: "CTA",
          description: "A soft, natural question to invite discussion.",
          example: "How do you test your landing page copy before launching?"
        }
      ],
      whyItWorks: "r/startups values deep, educational discussions. Sharing setbacks and warnings builds high authority and engagement.",
      realExampleUrl: "https://reddit.com/r/startups"
    }
  ],
  SideProject: [
    {
      id: 'reddit-sideproject-demo',
      name: "The Prototype-to-Product Update",
      description: "A casual, low-ego update showing progress from prototype to finished product.",
      purpose: "Get feedback and early users by showing real building progress.",
      bestFor: ["Indie Hackers", "Solo Builders"],
      expectedOutcome: ["High Feedback", "Early Users"],
      worksBestIn: ["r/SideProject"],
      difficulty: "Easy",
      difficultyExplanation: "Requires sharing your building progress and asking for feedback.",
      promotionRisk: "Low",
      promotionRiskExplanation: "The community loves supporting builders and giving feedback.",
      formula: ["Progress Hook", "The Update", "The Ask", "CTA"],
      structure: [
        {
          name: "Progress Hook",
          description: "A casual opening sharing your progress.",
          example: "Update: 3 weeks ago I posted a rough prototype here. Here is the finished version."
        },
        {
          name: "The Update",
          description: "What you changed based on early feedback.",
          example: "I simplified the onboarding and added a custom brand brain setup."
        },
        {
          name: "The Ask",
          description: "Ask directly for honest feedback.",
          example: "Would love to know if the positioning makes sense to you now."
        },
        {
          name: "CTA",
          description: "A natural link to try it.",
          example: "It is free to try at vibepromote.tech. Let me know what you think!"
        }
      ],
      whyItWorks: "r/SideProject is highly supportive of builders. Showing that you listened to previous feedback makes the community eager to support you.",
      realExampleUrl: "https://reddit.com/r/SideProject"
    }
  ]
};