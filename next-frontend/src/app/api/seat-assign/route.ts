import supabase from '@/lib/utils/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ticket_id, seat_number } = body

  // 1. Fetch ticket and event
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*, events(name)')
    .eq('ticket_id', ticket_id)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError }, { status: 404 })
  }

  // 2. Generate QR Code (in-memory only)
  const qrDataURL = await QRCode.toDataURL(ticket_id)

  // 3. Generate PDF with QR embedded
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Event Ticket', 20, 20)

  doc.setFontSize(12)
  doc.text(`Name: ${ticket.name}`, 20, 40)
  doc.text(`Email: ${ticket.email}`, 20, 50)
  doc.text(`Phone: ${ticket.phone}`, 20, 60)
  doc.text(`Category: ${ticket.category}`, 20, 70)
  doc.text(`Event: ${ticket.events.name}`, 20, 80)
  doc.text(`Seat Number: ${seat_number}`, 20, 90)
  doc.addImage(qrDataURL, 'PNG', 150, 10, 50, 50)

  const pdfBlob = doc.output('blob')
  const pdfArrayBuffer = await pdfBlob.arrayBuffer()
  const pdfBuffer = Buffer.from(pdfArrayBuffer)

  // 4. Upload PDF to Supabase Storage
  const pdfFileName = `pdf-${ticket_id}.pdf`
  const { error: pdfUploadError } = await supabase.storage
    .from('qr-codes')
    .upload(pdfFileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (pdfUploadError) {
    console.error('PDF Upload Error:', pdfUploadError)
    return NextResponse.json({ error: pdfUploadError }, { status: 500 })
  }

  // 5. Get public URL of PDF
  const {
    data: { publicUrl: pdfPublicUrl },
  } = supabase.storage.from('qr-codes').getPublicUrl(pdfFileName)

  // 6. Update ticket
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      seat_number,
      ticket_pdf_url: pdfPublicUrl,
    })
    .eq('ticket_id', ticket_id)

  if (updateError) {
    console.error('Error updating ticket:', updateError)
    return NextResponse.json({ error: updateError }, { status: 500 })
  }

  // 7. Return response
  return NextResponse.json({
    success: true,
    pdf_url: pdfPublicUrl,
    pdf_filename: pdfFileName,
  })
}
