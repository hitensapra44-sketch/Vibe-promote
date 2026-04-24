import { OpenAI } from 'openai';

// Initializing the client directly on the frontend to bypass the 404 proxy issue
const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export const generateAICall = async (systemPrompt, userMessage) => {
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

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("AI returned an empty response.");
    }

    let content = completion.choices[0].message.content;
    
    // Clean up response (remove markdown blocks if present)
    content = content.replace(/```json\n?|```/g, '').trim();
    
    return content;
  } catch (err) {
    console.error("AI Call Error:", err.message);
    throw err;
  }
};