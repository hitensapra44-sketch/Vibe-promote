"use client";

import { supabase } from '../supabaseClient';
import { queryClientInstance as queryClient } from './query-client';

/**
 * Marks a specific onboarding task as complete in the database.
 * @param {string} userId 
 * @param {string} taskKey - 'run_scan' | 'create_post' | 'connect_account' | 'set_goal' | 'dismissed'
 */
export async function completeOnboardingTask(userId, taskKey) {
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('onboarding_status')
      .update({ [taskKey]: true })
      .eq('user_id', userId);

    if (error) throw error;

    // Invalidate the TanStack Query key to update UI instantly
    queryClient.invalidateQueries({ queryKey: ['onboarding_status', userId] });
  } catch (err) {
    console.error(`[completeOnboardingTask] Failed to update ${taskKey}:`, err);
  }
}