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


  if (loading) return <p className="p-8 text-[#4D4D4D]">Loading...</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  return (
    <main className="min-h-screen bg-black p-8 px-12 text-white mt-28">
      <h1 className="text-2xl font-bold mb-6 text-[#E0AF41]">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-[#4D4D4D] bg-white shadow-md">
          <thead className="bg-black text-sm text-white">
            <tr>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Serial Number</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Holder Name</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Phone</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Email</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Category</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Event Name</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Ticket</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Seat Number</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Action</th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Send Tickets</th>
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

                const rowClass = isAlt ? 'bg-black' : 'bg-[#131313]'
                const canSendTicket = !!b.ticket_pdf_url && !b.ticket_sent

                return (
                  <tr
                    key={b.ticket_id}
                    className={`${rowClass} text-sm text-white border-[#4D4D4D] text-center`}
                  >
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.serial_number}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.name}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.phone}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.email}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.category}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">{b.events.name}</td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">
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
                        <span className="text-gray-500 cursor-not-allowed">No PDF</span>
                      )}
                    </td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2">
                      <input
                        type="text"
                        className="border-y border-gray-600 bg-gray-800 text-white rounded px-2 py-1 text-sm w-full disabled:bg-[#4D4D4D] disabled:cursor-not-allowed"
                        value={editedSeats[b.ticket_id] ?? b.seat_number}
                        onChange={(e) => handleSeatChange(b.ticket_id, e.target.value)}
                        disabled={!!b.seat_number}
                        placeholder="Assign seat"
                      />
                    </td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2 text-center">
                      <button
                        className={`p-2 rounded text-white ${!!b.seat_number || !(editedSeats[b.ticket_id]?.trim())
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 cursor-pointer'
                          }`}
                        onClick={async () => {
                          await handleSave(b.ticket_id);
                          window.location.reload();
                        }}
                        disabled={!!b.seat_number || !(editedSeats[b.ticket_id]?.trim())}
                      >
                        <FaSave />
                      </button>
                    </td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2 text-center">
                      {
                        !b.ticket_sent ?
                          <button
                            className={`p-2 rounded text-white ${canSendTicket
                              ? 'bg-[#E0AF41] hover:bg-[#aa852f] cursor-pointer'
                              : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            onClick={() => handleSendTicket(b)}
                            disabled={!canSendTicket}
                          >
                            <FaEnvelope className="inline-block mr-1" />
                            Email
                          </button> :
                          <button
                            className={`p-2 rounded text-white bg-gray-900 cursor-not-allowed`}
                            onClick={() => handleSendTicket(b)}
                            disabled={!canSendTicket}
                          >
                            Sent
                          </button>
                      }
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
