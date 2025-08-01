'use client'

import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState } from 'react'

type Ticket = {
  name: string
  email: string
  phone: string
  event_id: string
  category: string
  status: string
  seat_number: string
  qr_code_url: string
  ticket_id: string
}

export default function ScanPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false)

    scanner.render(
      async (decodedText) => {
        scanner.clear()
        const res = await fetch('/api/scan-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket_id: decodedText }),
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Something went wrong')
          setTicket(null)
        } else {
          setTicket(data.ticket)
          setError(null)
        }
      },
      (err) => {
        console.warn('QR scan error:', err)
      }
    )

    return () => {
      scanner.clear().catch((e) => console.error('Failed to stop scanner', e))
    }
  }, [])

  const handleMarkUsed = async () => {
    if (!ticket) return
    const res = await fetch('/api/mark-used', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticket.ticket_id }),
    })

    if (res.ok) {
      setTicket({ ...ticket, status: 'USED' })
    }
  }

  const getThemeColor = () => {
    if (ticket?.status === 'CONFIRMED') return 'bg-green-100 text-green-800'
    if (ticket?.status === 'USED') return 'bg-red-100 text-red-800'
    return 'bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Scan Ticket QR</h1>
        <div id="reader" className="w-full" />

        {error && <p className="text-red-500">{error}</p>}

        {ticket && (
          <div className={`p-4 mt-4 rounded ${getThemeColor()}`}>
            <p><strong>Name:</strong> {ticket.name}</p>
            <p><strong>Email:</strong> {ticket.email}</p>
            <p><strong>Phone:</strong> {ticket.phone}</p>
            <p><strong>Seat Number:</strong> {ticket.seat_number}</p>
            <p><strong>Status:</strong> {ticket.status}</p>

            {ticket.status === 'CONFIRMED' && (
              <button
                onClick={handleMarkUsed}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              >
                Mark as Used
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
