import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

const FEEDBACK_TYPES = ['Bug report', 'Feature request', 'General feedback'];
const SHOW_ON = ['/dashboard', '/post-maker', '/dashboard/results-tracker', '/audience-spotter', '/marketing-buddy', '/progress', '/settings'];

export default function FeedbackWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we should show the widget on the current path
  const shouldShow = SHOW_ON.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));
  if (!shouldShow) return null;

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
      {/* Tab button with Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-0 z-[9999] flex flex-col items-center gap-3 px-2 py-4 rounded-l-xl border border-r-0 border-orange-500/30 bg-[#1a1a1a] shadow-2xl transition-all hover:bg-[#222] hover:border-orange-500/60 focus:outline-none group"
      >
        <MessageSquare size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
        <span 
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          className="text-[10px] font-bold tracking-widest text-white/60 group-hover:text-white uppercase"
        >
          Feedback
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-white/30 transition hover:bg-white/5 hover:text-white focus:outline-none bg-transparent border-none cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MessageSquare size={18} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-white">Share feedback</h2>
            </div>
            <p className="text-xs text-white/40 mb-6">Help us improve Vibe Promote for founders like you.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Type
                </label>
                <div className="flex gap-2">
                  {FEEDBACK_TYPES.map((o) => (
                    <button
                      key={o}
                      onClick={() => setType(o)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all bg-transparent ${
                        type === o 
                          ? 'border-orange-500 text-orange-500 bg-orange-500/5' 
                          : 'border-white/5 text-white/40 hover:border-white/10'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="What's on your mind? Be as specific as you like..."
                  className="w-full resize-none rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-orange-500/40"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-3 text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}