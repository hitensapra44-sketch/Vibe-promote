import { OpenAI } from 'openai';

// Using a relative path allows the Vite proxy to intercept the request correctly
const client = new OpenAI({
  apiKey: "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",
  baseURL: '/api/ai',
  dangerouslyAllowBrowser: true 
});

export const generateAICall = async (systemPrompt, userMessage) => {
  try {
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
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