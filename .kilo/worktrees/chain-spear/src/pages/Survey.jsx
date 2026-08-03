// @ts-nocheck
import { supabase } from '../supabaseClient';
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Rocket, Brain, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { logEvent } from "../lib/analytics";
import { useAuth } from '../lib/AuthContext';

const surveyConfig = [
  {
    id: 1,
    headline: 'S T E P 1',
    question: 'Tell us about your app.',
    subtext: 'One time. Vibe Hype remembers forever.',
    type: 'onboarding',
  },
  {
    id: 2,
    headline: 'S T E P 2',
    question: 'What best describes your role?',
    subtext: 'Helps us tailor the energy to your workflow.',
    type: 'single',
    field: 'role',
    otherField: 'role_other',
    options: [
      'SaaS / App founder',
      'Solo indie hacker',
      'Product marketer',
      'Marketing manager',
      'Agency / Freelancer',
      'Developer',
      'Other',
    ],
  },
  {
    id: 3,
    headline: 'S T E P 3',
    question: 'What\'s your age group?',
    subtext: 'So we know the vibe of your generation.',
    type: 'single',
    field: 'age_group',
    options: ['18–24', '25–34', '35–44', '45+'],
  },
  {
    id: 4,
    headline: 'S T E P 4',
    question: 'Where are you marketing?',
    subtext: 'Where should we help you shine?',
    type: 'multi',
    field: 'marketing_channels',
    otherField: 'marketing_channels_other',
    options: [
      'LinkedIn', 'X (Twitter)', 'Product Hunt', 'Indie Hackers',
      'TikTok / Instagram', 'YouTube', 'Reddit',
      'Paid ads', 'App stores', 'Other',
    ],
  },
  {
    id: 5,
    headline: 'S T E P 5',
    question: 'Your product type?',
    subtext: 'So we know your playground.',
    type: 'single',
    field: 'product_type',
    otherField: 'product_type_other',
    options: ['B2B SaaS', 'Consumer app', 'Mobile app', 'Web app', 'AI tool', 'Dev tool', 'Other'],
  },
  {
    id: 6,
    headline: 'S T E P 6',
    question: 'Current focus stage?',
    subtext: 'What stage are you crushing right now?',
    type: 'single',
    field: 'focus_stage',
    options: ['Pre-launch', 'MVP launch', 'Growth', 'Retention', 'All of the above'],
  },
];

