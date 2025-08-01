import { jsPDF } from 'jspdf'
import { Booking } from '../types/types'

export const generateTicketPDFBlob = (booking: Booking, qrDataUrl: string): Blob => {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('🎟️ Event Ticket', 20, 20)

  doc.addImage(qrDataUrl, 'PNG', 150, 10, 50, 50)

  doc.setFontSize(12)
  const details = [
    `Event: ${booking.event_name}`,
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Category: ${booking.category}`,
    `Seat Number: ${booking.seat_number}`,
  ]

  details.forEach((line, i) => {
    doc.text(line, 20, 40 + i * 10)
  })

  // Return the Blob for upload
  return doc.output('blob')
}
