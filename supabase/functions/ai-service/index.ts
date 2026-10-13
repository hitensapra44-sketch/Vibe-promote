import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FAST_MODEL = 'deepseek-ai/deepseek-v4-flash'
const PRO_MODEL  = 'deepseek-ai/deepseek-v4-pro-0813'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const rawKeys = [
    Deno.env.get('NVIDIA_API_KEY_1') ?? '',
    Deno.env.get('NVIDIA_API_KEY_2') ?? '',
    Deno.env.get('NVIDIA_API_KEY') ?? '',
  ];

  // Filter out empty keys and remove duplicates
  const configuredKeys = Array.from(new Set(rawKeys.map(k => k.trim()).filter(Boolean)));

  if (configuredKeys.length === 0) {
    return new Response(JSON.stringify({ error: 'No API keys configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  const key1 = configuredKeys[0];
  const key2 = configuredKeys[1] || configuredKeys[0];
  const fallbackKey = configuredKeys[configuredKeys.length - 1];

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

    // Default target model
    let targetModel = PRO_MODEL;
    if (feature === 'onboarding' || feature === 'content_plan') {
      targetModel = PRO_MODEL;
    } else if (feature === 'userfinder') {
      targetModel = FAST_MODEL;
    }

    const tryCall = async (key: string, modelName: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            max_tokens: max_tokens || 2048,
          }),
        });

        if (!res.ok) {
          const bodyText = await res.text();
          const preview = bodyText.slice(0, 300);
          console.log(`[ai-service] Call failed: feature=${feature} model=${modelName} status=${res.status} detail=${preview}`);
          return { ok: false, status: res.status, errorDetail: preview, data: null };
        }

        const data = await res.json();

        if (!data?.choices?.[0]?.message?.content) {
          console.log(`[ai-service] Empty content response for feature=${feature} model=${modelName}:`, JSON.stringify(data?.choices?.[0]?.message ?? data));
        }

        return { ok: true, status: res.status, errorDetail: null, data };
      } catch (err: any) {
        const isAbort = err.name === 'AbortError';
        const msg = isAbort ? 'Request timed out after 25s' : err.message;
        console.log(`[ai-service] Network/timeout error: feature=${feature} model=${modelName} error=${msg}`);
        return { ok: false, status: isAbort ? 504 : 502, errorDetail: msg, data: null };
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Step 1: Key 1 with targetModel
    let callResult = await tryCall(key1, targetModel);

    // Skip retries on client errors (400, 404)
    const isFatalClientError = callResult.status === 400 || callResult.status === 404;

    // Step 2: Key 2 with targetModel
    if (!callResult.ok && !isFatalClientError && key2 !== key1) {
      console.log(`[ai-service] Attempting retry with Key 2 for ${feature}...`);
      callResult = await tryCall(key2, targetModel);
    }

    // Step 3: PRO_MODEL with fallbackKey
    if (!callResult.ok && !isFatalClientError) {
      console.log(`[ai-service] Attempting final fallback with PRO_MODEL (${PRO_MODEL})...`);
      callResult = await tryCall(fallbackKey, PRO_MODEL);
    }

    if (!callResult.ok) {
      const responseStatus = (callResult.status >= 400 && callResult.status < 600) ? callResult.status : 502;
      return new Response(JSON.stringify({
        error: 'Upstream AI request failed',
        status: callResult.status,
        detail: callResult.errorDetail
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: responseStatus,
      });
    }

    return new Response(JSON.stringify(callResult.data), {
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