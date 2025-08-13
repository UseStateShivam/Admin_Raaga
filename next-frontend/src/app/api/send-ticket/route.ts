import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import supabase from '@/lib/utils/supabaseClient'
import { Ticket } from '@/lib/types/types'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDateWithOrdinal(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()

  const ordinalSuffix = (n: number) => {
    if (n > 3 && n < 21) return 'th'
    switch (n % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  return `${day}${ordinalSuffix(day)} ${month} ${year}`
}

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
      .select(`
       *,
        events(name, date, location)
      `)
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
    const eventName = ticket.events.name
    const eventDate = ticket.events.date
    const eventLocation = ticket.events.location
    const eventDateFormatted = formatDateWithOrdinal(eventDate)

    // 2. Send email
    const sendResult = await resend.emails.send({
      from: 'Tickets <tickets@raagaexperience.com>',
      to: email,
      subject: `🎟️ Your Ticket for ${eventName} is Here!`,
      html: `
        <p>Hi ${email.split('@')[0]} 👋</p>
        <p>Thank you for booking your spot at <strong>${eventName}</strong>.</p>
        <p>We can’t wait to see you on ${eventDateFormatted} at ${eventLocation}..</p>
        <p>Your ticket is attached below.</p>
        <p>You can also <a href="${ticketUrl}">download it here</a>.</p>
        <p>Tip: Save this ticket on your phone and bring a valid ID for smooth entry.</p>
        <p>See you at the concert! 💛</p>
        <p>Team Raaga Experience</p>
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
