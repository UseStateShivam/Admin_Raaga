// src/app/api/checkout-ticket/route.ts
import supabase from '@/lib/utils/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ticketID = searchParams.get('ticketID')

  if (!ticketID) {
    return NextResponse.json({ error: 'Missing ticketID in query' }, { status: 400 })
  }

  console.log(ticketID)

  const { data: ticket, error: ticketError } = await supabase
    .from('event_ticket_types')
    .select('*')
    .eq('ticket_type_id', ticketID)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError?.message || 'Ticket not found' }, { status: 404 })
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('name')
    .eq('event_id', ticket.event_id)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: eventError?.message || 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({
    ticketName: ticket.name,
    eventName: event.name,
    eventId: ticket.event_id
  }, { status: 200 })
}
