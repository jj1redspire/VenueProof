'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, Loader2, TrendingDown, AlertTriangle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { VPEvent, VPComparison } from '@/types'

interface MonthStats {
  month: string
  events: number
  damageCount: number
  totalDeduction: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<VPEvent[]>([])
  const [comparisons, setComparisons] = useState<VPComparison[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: evts }, { data: comps }] = await Promise.all([
        supabase.from('vp_events').select('*, vp_locations!inner(user_id)').eq('vp_locations.user_id', user.id).order('event_date', { ascending: false }),
        supabase.from('vp_comparisons').select('*, vp_events!inner(vp_locations!inner(user_id))').eq('vp_events.vp_locations.user_id', user.id),
      ])

      setEvents(evts ?? [])
      setComparisons(comps ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>

  // Monthly stats
  const monthMap = new Map<string, MonthStats>()
  events.forEach(e => {
    const d = new Date(e.event_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (!monthMap.has(key)) monthMap.set(key, { month: label, events: 0, damageCount: 0, totalDeduction: 0 })
    monthMap.get(key)!.events++
  })
  comparisons.forEach(c => {
    const d = new Date(c.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthMap.has(key)) {
      monthMap.get(key)!.damageCount += c.damage_items?.new_damage?.length ?? 0
      monthMap.get(key)!.totalDeduction += c.deduction_amount ?? 0
    }
  })
  const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6).map(([, v]) => v)

  const totalDeduction = comparisons.reduce((s, c) => s + (c.deduction_amount || 0), 0)
  const eventsWithDamage = new Set(comparisons.filter(c => (c.damage_items?.new_damage?.length ?? 0) > 0).map(c => c.event_id)).size
  const avgDeduction = eventsWithDamage > 0 ? totalDeduction / eventsWithDamage : 0

  const maxDeduction = Math.max(...months.map(m => m.totalDeduction), 1)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-gold-400' },
          { label: 'Events w/ Damage', value: eventsWithDamage, icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'Total Deductions', value: formatCurrency(totalDeduction), icon: TrendingDown, color: 'text-red-400' },
          { label: 'Avg Deduction', value: formatCurrency(avgDeduction), icon: BarChart2, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {months.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Damage Deductions (Last 6 Months)</h2>
          <div className="space-y-3">
            {months.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-20 flex-shrink-0">{m.month}</span>
                <div className="flex-1 bg-charcoal-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gold-400 h-full rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((m.totalDeduction / maxDeduction) * 100, m.events > 0 ? 4 : 0)}%` }}
                  >
                    {m.totalDeduction > 0 && (
                      <span className="text-xs text-charcoal-900 font-semibold">{formatCurrency(m.totalDeduction)}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{m.events} event{m.events !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="card text-center py-12">
          <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Analytics will appear after you document events.</p>
        </div>
      )}
    </div>
  )
}
