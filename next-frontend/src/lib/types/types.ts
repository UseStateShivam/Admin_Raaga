export type Event = {
  event_id: string
  name: string
  location: string
  date: string
  start_time: string
  end_time: string
  description: string
}

export type Ticket = {
    ticket_type_id: string
    name: string
    event_id: string
    price: number
    features?: Feature[]
}

export type Feature = {
  included: boolean
  label: string
}

export type Booking = {
  ticket_id: string
  name: string
  email: string
  phone: string
  category: string
  qr_code_url: string
  ticket_pdf_url: string
  seat_number: string
  event_id: string
  event_name: string
}