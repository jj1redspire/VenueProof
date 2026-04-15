'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { VENUE_ZONES } from '@/lib/zones'

export default function NewLocationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', address: '', business_type: 'event_venue' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: loc, error: locErr } = await supabase
      .from('vp_locations')
      .insert({ user_id: user.id, name: form.name.trim(), address: form.address.trim() || null, business_type: form.business_type })
      .select()
      .single()

    if (locErr || !loc) { setError(locErr?.message ?? 'Failed to create location'); setLoading(false); return }

    // Seed zones from template
    const zoneRows = VENUE_ZONES.map(z => ({
      location_id: loc.id,
      name: z.name,
      category: z.category,
      checkpoints: z.checkpoints,
      sort_order: z.sort_order,
    }))
    await supabase.from('vp_zones').insert(zoneRows)

    router.push('/dashboard/locations')
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <div>
        <Link href="/dashboard/locations" className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Locations
        </Link>
        <h1 className="text-2xl font-bold text-white">Add Venue Location</h1>
        <p className="text-gray-400 text-sm mt-1">10 inspection zones will be automatically set up for your venue</p>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Venue Name</label>
          <input type="text" className="input" placeholder="The Grand Pavilion" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Address <span className="text-gray-500">(optional)</span></label>
          <input type="text" className="input" placeholder="123 Main St, City, State" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div>
          <label className="label">Venue Type</label>
          <select className="input" value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}>
            <option value="event_venue">Event Venue / Banquet Hall</option>
            <option value="wedding_venue">Wedding Venue</option>
            <option value="hotel_ballroom">Hotel Ballroom</option>
            <option value="rooftop">Rooftop Venue</option>
            <option value="winery_barn">Winery / Barn</option>
            <option value="restaurant_private">Restaurant Private Events</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="bg-charcoal-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 font-medium mb-2">Auto-configured inspection zones:</p>
          <div className="flex flex-wrap gap-1.5">
            {VENUE_ZONES.map(z => (
              <span key={z.name} className="bg-charcoal-600 text-gray-300 text-xs px-2 py-0.5 rounded">{z.name.split(' /')[0]}</span>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Venue'}
        </button>
      </form>
    </div>
  )
}
