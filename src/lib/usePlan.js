import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const PLAN_LIMITS = {
  free: {
    userFinder: 10,
    postMaker: 15,
    copilot: "locked",
    analytics: "locked",
    connectedAccounts: 1,
    brandProfiles: 1
  },
  starter: {
    userFinder: 50,
    postMaker: 35,
    copilot: "unlimited",
    analytics: "preview",
    connectedAccounts: 2,
    brandProfiles: 1
  },
  pro: {
    userFinder: "unlimited",
    postMaker: "unlimited",
    copilot: "unlimited",
    analytics: "full",
    connectedAccounts: "unlimited",
    brandProfiles: 1
  },
  founder: {
    userFinder: "unlimited",
    postMaker: "unlimited",
    copilot: "unlimited",
    analytics: "full_insights",
    connectedAccounts: "unlimited",
    brandProfiles: "unlimited"
  }
};

export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (!user) {
        setPlan('free');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_payments')
          .select('plan, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setPlan(data?.plan || 'free');
      } catch (err) {
        console.error('Error fetching plan:', err);
        setPlan('free');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [user]);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  return {
    plan,
    isLoading,
    limits,
    canAccess: {
      copilot: limits.copilot === "unlimited",
      analyticsPreview: ["preview", "full", "full_insights"].includes(limits.analytics),
      analyticsFull: ["full", "full_insights"].includes(limits.analytics),
      analyticsInsights: limits.analytics === "full_insights"
    }
  };
}