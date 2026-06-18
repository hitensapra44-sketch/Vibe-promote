import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const KEYS = {
  MINIMAX: Deno.env.get('NVIDIA_KEY_MINIMAX') ?? '',
  MISTRAL_1: Deno.env.get('NVIDIA_KEY_MISTRAL_1') ?? '',
  MISTRAL_2: Deno.env.get('NVIDIA_KEY_MISTRAL_2') ?? '',
  FALLBACK: Deno.env.get('NVIDIA_KEY_FALLBACK') ?? '',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!KEYS.FALLBACK) {
    return new Response(JSON.stringify({ error: 'API keys not configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const bodyJson = await req.json();
    const { feature, messages, temperature, max_tokens } = bodyJson;

    if (feature === 'scrape') {
      const { url } = bodyJson;
      if (!url) {
        return new Response(JSON.stringify({ error: "URL is required" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      try {
        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        if (!firecrawlKey) throw new Error('Firecrawl key not configured');

        const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlKey}`
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Firecrawl error: ${errText}`);
        }

        const json = await res.json();
        const markdown = json?.data?.markdown || json?.markdown || '';

        if (!markdown || markdown.length < 100) {
          throw new Error('Page returned no usable content. Check the URL and try again.');
        }

        const content = `URL: ${url}\n\n${markdown.slice(0, 12000)}`;

        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Could not fetch page.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }

    let apiKey = KEYS.FALLBACK;
    let model = 'nvidia/nemotron-mini-4b-instruct';

    if (feature === 'onboarding') {
      apiKey = KEYS.MISTRAL_1;
      model = 'meta/llama-3.1-8b-instruct';
    } else if (['post', 'copilot', 'analytics'].includes(feature)) {
      apiKey = KEYS.MISTRAL_1;
      model = 'meta/llama-3.1-8b-instruct';
    } else if (feature === 'content_plan') {
      apiKey = KEYS.MISTRAL_2;
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

    if (!response.ok && feature !== 'onboarding') {
      const secondaryKey = apiKey === KEYS.MISTRAL_2 ? KEYS.MISTRAL_1 : KEYS.MISTRAL_2;
      console.log(`[ai-service] Primary key failed for ${feature}, trying secondary key...`);
      response = await tryCall(secondaryKey, model);
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