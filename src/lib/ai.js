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

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`AI call failed [${feature}]: ${response.status} — ${err?.error || 'unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}