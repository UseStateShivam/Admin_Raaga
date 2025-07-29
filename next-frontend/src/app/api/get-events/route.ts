// src/app/api/get-events/route.ts
import { NextResponse } from 'next/server'
import supabase from '@/lib/utils/supabaseClient'
import { cache } from '@/lib/cache'
import { Event } from '@/lib/types/types'

export async function GET() {
  const cachedEvents = cache.get<Event[]>('events')
  if (cachedEvents) {
    return NextResponse.json({ events: cachedEvents })
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  cache.set('events', data)
  data.forEach((event) => {
    cache.set(`event_${event.event_id}`, event)
  })
  return NextResponse.json({ events: data })
}
