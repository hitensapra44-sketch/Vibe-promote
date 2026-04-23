import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from "react";
import { initGA, logPageView } from "./lib/analytics";
import PageNotFound from './lib/PageNotFound';

import Home from './pages/Home';
import Survey from './pages/Survey';
import PrePurchase from './pages/PrePurchase';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AudienceSpotter from './pages/AudienceSpotter';
import HookMaker from './pages/HookMaker';

import GridBackground from "@/components/ui/grid-background"

function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <div className="min-h-screen w-full max-w-screen-2xl mx-auto overflow-x-hidden text-text-primary relative">
        <GridBackground />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/pre-purchase" element={<PrePurchase />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audience-spotter" element={<AudienceSpotter />} />
          <Route path="/hook-maker" element={<HookMaker />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App