ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS buffer_access_token text,
  ADD COLUMN IF NOT EXISTS buffer_channel_id text,
  ADD COLUMN IF NOT EXISTS buffer_channel_name text,
  ADD COLUMN IF NOT EXISTS connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS remind_email boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS remind_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
