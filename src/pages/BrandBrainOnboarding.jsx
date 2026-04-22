import React, { useState, useRef } from 'react';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function BrandBrainOnboarding({ onComplete }) {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [url, setUrl] = useState('');
  
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);
  const fieldRefs = {
    app_name: useRef(null),
    app_description: useRef(null),
    target_customer: useRef(null),
    core_problem: useRef(null),
  };

  const handleExtract = async () => {
    if (!url) {
      setExtractError("Please enter a URL first.");
      return;
    }

    setExtracting(true);
    setExtractError(null);
    setExtracted(false);

    const systemPrompt = `You are an expert at reading SaaS landing pages and extracting positioning data. The user will give you a URL. You must return a JSON object with exactly these four fields extracted from what you know or can infer about the product at that URL: app_name (the product name), app_description (one sentence describing what it does in plain language, not marketing speak), target_customer (the specific type of person this is built for, as specific as possible), core_problem (the single biggest problem this product solves for that customer). If you cannot find specific information, make a reasonable inference based on the URL domain name and any context clues. Never return empty fields. Always return valid JSON only with no explanation and no markdown.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nExtract positioning data from this URL: ${url}`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);

      setAppName(parsed.app_name || '');
      setAppDescription(parsed.app_description || '');
      setTargetCustomer(parsed.target_customer || '');
      setCoreProblem(parsed.core_problem || '');
      
      setExtracted(true);
    } catch (err) {
      console.error("Extraction failed:", err);
      setExtractError("Couldn't read that URL. Fill in the questions below instead.");
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!appName.trim()) newErrors.app_name = "This field is required";
    if (!appDescription.trim()) newErrors.app_description = "This field is required";
    if (!targetCustomer.trim()) newErrors.target_customer = "This field is required";
    if (!coreProblem.trim()) newErrors.core_problem = "This field is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      fieldRefs[firstErrorField].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({
        app_name: appName,
        app_description: appDescription,
        target_customer: targetCustomer,
        core_problem: coreProblem
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30">
      <div className="max-w-lg mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="text-violet-400 text-xs font-medium tracking-widest uppercase">Step 1 of 3</span>
            <div className="h-1 bg-zinc-800 rounded-full w-full mt-2 overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full w-1/3 transition-all duration-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Let's understand your app.</h1>
          <p className="text-zinc-400 text-sm mt-1">Answer 4 quick questions or paste your URL and we'll figure it out.</p>
        </header>

        {/* URL Mode */}
        <section className="mb-8">
          <label className="text-white text-sm font-medium block mb-1">Have a landing page or website?</label>
          <p className="text-zinc-400 text-sm mb-3">Paste your URL and we'll skip the questions entirely.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://yourapp.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-600"
            />
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {extracting ? 'Extracting...' : 'Extract →'}
            </button>
          </div>
          
          {extractError && (
            <p className="text-red-400 text-sm mt-2">{extractError}</p>
          )}
        </section>

        {/* Divider */}
        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-600 text-xs uppercase tracking-widest">or fill it in yourself</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Form Section */}
        <div ref={formRef} className="relative">
          {extracting ? (
            <div className="py-20 text-center">
              <p className="text-white text-lg font-medium mb-4">Reading your website...</p>
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
              <p className="text-zinc-500 text-xs">This takes about 10 seconds</p>
            </div>
          ) : (
            <div className="space-y-8">
              {extracted && (
                <div className="bg-violet-900/20 border border-violet-700/50 rounded-xl px-4 py-3 text-violet-300 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
                  We extracted your info. Review and edit anything before continuing.
                </div>
              )}

              {/* Q1 */}
              <div ref={fieldRefs.app_name}>
                <label className="text-white text-sm font-medium block mb-1">What's your app called?</label>
                <input
                  type="text"
                  placeholder="Vibe Hype"
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value);
                    if (errors.app_name) setErrors({...errors, app_name: null});
                  }}
                  className={`bg-zinc-900 border ${errors.app_name ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600`}
                />
                {errors.app_name && <p className="text-red-400 text-xs mt-1">{errors.app_name}</p>}
              </div>

              {/* Q2 */}
              <div ref={fieldRefs.app_description}>
                <label className="text-white text-sm font-medium block mb-1">What does it do? Your words, not marketing speak.</label>
                <p className="text-zinc-500 text-xs mb-2">Be honest and raw. The AI will sharpen this — but needs your version first.</p>
                <textarea
                  rows={3}
                  placeholder="e.g. Vibe Hype helps bootstrapped founders stop posting into the void by finding their exact audience and telling them what to say."
                  value={appDescription}
                  onChange={(e) => {
                    setAppDescription(e.target.value);
                    if (errors.app_description) setErrors({...errors, app_description: null});
                  }}
                  className={`bg-zinc-900 border ${errors.app_description ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600 resize-none`}
                />
                {errors.app_description && <p className="text-red-400 text-xs mt-1">{errors.app_description}</p>}
              </div>

              {/* Q3 */}
              <div ref={fieldRefs.target_customer}>
                <label className="text-white text-sm font-medium block mb-1">Who exactly is this for?</label>
                <p className="text-zinc-500 text-xs mb-2">Not 'marketers'. Get specific — role, situation, frustration level.</p>
                <textarea
                  rows={2}
                  placeholder="e.g. Solo SaaS founders with under 10 customers who feel invisible on social media"
                  value={targetCustomer}
                  onChange={(e) => {
                    setTargetCustomer(e.target.value);
                    if (errors.target_customer) setErrors({...errors, target_customer: null});
                  }}
                  className={`bg-zinc-900 border ${errors.target_customer ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600 resize-none`}
                />
                {errors.target_customer && <p className="text-red-400 text-xs mt-1">{errors.target_customer}</p>}
              </div>

              {/* Q4 */}
              <div ref={fieldRefs.core_problem}>
                <label className="text-white text-sm font-medium block mb-1">What's the #1 problem you solve?</label>
                <p className="text-zinc-500 text-xs mb-2">The thing your customer complains about at 11pm.</p>
                <textarea
                  rows={2}
                  placeholder="e.g. Founders spend hours writing posts that get zero engagement because they don't know who their audience is"
                  value={coreProblem}
                  onChange={(e) => {
                    setCoreProblem(e.target.value);
                    if (errors.core_problem) setErrors({...errors, core_problem: null});
                  }}
                  className={`bg-zinc-900 border ${errors.core_problem ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-violet-500 focus:bg-zinc-800 transition-all placeholder-zinc-600 resize-none`}
                />
                {errors.core_problem && <p className="text-red-400 text-xs mt-1">{errors.core_problem}</p>}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-4 w-full text-sm transition-colors mt-8 shadow-lg shadow-violet-600/10"
              >
                See your positioning →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}