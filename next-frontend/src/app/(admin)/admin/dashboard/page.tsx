'use client'

import { Ticket } from '@/lib/types/types'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { FaSave, FaEnvelope, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'

type SortConfig = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

function AdminDashboard() {
  const [bookings, setBookings] = useState<Ticket[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Ticket[]>([])
  const [paginatedBookings, setPaginatedBookings] = useState<Ticket[]>([])
  const [editedSeats, setEditedSeats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [isSending, setIsSending] = useState<Record<string, boolean>>({})
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  const exportSelectedRows = () => {
    const selectedBookings = filteredBookings.filter(booking =>
      selectedRows.includes(booking.ticket_id)
    );

    if (selectedBookings.length === 0) {
      alert('Please select rows to export');
      return;
    }

    const csvHeaders = [
      'Serial Number',
      'Holder Name',
      'Phone',
      'Email',
      'Category',
      'Event Name',
      'Date of Booking',
      'Seat Number',
      'Ticket Status',
      'Ticket PDF URL',
      'Email Status'
    ];

    const csvData = selectedBookings.map(booking => [
      booking.serial_number || '',
      booking.name || '',
      booking.phone || '',
      booking.email || '',
      booking.category || '',
      booking.events?.name || '',
      booking.created_at || '',
      booking.seat_number || 'Not Assigned',
      booking.ticket_pdf_url ? 'Generated' : 'Not Generated',
      booking.ticket_pdf_url || '',
      booking.ticket_sent ? 'Sent' : 'Not Sent'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllRows = () => {
    const csvHeaders = [
      'Serial Number',
      'Holder Name',
      'Phone',
      'Email',
      'Category',
      'Event Name',
      'Date of Booking',
      'Seat Number',
      'Ticket Status',
      'Ticket PDF URL',
      'Email Status'
    ];

    const csvData = bookings.map(booking => [
      booking.serial_number || '',
      booking.name || '',
      booking.phone || '',
      booking.email || '',
      booking.category || '',
      booking.events?.name || '',
      booking.created_at || '',
      booking.seat_number || 'Not Assigned',
      booking.ticket_pdf_url ? 'Generated' : 'Not Generated',
      booking.ticket_pdf_url || '',
      booking.ticket_sent ? 'Sent' : 'Not Sent'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRow = (ticketId: string) => {
    setSelectedRows(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleAll = () => {
    const currentPageIds = paginatedBookings.map(b => b.ticket_id);
    const allCurrentSelected = currentPageIds.every(id => selectedRows.includes(id));

    if (allCurrentSelected) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="inline ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="inline ml-1 text-[#E0AF41]" />
      : <FaSortDown className="inline ml-1 text-[#E0AF41]" />;
  };

  useEffect(() => {
    let result = [...bookings];

    if (searchTerm) {
      result = result.filter(booking =>
        booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.events?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.created_at?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.seat_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serial_number?.toString().includes(searchTerm)
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: string | number | null, bValue: string | number | null;

        switch (sortConfig.key) {
          case 'serial_number':
            aValue = a.serial_number || 0;
            bValue = b.serial_number || 0;
            break;
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'phone':
            aValue = a.phone || '';
            bValue = b.phone || '';
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'category':
            aValue = a.category || '';
            bValue = b.category || '';
            break;
          case 'event_name':
            aValue = a.events?.name || '';
            bValue = b.events?.name || '';
            break;
          case 'date_of_booking':
            aValue = a.created_at || '';
            bValue = b.created_at || '';
            break;
          case 'seat_number':
            aValue = a.seat_number || '';
            bValue = b.seat_number || '';
            break;
          case 'ticket_status':
            aValue = a.ticket_pdf_url ? 'Generated' : 'Not Generated';
            bValue = b.ticket_pdf_url ? 'Generated' : 'Not Generated';
            break;
          case 'email_status':
            aValue = a.ticket_sent ? 'Sent' : 'Not Sent';
            bValue = b.ticket_sent ? 'Sent' : 'Not Sent';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredBookings(result);
    setCurrentPage(1);
  }, [bookings, searchTerm, sortConfig]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedBookings(filteredBookings.slice(startIndex, endIndex));
  }, [filteredBookings, currentPage, itemsPerPage]);

  useEffect(() => {
    if (headerCheckboxRef.current && paginatedBookings.length > 0) {
      const currentPageIds = paginatedBookings.map(b => b.ticket_id);
      const selectedOnCurrentPage = currentPageIds.filter(id => selectedRows.includes(id));
      const isAllSelected = selectedOnCurrentPage.length === currentPageIds.length;
      const isSomeSelected = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < currentPageIds.length;

      headerCheckboxRef.current.checked = isAllSelected;
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [selectedRows, paginatedBookings]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/get-tickets-data')
        if (!res.ok) throw new Error('Failed to fetch bookings')
        const data = await res.json()
        setBookings(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
          console.error('Error fetching bookings:', err)
        } else {
          setError('An unknown error occurred')
          console.error('Error fetching bookings:', err)
        }
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
    setIsSaving((prev) => ({ ...prev, [ticketId]: true }));
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
    } finally {
      setIsSaving((prev) => ({ ...prev, [ticketId]: false }));
      window.location.reload();
    }
  }

  const handleSendTicket = async (ticket: Ticket) => {
    setIsSending((prev) => ({ ...prev, [ticket.ticket_id]: true }));
    try {
      const res = await fetch('/api/send-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.ticket_id }),
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
    } finally {
      setIsSending((prev) => ({ ...prev, [ticket.ticket_id]: false }));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 px-12 text-white mt-28">
        <h1 className="text-3xl font-bold mb-3 text-[#E0AF41]">Admin Dashboard</h1>
        <div className="overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between bg-black border border-[#4D4D4D] rounded-md px-4 py-3 mb-4">
            <div className="shimmer-dark h-4 w-96 rounded"></div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="shimmer-dark h-8 w-32 rounded"></div>
              <div className="shimmer-dark h-8 w-20 rounded"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="shimmer-dark h-4 w-48 rounded"></div>
            <div className="shimmer-dark h-4 w-24 rounded"></div>
          </div>
          <div className="w-full border border-[#4D4D4D] bg-white shadow-md">
            <div className="bg-black px-3 py-4 border-b border-[#4D4D4D]">
              <div className="grid grid-cols-11 gap-4">
                <div className="shimmer-dark h-4 w-4 rounded"></div>
                <div className="shimmer-dark h-4 w-16 rounded"></div>
                <div className="shimmer-dark h-4 w-20 rounded"></div>
                <div className="shimmer-dark h-4 w-16 rounded"></div>
                <div className="shimmer-dark h-4 w-20 rounded"></div>
                <div className="shimmer-dark h-4 w-16 rounded"></div>
                <div className="shimmer-dark h-4 w-20 rounded"></div>
                <div className="shimmer-dark h-4 w-12 rounded"></div>
                <div className="shimmer-dark h-4 w-20 rounded"></div>
                <div className="shimmer-dark h-4 w-12 rounded"></div>
                <div className="shimmer-dark h-4 w-20 rounded"></div>
              </div>
            </div>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className={`px-3 py-3 border-b border-[#4D4D4D] ${index % 2 === 0 ? 'bg-black' : 'bg-[#131313]'}`}>
                <div className="grid grid-cols-11 gap-4 items-center">
                  <div className="shimmer-dark h-4 w-4 rounded"></div>
                  <div className="shimmer-dark h-4 w-8 rounded"></div>
                  <div className="shimmer-dark h-4 w-24 rounded"></div>
                  <div className="shimmer-dark h-4 w-20 rounded"></div>
                  <div className="shimmer-dark h-4 w-32 rounded"></div>
                  <div className="shimmer-dark h-4 w-16 rounded"></div>
                  <div className="shimmer-dark h-4 w-28 rounded"></div>
                  <div className="shimmer-dark h-4 w-16 rounded"></div>
                  <div className="shimmer-dark h-4 w-20 rounded"></div>
                  <div className="shimmer-dark h-8 w-8 rounded"></div>
                  <div className="shimmer-dark h-8 w-16 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="shimmer-dark h-4 w-48 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="shimmer-dark h-8 w-12 rounded"></div>
              <div className="shimmer-dark h-8 w-16 rounded"></div>
              <div className="shimmer-dark h-8 w-8 rounded"></div>
              <div className="shimmer-dark h-8 w-8 rounded"></div>
              <div className="shimmer-dark h-8 w-8 rounded"></div>
              <div className="shimmer-dark h-8 w-12 rounded"></div>
              <div className="shimmer-dark h-8 w-12 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  return (
    <main className="min-h-screen bg-black p-8 px-12 text-white mt-28">
      <h1 className="text-3xl font-bold mb-3 text-[#E0AF41]">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between bg-black border border-[#4D4D4D] rounded-md px-4 py-3 mb-4">
          <p className="text-white text-sm">
            Manage all bookings, assign seats, and control ticket PDF generation for upcoming events.
          </p>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="flex items-center border border-[#E0AF41] rounded px-3 py-1">
              <Image
                src="/search.svg"
                alt="Search Icon"
                width={16}
                height={16}
                className='mr-1'
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black text-white px-2 py-1 text-sm outline-none"
              />
            </div>
            <button
              className={`px-3 py-2 text-sm rounded transition-colors ${selectedRows.length > 0
                ? 'bg-[#E0AF41] text-white hover:bg-[#c89a34] cursor-pointer'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              onClick={exportSelectedRows}
              disabled={selectedRows.length === 0}
            >
              Export {selectedRows.length > 0 && `(${selectedRows.length})`}
            </button>
            <button
              className={`px-3 py-2 text-sm rounded transition-colors ${selectedRows.length <= 0
                ? 'bg-[#E0AF41] text-white hover:bg-[#c89a34] cursor-pointer'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              onClick={exportAllRows}
              disabled={selectedRows.length !== 0}
            >
              Export All
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
          <div>
            Showing {paginatedBookings.length} of {filteredBookings.length} results
            {searchTerm && ` for "${searchTerm}"`}
            {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
          </div>
          <div>
            Page {currentPage} of {Math.ceil(filteredBookings.length / itemsPerPage) || 1}
          </div>
        </div>
        <table className="w-full border border-[#4D4D4D] bg-white shadow-md">
          <thead className="bg-black text-[12px] text-[#e3e3e3]">
            <tr>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={paginatedBookings.length > 0 && paginatedBookings.every(b => selectedRows.includes(b.ticket_id))}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer appearance-none border-2 border-gray-500 bg-black checked:bg-[#E0AF41] checked:border-[#E0AF41] relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")`,
                    backgroundSize: '12px 12px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  title="Select/deselect all on current page"
                />
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('serial_number')}
              >
                Serial Number {getSortIcon('serial_number')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('name')}
              >
                Holder Name {getSortIcon('name')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('phone')}
              >
                Phone {getSortIcon('phone')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('category')}
              >
                Category {getSortIcon('category')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('event_name')}
              >
                Event Name {getSortIcon('event_name')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('date_of_booking')}
              >
                Date of Booking {getSortIcon('date_of_booking')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('ticket_status')}
              >
                Ticket {getSortIcon('ticket_status')}
              </th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('seat_number')}
              >
                Seat Number {getSortIcon('seat_number')}
              </th>
              <th className="px-3 py-2 border-y border-[#4D4D4D]">Action</th>
              <th
                className="px-3 py-2 border-y border-[#4D4D4D] cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('email_status')}
              >
                Send Tickets {getSortIcon('email_status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let lastEmail = ''
              let isAlt = false

              return paginatedBookings.map((b) => {
                if (b.email !== lastEmail) {
                  isAlt = !isAlt
                  lastEmail = b.email
                }

                const rowClass = isAlt ? 'bg-black' : 'bg-[#131313]'
                const canSendTicket = !!b.ticket_pdf_url && !b.ticket_sent

                return (
                  <tr
                    key={b.ticket_id}
                    className={`${rowClass} text-[12px] text-[#e3e3e3] border-[#4D4D4D] text-center`}
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
                      {new Date(b.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
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
                        value={editedSeats[b.ticket_id] ?? b.seat_number ?? ""}
                        onChange={(e) => handleSeatChange(b.ticket_id, e.target.value)}
                        disabled={!!b.seat_number}
                        placeholder="Assign seat"
                      />
                    </td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2 text-center">
                      <button
                        className={`p-2 rounded text-white flex items-center justify-center min-w-[48px] ${!!b.seat_number || !(editedSeats[b.ticket_id]?.trim()) || isSaving[b.ticket_id]
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 cursor-pointer'
                          }`}
                        onClick={() => handleSave(b.ticket_id)}
                        disabled={!!b.seat_number || !(editedSeats[b.ticket_id]?.trim()) || isSaving[b.ticket_id]}
                      >
                        {isSaving[b.ticket_id] ? (
                          <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                        ) : (
                          <FaSave />
                        )}
                      </button>
                    </td>
                    <td className="border-y border-[#4D4D4D] px-3 py-2 text-center">
                      {
                        !b.ticket_sent ? (
                          <button
                            className={`p-2 rounded text-white flex items-center justify-center mx-auto min-w-[80px] ${canSendTicket && !isSending[b.ticket_id]
                              ? 'bg-[#E0AF41] hover:bg-[#aa852f] cursor-pointer'
                              : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            onClick={() => handleSendTicket(b)}
                            disabled={!canSendTicket || isSending[b.ticket_id]}
                          >
                            {isSending[b.ticket_id] ? (
                              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                            ) : (
                              <FaEnvelope className="mr-1" />
                            )}
                            {isSending[b.ticket_id] ? 'Sending...' : 'Email'}
                          </button>
                        ) : (
                          <button
                            className="p-2 rounded text-white bg-gray-900 cursor-not-allowed min-w-[80px]"
                            disabled={true}
                          >
                            Sent
                          </button>
                        )
                      }
                    </td>
                  </tr>
                );
              })
            })()}
          </tbody>
        </table>
        {filteredBookings.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${currentPage === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E0AF41] text-black hover:bg-[#c89a34] cursor-pointer'
                  }`}
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${currentPage === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
                  }`}
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {(() => {
                  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 rounded text-sm ${i === currentPage
                          ? 'bg-[#E0AF41] text-black'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredBookings.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredBookings.length / itemsPerPage)}
                className={`px-3 py-1 rounded text-sm ${currentPage === Math.ceil(filteredBookings.length / itemsPerPage)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
                  }`}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(Math.ceil(filteredBookings.length / itemsPerPage))}
                disabled={currentPage === Math.ceil(filteredBookings.length / itemsPerPage)}
                className={`px-3 py-1 rounded text-sm ${currentPage === Math.ceil(filteredBookings.length / itemsPerPage)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E0AF41] text-black hover:bg-[#c89a34] cursor-pointer'
                  }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
        {filteredBookings.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-400">
            No results found {searchTerm && ` for “${searchTerm}”`}
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminDashboard