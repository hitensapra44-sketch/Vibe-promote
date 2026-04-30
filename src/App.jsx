"use client";

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import BrandBrainView from './pages/BrandBrainView';
import PostMaker from './pages/post-maker/PostMaker';
import MarketingBuddy from './pages/marketing-buddy/MarketingBuddy';
import { useAuth } from './lib/AuthContext';

export default function App() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/brand-brain" element={<BrandBrainView />} />
      <Route path="/post-maker" element={<PostMaker />} />
      <Route path="/marketing-buddy" element={<MarketingBuddy />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}