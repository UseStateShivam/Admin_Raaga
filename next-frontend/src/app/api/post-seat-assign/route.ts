import supabase from '@/lib/utils/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ticket_id, seat_number } = body

  // Fetch the ticket and event details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*, events(event_name)')
    .eq('ticket_id', ticket_id)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Prepare ticket details for QR
  const qrData = {
    Name: ticket.name,
    Phone: ticket.phone,
    Email: ticket.email,
    Category: ticket.category,
    Event: ticket.events?.event_name || 'N/A',
    Seat: seat_number,
  }

  // Generate QR code (as Data URL)
  const qrString = Object.entries(qrData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  const qrCodeDataUrl = await QRCode.toDataURL(qrString)

  // Upload QR code to Supabase Storage
  const fileName = `qr_${ticket_id}.png`
  const base64Data = qrCodeDataUrl.split(',')[1]
  const buffer = Buffer.from(base64Data, 'base64')

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('qr_codes')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return NextResponse.json({ error: 'QR upload failed' }, { status: 500 })
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('qr_codes').getPublicUrl(fileName)

  // Update ticket with seat number and QR code URL
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      seat_number,
      qr_code_url: publicUrl,
    })
    .eq('ticket_id', ticket_id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }

  return NextResponse.json({ success: true, qr_code_url: publicUrl })
}
