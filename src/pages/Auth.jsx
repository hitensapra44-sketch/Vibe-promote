import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Chrome, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';
import ParticleBackground from '@/components/landing/particlebackground';
import WelcomeScreen from '@/components/auth/WelcomeScreen';
import StartScreen from '@/components/auth/StartScreen';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isSignInInitial = searchParams.get('mode') === 'signin';
  const [isSignIn, setIsSignIn] = useState(isSignInInitial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) toast.error(error.message);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const trimmedName = name.trim();
      const { data, error } = isSignIn
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            ...(trimmedName
              ? { options: { data: { full_name: trimmedName } } }
              : {}),
          });

      if (error) {
        if (isSignIn && (error.message.includes('invalid') || error.message.includes('credentials'))) {
          setAuthError('email or password is wrong');
          return;
        }
        throw error;
      }

      if (!isSignIn && data?.user?.identities?.length === 0) {
        toast.error("Email already registered. Try signing in.");
      } else if (!isSignIn) {
        setShowWelcome(true);
      } else {
        localStorage.setItem('joined_waitlist', 'true');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => {
      setShowWelcome(false);
      setShowStart(true);
    }} />;
  }

  if (showStart) {
    return <StartScreen onStart={() => {
      localStorage.setItem('joined_waitlist', 'true');
      navigate('/onboarding');
    }} />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-poppins bg-transparent">
      <ParticleBackground />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl bg-primary" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl px-4"
      >
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-muted rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white">
              {isSignIn ? 'Welcome Back' : 'Signup for free'}
            </h1>
            <p className="text-text-secondary mt-3 text-base">
              Start growing your app/saas
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-200 mb-8"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-surface px-4 text-text-secondary/50 font-medium tracking-widest">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            {!isSignIn && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary ml-1 uppercase tracking-wider">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-bg-elevated border border-border-muted text-text-primary placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary ml-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-bg-elevated border border-border-muted text-text-primary placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-bg-elevated border border-border-muted text-text-primary placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-white transition-colors bg-transparent"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {authError && (
                <p className="text-red-500 text-xs font-medium ml-1 mt-1">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xl flex items-center justify-center gap-2 transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Processing...' : "Let's go"}
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsSignIn(!isSignIn);
                setAuthError('');
              }}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {isSignIn ? "Don't have an account? " : "Already signed up? "}
              <span className="text-primary font-semibold underline underline-offset-4">
                {isSignIn ? 'Create one' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}