import { create } from 'zustand'

interface Feature {
  included: boolean
  label: string
}

interface Ticket {
  ticket_type_id: string
  name: string
  price: number
  features?: Feature[]
}

interface TicketStore {
  tickets: Ticket[]
  loading: boolean
  fetchTickets: (eventID: string) => Promise<void>
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  loading: true,

  fetchTickets: async (eventID: string) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/get-event-tickets/${eventID}`)
      const data = await res.json()
      if (res.ok) {
        set({ tickets: data.tickets })
      } else {
        console.error(data.error)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      set({ loading: false })
    }
  },
}))
