create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'threads', 'reddit')),
  content text not null,
  subreddit text,
  scheduled_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  buffer_id text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.scheduled_posts enable row level security;

create policy "Users can view own scheduled posts"
  on public.scheduled_posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own scheduled posts"
  on public.scheduled_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scheduled posts"
  on public.scheduled_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own scheduled posts"
  on public.scheduled_posts for delete
  using (auth.uid() = user_id);

create index if not exists idx_scheduled_posts_user_id on public.scheduled_posts(user_id);
create index if not exists idx_scheduled_posts_scheduled_at on public.scheduled_posts(scheduled_at);
create index if not exists idx_scheduled_posts_status on public.scheduled_posts(status);
