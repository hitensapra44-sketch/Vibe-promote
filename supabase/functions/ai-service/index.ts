import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FAST_MODEL = 'deepseek-ai/deepseek-v4-flash'
const PRO_MODEL  = 'deepseek-ai/deepseek-v4-pro-0813'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Names only. The actual keys live in Supabase secrets.
  const rawKeys = [
    Deno.env.get('NVIDIA_API_KEY_1') ?? '',
    Deno.env.get('NVIDIA_API_KEY_2') ?? '',
    Deno.env.get('NVIDIA_API_KEY_3') ?? '',
    Deno.env.get('NVIDIA_API_KEY') ?? '',
  ];
  const keys = Array.from(new Set(rawKeys.map(k => k.trim()).filter(Boolean)));

  try {
    const bodyJson = await req.json();
    const { feature, messages, temperature, max_tokens } = bodyJson;

    if (feature === 'scrape') {
      const { url } = bodyJson;
      if (!url) return json({ error: 'URL is required' }, 400);

      try {
        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        if (!firecrawlKey) throw new Error('Firecrawl key not configured');

        const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlKey}`,
          },
          body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
        });

        if (!res.ok) throw new Error(`Firecrawl error: ${await res.text()}`);

        const j = await res.json();
        const markdown = j?.data?.markdown || j?.markdown || '';
        if (!markdown || markdown.length < 100) {
          throw new Error('Page returned no usable content. Check the URL and try again.');
        }
        return json({ content: `URL: ${url}\n\n${markdown.slice(0, 12000)}` });
      } catch (err: any) {
        return json({ error: err.message || 'Could not fetch page.' }, 400);
      }
    }

    if (keys.length === 0) {
      return json({ error: 'No API keys configured' }, 500);
    }

    // Flash for interactive features, Pro only for rare structured generation
    let targetModel = FAST_MODEL;
    if (feature === 'onboarding' || feature === 'content_plan') {
      targetModel = PRO_MODEL;
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
          const preview = (await res.text()).slice(0, 300);
          console.log(`[ai-service] Call failed: feature=${feature} model=${modelName} status=${res.status} detail=${preview}`);
          return { ok: false, status: res.status, errorDetail: preview, data: null };
        }

        const data = await res.json();
        if (!data?.choices?.[0]?.message?.content) {
          console.log(`[ai-service] Empty content: feature=${feature} model=${modelName}`, JSON.stringify(data?.choices?.[0]?.message ?? data));
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

    // Try each key in order with the target model.
    // Stop early on 400/404, since another key won't fix a bad request or model.
    let result = await tryCall(keys[0], targetModel);
    for (let i = 1; i < keys.length && !result.ok; i++) {
      if (result.status === 400 || result.status === 404) break;
      console.log(`[ai-service] Retrying ${feature} with key #${i + 1}`);
      result = await tryCall(keys[i], targetModel);
    }

    // Last resort: PRO_MODEL, only if the target wasn't already PRO and the error isn't a client error
    if (!result.ok && targetModel !== PRO_MODEL && result.status !== 400 && result.status !== 404) {
      console.log(`[ai-service] Final fallback to PRO_MODEL for ${feature}`);
      result = await tryCall(keys[keys.length - 1], PRO_MODEL);
    }

    if (!result.ok) {
      const status = result.status >= 400 && result.status < 600 ? result.status : 502;
      return json({ error: 'Upstream AI request failed', status: result.status, detail: result.errorDetail }, status);
    }

    return json(result.data);
  } catch (error: any) {
    console.error('[ai-service] Error:', error.message);
    return json({ error: error.message }, 500);
  }
})