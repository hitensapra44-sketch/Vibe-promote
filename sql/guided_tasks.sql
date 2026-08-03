CREATE TABLE IF NOT EXISTS public.user_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  day integer NOT NULL,
  task_key text NOT NULL,
  task_title text NOT NULL,
  task_description text NOT NULL,
  task_time text NOT NULL,
  route text NOT NULL,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal_type text,
  goal_label text,
  goal_target integer,
  current_value integer DEFAULT 0,
  streak integer DEFAULT 0,
  last_completed_date date,
  trial_start_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  sprint_start_date timestamptz,
  last_modal_shown_day integer[] DEFAULT '{}'::integer[]
);

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Explicit Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_tasks TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_progress TO authenticated;

-- Policies for user_tasks
CREATE POLICY "Users manage own tasks" ON public.user_tasks
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Policies for user_progress
CREATE POLICY "Users manage own progress" ON public.user_progress
FOR ALL TO authenticated USING (auth.uid() = user_id);