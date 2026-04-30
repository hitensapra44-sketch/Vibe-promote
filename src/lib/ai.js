import { OpenAI } from 'openai';
import { supabase } from '../supabaseClient';

const client = new OpenAI({
  apiKey: "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",
  baseURL: `${window.location.origin}/api/ai`,
  dangerouslyAllowBrowser: true
});

export const generateAICall = async (systemPrompt, userMessage, userId = null) => {
  // If user ID is provided, fetch brand brain and inject its context into the system prompt
  if (userId) {
    const { data: brain, error } = await supabase
      .from('brand_brains')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && brain) {
      const brandContext = `Brand Name: ${brain.app_name}
Tone: ${brain.brand_tone}
Writing Style: ${brain.writing_style}
Target Audience: ${brain.target_customer}
Core Problem: ${brain.core_problem}
Unique Differentiator: ${brain.unique_differentiator}
Primary CTA: ${brain.primary_cta}`;
      
      systemPrompt = `${systemPrompt}\n\nBrand Context:\n${brandContext}`;
    }
  }

  try {
    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-mini-4b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("AI returned an empty response.");
    }

    let content = completion.choices[0].message.content;
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