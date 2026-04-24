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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI Proxy Error");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up response (remove markdown blocks)
    content = content.replace(/```json\n?|```/g, '').trim();
    
    return content;
  } catch (err) {
    console.error("AI Call Error:", err);
    throw err;
  }
};