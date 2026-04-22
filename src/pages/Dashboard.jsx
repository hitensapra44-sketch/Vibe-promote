import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Brain,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .single();
      
      if (data) setBrain(data);
      setLoading(false);
    }
    fetchBrain();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Search, label: 'Audience Spotter' },
    { icon: PenTool, label: 'Hook Maker' },
    { icon: Calendar, label: 'Content Planner' },
    { icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-white font-poppins flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-muted flex flex-col bg-bg-surface/50 backdrop-blur-xl">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Vibe Promote</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-muted">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.email?.split('@')[0]}</h1>
            <p className="text-text-secondary">Here's what's happening with your brand today.</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
            <Zap className="w-4 h-4" />
            Quick Post
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand Brain Card */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-bg-surface border border-border-muted rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain className="w-32 h-32 text-white" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Your Brand Brain</h2>
              </div>

              {brain ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Current Tagline</span>
                    <p className="text-2xl font-bold text-white italic">"{brain.suggested_tagline}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/60 mb-1 block">Target Audience</span>
                      <p className="text-sm text-text-secondary">{brain.target_customer}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/60 mb-1 block">Core Value</span>
                      <p className="text-sm text-text-secondary">{brain.core_value}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-text-secondary mb-4">You haven't set up your Brand Brain yet.</p>
                  <Link to="/onboarding" className="text-primary font-bold hover:underline">Start Onboarding →</Link>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-bg-surface border border-border-muted rounded-3xl p-6 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Find My Audience</h3>
                <p className="text-sm text-text-secondary mb-4">Scan Reddit and X for people talking about your problem.</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  Start Scanning <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-bg-surface border border-border-muted rounded-3xl p-6 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Generate Hooks</h3>
                <p className="text-sm text-text-secondary mb-4">Create 5 viral hooks based on your brand voice.</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  Write Hooks <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats / Activity */}
          <div className="space-y-8">
            <section className="bg-bg-surface border border-border-muted rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6">Growth Stats</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Reach</span>
                  <span className="text-lg font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Engagement</span>
                  <span className="text-lg font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Signups</span>
                  <span className="text-lg font-bold">0</span>
                </div>
              </div>
              <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-xs text-text-secondary">Connect your accounts to see real-time analytics.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}