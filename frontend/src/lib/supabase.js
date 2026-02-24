import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://giumibwdsftyfcvfeypy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdW1pYndkc2Z0eWZjdmZleXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTI0NDgsImV4cCI6MjA4NzUyODQ0OH0.VjcPGeKBPLK1XgB1xaIQiVpNxPB35LCObpYcfjjv2dA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
