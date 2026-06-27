"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  LogOut,
  Sparkles,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Brain,
  Calendar,
  Link2,
  Menu,
  BarChart2,
  PenLine,
  Settings,
  Zap,
  Target,
  CalendarClock
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Sidebar({ isPaid }) {
  const { user, logout, plan } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', available: true },
    { icon: Target, label: 'My Progress', path: '/progress', available: true },
    { icon: Brain, label: 'Brand Brain', path: '/brand-brain', available: true },
    { icon: Search, label: 'User Finder', path: '/audience-spotter', available: true },
    { icon: PenLine, label: 'Post Maker', path: '/post-maker', available: true },
    { icon: BarChart2, label: 'Analytics', path: '/dashboard/results-tracker', available: true },
    { icon: Sparkles, label: 'Co-pilot', path: '/marketing-buddy', available: true },
    { icon: Settings, label: 'Settings', path: '/settings', available: true },
    { icon: TrendingUp, label: 'Virality Finder', path: '#', available: false, comingSoon: true },
    { icon: CalendarClock, label: 'Auto Poster', path: '/auto-poster', available: true },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          className="p-2 rounded-lg bg-background border border-foreground/10 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-background border-r border-foreground/5 z-50 transition-all duration-300 h-screen overflow-hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-16" : "lg:w-56"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-foreground" />
                <span className="text-sm font-bold tracking-tight">Vibe Promote</span>
              </div>
            )}
            <button 
              className="p-1.5 rounded-md hover:bg-foreground/5 text-foreground/70 transition-all bg-transparent border-none cursor-pointer"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.available) {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group bg-transparent border-none cursor-pointer",
                  location.pathname === link.path 
                    ? "bg-foreground/5 text-foreground" 
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
                  sidebarCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-4 h-4" />
                  {!sidebarCollapsed && (
                    <div className="flex flex-col items-start">
                      <span>{link.label}</span>
                      {link.comingSoon && (
                        <span className="text-[8px] text-orange-500/60 font-bold uppercase tracking-tighter">Coming Soon</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-foreground/5 space-y-3">
            {plan === 'free' && !sidebarCollapsed && (
              <button
                onClick={() => navigate('/pricing')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 flex-shrink-0 fill-orange-500" />
                Upgrade Now
              </button>
            )}

            <button
              onClick={() => {
                navigate('/connected-accounts');
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all bg-transparent border-none cursor-pointer",
                sidebarCollapsed ? "justify-center" : ""
              )}
            >
              <Link2 className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && "Connect accounts"}
            </button>

            {!sidebarCollapsed && (
              <div className="px-2">
                <p className="text-[9px] font-bold text-foreground/70 uppercase tracking-widest">Account</p>
                <p className="text-[10px] text-foreground/70 truncate mb-2">{user?.email}</p>
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                  isPaid ? "border-green-500/30 text-green-500" : "border-orange-500/30 text-orange-500"
                )}>
                  {isPaid ? "Lifetime" : "Free Tier"}
                </div>
              </div>
            )}
            
            {sidebarCollapsed && (
              <button 
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all bg-transparent border-none cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground/70 hover:text-red-400 hover:bg-red-400/5 transition-all bg-transparent border-none cursor-pointer",
                sidebarCollapsed ? "justify-center" : ""
              )}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && "Log Out"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}