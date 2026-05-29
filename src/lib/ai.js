import { supabase } from '../supabaseClient';

export async function generateAICall(systemPrompt, userMessage, userId = null, feature = 'onboarding') {
  let finalSystemPrompt = systemPrompt;

  // If userId is passed, inject brand brain into system prompt
  if (userId) {
    try {
      const { data: brandBrain } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (brandBrain) {
        finalSystemPrompt = systemPrompt + `\n\nBRAND CONTEXT:\n${JSON.stringify(brandBrain)}`;
      }
    } catch (e) {
      console.warn('Could not fetch brand brain:', e);
    }
  }

  // Call the Supabase Edge Function instead of the local /api/ai path
  const { data, error } = await supabase.functions.invoke('ai-service', {
    body: {
      feature,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }
  });

  if (error) {
    throw new Error(`AI service error: ${error.message}`);
  }

  // Surface NVIDIA-level errors that come back as 200 but with error field
  if (data?.error) {
    throw new Error(`AI model error: ${data.error}`);
  }

  if (!data?.choices?.[0]?.message?.content) {
    console.error('[generateAICall] Unexpected response shape:', JSON.stringify(data));
    throw new Error("Invalid response from AI service");
  }

  return data.choices[0].message.content;
}