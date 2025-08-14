'use client'

import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode'
import { useEffect, useState } from 'react'

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
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannerStarted, setScannerStarted] = useState(false)
  const [cameraId, setCameraId] = useState<string | null>(null)

  // Detect cameras when scanner is started
  useEffect(() => {
    if (!scannerStarted) return

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          setError('No cameras found on this device.')
          return
        }

        // Prefer back camera
        const backCamera = devices.find((device) =>
          /back|rear|environment/gi.test(device.label)
        )
        setCameraId(backCamera ? backCamera.id : devices[0].id)
      })
      .catch((err) => setError('Error detecting cameras: ' + err))
  }, [scannerStarted])

  // Start scanning when cameraId is available
  useEffect(() => {
    if (!scannerStarted || !cameraId) return

    const html5Qrcode = new Html5Qrcode('reader')

    const qrCodeSuccessCallback = async (decodedText: string) => {
      html5Qrcode.stop().catch(() => {})
      try {
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
      } catch (err) {
        setError('Failed to fetch ticket info.')
        setTicket(null)
      }
    }

    const config: Html5QrcodeCameraScanConfig = {
      fps: 10,
      qrbox: 300,
      // experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    }

    html5Qrcode
      .start(cameraId, config, qrCodeSuccessCallback, (err) => {
        console.warn('Scan error:', err)
      })
      .catch((err) => setError('Camera start failed: ' + err))

    return () => {
      html5Qrcode.stop().catch(() => {})
    }
  }, [cameraId, scannerStarted])

  const handleMarkUsed = async () => {
    if (!ticket) return
    const res = await fetch('/api/mark-used', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticket.ticket_id }),
    })
    if (res.ok) setTicket({ ...ticket, status: 'USED' })
  }

  const getThemeColor = () => {
    if (ticket?.status === 'CONFIRMED') return 'bg-green-900 text-green-300'
    if (ticket?.status === 'USED') return 'bg-red-900 text-red-300'
    return 'bg-gray-800 text-gray-300'
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1a1a1a] shadow-xl rounded-2xl p-6 space-y-6 border border-[#E0AF41]">
        <h1 className="text-2xl font-bold text-center text-[#E0AF41]">Scan Ticket QR</h1>

        {!scannerStarted && (
          <button
            onClick={() => {
              setError(null)
              setScannerStarted(true)
            }}
            className="w-full bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition-all duration-300 shadow-md"
          >
            Start Scanner
          </button>
        )}

        {scannerStarted && (
          <div className="relative w-full h-[386px] border-4 border-dashed border-[#E0AF41] rounded-xl overflow-hidden flex items-center justify-center bg-gray-900">
            <div id="reader" className="absolute w-full h-full" />
            <div className="absolute top-0 left-0 w-full h-full animate-pulse border-t-2 border-[#E0AF41]"></div>
          </div>
        )}

        {error && <p className="text-red-400 text-center font-medium">{error}</p>}

        {ticket && (
          <div className={`p-5 rounded-xl ${getThemeColor()} border border-[#E0AF41] shadow-md`}>
            <p className="mb-1"><strong className="text-[#E0AF41]">Name:</strong> {ticket.name}</p>
            <p className="mb-1"><strong className="text-[#E0AF41]">Email:</strong> {ticket.email}</p>
            <p className="mb-1"><strong className="text-[#E0AF41]">Phone:</strong> {ticket.phone}</p>
            <p className="mb-1"><strong className="text-[#E0AF41]">Seat:</strong> {ticket.seat_number}</p>
            <p className="mb-3"><strong className="text-[#E0AF41]">Status:</strong> {ticket.status}</p>

            {ticket.status === 'CONFIRMED' && (
              <button
                onClick={handleMarkUsed}
                className="w-full mt-2 bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition-all duration-300 shadow-md"
              >
                Mark as Used
              </button>
            )}

            {ticket.status === 'USED' && (
              <button
                onClick={() => window.location.reload()}
                className="w-full mt-2 bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition-all duration-300 shadow-md"
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
