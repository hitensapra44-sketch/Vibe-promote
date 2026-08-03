import React from 'react';
import { motion } from 'framer-motion';
import { Search, Target, PenTool, FileText, Send, Eye, TrendingUp, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Audience Spotter',
    desc: 'Shows you exactly who wants your app and where they hang out online right now. It finds real conversations (Reddit, Twitter, TikTok, forums) where people talk about the problems your app solve.',
  },
  {
    icon: Target,
    title: 'Positioning Helper',
    desc: 'Tells you the best way to describe your app so people instantly get why they need it. It studies your niche and audience, then gives you clear ideas to use right away.',
  },
  {
    icon: PenTool,
    title: 'Hook Maker',
    desc: 'Creates short, powerful opening lines that make people stop scrolling and read your post. Not random GPT. It create  ready-to-use hooks made specially for your audience\'s problems.',
  },
  {
    icon: FileText,
   title: 'Ready Posts',
    desc: 'Gives you full posts, captions, hashtags, and the best time to share them. Choose a platform. It makes everything sound natural and ready to copy-paste.',
  },
  {
    icon: Send,
    title: 'Auto Poster',
    desc: ' Posts and schedules your content for you on Instagram, TikTok, Twitter, LinkedIn, Reddit and more. Turn it on once. it keeps posting at the perfect times.',
  },
  {
    icon: Eye,
    title: 'Competitor Watcher',
    desc: 'Shows what your competitors and popular creators in your niche are posting. Shows you their best content quickly and give you fresh ideas to try yourself.',
  },
  {
    icon: TrendingUp,
    title: 'Results Tracker',
    desc: 'Gives you clear and detailed analytics of your posts and sends simple daily and weekly updates. It tells you what\'s working, what to change, and how much you\'re really growing.',
  },
  {
    icon: MessageCircle,
    title: 'Your 24/7 Marketing Buddy',
    desc: 'A helper that knows everything about your app. Ask anything anytime "Give me a Reddit idea" or "What should I do next week?"  it answers like an expert.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 font-poppins bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 px-2"
        >

          <h2 className="text-3xl sm:text-5xl font-bold text-white break-words" style={{ letterSpacing: '-1px', lineHeight: 1.2 }}>
            Vibe Promote Fixes Marketing Problems{' '}
            <span className="text-primary">
              In One Click
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto text-text-secondary">
            Everything your app/saas needs to grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl border border-border-muted bg-bg-surface hover:bg-bg-elevated transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(180deg, rgba(181,89,51,0.08) 0%, transparent 100%)' }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}