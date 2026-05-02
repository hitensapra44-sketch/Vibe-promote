"use client";

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function ConnectAccounts({ onFetch, isFetching, initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onFetch(username.trim());
    }
  };

  return (
    <div className="w-full bg-[#111111] border border-white/5 rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Reddit Username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. spez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all placeholder-zinc-700"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isFetching || !username.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
        >
          {isFetching ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Search size={20} />
              Fetch Posts
            </>
          )}
        </button>
      </form>
    </div>
  );
}