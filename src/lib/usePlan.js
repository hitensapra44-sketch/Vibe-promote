import { useAuth } from './AuthContext';

const PLAN_LIMITS = {
  free: {
    postMaker: 8,
    userFinder: 5,
    copilot: "locked",
    analytics: "locked"
  },
  starter: {
    postMaker: 60,
    userFinder: 50,
    copilot: 40,
    analytics: "preview"
  },
  pro: {
    postMaker: "unlimited",
    userFinder: "unlimited",
    copilot: "unlimited",
    analytics: "full"
  },
  founder: {
    postMaker: "unlimited",
    userFinder: "unlimited",
    copilot: "unlimited",
    analytics: "full"
  }
};

export function usePlan() {
  const { plan, planLoading } = useAuth();

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  return {
    plan,
    planLoading,
    limits,
    canAccess: {
      copilot: plan !== "free",
      analyticsFull: plan === "pro" || plan === "founder",
      analyticsPreview: plan === "starter" || plan === "pro" || plan === "founder"
    }
  };
}