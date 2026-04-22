import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import BrandBrainOnboarding from './BrandBrainOnboarding';
import PositioningHelper from './PositioningHelper';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [appData, setAppData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStep1Complete = (data) => {
    setAppData(data);
    setStep(2);
  };

  const handleStep2Complete = async (positioningResult) => {
    if (!user) {
      toast.error("You must be logged in to save your progress.");
      return;
    }

    const loadingToast = toast.loading("Saving your Brand Brain...");

    try {
      const { data: positioningData } = positioningResult;
      
      const brainData = {
        user_id: user.id,
        app_name: appData.app_name,
        app_description: appData.app_description,
        target_customer: appData.target_customer,
        core_problem: appData.core_problem,
        // If AI version was chosen, we use those fields
        positioning_statement: positioningData.positioningStatement || '',
        suggested_tagline: positioningData.suggestedTagline || '',
        core_value: positioningData.coreValue || '',
        key_differentiator: positioningData.keyDifferentiator || '',
        confidence_score: positioningData.confidenceScore || 0
      };

      const { error } = await supabase
        .from('brand_brains')
        .upsert(brainData, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Brand Brain saved! 🚀", { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save your Brand Brain. Please try again.", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {step === 1 && (
        <BrandBrainOnboarding onComplete={handleStep1Complete} />
      )}
      {step === 2 && (
        <PositioningHelper appData={appData} onComplete={handleStep2Complete} />
      )}
    </div>
  );
}