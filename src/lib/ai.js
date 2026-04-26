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
      model: "deepseek-ai/deepseek-v4-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7, // Slightly lower temperature for faster, more focused results
      top_p: 0.95,
      max_tokens: 4096, // Reduced max tokens to prevent long-winded responses
      extra_body: {
        "chat_template_kwargs": {
          "thinking": false // Disabled thinking to speed up response
        }
      },
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