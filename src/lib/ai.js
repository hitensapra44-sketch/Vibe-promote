const NVIDIA_API_KEY = "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";
// Switching to a faster, highly capable model to avoid proxy timeouts
const NVIDIA_MODEL = "meta/llama-3.3-70b-instruct";
const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Using a CORS proxy to bypass browser restrictions
const PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(INVOKE_URL);

export const generateAICall = async (systemPrompt, userMessage) => {
  const controller = new AbortController();
  // Set a timeout that aligns better with proxy limits (approx 30s)
  const timeoutId = setTimeout(() => controller.abort(), 45000);

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
        max_tokens: 1024, 
        temperature: 0.5,
        top_p: 0.9,
        stream: false
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // Not JSON, use status text
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("The AI returned an invalid format. Please try again.");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("The request took too long. Please try again.");
    }
    throw error;
  }
};