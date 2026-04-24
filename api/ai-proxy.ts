import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userMessage } = req.body;

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({ error: 'Missing systemPrompt or userMessage' });
  }

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-thinking",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 1,
        top_p: 0.9,
        max_tokens: 16384,
        stream: false // Explicitly disable streaming to get a standard JSON response
      })
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.error("Upstream Error:", text);
      return res.status(response.status).json({ 
        error: 'Upstream API Error', 
        details: text 
      });
    }

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseErr) {
      console.error("JSON Parse Error on upstream response:", text);
      return res.status(500).json({ 
        error: 'Invalid JSON from upstream', 
        details: text.substring(0, 200) 
      });
    }
  } catch (error: any) {
    console.error("AI Proxy Exception:", error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}