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

    if (response.status === 404) {
      throw new Error("AI Proxy not found (404). Please restart the app server.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.details || `Server error: ${response.status}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("AI returned an empty response.");
    }

    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?|```/g, '').trim();
    
    return content;
  } catch (err) {
    console.error("AI Call Error:", err.message);
    throw err;
  }
};