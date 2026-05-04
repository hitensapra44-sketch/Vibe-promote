"use client";

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Survey from './pages/Survey';
import PrePurchase from './pages/PrePurchase';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import BrandBrainView from './pages/BrandBrainView';
import PostMaker from './pages/post-maker/PostMaker';
import AudienceSpotter from './pages/AudienceSpotter';
import ResultsTracker from './pages/results-tracker/ResultsTracker';
import MarketingBuddy from './pages/marketing-buddy/MarketingBuddy';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ConnectedAccounts from './pages/ConnectedAccounts';
import FeedbackWidget from './components/FeedbackWidget';
import { useAuth } from './lib/AuthContext';

export default function App() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Define public routes that don't need a sidebar or auth
  const publicRoutes = ['/', '/auth', '/survey', '/pre-purchase'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex">
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/pre-purchase" element={<PrePurchase />} />

          {/* Protected Routes */}
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <Onboarding /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/brand-brain" 
            element={isAuthenticated ? <BrandBrainView /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/post-maker" 
            element={isAuthenticated ? <PostMaker /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/audience-spotter" 
            element={isAuthenticated ? <AudienceSpotter /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/dashboard/results-tracker" 
            element={isAuthenticated ? <ResultsTracker /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/marketing-buddy" 
            element={isAuthenticated ? <MarketingBuddy /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/analytics" 
            element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/connected-accounts" 
            element={isAuthenticated ? <ConnectedAccounts /> : <Navigate to="/auth" />} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <FeedbackWidget />
    </div>
  );
}