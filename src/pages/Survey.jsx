// @ts-nocheck
import { supabase } from '../supabaseClient';
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import SurveyStep from '../components/survey/SurveyStep';
import SurveyComplete from '../components/survey/SurveyComplete';
import OnboardingStep1 from '../components/survey/OnboardingStep1';
import { toast } from 'sonner';
import { logEvent } from "../lib/analytics";


const saveSurveyData = async (payload) => {
  const records = payload.map(item => ({
    user_id: null,
    question_id: item.question_id,
    answer: item.answer
  }));

  const { error } = await supabase
    .from('user_answers')
    .insert(records);

  if (error) {
    console.error('❌ Supabase save error:', error);
    throw error;
  } else {
    console.log('✅ Survey persisted to Supabase user_answers table');
  }
};

const surveyConfig = [
  {
    id: 1,
    headline: 'S T E P 1',
    question: 'App Details',
    type: 'onboarding',
    field: 'app_details',
  },
  {
    id: 2,
    headline: 'Let\'s get to know you',
    question: 'What best describes your role?',
    type: 'single',
    field: 'role',
    otherField: 'role_other',
    options: [
      'SaaS / App founder',
      'Solo indie hacker / bootstrapped founder',
      'Product marketer / Growth lead',
      'Marketing manager (in-house at SaaS company)',
      'Agency/freelancer (specializing in SaaS)',
      'Developer building & marketing their own app',
      'Other',
    ],
  },
  {
    id: 3,
    headline: 'Helps us tailor the energy',
    question: 'What\'s your age group?',
    type: 'single',
    field: 'age_group',
    options: ['18–24', '25–34', '35–44', '45+'],
  },
  {
    id: 4,
    headline: 'Where should we help you shine?',
    question: 'Where are you marketing your App/SaaS right now?',
    type: 'multi',
    field: 'marketing_channels',
    otherField: 'marketing_channels_other',
    options: [
      'LinkedIn', 'X (Twitter)', 'Product Hunt', 'Indie Hackers',
      'TikTok / Instagram', 'YouTube', 'Reddit',
      'Paid ads (Google/Meta)', 'App stores', 'Other',
    ],
  },
  {
    id: 5,
    headline: 'So we know your playground',
    question: 'Your product type?',
    type: 'single',
    field: 'product_type',
    otherField: 'product_type_other',
    options: ['B2B SaaS', 'Consumer app', 'Mobile app', 'Web app', 'AI tool', 'Dev tool', 'Other'],
  },
  {
    id: 6,
    headline: 'What stage are you crushing?',
    question: 'Current focus stage?',
    type: 'single',
    field: 'focus_stage',
    options: ['Pre-launch (waitlist)', 'MVP launch', 'Growth & acquisition', 'Retention & expansion', 'All of the above'],
  },
];

export default function Survey() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    app_name: '',
    app_description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const navigate = useNavigate();

  const handleDone = useCallback(() => {
    navigate('/pre-purchase');
  }, [navigate]);

  const current = surveyConfig[step - 1];
  
  const canNext = () => {
    if (step === 1) {
      return answers.app_name.trim().length > 0 && answers.app_description.trim().length > 0;
    }
    const val = answers[current.field];
    if (current.type === 'text') return val && val.trim().length > 0;
    if (current.type === 'multi') return Array.isArray(val) && val.length > 0;
    return !!val;
  };

  const handleNext = async () => {
    if (!canNext()) return;
    if (step < surveyConfig.length) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const payload = surveyConfig.map(c => {
          if (c.id === 1) {
            return { 
              question_id: c.id, 
              answer: `Name: ${answers.app_name} | Desc: ${answers.app_description}` 
            };
          }
          const val = answers[c.field];
          let text = Array.isArray(val) ? val.join(', ') : (val || '');
          if (c.otherField && answers[c.otherField]) text += ` (Other: ${answers[c.otherField]})`;
          return { question_id: c.id, answer: text.trim() };
        }).filter(p => p.answer !== '');

        await saveSurveyData(payload);

        toast.success('Survey submitted successfully! 🔥');
        setShowComplete(true);
        logEvent("survey", "completed", "user finished survey");

      } catch (err) {
        console.error('❌ Submission error:', err);
        toast.error('Failed to save answers. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (showComplete) return <SurveyComplete onDone={handleDone} />;

  if (step === 1) {
    return (
      <OnboardingStep1 
        appName={answers.app_name}
        setAppName={(val) => setAnswers({ ...answers, app_name: val })}
        description={answers.app_description}
        setDescription={(val) => setAnswers({ ...answers, app_description: val })}
        onNext={handleNext}
        canNext={canNext()}
      />
    );
  }

  const hasOther = current.otherField && (
    current.type === 'single'
      ? answers[current.field] === 'Other'
      : Array.isArray(answers[current.field]) && answers[current.field].includes('Other')
  );

  return (
    <div className="min-h-screen font-poppins flex flex-col bg-[#0a0e1a]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800 bg-[#0a0e1a]/50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold">Vibe Hype</span>
        </Link>
        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>

      {/* Survey content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-full lg:max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <SurveyStep
              key={step}
              step={step}
              totalSteps={surveyConfig.length}
              headline={current.headline}
              question={current.question}
              type={current.type}
              options={current.options}
              value={answers[current.field]}
              onChange={(val) => setAnswers({ ...answers, [current.field]: val })}
              showOtherInput={hasOther}
              otherValue={answers[current.otherField]}
              onOtherChange={(val) => setAnswers({ ...answers, [current.otherField]: val })}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-white border border-gray-800 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canNext() || submitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${
                canNext() ? 'bg-indigo-700 hover:bg-indigo-600 opacity-100' : 'bg-indigo-900/20 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Submitting...' : step === surveyConfig.length ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}