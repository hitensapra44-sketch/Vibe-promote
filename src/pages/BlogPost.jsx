"use client";

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Sparkles, CheckCircle2, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import NavBar from '../components/landing/navbar';
import Footer from '../components/landing/fottersection';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';
import SEO, { getArticleSchema, getBreadcrumbSchema } from '../components/shared/SEO';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import { BLOG_POSTS } from './BlogIndex';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const foundPost = BLOG_POSTS.find(p => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
    } else {
      // Fallback or redirect
      setPost(null);
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-primary hover:underline">Go back to Blog</Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` }
  ];

  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.description,
    datePublished: '2026-05-26',
    authorName: post.author || 'Hiten Sapra',
    imageUrl: 'https://vibepromote.tech/favicon.png',
    articleUrl: `https://vibepromote.tech/blog/${post.slug}`
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema]
  };

  // Related articles
  const relatedPosts = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins relative overflow-hidden">
      <SEO 
        title={post.title}
        description={post.description}
        keywords={post.tags || ['SaaS marketing', 'indie hacker', 'validation']}
        schema={combinedSchema}
      />
      
      <GridBackground />
      <ParticleBackground />
      <NavBar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="space-y-6 mb-12">
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
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              By {post.author || 'Hiten Sapra'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 leading-tight tracking-tight" style={{ letterSpacing: '-1.5px' }}>
            {post.title}
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {post.description}
          </p>
        </header>

        {/* Table of Contents */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 mb-12">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Table of Contents</h3>
          <ul className="space-y-2 text-sm text-orange-600 font-medium">
            <li><a href="#intro" className="hover:underline">1. Introduction</a></li>
            <li><a href="#core-lessons" className="hover:underline">2. Core Lessons Learned</a></li>
            <li><a href="#actionable-steps" className="hover:underline">3. Actionable Steps for Founders</a></li>
            <li><a href="#conclusion" className="hover:underline">4. Conclusion & Next Steps</a></li>
          </ul>
        </div>

        {/* Article Content */}
        <article className="prose prose-zinc max-w-none mb-16 space-y-8">
          <div id="intro" className="text-base text-zinc-600 leading-relaxed space-y-6">
            <p>{post.intro || 'As a founder, your time is best spent building product, not struggling with marketing copy or guessing where your audience hangs out. Vibe Promote acts as your automated marketing department, translating your technical features into high-converting positioning and platform-native content.'}</p>
          </div>

          <div id="core-lessons" className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Core Lessons Learned</h2>
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 space-y-4">
              {post.benefits ? post.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-zinc-700 font-medium">{benefit}</span>
                </div>
              )) : (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-700 font-medium">Validation matters more than promotion. Talk to users first.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-700 font-medium">Positioning is everything. Explain outcomes, not features.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div id="actionable-steps" className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Actionable Steps for Founders</h2>
            <ol className="list-decimal pl-6 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <li><strong>Define Your Brand Brain:</strong> Clarify your core value proposition, target audience, and the exact pain points you solve.</li>
              <li><strong>Find High-Intent Conversations:</strong> Monitor subreddits and developer forums for people actively discussing the problem you solve.</li>
              <li><strong>Share Value-First Content:</strong> Write platform-native posts that teach, share lessons, or tell honest stories instead of pitching.</li>
            </ol>
          </div>

          <div id="conclusion" className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Conclusion & Next Steps</h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Stop building in silence. Vibe Promote was built to automate these exact workflows so you can keep building great things without ever worrying about how you will market it.
            </p>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-zinc-100 pt-12 mb-16">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((p) => (
                <div key={p.slug} className="p-6 rounded-xl border border-zinc-100 bg-zinc-50 hover:border-orange-500/30 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 hover:text-orange-500 transition-colors">
                      <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                    </h4>
                    <p className="text-zinc-500 text-xs line-clamp-2">{p.description}</p>
                  </div>
                  <Link to={`/blog/${p.slug}`} className="text-xs font-bold text-orange-500 hover:underline inline-flex items-center gap-1">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="border-t border-zinc-100 pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
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