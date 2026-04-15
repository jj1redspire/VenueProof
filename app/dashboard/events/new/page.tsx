'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { VPLocation } from '@/types'

export default function NewEventPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<VPLocation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingLocs, setLoadingLocs] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    location_id: '',
    event_name: '',
    client_name: '',
    client_email: '',
    event_date: '',
    guest_count: '',
    deposit_amount: '',
    catering_type: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('vp_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      const locs = data ?? []
      setLocations(locs)
      if (locs.length === 1) setForm(f => ({ ...f, location_id: locs[0].id }))
      setLoadingLocs(false)
    }
    load()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.location_id) { setError('Please select a location'); setLoading(false); return }
    if (!form.deposit_amount || Number(form.deposit_amount) <= 0) {
      setError('Please enter a valid deposit amount'); setLoading(false); return
    }

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('vp_events')
      .insert({
        location_id: form.location_id,
        event_name: form.event_name.trim(),
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim() || null,
        event_date: form.event_date,
        guest_count: form.guest_count ? Number(form.guest_count) : null,
        deposit_amount: Number(form.deposit_amount),
        status: 'pending',
        catering_type: form.catering_type || null,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/events/${data.id}`)
    }
  }

  if (loadingLocs) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-300 mb-4">You need to add a venue location before creating events.</p>
          <Link href="/dashboard/locations/new" className="btn-primary inline-block">
            Add Venue Location
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <div>
        <Link href="/dashboard/events" className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Event</h1>
        <p className="text-gray-400 text-sm mt-1">Set up a new event to begin documentation</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        {locations.length > 1 && (
          <div>
            <label className="label">Venue Location</label>
            <select
              className="input"
              value={form.location_id}
              onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
              required
            >
              <option value="">Select a venue...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Event Name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Johnson-Williams Wedding Reception"
            value={form.event_name}
            onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Client Name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Sarah Johnson"
            value={form.client_name}
            onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Client Email <span className="text-gray-500">(for signature)</span></label>
          <input
            type="email"
            className="input"
            placeholder="client@email.com"
            value={form.client_email}
            onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Event Date</label>
            <input
              type="date"
              className="input"
              value={form.event_date}
              onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Expected Guests</label>
            <input
              type="number"
              className="input"
              placeholder="150"
              min="1"
              value={form.guest_count}
              onChange={e => setForm(f => ({ ...f, guest_count: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">Deposit Amount ($)</label>
          <input
            type="number"
            className="input"
            placeholder="2500"
            min="1"
            step="0.01"
            value={form.deposit_amount}
            onChange={e => setForm(f => ({ ...f, deposit_amount: e.target.value }))}
            required
          />
          <p className="text-gray-500 text-xs mt-1">The security deposit or equipment value at stake for this event</p>
        </div>

        {/* Catering type — shown when location is a catering business */}
        {(() => {
          const loc = locations.find(l => l.id === form.location_id)
          const isCatering = loc?.business_type === 'catering_company' || loc?.business_type === 'event_catering'
          return isCatering ? (
            <div>
              <label className="label">Service Type</label>
              <select className="input" value={form.catering_type} onChange={e => setForm(f => ({ ...f, catering_type: e.target.value }))}>
                <option value="">Select service type...</option>
                <option value="full_service">Full Service (deliver, set up, serve, clean up)</option>
                <option value="delivery">Delivery & Setup Only</option>
                <option value="drop_off">Drop-Off Only</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">Determines which documentation steps apply to this event</p>
            </div>
          ) : null
        })()}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  )
}
