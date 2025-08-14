'use client'

import { Html5Qrcode, Html5QrcodeCameraScanConfig, Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState, useRef } from 'react'

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
  const [isScanning, setIsScanning] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const html5QrScannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    checkMobile()
  }, [])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error)
      html5QrCodeRef.current = null
    }
    if (html5QrScannerRef.current) {
      html5QrScannerRef.current.clear().catch(console.error)
      html5QrScannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleQrCodeSuccess = async (decodedText: string) => {
    console.log('QR Code scanned:', decodedText)
    
    // Stop scanner immediately after successful scan
    stopScanner()
    
    try {
      const res = await fetch('/api/scan-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: decodedText.trim() }),
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
      setError('Failed to fetch ticket info: ' + err)
      setTicket(null)
    }
  }

  const handleQrCodeError = (errorMessage: string) => {
    // Only log errors, don't show them to user as they're usually just "not found" messages
    console.warn('QR Code scan error:', errorMessage)
  }

  const startMobileScanner = () => {
    if (html5QrScannerRef.current) {
      stopScanner()
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      supportedScanTypes: [],
      videoConstraints: {
        facingMode: { exact: "environment" }
      },
    }

    try {
      html5QrScannerRef.current = new Html5QrcodeScanner(
        "reader",
        config,
        false // verbose logging
      )

      html5QrScannerRef.current.render(handleQrCodeSuccess, handleQrCodeError)
      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Failed to initialize scanner: ' + err)
      console.error('Scanner initialization error:', err)
    }
  }

  const startDesktopScanner = async () => {
    if (html5QrCodeRef.current) {
      stopScanner()
    }

    try {
      // Get camera devices
      const devices = await Html5Qrcode.getCameras()
      if (!devices || devices.length === 0) {
        setError('No cameras found on this device.')
        return
      }

      // Always prefer back camera - find by label patterns
      const backCamera = devices.find((device) =>
        /back|rear|environment|camera2|0/gi.test(device.label)
      )
      
      // If no back camera found by label, try to find by id (usually camera 0 is back on mobile)
      const fallbackBackCamera = devices.find((device) => 
        device.id === "0" || device.id.includes("back") || device.id.includes("environment")
      )
      
      const selectedCameraId = backCamera ? backCamera.id : (fallbackBackCamera ? fallbackBackCamera.id : devices[0].id)

      html5QrCodeRef.current = new Html5Qrcode("reader")

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: { exact: "environment" }
        }
      }

      await html5QrCodeRef.current.start(
        selectedCameraId, 
        config, 
        handleQrCodeSuccess,
        handleQrCodeError
      )
      
      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Failed to start camera: ' + err)
      console.error('Camera start error:', err)
    }
  }

  const startScanner = () => {
    setScannerStarted(true)
    setError(null)
    
    // Use Html5QrcodeScanner for mobile devices (better mobile support)
    // Use Html5Qrcode for desktop (more control)
    if (isMobile) {
      startMobileScanner()
    } else {
      startDesktopScanner()
    }
  }

  const handleMarkUsed = async () => {
    if (!ticket) return
    try {
      const res = await fetch('/api/mark-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.ticket_id }),
      })
      if (res.ok) {
        setTicket({ ...ticket, status: 'USED' })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to mark ticket as used')
      }
    } catch (err) {
      setError('Failed to mark ticket as used: ' + err)
    }
  }

  const resetScanner = () => {
    stopScanner()
    setScannerStarted(false)
    setTicket(null)
    setError(null)
  }

  const getThemeColor = () => {
    if (ticket?.status === 'CONFIRMED') return 'bg-green-900 text-green-300'
    if (ticket?.status === 'USED') return 'bg-red-900 text-red-300'
    return 'bg-gray-800 text-gray-300'
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Add viewport meta tag info for mobile */}
      <div className="max-w-md w-full bg-[#1a1a1a] shadow-xl rounded-2xl p-6 space-y-6 border border-[#E0AF41]">
        <h1 className="text-2xl font-bold text-center text-[#E0AF41]">
          Scan Ticket QR
          {isMobile && <span className="block text-sm font-normal text-gray-400 mt-1">Mobile Mode</span>}
        </h1>

        {!scannerStarted && (
          <div className="space-y-4">
            <button
              onClick={startScanner}
              className="w-full bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition-all duration-300 shadow-md"
            >
              Start QR Scanner
            </button>
            <div className="text-center text-gray-400 text-sm">
              <p>• Allow camera permissions when prompted</p>
              <p>• Point camera at QR code</p>
              <p>• Keep code within the scanning area</p>
            </div>
          </div>
        )}

        {scannerStarted && !ticket && (
          <div className="space-y-4">
            <div className="relative w-full min-h-[300px] border-2 border-dashed border-[#E0AF41] rounded-xl overflow-hidden bg-gray-900">
              <div id="reader" className="w-full h-full" />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center text-[#E0AF41]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E0AF41] mx-auto mb-2"></div>
                    <p>Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition-all duration-300"
              >
                Stop Scanner
              </button>
              <button
                onClick={() => {
                  stopScanner()
                  setTimeout(() => {
                    if (isMobile) {
                      startMobileScanner()
                    } else {
                      startDesktopScanner()
                    }
                  }, 100)
                }}
                className="flex-1 bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition-all duration-300"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-xl p-4">
            <p className="text-red-300 text-center font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="w-full mt-2 bg-red-700 hover:bg-red-600 text-white font-semibold py-1 rounded text-sm transition-all duration-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {ticket && (
          <div className={`p-5 rounded-xl ${getThemeColor()} border border-[#E0AF41] shadow-md space-y-2`}>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <p><strong className="text-[#E0AF41]">Name:</strong> {ticket.name}</p>
              <p><strong className="text-[#E0AF41]">Email:</strong> {ticket.email}</p>
              <p><strong className="text-[#E0AF41]">Phone:</strong> {ticket.phone}</p>
              <p><strong className="text-[#E0AF41]">Seat:</strong> {ticket.seat_number}</p>
              <p><strong className="text-[#E0AF41]">Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  ticket.status === 'CONFIRMED' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {ticket.status}
                </span>
              </p>
            </div>

            <div className="flex space-x-2 mt-4">
              {ticket.status === 'CONFIRMED' && (
                <button
                  onClick={handleMarkUsed}
                  className="flex-1 bg-[#E0AF41] hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition-all duration-300 shadow-md"
                >
                  Mark as Used
                </button>
              )}
              
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition-all duration-300"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}