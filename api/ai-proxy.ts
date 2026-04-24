import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userMessage } = req.body;

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "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";
  const NVIDIA_MODEL = "moonshotai/kimi-k2-thinking";
  const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

  try {
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 1,
        top_p: 0.9,
        max_tokens: 16384
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "NVIDIA API Error", details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}