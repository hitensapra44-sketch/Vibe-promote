const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";
const INVOKE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const generateAICall = async (systemPrompt, userMessage) => {
  try {
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `System Instructions: ${systemPrompt}\n\nUser Input: ${userMessage}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Gemini API Error");
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();
    return content;
  } catch (err) {
    console.error("AI Call Error:", err);
    throw err;
  }
};