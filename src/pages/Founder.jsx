"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Calendar, Award, MessageSquare, Heart } from 'lucide-react';
import NavBar from '../components/landing/navbar';
import Footer from '../components/landing/fottersection';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';
import SEO, { getPersonSchema, getBreadcrumbSchema, getFAQSchema } from '../components/shared/SEO';
import Breadcrumbs from '../components/shared/Breadcrumbs';

const FAQS = [
  {
    q: "Who is the founder of Vibe Promote?",
    a: "Vibe Promote was founded by Hiten Sapra, a 17-year-old developer and indie hacker from India who is passionate about building tools that simplify marketing for technical builders."
  },
  {
    q: "What inspired Hiten Sapra to build Vibe Promote?",
    a: "After spending 8 months marketing a fitness AI app and getting only 16 downloads despite posting over 350 Instagram reels, Hiten realized that marketing cannot save a product people do not truly need. This painful lesson inspired him to build Vibe Promote to help founders validate their ideas, find high-intent users, and automate their positioning."
  },
  {
    q: "What is the mission of Vibe Promote?",
    a: "The mission of Vibe Promote is to make marketing as easy as vibe coding, allowing solo founders and indie hackers to grow their SaaS products without needing a full-time marketing team."
  }
];

export default function Founder() {
  const breadcrumbItems = [
    { name: 'Founder', url: '/founder' }
  ];

  const personSchema = getPersonSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Founder', url: '/founder' }
  ]);
  const faqSchema = getFAQSchema(FAQS);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [personSchema, breadcrumbSchema, faqSchema]
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins relative overflow-hidden">
      <SEO 
        title="Hiten Sapra - Founder of Vibe Promote"
        description="Meet Hiten Sapra, founder of Vibe Promote. Learn how spending 8 months marketing an app and getting only 16 users led to building Vibe Promote."
        keywords={['founder of vibe promote', 'vibe promote founder', 'hiten sapra', 'hiten sapra founder', 'who created vibe promote']}
        schema={combinedSchema}
      />
      
      <GridBackground />
      <ParticleBackground />
      <NavBar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Section */}
        <header className="space-y-6 mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Meet the Founder</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 leading-tight tracking-tight" style={{ letterSpacing: '-2px' }}>
            Hiten Sapra
          </h1>
          <p className="text-xl text-zinc-600 font-medium leading-relaxed max-w-2xl">
            17-year-old developer from India building tools that help founders market their products without becoming full-time marketers.
          </p>
          
          {/* Founder Image Placeholder */}
          <div className="relative w-full max-w-md mx-auto sm:mx-0 aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-lg mt-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent" />
            <div className="text-center p-6 space-y-2">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">HS</span>
              </div>
              <p className="text-sm font-bold text-zinc-800">Hiten Sapra</p>
              <p className="text-xs text-zinc-500">Founder & Developer of Vibe Promote</p>
            </div>
          </div>
        </header>

        {/* Story Section */}
        <section className="prose prose-zinc max-w-none mb-16 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">The 16-Download Wake-Up Call</h2>
          <div className="text-base text-zinc-600 leading-relaxed space-y-6">
            <p>
              In April 2025, I built a fitness AI app. Like most developers, I believed that if I built a great product, users would naturally find it. I was wrong.
            </p>
            <p>
              I spent the next 8 months trying to market it. I posted over 350 Instagram reels across multiple accounts, often uploading 2 to 3 times every single day. I spent hours editing videos, researching hashtags, and trying to hack the algorithm.
            </p>
            <p>
              After months of relentless effort, the app got only <strong>16 downloads</strong>.
            </p>
            <p className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl text-zinc-800 font-medium italic">
              "That experience taught me a painful lesson: marketing cannot save a product people do not truly need. Validation matters more than promotion."
            </p>
            <p>
              The experience completely changed how I think about startups. I realized most founders struggle with understanding users, positioning, and distribution. We love building, but we hate marketing.
            </p>
            <p>
              That insight eventually became Vibe Promote.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8 sm:p-10 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Make marketing as easy as vibe coding.</h2>
          <p className="text-zinc-600 leading-relaxed">
            Vibe Promote was built to solve the exact problem I faced. It automates the painful parts of marketing — finding high-intent users, sharpening your positioning, and generating platform-native content — so you can focus on what you love: building great products.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">Find buyers on autopilot</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">Sharpen positioning in minutes</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">Generate human-sounding content</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">No marketing degree required</span>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">The Journey</h2>
          <div className="relative border-l-2 border-zinc-100 pl-6 ml-4 space-y-10">
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">April 2025</span>
              <h3 className="text-lg font-bold text-zinc-900">Built Fitness AI App</h3>
              <p className="text-zinc-500 text-sm mt-1">Launched my first major product, believing building was the hard part.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">December 2025</span>
              <h3 className="text-lg font-bold text-zinc-900">Learned Marketing Through Failure</h3>
              <p className="text-zinc-500 text-sm mt-1">After 350+ reels and only 16 downloads, I realized the importance of validation and positioning.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">Early 2026</span>
              <h3 className="text-lg font-bold text-zinc-900">Started Vibe Promote</h3>
              <p className="text-zinc-500 text-sm mt-1">Began building a tool to automate audience discovery and positioning for indie hackers.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">Present</span>
              <h3 className="text-lg font-bold text-zinc-900">Helping Founders Automate SaaS Marketing</h3>
              <p className="text-zinc-500 text-sm mt-1">Empowering solo builders to find their first users and grow consistently.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16 border-t border-zinc-100 pt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 space-y-2">
                <h3 className="text-base font-bold text-zinc-900">{faq.q}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Linking Hub */}
        <section className="border-t border-zinc-100 pt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <Link to="/" className="text-sm font-bold text-zinc-500 hover:text-orange-500 transition-colors">Home</Link>
            <Link to="/blog" className="text-sm font-bold text-zinc-500 hover:text-orange-500 transition-colors">Blog</Link>
            <Link to="/pricing" className="text-sm font-bold text-zinc-500 hover:text-orange-500 transition-colors">Pricing</Link>
          </div>
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            Start for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}