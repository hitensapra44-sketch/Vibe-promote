import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/*
================================================================
  API KEYS — UPDATE THESE WHEN ROTATING KEYS
================================================================
  MINIMAX key  → used for: onboarding (BrandBrainOnboarding, 
                 PositioningHelper, PostPreview)
  MISTRAL_1    → used for: post maker, buddy chat, analytics buddy
  MISTRAL_2    → used for: user finder / audience spotter
  FALLBACK     → used by all features if primary fails
================================================================
*/

// Keys provided by the user
const KEYS = {
  MINIMAX: "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",
  MISTRAL_1: "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",
  MISTRAL_2: "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",
  FALLBACK: "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"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { feature, messages, temperature, max_tokens } = await req.json();

    let apiKey = KEYS.FALLBACK;
    let model = 'nvidia/nemotron-mini-4b-instruct';

    if (feature === 'onboarding') {
      apiKey = KEYS.MINIMAX;
      model = 'meta/llama-3.3-70b-instruct';
    } else if (['post', 'copilot', 'analytics'].includes(feature)) {
      apiKey = KEYS.MISTRAL_1;
      model = 'meta/llama-3.1-8b-instruct';
    } else if (feature === 'userfinder') {
      apiKey = KEYS.MISTRAL_2;
      model = 'meta/llama-3.3-70b-instruct';
    }

    const tryCall = async (key: string, modelName: string) => {
      return await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 1024,
        }),
      });
    };

    let response = await tryCall(apiKey, model);

    // Fallback logic if primary key for the feature fails
    if (!response.ok && feature !== 'onboarding') {
      console.log(`[ai-service] Primary key failed for ${feature}, trying secondary Mistral key...`);
      response = await tryCall(KEYS.MISTRAL_2, model);
    }

    if (!response.ok) {
      console.log(`[ai-service] Secondary key failed, trying global fallback...`);
      response = await tryCall(KEYS.FALLBACK, 'nvidia/nemotron-mini-4b-instruct');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("[ai-service] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})