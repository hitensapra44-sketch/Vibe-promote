"use client";

import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import PageNotFound from './lib/PageNotFound';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/supabaseClient';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Survey from './pages/Survey';
import PrePurchase from './pages/PrePurchase';
import Pricing from './pages/Pricing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import BrandBrainView from './pages/BrandBrainView';
import PostMaker from './pages/post-maker/PostMaker';
import AudienceSpotter from './pages/AudienceSpotter';
import ResultsTracker from './pages/results-tracker/ResultsTracker';
import MarketingBuddy from './pages/marketing-buddy/MarketingBuddy';
import Settings from './pages/Settings';
import ConnectedAccounts from './pages/ConnectedAccounts';
import FeedbackWidget from './components/FeedbackWidget';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, user, authEvent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user?.id && authEvent === 'SIGNED_IN') {
      // Define paths that should not trigger an automatic redirect if the user is already there
      const protectedPaths = [
        '/dashboard',
        '/onboarding',
        '/post-maker',
        '/audience-spotter',
        '/brand-brain',
        '/marketing-buddy',
        '/settings',
        '/connected-accounts',
        '/dashboard/results-tracker',
        '/pricing'
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
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/pre-purchase" element={<PrePurchase />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Protected Routes */}
      <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/brand-brain" element={isAuthenticated ? <BrandBrainView /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/post-maker" element={isAuthenticated ? <PostMaker /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/audience-spotter" element={isAuthenticated ? <AudienceSpotter /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/dashboard/results-tracker" element={isAuthenticated ? <ResultsTracker /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/marketing-buddy" element={isAuthenticated ? <MarketingBuddy /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/settings" element={isAuthenticated ? <Settings /> : (isLoadingAuth ? null : <Home />)} />
      <Route path="/connected-accounts" element={isAuthenticated ? <ConnectedAccounts /> : (isLoadingAuth ? null : <Home />)} />
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-black text-white font-geist">
      <AuthenticatedApp />
      <FeedbackWidget />
      <Toaster />
    </div>
  );
}

export default App;