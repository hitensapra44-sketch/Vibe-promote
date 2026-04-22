import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandBrainOnboarding from './BrandBrainOnboarding';
import PositioningHelper from './PositioningHelper';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [appData, setAppData] = useState(null);
  const [positioningData, setPositioningData] = useState(null);
  const navigate = useNavigate();

  const handleStep1Complete = (data) => {
    setAppData(data);
    setStep(2);
  };

  const handleStep2Complete = (data) => {
    setPositioningData(data);
    // In a real app, we'd save this to Supabase here
    setStep(3);
    // For now, let's redirect to home or a final success screen
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {step === 1 && (
        <BrandBrainOnboarding onComplete={handleStep1Complete} />
      )}
      {step === 2 && (
        <PositioningHelper appData={appData} onComplete={handleStep2Complete} />
      )}
      {step === 3 && (
        <div className="min-h-screen flex items-center justify-center text-white p-6 text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">You're all set! 🚀</h1>
            <p className="text-zinc-400 mb-8">Your brand brain is ready. Taking you to your dashboard...</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-violet-600 px-8 py-3 rounded-xl font-bold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}