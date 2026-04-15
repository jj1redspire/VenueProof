'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, Play, Zap, FileText,
  Loader2, AlertTriangle, PenLine, Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { VPEvent, VPLocation, VPZone, VPConditionSnapshot } from '@/types'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const router = useRouter()

  const [event, setEvent] = useState<VPEvent | null>(null)
  const [location, setLocation] = useState<VPLocation | null>(null)
  const [zones, setZones] = useState<VPZone[]>([])
  const [preSnapshots, setPreSnapshots] = useState<VPConditionSnapshot[]>([])
  const [postSnapshots, setPostSnapshots] = useState<VPConditionSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [sigSaved, setSigSaved] = useState(false)
  const sigCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [sigDrawing, setSigDrawing] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: evt } = await supabase
        .from('vp_events')
        .select('*')
        .eq('id', eventId)
        .single()
      if (!evt) { router.push('/dashboard/events'); return }
      setEvent(evt)

      const [{ data: loc }, { data: zs }, { data: snaps }] = await Promise.all([
        supabase.from('vp_locations').select('*').eq('id', evt.location_id).single(),
        supabase.from('vp_zones').select('*').eq('location_id', evt.location_id).order('sort_order'),
        supabase.from('vp_condition_snapshots').select('*').eq('event_id', eventId),
      ])

      setLocation(loc)
      setZones(zs ?? [])
      setPreSnapshots((snaps ?? []).filter((s: VPConditionSnapshot) => s.snapshot_type === 'pre'))
      setPostSnapshots((snaps ?? []).filter((s: VPConditionSnapshot) => s.snapshot_type === 'post'))
      if (evt.client_signature) setSigSaved(true)
      setLoading(false)
    }
    load()
  }, [eventId, router])

  async function runComparison() {
    setComparing(true)
    try {
      const res = await fetch('/api/ai/compare-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      })
      if (res.ok) {
        router.push(`/dashboard/events/${eventId}/comparison`)
      }
    } catch {
      setComparing(false)
    }
  }

  function startSig() {
    setIsSigning(true)
    setTimeout(() => {
      const canvas = sigCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }, 50)
  }

  function sigPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setSigDrawing(true)
    const canvas = sigCanvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  function sigPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!sigDrawing) return
    const canvas = sigCanvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')!
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  async function saveSignature() {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const supabase = createClient()
    await supabase.from('vp_events').update({ client_signature: dataUrl }).eq('id', eventId)
    setSigSaved(true)
    setIsSigning(false)
    setEvent(prev => prev ? { ...prev, client_signature: dataUrl } : prev)
  }

  function clearSig() {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  if (!event) return null

  const preComplete = preSnapshots.length >= zones.length && zones.length > 0
  const postComplete = postSnapshots.length >= zones.length && zones.length > 0
  const canCompare = preComplete && postComplete

  const steps = [
    {
      number: 1,
      title: 'Pre-Event Walkthrough',
      description: 'Document facility condition before guests arrive',
      status: preComplete ? 'complete' : 'active',
      count: `${preSnapshots.length} / ${zones.length} zones`,
      href: `/dashboard/events/${eventId}/walkthrough/pre`,
      btnLabel: preComplete ? 'View Pre-Event' : 'Start Pre-Event',
      disabled: false,
    },
    {
      number: 2,
      title: 'Client Signature',
      description: 'Client acknowledges pre-event condition',
      status: sigSaved ? 'complete' : preComplete ? 'active' : 'locked',
      count: sigSaved ? 'Signed' : 'Pending',
      href: null,
      btnLabel: sigSaved ? 'Signed' : 'Collect Signature',
      disabled: !preComplete,
    },
    {
      number: 3,
      title: 'Post-Event Walkthrough',
      description: 'Document facility condition after guests leave',
      status: postComplete ? 'complete' : preComplete ? 'active' : 'locked',
      count: `${postSnapshots.length} / ${zones.length} zones`,
      href: `/dashboard/events/${eventId}/walkthrough/post`,
      btnLabel: postComplete ? 'View Post-Event' : 'Start Post-Event',
      disabled: !preComplete,
    },
    {
      number: 4,
      title: 'AI Comparison',
      description: 'Compare before/after and identify damage',
      status: (event.status === 'compared' || event.status === 'exported') ? 'complete' : canCompare ? 'active' : 'locked',
      count: (event.status === 'compared' || event.status === 'exported') ? 'Complete' : 'Pending',
      href: (event.status === 'compared' || event.status === 'exported') ? `/dashboard/events/${eventId}/comparison` : null,
      btnLabel: (event.status === 'compared' || event.status === 'exported') ? 'View Comparison' : 'Run Comparison',
      disabled: !canCompare,
    },
    {
      number: 5,
      title: 'Deposit Report',
      description: 'Generate itemized deduction report for client',
      status: event.status === 'exported' ? 'complete' : (event.status === 'compared') ? 'active' : 'locked',
      count: event.status === 'exported' ? 'Exported' : 'Pending',
      href: (event.status === 'compared' || event.status === 'exported') ? `/dashboard/events/${eventId}/report` : null,
      btnLabel: 'Generate Report',
      disabled: event.status !== 'compared' && event.status !== 'exported',
    },
  ]

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/dashboard/events" className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{event.event_name}</h1>
              <p className="text-gray-400 mt-1">{event.client_name}</p>
              {location && <p className="text-gray-500 text-sm mt-0.5">{location.name}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-gold-400">{formatCurrency(event.deposit_amount)}</p>
              <p className="text-gray-500 text-xs mt-0.5">deposit</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap gap-4 text-sm">
            <span className="text-gray-400">Date: <span className="text-white">{formatDate(event.event_date)}</span></span>
            {event.guest_count && (
              <span className="text-gray-400">Guests: <span className="text-white">{event.guest_count}</span></span>
            )}
            {event.client_email && (
              <span className="text-gray-400">Client email: <span className="text-white">{event.client_email}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Event Workflow</h2>

        {steps.map((step, idx) => {
          const isComplete = step.status === 'complete'
          const isActive = step.status === 'active'
          const isLocked = step.status === 'locked'

          return (
            <div
              key={idx}
              className={`card flex items-start gap-4 ${isLocked ? 'opacity-50' : ''}`}
            >
              {/* Step icon */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                isComplete ? 'bg-green-600 text-white' :
                isActive ? 'bg-gold-400 text-charcoal-900' :
                'bg-charcoal-600 text-gray-500'
              }`}>
                {isComplete ? <CheckCircle className="w-5 h-5" /> : step.number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isComplete ? 'bg-green-900 text-green-300' :
                    isActive ? 'bg-gold-400/10 text-gold-400' :
                    'bg-charcoal-600 text-gray-500'
                  }`}>
                    {step.count}
                  </span>
                </div>

                {/* Step 2: signature inline */}
                {idx === 1 && !isLocked && !sigSaved && (
                  <div className="mt-3">
                    {!isSigning ? (
                      <button onClick={startSig} className="btn-secondary text-sm flex items-center gap-2">
                        <PenLine className="w-4 h-4" />
                        Collect Signature
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-xs">Ask the client to sign below to acknowledge the pre-event condition</p>
                        <canvas
                          ref={sigCanvasRef}
                          width={480}
                          height={120}
                          className="w-full rounded-lg border border-surface-border cursor-crosshair touch-none"
                          onPointerDown={sigPointerDown}
                          onPointerMove={sigPointerMove}
                          onPointerUp={() => setSigDrawing(false)}
                        />
                        <div className="flex gap-2">
                          <button onClick={saveSignature} className="btn-primary text-sm flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Save Signature
                          </button>
                          <button onClick={clearSig} className="btn-secondary text-sm">Clear</button>
                          <button onClick={() => setIsSigning(false)} className="btn-secondary text-sm">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: signed */}
                {idx === 1 && sigSaved && (
                  <div className="mt-2">
                    {event.client_signature && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.client_signature} alt="Client signature" className="h-12 rounded border border-surface-border" />
                    )}
                  </div>
                )}

                {/* Action button for other steps */}
                {idx !== 1 && !isLocked && (
                  <div className="mt-3 flex gap-2">
                    {step.href ? (
                      <Link href={step.href} className={isComplete ? 'btn-secondary text-sm flex items-center gap-1.5' : 'btn-primary text-sm flex items-center gap-1.5'}>
                        {isComplete ? <CheckCircle className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {step.btnLabel}
                      </Link>
                    ) : idx === 3 && !step.disabled ? (
                      <button
                        onClick={runComparison}
                        disabled={comparing}
                        className="btn-primary text-sm flex items-center gap-1.5"
                      >
                        {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        {comparing ? 'Analyzing...' : 'Run AI Comparison'}
                      </button>
                    ) : idx === 4 && step.href ? (
                      <Link href={step.href} className="btn-primary text-sm flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {step.btnLabel}
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick export if done */}
      {(event.status === 'compared' || event.status === 'exported') && (
        <div className="card border-gold-400/30">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gold-400" />
            <div>
              <p className="font-semibold text-white">Deposit Deduction Report Ready</p>
              <p className="text-sm text-gray-400">Generate and export the PDF for your client</p>
            </div>
            <Link href={`/dashboard/events/${eventId}/report`} className="btn-primary text-sm ml-auto flex-shrink-0">
              Open Report
            </Link>
          </div>
        </div>
      )}

      {/* Warning if no zones */}
      {zones.length === 0 && (
        <div className="card border-orange-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">No zones configured</p>
              <p className="text-sm text-gray-400 mt-1">
                This location has no inspection zones set up. Zones should be seeded automatically.
                If missing, check that the location was created correctly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
