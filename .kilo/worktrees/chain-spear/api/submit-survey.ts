import { createClient } from '@supabase/supabase-js';

// Environment variables (should be set in your deployment platform)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a service role client to bypass RLS and handle transactions
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  // 1. Accept only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Accept only application/json
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  // 3. Verify Supabase JWT token or handle anonymous
  const authHeader = req.headers['authorization'];
  let user_id = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!authError && user) {
      user_id = user.id;
    } else if (authError) {
      return res.status(401).json({ error: 'Invalid authentication token', details: authError.message });
    }
  }

  // If still no user_id and it's meant to be anonymous, we'll use a placeholder or null
  // The user specifically asked to "save even if not logged in"
  if (!user_id) {
    user_id = '00000000-0000-0000-0000-000000000000'; // Default anonymous UUID
  }

  const payload = req.body;

  // 4. Validate payload structure
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: 'Payload must be an array of answers' });
  }

  // 5. Start PostgreSQL transaction logic
  // Since we're in a serverless environment, we'll use a single .rpc() call 
  // or a batched insert with error handling to ensure atomicity.
  // The most reliable way for transactions in Supabase is via an RPC function:
  //
  // CREATE OR REPLACE FUNCTION submit_survey_transaction(payload JSONB, user_uuid UUID)
  // RETURNS void AS $$
  // BEGIN
  //   INSERT INTO user_answers (user_id, question_id, answer)
  //   SELECT user_uuid, (item->>'question_id')::int, (item->>'answer')::text
  //   FROM jsonb_array_elements(payload) AS item;
  // END;
  // $$ LANGUAGE plpgsql;

  try {
    console.log(`[${new Date().toISOString()}] Submission attempt for user: ${user_id}`);

    // Data validation: Check each element in payload
    for (const item of payload) {
      if (typeof item.question_id !== 'number' || typeof item.answer !== 'string' || !item.answer.trim()) {
        return res.status(400).json({ error: 'Invalid question_id or empty answer provided' });
      }
    }

    // Prepare data for batched insert (Supabase client handles this as a single transaction)
    const records = payload.map(item => ({
      user_id: user_id,
      question_id: item.question_id,
      answer: item.answer.trim()
    }));

    const { error: insertError } = await supabaseAdmin
      .from('user_answers')
      .insert(records);

    if (insertError) {
      throw insertError;
    }

    console.log(`[${new Date().toISOString()}] ✅ Successful submission for user: ${user_id}`);
    return res.status(201).end();

  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] ❌ Submission failed for user: ${user_id}`, err);
    return res.status(500).json({
      error: 'An internal server error occurred while persisting survey data.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
