import { OpenAI } from 'openai';

// We use an absolute URL to satisfy the OpenAI client's validation while still using our proxy
const client = new OpenAI({
  apiKey: "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",
  baseURL: `${window.location.origin}/api/ai`,
  dangerouslyAllowBrowser: true 
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
      max_tokens: 4096,
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
    // If we still get a 404, it means the Vite proxy hasn't kicked in yet
    if (err.message.includes('404')) {
      throw new Error("Proxy not active. Please click the 'Restart' button above.");
    }
    throw err;
  }
};