import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
    let initialSessionResolved = false;

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
      initialSessionResolved = true;
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoadingAuth(false);

      if (currentUser) {
        // Only treat as a real sign-in event if the initial session check has already finished
        if (event === 'SIGNED_IN' && initialSessionResolved) {
          setAuthEvent('SIGNED_IN');
        } else {
          setAuthEvent(null); // session restore or initial load — do NOT trigger redirect
        }
        fetchPlan(currentUser.id);
      } else {
        setAuthEvent(null);
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