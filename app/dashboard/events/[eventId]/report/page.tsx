'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, DollarSign, Edit2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateDepositReport } from '@/lib/pdf'
import type { VPEvent, VPLocation, VPComparison } from '@/types'

export default function ReportPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const router = useRouter()

  const [event, setEvent] = useState<VPEvent | null>(null)
  const [location, setLocation] = useState<VPLocation | null>(null)
  const [comparisons, setComparisons] = useState<VPComparison[]>([])
  const [deductions, setDeductions] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: evt } = await supabase.from('vp_events').select('*').eq('id', eventId).single()
      if (!evt) { router.push('/dashboard'); return }
      setEvent(evt)

      const [{ data: loc }, { data: comps }] = await Promise.all([
        supabase.from('vp_locations').select('*').eq('id', evt.location_id).single(),
        supabase.from('vp_comparisons').select('*').eq('event_id', eventId).order('created_at'),
      ])

      setLocation(loc)
      const compsData = comps ?? []
      setComparisons(compsData)

      // Initialize deduction amounts from AI suggestions
      const initDeductions: Record<string, number> = {}
      compsData.forEach(comp => {
        comp.damage_items?.new_damage?.forEach((dmg: { item: string; deduction_suggestion: number }) => {
          const key = `${comp.zone_id}_${dmg.item}`
          initDeductions[key] = dmg.deduction_suggestion ?? 0
        })
      })
      setDeductions(initDeductions)
      setLoading(false)
    }
    load()
  }, [eventId, router])

  function getTotalDeductions() {
    return Object.values(deductions).reduce((sum, v) => sum + (v || 0), 0)
  }

  async function handleExport() {
    if (!event || !location) return
    setExporting(true)
    try {
      const blob = generateDepositReport(event, comparisons, location.name, deductions)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VenueProof-${event.event_name.replace(/\s+/g, '-')}-${event.id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      // Mark as exported
      const supabase = createClient()
      await supabase.from('vp_events').update({ status: 'exported' }).eq('id', eventId)
    } catch (err) {
      console.error('Export error:', err)
    }
    setExporting(false)
  }

  function startEdit(key: string, currentVal: number) {
    setEditingKey(key)
    setEditVal(String(currentVal))
  }

  function saveEdit() {
    if (editingKey) {
      setDeductions(prev => ({ ...prev, [editingKey]: Math.max(0, Number(editVal) || 0) }))
      setEditingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  if (!event) return null

  const totalDeductions = getTotalDeductions()
  const netRefund = Math.max(0, event.deposit_amount - totalDeductions)
  const allDamageItems: Array<{ comp: VPComparison; item: { item: string; severity: string; deduction_suggestion: number; description: string } }> = []
  comparisons.forEach(comp => {
    comp.damage_items?.new_damage?.forEach(dmg => {
      allDamageItems.push({ comp, item: dmg })
    })
  })

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/dashboard/events/${eventId}/comparison`} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Comparison
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Deposit Deduction Report</h1>
            <p className="text-gray-400 text-sm mt-1">{event.event_name} · {event.client_name}</p>
            {location && <p className="text-gray-500 text-xs mt-0.5">{location.name} · {formatDate(event.event_date)}</p>}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Deposit summary */}
      <div className="card border-gold-400/20">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gold-400" />
          <h2 className="text-lg font-semibold text-white">Deposit Summary</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Original Deposit</p>
            <p className="text-xl font-bold text-white">{formatCurrency(event.deposit_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Deductions</p>
            <p className="text-xl font-bold text-red-400">-{formatCurrency(totalDeductions)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Net Refund to Client</p>
            <p className="text-xl font-bold text-gold-400">{formatCurrency(netRefund)}</p>
          </div>
        </div>
      </div>

      {/* Itemized deductions — editable */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Itemized Deductions</h2>
        <p className="text-xs text-gray-500 mb-3">Amounts are AI-suggested. Click the pencil to edit any amount before exporting.</p>

        {allDamageItems.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-green-400 font-medium">No damage found</p>
            <p className="text-gray-400 text-sm mt-1">Full deposit refund recommended</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-700 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Zone / Item</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Severity</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Deduction</th>
                </tr>
              </thead>
              <tbody>
                {allDamageItems.map(({ comp, item }, idx) => {
                  const key = `${comp.zone_id}_${item.item}`
                  const amount = deductions[key] ?? item.deduction_suggestion ?? 0
                  const isEditing = editingKey === key
                  return (
                    <tr key={idx} className={`border-t border-surface-border ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-light'}`}>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{item.item}</p>
                        <p className="text-gray-500 text-xs">{comp.zone_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-${item.severity}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-gray-400">$</span>
                            <input
                              type="number"
                              className="w-24 bg-charcoal-700 border border-gold-400 rounded px-2 py-1 text-white text-right"
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveEdit()}
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-gold-400 hover:text-gold-300">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-white font-semibold">{formatCurrency(amount)}</span>
                            <button
                              onClick={() => startEdit(key, amount)}
                              className="text-gray-500 hover:text-gold-400"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 border-gold-400/30 bg-charcoal-700">
                  <td className="px-4 py-3 font-semibold text-white" colSpan={2}>Total Deductions</td>
                  <td className="px-4 py-3 text-right font-bold text-red-400 text-base">
                    -{formatCurrency(totalDeductions)}
                  </td>
                </tr>
                <tr className="bg-charcoal-800">
                  <td className="px-4 py-3 font-semibold text-white" colSpan={2}>Net Refund to Client</td>
                  <td className="px-4 py-3 text-right font-bold text-gold-400 text-lg">
                    {formatCurrency(netRefund)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Zones with damage summary */}
      {comparisons.filter(c => (c.damage_items?.new_damage?.length ?? 0) > 0).map(comp => (
        <div key={comp.id} className="card">
          <h3 className="font-semibold text-white mb-3">{comp.zone_name}</h3>
          <div className="space-y-2">
            {comp.damage_items?.new_damage?.map((dmg, i) => (
              <div key={i} className="bg-red-950/20 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge-${dmg.severity}`}>{dmg.severity}</span>
                  <span className="font-medium text-white">{dmg.item}</span>
                </div>
                <p className="text-gray-300">{dmg.description}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Pre-event: {dmg.pre_condition} → Post-event: {dmg.post_condition}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Client signature display */}
      {event.client_signature && (
        <div className="card">
          <h3 className="font-semibold text-white mb-2">Client Pre-Event Acknowledgment</h3>
          <p className="text-xs text-gray-400 mb-3">
            {event.client_name} signed below acknowledging the pre-event condition of the venue.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.client_signature}
            alt="Client signature"
            className="h-16 rounded border border-surface-border"
          />
        </div>
      )}

      {/* Export CTA */}
      <div className="card border-gold-400/30">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-gold-400" />
          <div>
            <p className="font-semibold text-white">Export Deposit Deduction Report</p>
            <p className="text-sm text-gray-400">
              Branded PDF with all evidence — ready to send to client, insurance, or legal
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary ml-auto flex-shrink-0 flex items-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
