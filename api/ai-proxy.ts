import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userMessage } = req.body;

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({ error: 'Missing systemPrompt or userMessage' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "moonshotai/kimi-k2-thinking",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 1,
      top_p: 0.9,
      max_tokens: 16384,
      stream: false
    });

    return res.status(200).json(completion);
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return res.status(500).json({ 
      error: 'AI Proxy Error', 
      details: error.message 
    });
  }
}