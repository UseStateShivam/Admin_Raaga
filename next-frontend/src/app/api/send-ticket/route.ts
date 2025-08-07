import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import supabase from '@/lib/utils/supabaseClient'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticket_id } = body

    if (!ticket_id) {
      return new Response(JSON.stringify({ error: 'Missing ticket_id' }), { status: 400 })
    }

    // 1. Fetch ticket details with related event name
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('email, ticket_pdf_url, ticket_sent, events(name)')
      .eq('ticket_id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket fetch error:', ticketError)
      return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 })
    }

    if (!ticket.ticket_pdf_url) {
      return new Response(JSON.stringify({ error: 'Ticket PDF not available' }), { status: 400 })
    }

    if (ticket.ticket_sent) {
      return new Response(JSON.stringify({ error: 'Ticket already sent' }), { status: 409 })
    }

    const email = ticket.email
    const ticketUrl = ticket.ticket_pdf_url
    const eventName = 'Raaga Experience – Live Temple Concert'

    // 2. Send email
    const sendResult = await resend.emails.send({
      from: 'Tickets <write@raagaexperience.com>',
      to: email,
      subject: `🎟️ Your Ticket for ${eventName}`,
      html: `
        <p>Hi there! 👋</p>
        <p>Thanks for booking <strong>${eventName}</strong>.</p>
        <p>Your ticket is attached below. You can also <a href="${ticketUrl}">download it here</a>.</p>
      `,
      attachments: [
        {
          filename: 'ticket.pdf',
          path: ticketUrl,
        },
      ],
    })

    if (sendResult.error) {
      console.error('Resend error:', sendResult.error)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 })
    }

    // 3. Mark ticket as sent
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ ticket_sent: true })
      .eq('ticket_id', ticket_id)

    if (updateError) {
      console.warn('Ticket sent, but failed to update status:', updateError)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
