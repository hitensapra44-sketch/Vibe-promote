const NVIDIA_API_KEY = "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";
const NVIDIA_MODEL = "qwen/qwen3.5-397b-a17b";
const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Using a CORS proxy to bypass browser restrictions
const PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(INVOKE_URL);

export const generateAICall = async (systemPrompt, userMessage) => {
  const controller = new AbortController();
  // Set a generous timeout, though the proxy will likely limit us to 30-60s
  const timeoutId = setTimeout(() => controller.abort(), 320000);

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 2048, 
        temperature: 0.5,
        top_p: 0.9,
        stream: false,
        // Disabled thinking to stay under proxy timeout limits
        chat_template_kwargs: { enable_thinking: false }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();

    return JSON.parse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("The request took too long. Please try again.");
    }
    throw error;
  }
};