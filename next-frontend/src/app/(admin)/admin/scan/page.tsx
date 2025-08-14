'use client'

import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Ticket = {
  name: string
  email: string
  phone: string
  event_id: string
  category: string
  status: string
  seat_number: string
  ticket_id: string
}

export default function ScanPage() {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let scanner: Html5QrcodeScanner

    Html5Qrcode.getCameras()
      .then((devices: any[]) => {
        if (devices && devices.length) {
          // Try to select the back camera (environment)
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
          ) || devices[0] // fallback to first camera

          scanner = new Html5QrcodeScanner(backCamera.id, { fps: 10, qrbox: 250 }, false)

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
            (err) => console.warn('QR scan error:', err)
          )
        }
      })
      .catch((err: Error) => console.error('Failed to get cameras', err))

    return () => {
      scanner?.clear().catch((e) => console.error('Failed to stop scanner', e))
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
    if (ticket?.status === 'CONFIRMED') return 'bg-green-900 text-green-300'
    if (ticket?.status === 'USED') return 'bg-red-900 text-red-300'
    return 'bg-gray-800 text-gray-300'
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white mt-40">
      <div className="max-w-xl mx-auto bg-[#1a1a1a] shadow-md rounded-lg p-6 space-y-4 border border-[#E0AF41]">
        <h1 className="text-xl font-bold text-[#E0AF41]">Scan Ticket QR</h1>
        <div id="reader" className="w-full border border-[#E0AF41] rounded-lg" />

        {error && <p className="text-red-400">{error}</p>}

        {ticket && (
          <div className={`p-4 mt-4 rounded ${getThemeColor()} border border-[#E0AF41]`}>
            <p><strong className="text-[#E0AF41]">Name:</strong> {ticket.name}</p>
            <p><strong className="text-[#E0AF41]">Email:</strong> {ticket.email}</p>
            <p><strong className="text-[#E0AF41]">Phone:</strong> {ticket.phone}</p>
            <p><strong className="text-[#E0AF41]">Seat Number:</strong> {ticket.seat_number}</p>
            <p><strong className="text-[#E0AF41]">Status:</strong> {ticket.status}</p>

            {ticket.status === 'CONFIRMED' && (
              <button
                onClick={handleMarkUsed}
                className="mt-4 bg-[#E0AF41] text-black font-semibold px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                Mark as Used
              </button>
            )}

            {ticket.status === 'USED' && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#E0AF41] text-black font-semibold px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                Go Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
