// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vvhmpwgmwvqcmzomoayj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aG1wd2dtd3ZxY216b21vYXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTc5MTAsImV4cCI6MjA2ODk3MzkxMH0.DY5hCFxfmETmH4GSkvv21pK8VBm9MEFiUPbcsde7iJc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
