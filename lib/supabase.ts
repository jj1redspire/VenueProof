import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || url === 'undefined') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your Netlify environment variables.')
  }
  if (!key || key.startsWith('PASTE_YOUR')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add it to your Netlify environment variables.')
  }

  return createBrowserClient(url, key)
}
