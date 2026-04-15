'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, ChevronRight, Loader2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatShortDate, getEventStatusLabel, getEventStatusColor, formatCurrency } from '@/lib/utils'
import type { VPEvent } from '@/types'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<VPEvent[]>([])
  const [filtered, setFiltered] = useState<VPEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('vp_events')
        .select('*, vp_locations!inner(user_id, name)')
        .eq('vp_locations.user_id', user.id)
        .order('event_date', { ascending: false })

      setEvents(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      events.filter(e =>
        e.event_name.toLowerCase().includes(q) ||
        e.client_name.toLowerCase().includes(q)
      )
    )
  }, [search, events])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <Link href="/dashboard/events/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      {events.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search events or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 && events.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No events yet. Start by creating your first event.</p>
          <Link href="/dashboard/events/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(event => {
            const e = event as VPEvent & { vp_locations?: { name: string } }
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="card flex items-center justify-between hover:border-gold-400/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{event.event_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {event.client_name}
                    {e.vp_locations?.name ? ` · ${e.vp_locations.name}` : ''}
                    {' · '}{formatShortDate(event.event_date)}
                    {event.guest_count ? ` · ${event.guest_count} guests` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-300">{formatCurrency(event.deposit_amount)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEventStatusColor(event.status)}`}>
                    {getEventStatusLabel(event.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gold-400 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
