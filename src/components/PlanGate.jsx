import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, BarChart2 } from 'lucide-react';

export default function PlanGate({ 
  feature, 
  plan, 
  used = 0, 
  limit, 
  children, 
  fallback 
}) {
  const isLocked = limit === "locked";
  const isLimitReached = typeof limit === "number" && used >= limit;

  if (isLocked) {
    return fallback || (
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 flex flex-col items-center text-center">
        <Lock className="text-gray-500 w-8 h-8" />
        <h2 className="text-white font-semibold text-lg mt-4">This feature is locked</h2>
        <p className="text-gray-400 text-sm mt-2">Upgrade your plan to unlock this feature.</p>
        <Link 
          to="/pricing" 
          className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  if (isLimitReached) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const resetDate = nextMonth.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

    return fallback || (
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 flex flex-col items-center text-center">
        <BarChart2 className="text-gray-500 w-8 h-8" />
        <h2 className="text-white font-semibold text-lg mt-4">Monthly limit reached</h2>
        <p className="text-gray-400 text-sm mt-2">
          You have used {used} of {limit} this month. Resets on {resetDate}.
        </p>
        <Link 
          to="/pricing" 
          className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  return children;
}