import supabase from '@/lib/utils/supabaseClient'
import { NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventID = searchParams.get('eventID')

  if (!eventID) {
    return NextResponse.json({ error: 'Missing eventID in query' }, { status: 400 })
  }

  const key = `tickets_${eventID}`
  const cached = cache.get(key)

  if (cached) return NextResponse.json({ tickets: cached })

  const { data: tickets, error } = await supabase
    .from('event_ticket_types')
    .select('*')
    .eq('event_id', eventID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (tickets) {
    // Cache full list for event
    cache.set(key, tickets)

    // Cache individual tickets
    tickets.forEach(ticket => {
      if (ticket.id) {
        cache.set(`ticket_${ticket.id}`, ticket)
      }
    })
  }
  console.log(cache.get(`ticket_${tickets[0]?.id}`)) 
  return NextResponse.json({ tickets })
}
