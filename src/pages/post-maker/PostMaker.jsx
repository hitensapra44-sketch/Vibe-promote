"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import PlatformSelector from '../../components/post-maker/PlatformSelector';
import PostModeSelector from '../../components/post-maker/PostModeSelector';
import TemplatePicker from '../../components/post-maker/TemplatePicker';
import WriteYourselfEditor from '../../components/post-maker/WriteYourselfEditor';
import PostOutput from '../../components/post-maker/PostOutput';

export default function PostMaker() {
  const [step, setStep] = useState('platform');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [postData, setPostData] = useState(null);

  const brandInfo = {
    appName: "Vibe Promote",
    problem: "Marketing takes too long for solo founders",
    audience: "SaaS founders",
    tone: "Authentic Founder",
    cta: "Try free for 14 days"
  };

  const reset = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setSelectedMode(null);
    setSelectedTemplate(null);
    setPostData(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 'platform' && (
          <PlatformSelector 
            onSelect={(p) => {
              setSelectedPlatform(p);
              setStep('mode');
            }} 
          />
        )}

        {step === 'mode' && (
          <PostModeSelector 
            platform={selectedPlatform}
            onSelectMode={(m) => {
              setSelectedMode(m);
              setStep(m === 'write' ? 'editor' : 'template');
            }}
            onBack={() => setStep('platform')}
          />
        )}

        {step === 'template' && (
          <TemplatePicker 
            platform={selectedPlatform}
            brandInfo={brandInfo}
            onSelectTemplate={(t) => {
              setSelectedTemplate(t);
              setStep('editor');
            }}
            onBack={() => setStep('mode')}
          />
        )}

        {step === 'editor' && (
          <WriteYourselfEditor 
            platform={selectedPlatform}
            brandInfo={brandInfo}
            template={selectedTemplate}
            onPostGenerated={(data) => {
              setPostData(data);
              setStep('output');
            }}
            onBack={() => setStep(selectedMode === 'template' ? 'template' : 'mode')}
          />
        )}

        {step === 'output' && (
          <PostOutput 
            postData={postData}
            brandInfo={brandInfo}
            onBack={reset}
            onRegenerate={() => setStep('editor')}
          />
        )}
      </main>
    </div>
  );
}