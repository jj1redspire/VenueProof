'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, TrendingUp, AlertTriangle, DollarSign, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatShortDate, getEventStatusLabel, getEventStatusColor, formatCurrency } from '@/lib/utils'
import type { VPEvent, VPLocation } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<VPEvent[]>([])
  const [locations, setLocations] = useState<VPLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: locs }, { data: evts }] = await Promise.all([
        supabase.from('vp_locations').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('vp_events')
          .select('*, vp_locations!inner(user_id)')
          .eq('vp_locations.user_id', user.id)
          .order('event_date', { ascending: false })
          .limit(20),
      ])

      setLocations(locs ?? [])
      setEvents(evts ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-16 card">
          <Calendar className="w-14 h-14 text-gold-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to VenueProof</h2>
          <p className="text-gray-400 mb-6">Add your venue to start documenting events and protecting your deposits.</p>
          <Link href="/dashboard/locations/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Your Venue
          </Link>
        </div>
      </div>
    )
  }

  const upcoming = events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5)
  const recent = events.filter(e => new Date(e.event_date) < new Date()).slice(0, 10)
  const withDamage = events.filter(e => e.status === 'compared' || e.status === 'exported')
  const avgDeduction = 0 // Would be computed from comparisons

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track your venue events and damage history</p>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Event</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-gold-400' },
          { label: 'Events w/ Damage', value: withDamage.length, icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'Avg Deduction', value: formatCurrency(avgDeduction), icon: DollarSign, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-2">
            {upcoming.map(event => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="card flex items-center justify-between hover:border-gold-400/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{event.event_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{event.client_name} · {formatShortDate(event.event_date)}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEventStatusColor(event.status)}`}>
                    {getEventStatusLabel(event.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Recent Events</h2>
            <Link href="/dashboard/events" className="text-sm text-gold-400 hover:text-gold-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map(event => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="card flex items-center justify-between hover:border-gold-400/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{event.event_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{event.client_name} · {formatShortDate(event.event_date)}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm text-gray-400">{formatCurrency(event.deposit_amount)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEventStatusColor(event.status)}`}>
                    {getEventStatusLabel(event.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No events yet. Create your first event to start documenting.</p>
          <Link href="/dashboard/events/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create First Event
          </Link>
        </div>
      )}
    </div>
  )
}
