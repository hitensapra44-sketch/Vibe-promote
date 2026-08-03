import { createClient } from '@supabase/supabase-js' 

const supabaseUrl = "https://pxueqqjfvbrzfvmcbynu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dWVxcWpmdmJyemZ2bWNieW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTAwNTgsImV4cCI6MjA5MDAyNjA1OH0.u_mEpSJ8aRUCFyL5dNXqQQT7rQKDx7IWMLXf7WaZ-Jw";

export const supabase = createClient(supabaseUrl, supabaseKey) 

console.log("✅ Supabase client connected")