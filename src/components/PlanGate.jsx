import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, BarChart2 } from 'lucide-react';

export default function PlanGate({ feature, plan, used, limit, children, fallback }) {
  const isLocked = limit === "locked";
  const isLimitReached = typeof limit === "number" && used >= limit;

  if (isLocked) {
    return fallback || (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-10 h-10 text-zinc-600 mb-4" />
        <h3 className="text-white font-semibold text-lg">This feature requires an upgrade</h3>
        <p className="text-zinc-500 text-sm mt-2">Upgrade your plan to unlock this feature.</p>
        <Link 
          to="/pricing" 
          className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  if (isLimitReached) {
    return fallback || (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BarChart2 className="w-10 h-10 text-zinc-600 mb-4" />
        <h3 className="text-white font-semibold text-lg">Monthly limit reached</h3>
        <p className="text-zinc-500 text-sm mt-2">
          You've used {used} of {limit} this month. Resets on the 1st.
        </p>
        <Link 
          to="/pricing" 
          className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  return children;
}