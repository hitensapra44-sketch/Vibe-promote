import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function SurveyStep({
  step,
  totalSteps,
  headline,
  question,
  type, // 'single' | 'multi' | 'text'
  options,
  value,
  onChange,
  showOtherInput,
  otherValue,
  onOtherChange,
}) {
  const progress = ((step) / totalSteps) * 100;

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-text-secondary font-medium">Step {step}/{totalSteps}</span>
          <span className="text-primary font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-border-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-primary font-bold tracking-wider uppercase text-xs mb-3">{headline}</p>
        <h2 className="text-2xl sm:text-4xl font-bold text-text-primary leading-tight">{question}</h2>
      </div>

      {/* Options */}
      {(type === 'single' || type === 'multi') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isMulti = type === 'multi';
            const arr = isMulti ? (Array.isArray(value) ? value : []) : null;
            const selected = isMulti ? arr.includes(opt) : value === opt;

            return (
              <button
                key={opt}
                onClick={() => {
                  if (isMulti) {
                    if (selected) {
                      onChange(arr.filter((v) => v !== opt));
                    } else {
                      onChange([...arr, opt]);
                    }
                  } else {
                    onChange(opt);
                  }
                }}
                className={`relative p-5 rounded-xl border text-left text-base font-medium transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary/10 text-text-primary'
                    : 'border-border-muted bg-bg-surface text-text-secondary hover:border-primary/50 hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                {selected && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {type === 'text' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={options?.[0] || 'Type your answer...'}
          rows={5}
          maxLength={500}
          className="w-full p-5 rounded-xl bg-bg-surface border border-border-muted text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all min-h-[160px] resize-none"
        />
      )}

      {/* Other input */}
      <AnimatePresence>
        {showOtherInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <input
              type="text"
              value={otherValue || ''}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Please specify..."
              className="w-full p-4 rounded-xl bg-bg-surface border border-border-muted text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}