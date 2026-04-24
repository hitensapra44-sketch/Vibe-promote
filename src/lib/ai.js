export const generateAICall = async (systemPrompt, userMessage) => {
  try {
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemPrompt,
        userMessage
      })
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid server response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.details || "AI Proxy Error");
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("AI returned an empty or malformed response.");
    }

    let content = data.choices[0].message.content;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();
    
    return content;
  } catch (err) {
    console.error("AI Call Error:", err);
    throw err;
  }
};