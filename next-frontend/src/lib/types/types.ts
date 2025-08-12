export type Event = {
  event_id: string
  name: string
  location: string
  date: string
  start_time: string
  end_time: string
  entry_time: string
  description: string
  important_guidelines: string
  featured_artists: string
}

export type EventTicketTypes = {
    ticket_type_id: string
    name: string
    event_id: string
    number_of_seats: number
    tickets_sold: number
    list_price: number
    basic_fee: number
    gst_on_basic_fee: number
    booking_transaction_fee: number
    igst_on_booking_transaction_fee: number
    description: string
}

export type Ticket = {
  ticket_id: string
  serial_number: string
  name: string
  email: string
  phone: string
  event_id: string
  category: string
  razorpay_id: string
  price: number
  events: Event
  status: string
  ticket_sent: boolean
  ticket_pdf_url: string
  seat_number: string
}