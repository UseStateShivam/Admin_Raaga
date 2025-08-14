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
            ticket_pdf_url,
            serial_number,
            seat_number,
            event_id,
            ticket_sent,
            events(name),
            created_at
        `)
        .order('email', { ascending: true })
        
    if (error) {
        console.error('Error fetching tickets:', error.message)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json(tickets)
}
