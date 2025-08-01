import supabase from '@/lib/utils/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { ticket_id } = await req.json()

  const { error } = await supabase
    .from('tickets')
    .update({ status: 'USED' })
    .eq('ticket_id', ticket_id)

  if (error) {
    return NextResponse.json({ error: 'Failed to mark ticket as used' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
