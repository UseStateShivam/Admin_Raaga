'use client'

import { Ticket } from '@/lib/types/types'
import { useEffect, useState } from 'react'
import { FaSave, FaEnvelope } from 'react-icons/fa'

function AdminDashboard() {
  const [bookings, setBookings] = useState<Ticket[]>([])
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
              ticket_pdf_url: result.ticket_pdf_url || b.ticket_pdf_url,
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

  const handleSendTicket = async (ticket: Ticket) => {
    try {
      const res = await fetch('/api/send-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.ticket_id }), // ✅ only send ID
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to send ticket')

      setBookings((prev) =>
        prev.map((b) =>
          b.ticket_id === ticket.ticket_id ? { ...b, ticket_sent: true } : b
        )
      )
    } catch (err) {
      console.error('Error sending ticket:', err)
    }
  }


  if (loading) return <p className="p-8 text-gray-700">Loading...</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-2xl font-bold mb-6 text white">🎫 Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white shadow-md">
          <thead className="bg-black text-sm text-white">
            <tr>
              <th className="px-3 py-2 border">Holder Name</th>
              <th className="px-3 py-2 border">Phone</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Category</th>
              <th className="px-3 py-2 border">Event Name</th>
              <th className="px-3 py-2 border">Ticket</th>
              <th className="px-3 py-2 border">Seat Number</th>
              <th className="px-3 py-2 border">Action</th>
              <th className="px-3 py-2 border">Send Ticket</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let lastEmail = ''
              let isAlt = false

              return bookings.map((b) => {
                if (b.email !== lastEmail) {
                  isAlt = !isAlt
                  lastEmail = b.email
                }

                const rowClass = isAlt ? 'bg-black' : 'bg-gray-50'
                const canSendTicket = !!b.ticket_pdf_url && !b.ticket_sent

                return (
                  <tr
                    key={b.ticket_id}
                    className={`${rowClass} text-sm text-white bg-gray-900 border-gray-700`}
                  >
                    <td className="border border-gray-700 px-3 py-2">{b.name}</td>
                    <td className="border border-gray-700 px-3 py-2">{b.phone}</td>
                    <td className="border border-gray-700 px-3 py-2">{b.email}</td>
                    <td className="border border-gray-700 px-3 py-2">{b.category}</td>
                    <td className="border border-gray-700 px-3 py-2">{b.events.name}</td>
                    <td className="border border-gray-700 px-3 py-2">
                      {b.ticket_pdf_url ? (
                        <a
                          href={b.ticket_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <span className="text-gray-500">No PDF</span>
                      )}
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-600 bg-gray-800 text-white rounded px-2 py-1 text-sm w-full disabled:bg-gray-700"
                        value={editedSeats[b.ticket_id] ?? b.seat_number}
                        onChange={(e) => handleSeatChange(b.ticket_id, e.target.value)}
                        disabled={!!b.seat_number}
                        placeholder="Assign seat"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-center">
                      <button
                        className={`p-2 rounded text-white ${b.seat_number
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500'
                          }`}
                        onClick={async () => {
                          await handleSave(b.ticket_id);
                          window.location.reload();
                        }}
                        disabled={!!b.seat_number}
                      >
                        <FaSave />
                      </button>
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-center">
                      <button
                        className={`p-2 rounded text-white ${canSendTicket
                          ? 'bg-blue-600 hover:bg-blue-500'
                          : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        onClick={() => handleSendTicket(b)}
                        disabled={!canSendTicket}
                      >
                        <FaEnvelope className="inline-block mr-1" />
                        E-Mail
                      </button>
                    </td>
                  </tr>
                );
              })
            })()}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default AdminDashboard
