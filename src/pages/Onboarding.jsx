import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import BrandBrainOnboarding from './BrandBrainOnboarding';
import PositioningHelper from './PositioningHelper';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStep1Complete = (data) => {
    setStep1Data(data);
    setStep(1.5); // Move to Positioning Helper
  };

  const handlePositioningComplete = async (result) => {
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
        app_description: result.data.positioningStatement || step1Data.app_description,
        target_customer: result.data.targetAudience || step1Data.target_customer,
        core_problem: result.data.coreProblemSolved || step1Data.core_problem,
        suggested_tagline: result.data.suggestedTagline || '',
        core_value: result.data.coreValue || '',
        unique_differentiator: result.data.coreValue || '',
        pain_phrases: result.data.audienceKeywords ? result.data.audienceKeywords.join(', ') : '',
        brand_tone: 'Authentic Founder',
        writing_style: 'Casual, direct, no-BS',
        primary_platform: result.data.selectedChannels ? result.data.selectedChannels.join(', ') : 'Reddit',
        primary_cta: result.data.suggestedTagline || '',
        current_stage: 'MVP',
        posting_frequency: 'Daily',
        audience_communities: result.data.bestCommunities ? JSON.stringify(result.data.bestCommunities.map(c => c.name.replace('r/', '').trim()).filter(Boolean)) : '[]',
        audience_keywords: result.data.audienceKeywords ? JSON.stringify(result.data.audienceKeywords) : '[]',
        audience_platforms: result.data.selectedChannels ? JSON.stringify(result.data.selectedChannels.map(c => c.toLowerCase())) : '["reddit"]'
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
    <div className="min-h-screen bg-background">
      {step === 1 && (
        <BrandBrainOnboarding onComplete={handleStep1Complete} />
      )}
      {step === 1.5 && (
        <PositioningHelper 
          appData={step1Data} 
          onComplete={handlePositioningComplete} 
        />
      )}
    </div>
  );
}