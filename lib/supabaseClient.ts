import { createBrowserClient } from '@supabase/ssr'

// Hardcoded keys for Vercel deployment (Temporary)
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xuaduskqfjyxzwykveeb.supabase.co'
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YWR1c2txZmp5eHp3eWt2ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Nzg4MzUsImV4cCI6MjA5MjE1NDgzNX0.5VA9POnFgXblt4ZOnAs7LpA-kdOVUx7d6RuYRrIaltg'

export function createClient() {
  return createBrowserClient(SB_URL, SB_KEY)
}

export const supabase = createClient()
