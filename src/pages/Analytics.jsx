import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins flex items-center justify-center">
      <div className="text-center">
        <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
        <h1 className="text-2xl font-bold mb-2 text-zinc-900">Analytics Dashboard</h1>
        <p className="text-zinc-500">This is where your analytics will be displayed.</p>
        <p className="text-zinc-500 text-sm mt-2">Coming soon with more features!</p>
      </div>
    </div>
  );
}