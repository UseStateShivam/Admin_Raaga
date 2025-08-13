'use client'

import { Ticket } from '@/lib/types/types'
import { useEffect, useRef, useState } from 'react'
import { FaSave, FaEnvelope } from 'react-icons/fa'

function AdminDashboard() {
  const [bookings, setBookings] = useState<Ticket[]>([])
  const [editedSeats, setEditedSeats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const toggleRow = (ticketId: string) => {
    setSelectedRows(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === bookings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(bookings.map(b => b.ticket_id));
    }
  };

  // Update header checkbox state when selectedRows changes
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const isAllSelected = selectedRows.length === bookings.length && bookings.length > 0;
      const isSomeSelected = selectedRows.length > 0 && selectedRows.length < bookings.length;
      
      headerCheckboxRef.current.checked = isAllSelected;
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [selectedRows, bookings]);

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
      <h1 className="text-3xl font-bold mb-3 text-[#E0AF41]">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        {/* Top bar above the table */}
        <div className="flex flex-wrap items-center justify-between bg-black border border-[#4D4D4D] rounded-md px-4 py-3 mb-4">
          <p className="text-white text-sm">
            Manage all bookings, assign seats, and control ticket PDF generation for upcoming events.
          </p>

          {/* Right side actions */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {/* Search icon + input */}
            <div className="flex items-center border border-[#E0AF41] rounded">
              <span className="px-2 text-[#E0AF41]">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                className="bg-black text-white px-2 py-1 text-sm outline-none"
              />
            </div>

            {/* Delete button - now shows selected count */}
            {/* <button 
              className={`px-3 py-1 border text-sm rounded transition-colors ${
                selectedRows.length > 0 
                  ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                  : 'border-[#4D4D4D] text-gray-400 cursor-not-allowed'
              }`}
              disabled={selectedRows.length === 0}
            >
              Delete {selectedRows.length > 0 && `(${selectedRows.length})`}
            </button> */}

            {/* Export button */}
            <button className="px-3 py-1 bg-[#E0AF41] text-black text-sm rounded hover:bg-[#c89a34]">
              Export
            </button>
          </div>
        </div>
        <table className="w-full border border-[#4D4D4D] bg-white shadow-md">
          <thead className="bg-black text-sm text-white">
            <tr>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={selectedRows.length === bookings.length && bookings.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer appearance-none border-2 border-gray-500 bg-black checked:bg-[#E0AF41] checked:border-[#E0AF41] relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")`,
                    backgroundSize: '12px 12px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  title={
                    selectedRows.length === 0 
                      ? "Select all" 
                      : selectedRows.length === bookings.length 
                        ? "Deselect all" 
                        : "Select all"
                  }
                />
              </th>
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
                    <td className="border-y border-[#4D4D4D] px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(b.ticket_id)}
                        onChange={() => toggleRow(b.ticket_id)}
                        className="w-4 h-4 rounded cursor-pointer appearance-none border-2 border-gray-500 bg-black checked:bg-[#E0AF41] checked:border-[#E0AF41] relative"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")`,
                          backgroundSize: '12px 12px',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </td>
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