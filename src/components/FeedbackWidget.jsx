import React, { useState } from 'react';

const FEEDBACK_TYPES = ['Bug report', 'Feature request', 'General feedback'];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState('');
  const [showThanks, setShowThanks] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    console.log('Feedback submitted:', {
      type,
      message: trimmedMessage,
      submittedAt: new Date().toISOString(),
    });

    setType(FEEDBACK_TYPES[0]);
    setMessage('');
    setIsOpen(false);
    setShowThanks(true);
    window.setTimeout(() => setShowThanks(false), 2500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        className="fixed bottom-24 right-0 z-50 h-20 w-7 rounded-l-md border border-r-0 border-orange-500/20 bg-[#111111] text-[10px] font-semibold tracking-widest text-white/50 shadow-md transition-all hover:bg-[#1a1a1a] hover:text-white/80 focus:outline-none"
      >
        Feedback
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-orange-500/20 bg-[#111111] p-6 text-white shadow-2xl">

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-white/40 transition hover:bg-white/5 hover:text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-base font-bold text-white">Share your feedback</h2>
            <p className="mt-1 text-xs text-white/40">Help us improve Vibe Hype</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20"
                >
                  {FEEDBACK_TYPES.map((option) => (
                    <option key={option} value={option} className="bg-[#111111]">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us what's working or what we should improve..."
                  className="w-full resize-none rounded-lg border border-white/5 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none"
              >
                Send feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {showThanks && (
        <div className="fixed bottom-28 right-4 z-50 rounded-lg border border-orange-500/20 bg-[#111111] px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          Thanks for your feedback!
        </div>
      )}
    </>
  );
}