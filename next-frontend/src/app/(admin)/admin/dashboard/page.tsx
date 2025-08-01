'use client'

import { useEffect, useState } from 'react'
import { FaSave } from 'react-icons/fa'

type Booking = {
  ticket_id: string
  name: string
  email: string
  phone: string
  category: string
  qr_code_url: string
  seat_number: string
  event_id: string
  event_name: string
}

function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [editedSeats, setEditedSeats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/get-tickets-data')
        if (!res.ok) throw new Error('Failed to fetch bookings')
        const data = await res.json()
        setBookings(data)
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleSeatChange = (ticketId: string, seat: string) => {
    setEditedSeats((prev) => ({
      ...prev,
      [ticketId]: seat,
    }))
  }

  const handleSave = async (ticketId: string) => {
    const updatedSeat = editedSeats[ticketId]

    try {
      const res = await fetch('/api/seat-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, seat_number: updatedSeat }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to assign seat')

      setBookings((prev) =>
        prev.map((b) =>
          b.ticket_id === ticketId
            ? {
                ...b,
                seat_number: updatedSeat,
                qr_code_url: result.qr_code_url || b.qr_code_url,
              }
            : b
        )
      )

      setEditedSeats((prev) => {
        const updated = { ...prev }
        delete updated[ticketId]
        return updated
      })
    } catch (err) {
      console.error('Error assigning seat:', err)
    }
  }

  if (loading) return <p className="p-8 text-gray-700">Loading...</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">🎫 Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white shadow-md">
          <thead className="bg-gray-200 text-sm text-gray-700">
            <tr>
              <th className="px-3 py-2 border">Holder Name</th>
              <th className="px-3 py-2 border">Phone</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Category</th>
              <th className="px-3 py-2 border">Event Name</th>
              <th className="px-3 py-2 border">QR</th>
              <th className="px-3 py-2 border">Seat Number</th>
              <th className="px-3 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.ticket_id} className="text-sm text-gray-800">
                <td className="border px-3 py-2">{b.name}</td>
                <td className="border px-3 py-2">{b.phone}</td>
                <td className="border px-3 py-2">{b.email}</td>
                <td className="border px-3 py-2">{b.category}</td>
                <td className="border px-3 py-2">{b.event_name}</td>
                <td className="border px-3 py-2">
                  {b.qr_code_url ? (
                    <a
                      href={b.qr_code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View QR
                    </a>
                  ) : (
                    <span className="text-gray-400">No QR</span>
                  )}
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm w-full disabled:bg-gray-100"
                    value={editedSeats[b.ticket_id] ?? b.seat_number}
                    onChange={(e) => handleSeatChange(b.ticket_id, e.target.value)}
                    disabled={!!b.seat_number}
                    placeholder="Assign seat"
                  />
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    className={`p-2 rounded text-white ${
                      b.seat_number
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    onClick={() => handleSave(b.ticket_id)}
                    disabled={!!b.seat_number}
                  >
                    <FaSave />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default AdminDashboard
