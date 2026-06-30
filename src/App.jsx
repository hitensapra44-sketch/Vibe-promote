"use client";

import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import PageNotFound from './lib/PageNotFound';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/supabaseClient';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Survey from './pages/Survey';
import PrePurchase from './pages/PrePurchase';
import Pricing from './pages/Pricing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import BrandBrainView from './pages/BrandBrainView';
import PostMaker from './pages/post-maker/PostMaker';
import RedditPost from './pages/post-maker/RedditPost';
import XPost from './pages/post-maker/XPost';
import ThreadsPost from './pages/post-maker/ThreadsPost';
import IndieHackersPost from './pages/post-maker/IndieHackersPost';
import AudienceSpotter from './pages/AudienceSpotter';
import ResultsTracker from './pages/results-tracker/ResultsTracker';
import MarketingBuddy from './pages/marketing-buddy/MarketingBuddy';
import Settings from './pages/Settings';
import ConnectedAccounts from './pages/ConnectedAccounts';
import AutoPoster from './pages/AutoPoster';
import FeedbackWidget from './components/FeedbackWidget';
import TaskWidget from './components/TaskWidget';
import ProgressPage from './pages/ProgressPage';
import SeoLandingPage from './pages/SeoLandingPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, user, authEvent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user?.id && authEvent === 'SIGNED_IN') {
      const protectedPaths = [
        '/dashboard',
        '/onboarding',
        '/post-maker',
        '/post-maker/reddit',
        '/post-maker/x',
        '/post-maker/threads',
        '/post-maker/indiehackers',
        '/audience-spotter',
        '/brand-brain',
        '/marketing-buddy',
        '/settings',
        '/connected-accounts',
        '/dashboard/results-tracker',
        '/pricing',
        '/progress',
        '/auto-poster'
      ];

      if (protectedPaths.includes(location.pathname)) return;

      const checkUserStatus = async () => {
        try {
          const { data } = await supabase
            .from('brand_brains')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();
          navigate(data ? '/dashboard' : '/onboarding');
        } catch (err) {
          navigate('/onboarding');
        }
      };
      checkUserStatus();
    }
  }, [isAuthenticated, isLoadingAuth, user, navigate, authEvent, location.pathname]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/pre-purchase" element={<PrePurchase />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* SEO Landing Pages */}
        <Route path="/ai-marketing-tool" element={<SeoLandingPage />} />
        <Route path="/saas-marketing-tool" element={<SeoLandingPage />} />
        <Route path="/indie-hacker-marketing" element={<SeoLandingPage />} />
        <Route path="/reddit-marketing-tool" element={<SeoLandingPage />} />
        <Route path="/marketing-copilot" element={<SeoLandingPage />} />
        <Route path="/startup-marketing-tool" element={<SeoLandingPage />} />
        <Route path="/bootstrapped-founder-marketing" element={<SeoLandingPage />} />
        <Route path="/how-to-market-your-saas" element={<SeoLandingPage />} />
        <Route path="/best-ai-marketing-tools-for-founders" element={<SeoLandingPage />} />
        
        {/* Protected Routes */}
        <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/brand-brain" element={isAuthenticated ? <BrandBrainView /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/post-maker" element={isAuthenticated ? <PostMaker /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/post-maker/reddit" element={isAuthenticated ? <RedditPost /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/post-maker/x" element={isAuthenticated ? <XPost /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/post-maker/threads" element={isAuthenticated ? <ThreadsPost /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/post-maker/indiehackers" element={isAuthenticated ? <IndieHackersPost /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/audience-spotter" element={isAuthenticated ? <AudienceSpotter /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/dashboard/results-tracker" element={isAuthenticated ? <ResultsTracker /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/marketing-buddy" element={isAuthenticated ? <MarketingBuddy /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/connected-accounts" element={isAuthenticated ? <ConnectedAccounts /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/progress" element={isAuthenticated ? <ProgressPage /> : (isLoadingAuth ? null : <Home />)} />
        <Route path="/auto-poster" element={isAuthenticated ? <AutoPoster /> : (isLoadingAuth ? null : <Home />)} />
        
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {isAuthenticated && location.pathname !== '/onboarding' && <TaskWidget />}
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-geist">
      <AuthenticatedApp />
      <FeedbackWidget />
      <Toaster />
    </div>
  );
}

export default App;