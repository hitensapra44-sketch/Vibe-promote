import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const FEEDBACK_TYPES = ['Bug report', 'Feature request', 'General feedback'];
const VISIBLE_PATHS = [
  '/dashboard',
  '/audience-spotter',
  '/dashboard/results-tracker',
  '/post-maker',
];

export default function FeedbackWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState('');
  const [showThanks, setShowThanks] = useState(false);

  if (!VISIBLE_PATHS.includes(location.pathname)) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    console.log('Feedback submitted:', {
      type,
      message: trimmedMessage,
      path: location.pathname,
      submittedAt: new Date().toISOString(),
    });

    setType(FEEDBACK_TYPES[0]);
    setMessage('');
    setIsOpen(false);
    setShowThanks(true);

    window.setTimeout(() => {
      setShowThanks(false);
    }, 2500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-white/10 bg-[#1a1f2e] px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-[#20283b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#0f1117]"
      >
        Feedback
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 text-[#e5e7eb] shadow-2xl">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close feedback modal"
              className="absolute right-4 top-4 rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            >
              <span className="text-lg leading-none">x</span>
            </button>

            <h2 className="text-xl font-semibold text-white">Share your feedback</h2>
            <p className="mt-1 text-sm text-[#c9cfdd]">Help us improve Vibe Hype</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="feedback-type" className="mb-1 block text-sm font-medium">
                  Type
                </label>
                <select
                  id="feedback-type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1e2435] px-3 py-2 text-sm text-white outline-none transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/50"
                >
                  {FEEDBACK_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Tell us what is working or what we should improve..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#1a1f2e] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!message.trim()}
              >
                Send feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {showThanks && (
        <div className="fixed bottom-24 right-6 z-50 rounded-lg border border-white/10 bg-[#1a1f2e] px-4 py-2 text-sm text-white shadow-lg">
          Thanks for your feedback!
        </div>
      )}
    </>
  );
}
