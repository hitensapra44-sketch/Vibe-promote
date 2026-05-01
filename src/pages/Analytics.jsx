import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex items-center justify-center">
      <div className="text-center">
        <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-500">This is where your analytics will be displayed.</p>
        <p className="text-gray-500 text-sm mt-2">Coming soon with more features!</p>
      </div>
    </div>
  );
}