export default function Survey() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    app_name: '',
    app_description: '',
    role: '',
    role_other: '',
    age_group: '',
    marketing_channels: [],
    marketing_channels_other: '',
    product_type: '',
    product_type_other: '',
    focus_stage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const current = surveyConfig[step - 1];

  const canNext = useMemo(() => {
    if (step === 1) {
      return answers.app_name.trim().length > 0 && answers.app_description.trim().length > 0;
    }
    const val = answers[current.field];
    if (current.type === 'multi') return Array.isArray(val) && val.length > 0;
    return !!val;
  }, [step, answers, current]);

  const handleNext = async () => {
    if (!canNext) return;
    if (step < surveyConfig.length) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const payload = surveyConfig.map(c => {
          if (c.id === 1) {
            return { 
              user_id: user?.id || null,
              question_id: c.id, 
              answer: `Name: ${answers.app_name} | Desc: ${answers.app_description}` 
            };
          }
          const val = answers[c.field];
          let text = Array.isArray(val) ? val.join(', ') : (val || '');
          if (c.otherField && answers[c.otherField]) text += ` (Other: ${answers[c.otherField]})`;
          return { 
            user_id: user?.id || null,
            question_id: c.id, 
            answer: text.trim() 
          };
        }).filter(p => p.answer !== '');

        const { error } = await supabase
          .from('user_answers')
          .insert(payload);

        if (error) throw error;

        toast.success('Survey submitted successfully! 🔥');
        logEvent("survey", "completed", "user finished survey");
        navigate('/pre-purchase');
      } catch (err) {
        console.error('❌ Survey save error:', err);
        toast.error('Failed to save answers. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderInput = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <input
            type="text"
            placeholder="What's it called?"
            value={answers.app_name}
            onChange={(e) => setAnswers({ ...answers, app_name: e.target.value })}
            className="w-full bg-[#111827] border border-gray-700 rounded-2xl px-6 py-5 text-white text-xl placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Describe it in one sentence..."
              value={answers.app_description}
              onChange={(e) => setAnswers({ ...answers, app_description: e.target.value.slice(0, 200) })}
              className="w-full bg-[#111827] border border-gray-700 rounded-2xl px-6 py-5 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />
            <div className="absolute bottom-4 right-6 text-gray-600 text-xs font-medium">
              {answers.app_description.length}/200
            </div>
          </div>
        </div>
      );
    }

    if (current.type === 'single' || current.type === 'multi') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map((opt) => {
            const isMulti = current.type === 'multi';
            const arr = isMulti ? (Array.isArray(answers[current.field]) ? answers[current.field] : []) : null;
            const selected = isMulti ? arr.includes(opt) : answers[current.field] === opt;

            return (
              <button
                key={opt}
                onClick={() => {
                  if (isMulti) {
                    if (selected) {
                      setAnswers({ ...answers, [current.field]: arr.filter((v) => v !== opt) });
                    } else {
                      setAnswers({ ...answers, [current.field]: [...arr, opt] });
                    }
                  } else {
                    setAnswers({ ...answers, [current.field]: opt });
                  }
                }}
                className={`relative p-5 rounded-xl border text-left text-base font-medium transition-all duration-200 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-700 bg-[#111827] text-gray-400 hover:border-indigo-500/50 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {selected && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center bg-indigo-600">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {opt}
              </button>
            );
          })}
          
          {(current.otherField && (
            current.type === 'single' 
              ? answers[current.field] === 'Other' 
              : answers[current.field]?.includes('Other')
          )) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="col-span-full mt-2">
              <input
                type="text"
                placeholder="Please specify..."
                value={answers[current.otherField]}
                onChange={(e) => setAnswers({ ...answers, [current.otherField]: e.target.value })}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </motion.div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-white font-poppins relative overflow-hidden flex flex-col">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full blur-[1px]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-500/20 rounded-full blur-[2px]" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-indigo-400/10 rounded-full blur-[4px]" />
      </div>

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex gap-2 items-center">
          {surveyConfig.map((s) => (
            <div 
              key={s.id} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id === step ? 'w-8 bg-white' : s.id < step ? 'w-4 bg-indigo-500' : 'w-4 bg-gray-700'
              }`} 
            />
          ))}
        </div>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">
          Skip
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 sm:px-12 gap-12 lg:gap-24">
        
        {/* Left Column: Form */}
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[60%] space-y-8"
        >
          <div>
            <span className="text-gray-500 tracking-[0.3em] text-sm font-bold uppercase block mb-4">{current.headline}</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              {current.question.split(' ').map((word, i) => (
                <span key={i} className={word.toLowerCase() === 'app.' ? 'text-white' : ''}>{word} </span>
              ))}
            </h1>
            <p className="text-gray-400 text-lg mt-4">{current.subtext}</p>
          </div>

          <div className="space-y-8">
            {renderInput()}

            <div className="flex gap-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-5 rounded-2xl font-bold text-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canNext || submitting}
                className={`group flex items-center justify-center gap-2 ${step > 1 ? 'flex-[2]' : 'w-full'} py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  canNext 
                  ? 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Saving...' : step === surveyConfig.length ? 'Finish' : 'Next Step'}
                <ArrowRight className={`w-5 h-5 transition-transform ${canNext ? 'group-hover:translate-x-1' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block w-full md:w-[40%] relative"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#111827] border border-gray-700/50 flex items-center justify-center shadow-2xl z-10">
            <Rocket className="w-8 h-8 text-indigo-500/40" />
          </div>

          <div className="bg-[#111827] border border-gray-700/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50 flex items-center justify-center border border-gray-700/30">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">YOUR APP BRAIN</span>
                <h3 className="text-lg font-bold text-white">Building live</h3>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">APP</span>
                <h2 className={`text-4xl font-bold transition-all duration-300 break-words ${answers.app_name ? 'text-white' : 'text-white/10'}`}>
                  {answers.app_name || 'Your app name'}
                </h2>
              </div>

              <div className="space-y-2">
                <p className={`text-lg leading-relaxed transition-all duration-300 ${answers.app_description ? 'text-gray-400' : 'text-white/5'}`}>
                  {answers.app_description || 'Your one-sentence description will appear here as Vibe Hype builds your marketing brain in real time.'}
                </p>
              </div>

              {/* Dynamic Insights based on answers */}
              <div className="pt-6 space-y-4">
                {answers.role && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Profile: {answers.role}</span>
                  </motion.div>
                )}
                {answers.marketing_channels.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Channels: {answers.marketing_channels.length} Active</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-800/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Syncing with AI</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-[#111827]/50 border border-gray-700/30 backdrop-blur-sm flex items-center justify-between">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              <span className="text-indigo-500 font-bold">Early Access</span> — some features may not work as expected. We appreciate your patience.
            </p>
            <X className="w-4 h-4 text-gray-700 cursor-pointer hover:text-white transition-colors" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}