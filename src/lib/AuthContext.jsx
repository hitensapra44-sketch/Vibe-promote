import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [plan, setPlan] = useState('free');
  const [planLoading, setPlanLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState(null);

  useEffect(() => {
    const fetchPlan = async (userId) => {
      setPlanLoading(true);
      try {
        const { data } = await supabase
          .from('user_payments')
          .select('plan, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setPlan(data?.plan || 'free');
      } catch (err) {
        setPlan('free');
      } finally {
        setPlanLoading(false);
      }
    };

    // Synchronous check for cached session to avoid loading flicker
    try {
      const storageKeys = Object.keys(localStorage);
      const authKey = storageKeys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
      if (authKey) {
        const cachedSession = JSON.parse(localStorage.getItem(authKey));
        if (cachedSession?.user) {
          setUser(cachedSession.user);
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          fetchPlan(cachedSession.user.id);
        }
      }
    } catch (e) {
      console.warn('Auth cache read failed', e);
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoadingAuth(false);
      if (currentUser) {
        fetchPlan(currentUser.id);
      } else {
        setPlan('free');
        setPlanLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoadingAuth(false);

      if (event === 'INITIAL_SESSION') {
        setAuthEvent(null);
      } else if (event === 'SIGNED_IN') {
        setAuthEvent('SIGNED_IN');
      } else if (event === 'SIGNED_OUT') {
        setAuthEvent(null);
      }

      if (currentUser) {
        fetchPlan(currentUser.id);
      } else {
        setPlan('free');
        setPlanLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      logout,
      plan,
      planLoading,
      authEvent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};