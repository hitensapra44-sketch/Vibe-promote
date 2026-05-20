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
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (!res.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch URL: ${res.statusText}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }

        const html = await res.text();

        // Simple regex-based extraction
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : '';

        const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) || 
                             html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

        const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i) ||
                            html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+property=["']og:description["']/i);
        const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

        // Extract H2 and H3 headings
        const headings: string[] = [];
        const headingRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;
        while ((match = headingRegex.exec(html)) !== null) {
          const text = match[2].replace(/<[^>]*>/g, '').trim();
          if (text) headings.push(text);
        }

        // Strip script, style, and HTML tags to get clean body text
        let bodyText = html;
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          bodyText = bodyMatch[1];
        }
        bodyText = bodyText.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
        bodyText = bodyText.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
        bodyText = bodyText.replace(/<[^>]*>/g, ' ');
        bodyText = bodyText.replace(/\s+/g, ' ').trim();

        const content = [
          `Title: ${title}`,
          `H1: ${h1}`,
          `Meta Description: ${metaDesc}`,
          `OG Description: ${ogDesc}`,
          `Headings:\n${headings.slice(0, 15).join('\n')}`,
          `Page Text:\n${bodyText.slice(0, 4000)}`
        ].join('\n\n').slice(0, 5000);

        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Failed to scrape URL" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }

    let apiKey = KEYS.FALLBACK;
    let model = 'nvidia/nemotron-mini-4b-instruct';

    if (feature === 'onboarding') {
      apiKey = KEYS.MINIMAX;
      model = 'mistralai/mistral-small-4-119b-2603';
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