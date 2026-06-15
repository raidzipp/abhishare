import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qnnhunuqglqnjadartdd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubmh1bnVxZ2xxbmphZGFydGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjM5NjQsImV4cCI6MjA5MDUzOTk2NH0.yKbT85ZmV7jrmR4YMgLKdsbzmx6T73U0GJUNVApNCA4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)