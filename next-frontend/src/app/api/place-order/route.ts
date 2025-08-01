import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { tickets } = await req.json();

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return NextResponse.json({ error: 'No tickets provided' }, { status: 400 });
  }

  for (const t of tickets) {
    const { user_id, name, email, phone, event_id, category, razorpay_id } = t;
    if (!user_id || !name || !email || !phone || !event_id || !category || !razorpay_id) {
      return NextResponse.json({ error: 'Missing required fields in one of the tickets' }, { status: 400 });
    }
  }

  const toInsert = tickets.map(t => ({
    ...t,
    payment_status: 'PAID',
    confirmation_sent: false,
    qr_sent: false,
    seat_number: null,
    ticket_pdf_url: null,
  }));

  const { data, error } = await supabase.from('tickets').insert(toInsert).select();

  if (error) {
    console.error('Error inserting tickets:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }

  return NextResponse.json({ success: true, tickets: data }, { status: 200 });
}
