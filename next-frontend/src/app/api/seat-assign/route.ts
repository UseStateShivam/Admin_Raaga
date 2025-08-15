import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { PDFDocument, rgb } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let templateUrl: string = ''
  const { ticket_id, seat_number } = await req.json()

  // 1. Fetch ticket and event
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*, events(name)')
    .eq('ticket_id', ticket_id)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError }, { status: 404 })
  }

  // 2. Load Ticket PDF template from Supabase Storage
  if (ticket.category === 'SILVER') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Silver-Ticket-Template.pdf'
  } else if (ticket.category === 'SILVER PLUS') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Silver-Plus-Ticket-Template.pdf'
  } else if (ticket.category === 'GOLD') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Gold-Ticket-Template.pdf'
  } else if (ticket.category === 'GOLD PLUS') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Gold-Plus-Ticket-Template.pdf'
  } else if (ticket.category === 'DIAMOND') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Diamond-Ticket-Template.pdf'
  } else if (ticket.category === 'PLATINUM') {
    templateUrl = 'https://ysguytfjamrjqpioovfu.supabase.co/storage/v1/object/public/qr-codes/Nirvana-Platinum-Ticket-Template.pdf'
  }

  if (templateUrl === '') {
    return NextResponse.json({ error: "Ticket template not found" }, { status: 500 })
  }

  const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)

  // 3. Generate QR Code
  const qrDataURL = await QRCode.toDataURL(ticket_id, {
    color: {
      dark: '#000000',
      light: '#00000000',
    },
  })
  const qrImage = await pdfDoc.embedPng(qrDataURL)

  // 4. Get first page of PDF
  const page = pdfDoc.getPages()[0]

  page.drawText(ticket.name, { x: 200, y: 112, size: 24, color: rgb(0, 0, 0) })
  page.drawText(ticket.email, { x: 188, y: 76, size: 24, color: rgb(0, 0, 0) })
  page.drawText(ticket.phone, { x: 200, y: 37, size: 24, color: rgb(0, 0, 0) })
  page.drawText(ticket.serial_number, { x: 1108, y: 180, size: 16, color: rgb(0, 0, 0) })
  page.drawText(seat_number, { x: 884, y: 67, size: 28, color: rgb(0, 0, 0) })

  // Place QR code in top-right corner
  page.drawImage(qrImage, { x: 1090, y: 180, width: 204, height: 204 })

  // 6. Save new PDF
  const pdfBytes = await pdfDoc.save()

  // 7. Upload PDF to Supabase
  const pdfFileName = `pdf-${ticket_id}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('qr-codes')
    .upload(pdfFileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    console.error('PDF Upload Error:', uploadError)
    return NextResponse.json({ error: uploadError }, { status: 500 })
  }

  // 8. Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('qr-codes')
    .getPublicUrl(pdfFileName)

  // 9. Update ticket
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ seat_number, ticket_pdf_url: publicUrl })
    .eq('ticket_id', ticket_id)

  if (updateError) {
    console.error('Error updating ticket:', updateError)
    return NextResponse.json({ error: updateError }, { status: 500 })
  }

  return NextResponse.json({ success: true, pdf_url: publicUrl })
}
