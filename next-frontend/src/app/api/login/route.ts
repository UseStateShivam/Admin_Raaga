import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await req.json()
  const { email, secretKey } = body

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ message: 'Invalid secret key' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { error: authError } = await supabase.auth.signInWithOtp({ email })
  if (authError) {
    return NextResponse.json({ message: 'Failed to send login link' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Magic link sent to email' })
}
