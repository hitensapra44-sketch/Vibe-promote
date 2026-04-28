import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import BrandBrainOnboarding from './BrandBrainOnboarding';
import PositioningHelper from './PositioningHelper';
import BrandBrainOnboarding2 from './BrandBrainOnboarding2';
import PostPreview from './PostPreview';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStep1Complete = (data) => {
    setStep1Data(data);
    setStep(1.5); // Move to Positioning Helper
  };

  const handlePositioningComplete = (result) => {
    // If they chose AI, we update the core fields with AI's improved versions
    if (result.type === 'ai') {
      setStep1Data(prev => ({
        ...prev,
        app_description: result.data.positioningStatement,
        target_customer: result.data.targetAudience,
        suggested_tagline: result.data.suggestedTagline,
        core_value: result.data.coreValue
      }));
    }
    setStep(2);
  };

  const handleStep2Complete = (data) => {
    setStep2Data(data);
    setStep(3);
  };

  const handleFinalComplete = async () => {
    if (!user) {
      toast.error("You must be logged in to save your progress.");
      navigate('/auth');
      return;
    }

    const loadingToast = toast.loading("Finalizing your Brand Brain...");

    try {
      const brainData = {
        user_id: user.id,
        app_name: step1Data.app_name,
        app_description: step1Data.app_description,
        target_customer: step1Data.target_customer,
        core_problem: step1Data.core_problem,
        suggested_tagline: step1Data.suggested_tagline || '',
        core_value: step1Data.core_value || '',
        unique_differentiator: step2Data.unique_differentiator,
        pain_phrases: step2Data.pain_phrases,
        brand_tone: step2Data.brand_tone,
        writing_style: step2Data.writing_style,
        primary_platform: step2Data.primary_platform,
        primary_cta: step2Data.primary_cta,
        current_stage: 'MVP',
        posting_frequency: step2Data.posting_frequency || 'Daily'
      };

      const { error } = await supabase
        .from('brand_brains')
        .upsert(brainData, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Brand Brain ready! 🚀", { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save your Brand Brain.", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {step === 1 && (
        <BrandBrainOnboarding onComplete={handleStep1Complete} />
      )}
      {step === 1.5 && (
        <PositioningHelper 
          appData={step1Data} 
          onComplete={handlePositioningComplete} 
        />
      )}
      {step === 2 && (
        <BrandBrainOnboarding2 
          {...step1Data} 
          onComplete={handleStep2Complete} 
        />
      )}
      {step === 3 && (
        <PostPreview 
          {...step1Data} 
          {...step2Data} 
          onComplete={handleFinalComplete} 
        />
      )}
    </div>
  );
}