import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Event = {
  event_id: string
  name: string
  date: string
  start_time: string
  end_time: string
  location: string
  description: string
}

type EventStore = {
  events: Event[]
  loading: boolean
  error: string
  fetchEvents: () => Promise<void>
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,
      error: '',
      fetchEvents: async () => {
        // Avoid refetching if already loaded
        if (get().events.length > 0) return

        set({ loading: true, error: '' })
        try {
          const res = await fetch('/api/get-events')
          const data = await res.json()
          if (res.ok) {
            set({ events: data.events })
          } else {
            set({ error: data.error || 'Failed to load events' })
          }
        } catch (err) {
          set({ error: 'Something went wrong' })
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'event-store', // localStorage key
      partialize: (state) => ({
        events: state.events,
      }), // optional: only persist events, not loading/error
    }
  )
)
