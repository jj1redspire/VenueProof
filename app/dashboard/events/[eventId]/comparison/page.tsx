'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Loader2, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import type { VPEvent, VPComparison } from '@/types'

export default function ComparisonPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const router = useRouter()

  const [event, setEvent] = useState<VPEvent | null>(null)
  const [comparisons, setComparisons] = useState<VPComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: evt }, { data: comps }] = await Promise.all([
        supabase.from('vp_events').select('*').eq('id', eventId).single(),
        supabase.from('vp_comparisons').select('*').eq('event_id', eventId).order('created_at'),
      ])

      setEvent(evt)
      setComparisons(comps ?? [])
      // Auto-expand zones with damage
      const withDamage = new Set(
        (comps ?? [])
          .filter(c => c.damage_items?.new_damage?.length > 0)
          .map(c => c.id)
      )
      setExpanded(withDamage)
      setLoading(false)
    }
    load()
  }, [eventId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  if (!event) return null

  const totalDeduction = comparisons.reduce((sum, c) => sum + (c.deduction_amount || 0), 0)
  const totalDamage = comparisons.reduce((sum, c) => sum + (c.damage_items?.new_damage?.length || 0), 0)
  const totalMissing = comparisons.reduce((sum, c) => sum + (c.damage_items?.missing?.length || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <Link href={`/dashboard/events/${eventId}`} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>
        <h1 className="text-2xl font-bold text-white">AI Comparison Results</h1>
        <p className="text-gray-400 text-sm mt-1">{event.event_name} — {event.client_name}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-400">{totalDamage}</p>
          <p className="text-xs text-gray-400 mt-1">Damage Items</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-400">{totalMissing}</p>
          <p className="text-xs text-gray-400 mt-1">Missing Items</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(totalDeduction)}</p>
          <p className="text-xs text-gray-400 mt-1">Suggested Deduction</p>
        </div>
      </div>

      {/* Deposit summary */}
      {totalDeduction > 0 && (
        <div className="card border-gold-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Original Deposit</p>
              <p className="text-xl font-bold text-white">{formatCurrency(event.deposit_amount)}</p>
            </div>
            <div className="text-center text-gray-500">→</div>
            <div>
              <p className="text-sm text-gray-400">Suggested Deductions</p>
              <p className="text-xl font-bold text-red-400">-{formatCurrency(totalDeduction)}</p>
            </div>
            <div className="text-center text-gray-500">=</div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Net Refund</p>
              <p className="text-xl font-bold text-gold-400">{formatCurrency(Math.max(0, event.deposit_amount - totalDeduction))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Zone-by-zone */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Zone Breakdown</h2>

        {comparisons.map(comp => {
          const damages = comp.damage_items?.new_damage ?? []
          const missing = comp.damage_items?.missing ?? []
          const unchanged = comp.damage_items?.unchanged ?? []
          const improved = comp.damage_items?.improved ?? []
          const isOpen = expanded.has(comp.id)
          const hasDamage = damages.length > 0 || missing.length > 0

          return (
            <div key={comp.id} className={cn('card', hasDamage && 'border-red-800/50')}>
              <button
                onClick={() => setExpanded(prev => {
                  const next = new Set(prev)
                  if (next.has(comp.id)) { next.delete(comp.id) } else { next.add(comp.id) }
                  return next
                })}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  {hasDamage ? (
                    <AlertTriangle className={cn(
                      'w-5 h-5 flex-shrink-0',
                      comp.severity === 'major' ? 'text-red-400' :
                      comp.severity === 'moderate' ? 'text-orange-400' : 'text-yellow-400'
                    )} />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-white text-left">{comp.zone_name}</span>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  {hasDamage && (
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0',
                      comp.severity === 'major' ? 'badge-major' :
                      comp.severity === 'moderate' ? 'badge-moderate' : 'badge-minor'
                    )}>
                      {damages.length} damage{damages.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {comp.deduction_amount > 0 && (
                    <span className="text-red-400 text-sm font-medium flex-shrink-0">
                      -{formatCurrency(comp.deduction_amount)}
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 space-y-4">
                  {/* New damage */}
                  {damages.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">New Damage</p>
                      <div className="space-y-2">
                        {damages.map((dmg, i) => (
                          <div key={i} className="bg-red-950/30 border border-red-900/30 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`badge-${dmg.severity} flex-shrink-0`}>
                                    {dmg.severity}
                                  </span>
                                  <span className="font-medium text-white text-sm">{dmg.item}</span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1">{dmg.description}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  Before: {dmg.pre_condition} → After: {dmg.post_condition}
                                </p>
                              </div>
                              <span className="text-red-400 font-semibold text-sm flex-shrink-0">
                                -{formatCurrency(dmg.deduction_suggestion)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing items */}
                  {missing.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Missing Items
                      </p>
                      <ul className="space-y-1">
                        {missing.map((item, i) => (
                          <li key={i} className="text-sm text-orange-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved */}
                  {improved.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Improved</p>
                      <ul className="space-y-1">
                        {improved.map((item, i) => (
                          <li key={i} className="text-sm text-blue-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Unchanged */}
                  {unchanged.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Unchanged / Good</p>
                      <p className="text-sm text-gray-400">{unchanged.join(' · ')}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {comp.damage_items?.comparison_notes && (
                    <p className="text-xs text-gray-500 italic border-t border-surface-border pt-3">
                      {comp.damage_items.comparison_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Generate report CTA */}
      <div className="card border-gold-400/30">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gold-400" />
          <div>
            <p className="font-semibold text-white">Ready to Generate Deposit Report</p>
            <p className="text-sm text-gray-400">
              Export a branded PDF with before/after evidence and itemized deductions
            </p>
          </div>
          <Link
            href={`/dashboard/events/${eventId}/report`}
            className="btn-primary text-sm ml-auto flex-shrink-0"
          >
            Generate Report
          </Link>
        </div>
      </div>
    </div>
  )
}
