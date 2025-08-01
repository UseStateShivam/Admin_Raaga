import supabase from '@/lib/utils/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
    // Fetch all tickets
    const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
            ticket_id,
            name,
            email,
            phone,
            category,
            qr_code_url,
            seat_number,
            event_id
        `)
        .order('email', { ascending: true })
        
    if (error) {
        console.error('Error fetching tickets:', error.message)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    // For each ticket, fetch its event name
    const formatted = await Promise.all(
        tickets.map(async (ticket) => {
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('name')
                .eq('event_id', ticket.event_id)
                .single()

            return {
                ...ticket,
                event_name: eventData?.name || 'Unknown Event',
            }
        })
    )
    console.log(formatted)
    return NextResponse.json(formatted)
}
