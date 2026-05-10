import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

const FEEDBACK_TYPES = ['Bug report', 'Feature request', 'General feedback'];
const SHOW_ON = ['/dashboard', '/post-maker', '/dashboard/results-tracker', '/audience-spotter', '/marketing-buddy'];

export default function FeedbackWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!SHOW_ON.includes(location.pathname)) return null;

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          type,
          message: message.trim(),
          path: location.pathname
        });

      if (error) throw error;

      toast.success('Thanks for your feedback! 🙌');
      setType(FEEDBACK_TYPES[0]);
      setMessage('');
      setIsOpen(false);
    } catch (err) {
      console.error('Feedback error:', err);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Tab button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        className="fixed bottom-32 right-0 z-[9999] h-28 w-9 rounded-l-lg border border-r-0 border-orange-500/30 bg-[#1a1a1a] text-[11px] font-semibold tracking-widest text-white/60 shadow-lg transition-all hover:bg-[#222] hover:text-white hover:border-orange-500/60 focus:outline-none"
      >
        Feedback
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-orange-500/20 bg-[#111111] p-6 text-white shadow-2xl">

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-white/30 transition hover:bg-white/5 hover:text-white focus:outline-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-base font-bold text-white">Share your feedback</h2>
            <p className="mt-1 text-xs text-white/40">Help us improve Vibe Promote</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/40"
                >
                  {FEEDBACK_TYPES.map((o) => (
                    <option key={o} value={o} className="bg-[#111111]">{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us what's working or what we should improve..."
                  className="w-full resize-none rounded-lg border border-white/5 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-orange-500/40"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
              >
                {isSubmitting ? 'Sending...' : 'Send feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}