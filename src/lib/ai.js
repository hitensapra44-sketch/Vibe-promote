import { OpenAI } from 'openai';

// Using absolute URL for the proxy to satisfy OpenAI client validation
const client = new OpenAI({
  apiKey: "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",
  baseURL: `${window.location.origin}/api/ai`,
  dangerouslyAllowBrowser: true 
});

export const generateAICall = async (systemPrompt, userMessage) => {
  try {
    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-mini-4b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("AI returned an empty response.");
    }

    let content = completion.choices[0].message.content;
    // Clean up any potential markdown formatting
    content = content.replace(/```json\n?|```/g, '').trim();
    
    return content;
  } catch (err) {
    console.error("AI Call Error:", err.message);
    if (err.message.includes('404')) {
      throw new Error("Proxy not active. Please click the 'Restart' button above.");
    }
    throw err;
  }
};