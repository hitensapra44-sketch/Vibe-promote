import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, User, ArrowRight, LogOut } from 'lucide-react';
import { supabase } from '@/supabaseClient';

export default function Navbar({ joined, onJoinWaitlist }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('joined_waitlist');
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { label: 'Features', id: 'features' },
    { label: 'How it Works', id: 'howitworks' },
    { label: 'Benefits', id: 'benefits' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-poppins ${scrolled ? 'bg-bg-base/90 backdrop-blur-xl border-b border-border-muted' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Vibe Promote</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-text-secondary hover:text-text-primary transition-colors text-base font-medium tracking-wide"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <AnimatePresence mode="wait">
                {!joined ? (
                  <motion.div
                    key="waitlist-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative p-[2px] rounded-lg bg-primary">
                      <button
                        onClick={() => scrollTo('waitlist')}
                        className="px-5 py-2 text-sm font-semibold text-white rounded-md hover:bg-primary-hover transition-all bg-bg-base"
                      >
                        Start Free
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="survey-btn"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 relative"
                  >
                    <Link
                      to="/survey"
                      className="group flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary-hover transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Do Survey (34s)
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="w-9 h-9 rounded-full flex items-center justify-center border border-border-muted transition-all duration-200 hover:scale-105 bg-bg-surface"
                      >
                        <User className="w-4 h-4 text-white" />
                      </button>

                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-3 w-40 rounded-xl border border-border-muted overflow-hidden shadow-xl bg-bg-elevated"
                          >
                            <button
                              onClick={handleLogout}
                              className="w-full flex flex-row items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                            >
                              <LogOut className="w-4 h-4" />
                              Log Out
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-bg-base/95 backdrop-blur-xl pt-20 px-6 md:hidden font-poppins text-text-primary"
          >
            <div className="flex flex-col gap-6">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-text-primary text-2xl font-semibold text-left"
                >
                  {l.label}
                </button>
              ))}
              <hr className="border-border-muted" />
              {!joined ? (
                <button
                  onClick={() => { setMobileOpen(false); scrollTo('waitlist'); }}
                  className="px-6 py-3 text-base font-semibold text-white rounded-lg text-center bg-primary hover:bg-primary-hover transition-all duration-200"
                >
                  Start Free
                </button>
              ) : (
                <Link
                  to="/survey"
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-3 text-base font-semibold text-white rounded-lg text-center bg-primary hover:bg-primary-hover transition-all duration-200"
                >
                  Do Survey (34s)
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}