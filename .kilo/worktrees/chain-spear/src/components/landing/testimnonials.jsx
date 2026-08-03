import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    handle: '@indiealex42',
    avatar: 'IA',
    badge: 'Pre-Purchased',
    text: '“Man, I never know what to post, where to post it, or who I’m even posting for. Everything always felt so random. But the features in this app actually fix that mess. Feels good.”',
  },
  {
    handle: '@sarahcodes_',
    avatar: 'SC',
    badge: 'Pre-Purchased',
    text: '“Getting content ideas was easy with AI, so I thought marketing would be the same. Nope — it’s still hard as hell. But this app? It’s turning marketing into something that actually vibes. Super relieved.”',
  },
  {
    handle: '@devonbuilds',
    avatar: 'DB',
    badge: 'Joined waitlist',
    text: '“The best thing is it feels like vibe coding but for marketing. You just say what you want in normal English and it runs everything on autopilot. No more overthinking, just results. This is wild.”',
  },
  {
    handle: '@mike_the_maker',
    avatar: 'MM',
    badge: 'Pre-Purchased',
    text: '“Coding used to stress me out so bad. Then vibe coding came and made it easy and fun. Marketing has been killing me… but this app is doing the same thing for marketing. It’s actually stress-free now. I love it.”',
  },
  {
    handle: '@hitensapra11',
    avatar: 'HS',
    badge: 'joined waitlist',
    text: '“Every app builder’s biggest nightmare is marketing. You can build something great, but telling people about it? That part makes everyone sweat. This app feels like the early days of Cursor AI — finally making the painful part simple.”',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 font-poppins bg-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            Founders Who Love{' '}
            <span className="text-primary">
              Vibe Promote
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border-muted bg-bg-surface hover:bg-bg-elevated transition-all duration-300 hover:border-primary/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-text-primary font-semibold text-sm">{t.handle}</p>
                  <div className="flex gap-1 mt-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                 <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {t.badge}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                "{t.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}