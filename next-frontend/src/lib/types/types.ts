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