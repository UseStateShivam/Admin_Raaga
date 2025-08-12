'use client'

import React, { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { Ticket } from '@/lib/types/types'

const mockTicket: Ticket = {
  ticket_id: 'RAGA-NIV001-A113',
  name: 'Divya Sharma',
  email: 'xyz@gmail.com',
  phone: '9951541261',
  seat_number: 'A13',
  category: 'Silver',
  serial_number: 'NIV001',
  event_id: 'nirvana-2025',
  razorpay_id: '',
  price: 1500,
  events: {
    event_id: 'nirvana-2025',
    name: 'Nirvana - Classical Music Concert',
    location: 'Bharat Mandapam, New Delhi',
    date: '11 OCT 2025',
    start_time: '4 PM',
    end_time: '8 PM',
    entry_time: '3 PM',
    description: 'A mesmerizing evening of classical Indian music',
    important_guidelines: 'Please arrive 30 minutes early',
    featured_artists: 'Ustad Amjad Ali Khan, Amaan Ali Bangash & Ayaan Ali Bangash',
  },
  status: 'confirmed',
  ticket_sent: false,
  ticket_pdf_url: '',
}

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return
    setLoading(true)

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 1.5, // Higher scale for better quality
        useCORS: true,
        width: 1359,
        height: 539,
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        unit: 'px',
        format: [1359, 539],
        orientation: 'landscape',
      })

      pdf.addImage(imgData, 'PNG', 0, 0, 1359, 539)
      pdf.save(`ticket-${mockTicket.seat_number}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Ticket PDF Generator Test</h1>

      {/* Ticket component with exact size */}
      <div
        ref={ticketRef}
        className="inline-block"
        style={{ width: '1359px', height: '539px' }}
      >
        <TicketWrapper ticket={mockTicket} />
      </div>

      <button
        onClick={handleDownloadPdf}
        disabled={loading}
        className={`px-6 py-3 rounded-md text-white font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {loading ? 'Generating PDF...' : 'Download Ticket PDF'}
      </button>
    </div>
  )
}

// Wrapper to generate QR code URL asynchronously
function TicketWrapper({ ticket }: { ticket: Ticket }) {
  const [qrDataURL, setQrDataURL] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(ticket.ticket_id).then(url => {
        if (isMounted) setQrDataURL(url)
      })
    })
    return () => {
      isMounted = false
    }
  }, [ticket.ticket_id])

  if (!qrDataURL) return <div>Loading ticket...</div>

  return (
    <div
      id="ticket-preview"
      className="w-[1359px] h-[570px] bg-white flex border border-black"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Left Blue Bar */}
      <div className="w-[70px] bg-[#2E3A87] flex items-center justify-center">
        <span className="text-[#F5C65E] font-bold text-[20px] -rotate-90">
          Event Ticket
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 px-10 py-8">
        {/* Logo + Artists */}
        <div>
          <img
            src="/nirvana-logo.png"
            alt="Nirvana Logo"
            className="h-[60px] object-contain"
          />
          <div className="mt-3 text-[15px] leading-snug">
            Ustad Amjad Ali Khan, Amaan Ali Bangash & Ayaan Ali Bangash <br />
            Pandit Sajan Misra, Swaraansh Misra <br />
            The Anirudh Varma Collective
          </div>
        </div>

        {/* Event Info */}
        <div className="mt-8 font-semibold text-[22px]">
          {ticket.events.date} | {ticket.events.start_time} ONWARDS
        </div>
        <div className="text-[17px]">
          At {ticket.events.location}
        </div>

        {/* User Info */}
        <div className="mt-8 text-[17px] leading-relaxed">
          <div><strong>Name :</strong> {ticket.name}</div>
          <div><strong>Email:</strong> {ticket.email}</div>
          <div><strong>Phone:</strong> {ticket.phone}</div>
        </div>

        {/* Seat Number */}
        <div className="mt-auto text-right text-[18px] font-semibold">
          Seat Number: {ticket.seat_number}
        </div>
      </div>

      {/* Purple Bar with Category */}
      <div className="w-[60px] bg-[#B989C9] flex items-center justify-center">
        <span className="text-white font-semibold text-[20px] -rotate-90 tracking-wide">
          {ticket.category}
        </span>
      </div>

      {/* QR Section */}
      <div className="w-[230px] bg-[#E5B14C] flex flex-col items-center justify-center">
        <img
          src={qrDataURL}
          alt="QR"
          className="w-[160px] h-[160px]"
        />
        <span className="text-[16px] font-medium mt-4">{ticket.ticket_id}</span>
      </div>
    </div>
  )
}
