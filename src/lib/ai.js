const NVIDIA_API_KEY = "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";
const NVIDIA_MODEL = "moonshotai/kimi-k2-thinking";
const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const generateAICall = async (systemPrompt, userMessage) => {
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
      const error = await response.json();
      throw new Error(error.error?.message || "NVIDIA API Error");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();
    
    // If the model returns a string that is meant to be JSON, we return it as is
    // The calling components handle the JSON.parse
    return content;
  } catch (err) {
    console.error("AI Call Error:", err);
    throw err;
  }
};