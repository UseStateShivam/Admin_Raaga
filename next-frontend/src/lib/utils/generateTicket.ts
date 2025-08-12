import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { Ticket } from '../types/types'

export async function generateTicketPDF(ticket: Ticket) {
  const doc = new jsPDF({ unit: 'pt', format: [400, 160] }) // smaller custom size

  // Colors
  const blue = '#2E3A87'
  const purple = '#A16DB2'
  const yellow = '#E5B14C'
  const black = '#000000'

  // Draw left blue vertical bar
  doc.setFillColor(46, 58, 135)
  doc.rect(0, 0, 50, 160, 'F')

  // Add "Event Ticket" vertically in left bar
  doc.setTextColor('white')
  doc.setFontSize(14)
  doc.text('Event Ticket', 25, 80, { 
    align: 'center',
    angle: -90 
  })

  // Draw right vertical purple bar
  doc.setFillColor(161, 109, 178)
  doc.rect(330, 0, 20, 160, 'F')

  // Add "Silver" vertically in right bar
  doc.setTextColor('white')
  doc.setFontSize(12)
  doc.text('Silver', 340, 80, { 
    align: 'center',
    angle: -90 
  })

  // Draw right yellow box
  doc.setFillColor(229, 177, 76)
  doc.rect(350, 0, 50, 160, 'F')

  // Add QR Code on yellow section
  const qrDataURL = await QRCode.toDataURL(ticket.ticket_id)
  doc.addImage(qrDataURL, 'PNG', 355, 15, 40, 40)

  // Add QR code text below QR
  doc.setTextColor(black)
  doc.setFontSize(6)
  doc.text('RAGA-NIV001', 375, 65, { align: 'center' })

  // Add event logo placeholder top-left (optional)
  // doc.addImage(yourLogoDataURL, 'PNG', 60, 10, 60, 40)

  // Add event details on white center area
  doc.setTextColor(black)
  doc.setFontSize(8)
  doc.text('Ustad Amjad Ali Khan, Amaan Ali Bangash & Ayaan Ali Bangash', 60, 30)
  doc.text('Pandit Sajan Misra, Swaraansh Misra', 60, 40)
  doc.text('The Anirudh Varma Collective', 60, 50)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('11 OCT 2025 | 4 PM ONWARDS', 60, 70)
  doc.setFont('helvetica', 'normal')
  doc.text('At Bharat Mandapam, New Delhi', 60, 80)

  // User info on left side
  doc.text(`Name : ${ticket.name}`, 60, 100)
  doc.text(`Email: ${ticket.email}`, 60, 110)
  doc.text(`Phone: ${ticket.phone}`, 60, 120)

  // Seat number on right side near center
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Seat Number: ${ticket.seat_number}`, 270, 120)

  return doc
}