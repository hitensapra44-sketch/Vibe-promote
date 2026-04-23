const NVIDIA_API_KEY = "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";
const NVIDIA_MODEL = "qwen/qwen3.5-397b-a17b";
const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Using a CORS proxy to bypass browser restrictions
const PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(INVOKE_URL);

export const generateAICall = async (systemPrompt, userMessage) => {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
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
      max_tokens: 16384,
      temperature: 0.60,
      top_p: 0.95,
      stream: false,
      chat_template_kwargs: { enable_thinking: true }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Clean up response (remove thinking blocks and markdown)
  content = content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
  content = content.replace(/```json\n?|```/g, '').trim();

  return JSON.parse(content);
};