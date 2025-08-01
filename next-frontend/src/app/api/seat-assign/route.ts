import supabase from '@/lib/utils/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ticket_id, seat_number } = body

  // 1. Fetch ticket + event
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*, events(name)')
    .eq('ticket_id', ticket_id)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError }, { status: 404 })
  }

  // 2. Generate QR as PNG buffer
  const buffer = await QRCode.toBuffer(ticket_id, { type: 'png' })

  // 3. Upload to Supabase Storage
  const fileName = `qr-${ticket_id}.png`

  const { error: uploadError } = await supabase.storage
    .from('qr-codes')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload QR code to storage' }, { status: 500 })
  }

  // 4. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('qr-codes').getPublicUrl(fileName)

  // 5. Update ticket record
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      seat_number,
      qr_code_url: publicUrl,
    })
    .eq('ticket_id', ticket_id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update ticket with QR URL' }, { status: 500 })
  }

  // 6. Return the public URL of the QR
  return NextResponse.json({
    success: true,
    qr_code_url: publicUrl,
    filename: fileName,
  })
}
