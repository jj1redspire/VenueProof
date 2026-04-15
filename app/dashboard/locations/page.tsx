'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { VPLocation } from '@/types'

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<VPLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('vp_locations').select('*').eq('user_id', user.id).order('name')
      setLocations(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Venue Locations</h1>
        <Link href="/dashboard/locations/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Location
        </Link>
      </div>
      {locations.length === 0 ? (
        <div className="card text-center py-16">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No venue locations yet.</p>
          <Link href="/dashboard/locations/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Your Venue
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map(loc => (
            <div key={loc.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{loc.name}</p>
                {loc.address && <p className="text-sm text-gray-400 mt-0.5">{loc.address}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
