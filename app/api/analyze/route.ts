// analyze-auth-lock
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Used only to check who is calling (verifies the login token).
const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const MAX_PROMPT_CHARS = 8000

export async function POST(req: NextRequest) {
  try {
    // 1. Caller must be signed in.
    const header = req.headers.get('authorization') || ''
    const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: authData, error: authError } = await authClient.auth.getUser(token)
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Only forward one plain-text user message of sensible size.
    const body = await req.json()
    const messages = body?.messages
    if (
      !Array.isArray(messages) ||
      messages.length !== 1 ||
      messages[0]?.role !== 'user' ||
      typeof messages[0]?.content !== 'string' ||
      messages[0].content.length === 0 ||
      messages[0].content.length > MAX_PROMPT_CHARS
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: messages[0].content }],
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
