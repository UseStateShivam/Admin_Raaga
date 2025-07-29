import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Step 1: Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 2: Get tickets for the user
  const { data: tickets, error: ticketError } = await supabase
    .from('tickets')
    .select('name, category, status, event_id')
    .eq('user_id', user.id)

  if (ticketError) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }

  // Step 3: For each ticket, fetch event name + ticket price
  const enrichedTickets = await Promise.all(
    tickets.map(async (ticket) => {
      const { event_id, category } = ticket

      // 3a: Fetch event name
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('name')
        .eq('event_id', event_id)
        .single()

      // 3b: Fetch ticket price from event_ticket_types
      const { data: ticketType, error: priceError } = await supabase
        .from('event_ticket_types')
        .select('price')
        .eq('event_id', event_id)
        .eq('name', category)
        .single()

      return {
        name: ticket.name,
        category: ticket.category,
        status: ticket.status,
        eventName: event?.name || 'Unknown Event',
        price: ticketType?.price || 'Unknown',
      }
    })
  )

  return NextResponse.json({ tickets: enrichedTickets }, { status: 200 })
}
