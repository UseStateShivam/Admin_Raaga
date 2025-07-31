'use client'

import { useEffect, useState } from 'react'
import { FaSave } from 'react-icons/fa'

// Define a type for bookings
type Booking = {
  ticket_id: string
  name: string
  email: string
  phone: string
  category: string
  qr_code_url: string
  seat_number: string
}

// Replace this with actual fetch from Supabase
const mockBookings: Booking[] = [
  {
    ticket_id: 'RAA-9831',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    category: 'Gold',
    qr_code_url: 'https://via.placeholder.com/100',
    seat_number: 'A12, A13',
  },
  {
    ticket_id: 'RAA-9832',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '9876543211',
    category: 'Platinum',
    qr_code_url: 'https://via.placeholder.com/100',
    seat_number: '',
  },
]

function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [editedSeats, setEditedSeats] = useState<Record<string, string>>({})

  // Fetch bookings (use Supabase in real setup)
  useEffect(() => {
    setBookings(mockBookings)
  }, [])

  // Handle seat number edit
  const handleSeatChange = (ticketId: string, seat: string) => {
    setEditedSeats((prev) => ({
      ...prev,
      [ticketId]: seat,
    }))
  }

  // Save seat number to backend (simulate PATCH)
  const handleSave = (ticketId: string) => {
    const updatedSeat = editedSeats[ticketId]
    console.log(`Updating seat number for ${ticketId} => ${updatedSeat}`)

    // TODO: Replace with Supabase PATCH call
    setBookings((prev) =>
      prev.map((b) =>
        b.ticket_id === ticketId ? { ...b, seat_number: updatedSeat } : b
      )
    )
  }

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
                <td className="border px-3 py-2">
                  <a
                    href={b.qr_code_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View QR
                  </a>
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm w-full"
                    value={editedSeats[b.ticket_id] ?? b.seat_number}
                    onChange={(e) =>
                      handleSeatChange(b.ticket_id, e.target.value)
                    }
                  />
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    onClick={() => handleSave(b.ticket_id)}
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
