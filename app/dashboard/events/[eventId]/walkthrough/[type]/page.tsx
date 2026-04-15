'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, Camera, Mic, MicOff, Loader2, CheckCircle,
  X, Star, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { VPZone, VPConditionSnapshot, EquipmentItem, TempReading } from '@/types'

type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'

const RATINGS: { value: ConditionRating; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-600 text-white' },
  { value: 'good', label: 'Good', color: 'bg-blue-600 text-white' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-600 text-white' },
  { value: 'poor', label: 'Poor', color: 'bg-orange-600 text-white' },
  { value: 'damaged', label: 'Damaged', color: 'bg-red-600 text-white' },
]

export default function WalkthroughPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const snapshotType = params.type as 'pre' | 'post'
  const router = useRouter()

  const [zones, setZones] = useState<VPZone[]>([])
  const [existingSnapshots, setExistingSnapshots] = useState<VPConditionSnapshot[]>([])
  const [currentZoneIdx, setCurrentZoneIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Per-zone state
  const [photos, setPhotos] = useState<string[]>([])
  const [transcript, setTranscript] = useState('')
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null)
  const [conditionRating, setConditionRating] = useState<ConditionRating>('good')
  const [notes, setNotes] = useState('')
  const [showCheckpoints, setShowCheckpoints] = useState(true)

  // Catering-specific state
  const [isCateringEvent, setIsCateringEvent] = useState(false)
  const [equipmentInventory, setEquipmentInventory] = useState<EquipmentItem[]>([])
  const [temperatureLogs, setTemperatureLogs] = useState<TempReading[]>([])
  const [showCateringPanel, setShowCateringPanel] = useState(true)

  // Voice recording (Web Speech API)
  const [recording, setRecording] = useState(false)
  const [transcribing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: evt } = await supabase.from('vp_events').select('location_id, catering_type').eq('id', eventId).single()
      if (!evt) { router.push('/dashboard'); return }
      setIsCateringEvent(!!evt.catering_type)

      const [{ data: zs }, { data: snaps }] = await Promise.all([
        supabase.from('vp_zones').select('*').eq('location_id', evt.location_id).order('sort_order'),
        supabase.from('vp_condition_snapshots').select('*').eq('event_id', eventId).eq('snapshot_type', snapshotType),
      ])

      setZones(zs ?? [])
      setExistingSnapshots(snaps ?? [])

      // Start at first incomplete zone
      const completedIds = new Set((snaps ?? []).map((s: VPConditionSnapshot) => s.zone_id))
      const firstIncomplete = (zs ?? []).findIndex((z: VPZone) => !completedIds.has(z.id))
      if (firstIncomplete >= 0) setCurrentZoneIdx(firstIncomplete)
      else if ((zs ?? []).length > 0) setCurrentZoneIdx(0)

      setLoading(false)
    }
    load()
  }, [eventId, snapshotType, router])

  // Reset zone state when zone changes
  useEffect(() => {
    setPhotos([])
    setTranscript('')
    setAiResult(null)
    setConditionRating('good')
    setNotes('')
    setShowCheckpoints(true)
    setEquipmentInventory([])
    setTemperatureLogs([])
    setShowCateringPanel(true)
  }, [currentZoneIdx])

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.slice(0, 6 - photos.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setPhotos(prev => [...prev, ev.target?.result as string].slice(0, 6))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function startRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your observations instead.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let fullText = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) fullText += t + ' '
        else interim = t
      }
      setTranscript(fullText + interim)
    }
    recognition.onend = () => {
      setRecording(false)
      setTranscript(fullText.trim())
    }
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  async function processWithAI() {
    const input = transcript || notes
    if (!input) return
    setProcessing(true)
    try {
      const res = await fetch('/api/ai/structure-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_input: input,
          zone_name: zones[currentZoneIdx]?.name,
          checkpoints: zones[currentZoneIdx]?.checkpoints,
          event_id: eventId,
          zone_id: zones[currentZoneIdx]?.id,
          snapshot_type: snapshotType,
        }),
      })
      const data = await res.json()
      if (data.ai_result) {
        setAiResult(data.ai_result)
        if (data.ai_result.condition_rating) setConditionRating(data.ai_result.condition_rating)
        if (data.ai_result.summary) setNotes(data.ai_result.summary)
      }
    } catch { /* ignore */ }
    setProcessing(false)
  }

  async function saveZone() {
    if (!conditionRating) return
    setSaving(true)

    const supabase = createClient()
    const zone = zones[currentZoneIdx]

    // Check if snapshot already exists for this zone
    const { data: existing } = await supabase
      .from('vp_condition_snapshots')
      .select('id')
      .eq('event_id', eventId)
      .eq('zone_id', zone.id)
      .eq('snapshot_type', snapshotType)
      .single()

    const payload = {
      event_id: eventId,
      zone_id: zone.id,
      snapshot_type: snapshotType,
      photos: photos,
      voice_transcript: transcript || null,
      ai_structured_data: aiResult,
      condition_rating: conditionRating,
      equipment_inventory: equipmentInventory.length > 0 ? equipmentInventory : null,
      temperature_logs: temperatureLogs.length > 0 ? temperatureLogs : null,
    }

    if (existing) {
      await supabase.from('vp_condition_snapshots').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('vp_condition_snapshots').insert(payload)
    }

    // Reload snapshots
    const { data: snaps } = await supabase
      .from('vp_condition_snapshots')
      .select('*')
      .eq('event_id', eventId)
      .eq('snapshot_type', snapshotType)

    const updatedSnaps = snaps ?? []
    setExistingSnapshots(updatedSnaps)

    // Update event status
    if (updatedSnaps.length >= zones.length) {
      const newStatus = snapshotType === 'pre' ? 'pre_complete' : 'post_complete'
      await supabase.from('vp_events').update({ status: newStatus }).eq('id', eventId)
      router.push(`/dashboard/events/${eventId}`)
      return
    }

    // Move to next zone
    if (currentZoneIdx < zones.length - 1) {
      setCurrentZoneIdx(i => i + 1)
    } else {
      router.push(`/dashboard/events/${eventId}`)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  const zone = zones[currentZoneIdx]
  if (!zone) return null

  const completedIds = new Set(existingSnapshots.map(s => s.zone_id))
  const isCompleted = completedIds.has(zone.id)

  const aiCheckpoints = aiResult
    ? (aiResult as { checkpoint_items?: Array<{ name: string; condition: string; notes: string }> }).checkpoint_items
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-charcoal-800 border-b border-surface-border">
        <Link href={`/dashboard/events/${eventId}`} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {snapshotType === 'pre' ? 'Pre-Event' : 'Post-Event'} Walkthrough
          </p>
          <p className="text-xs text-gray-400">Zone {currentZoneIdx + 1} of {zones.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{existingSnapshots.length} / {zones.length} done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-charcoal-700">
        <div
          className="h-1 bg-gold-400 transition-all"
          style={{ width: `${(existingSnapshots.length / zones.length) * 100}%` }}
        />
      </div>

      {/* Zone list (collapsible) */}
      <div className="bg-charcoal-800 border-b border-surface-border px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {zones.map((z, i) => {
            const done = completedIds.has(z.id)
            const active = i === currentZoneIdx
            return (
              <button
                key={z.id}
                onClick={() => setCurrentZoneIdx(i)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  active ? 'bg-gold-400 text-charcoal-900' :
                  done ? 'bg-green-800 text-green-200' :
                  'bg-charcoal-700 text-gray-400 hover:bg-charcoal-600'
                )}
              >
                {done && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {z.name.split(' / ')[0].split(' — ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">

          {/* Zone header */}
          <div>
            <h2 className="text-xl font-bold text-white">{zone.name}</h2>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Already documented — overwrite to update
              </span>
            )}
          </div>

          {/* Checkpoints */}
          <div className="card">
            <button
              onClick={() => setShowCheckpoints(v => !v)}
              className="flex items-center justify-between w-full text-sm font-semibold text-white"
            >
              <span>Checkpoints to inspect ({zone.checkpoints.length})</span>
              {showCheckpoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showCheckpoints && (
              <div className="mt-3 flex flex-wrap gap-2">
                {zone.checkpoints.map(cp => (
                  <span key={cp} className="bg-charcoal-700 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                    {cp}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <p className="label mb-2">Photos ({photos.length}/6)</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-surface-border" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-surface-border rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gold-400 hover:text-gold-400 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs mt-1">Add photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Voice recording */}
          <div className="card">
            <p className="text-sm font-semibold text-white mb-3">Voice Observation</p>
            <p className="text-xs text-gray-400 mb-3">
              Record your observations about this zone. Describe the condition of each checkpoint.
            </p>

            <div className="flex gap-2">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={transcribing || processing}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Mic className="w-4 h-4" />
                  {transcribing ? 'Transcribing...' : 'Start Recording'}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="btn-danger flex items-center gap-2 text-sm animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </button>
              )}
              {(transcribing || processing) && <Loader2 className="w-5 h-5 animate-spin text-gold-400 self-center" />}
            </div>

            {transcript && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Transcript:</p>
                <p className="text-sm text-gray-300 bg-charcoal-700 rounded-lg p-3 italic">{transcript}</p>
              </div>
            )}
          </div>

          {/* Manual notes + AI process */}
          <div>
            <label className="label">Notes (or edit transcript)</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Describe the condition of this zone — flooring, walls, equipment, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            {(transcript || notes) && !aiResult && (
              <button
                onClick={processWithAI}
                disabled={processing}
                className="btn-secondary text-sm mt-2 flex items-center gap-1.5"
              >
                {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 text-gold-400" />}
                {processing ? 'Processing...' : 'Structure with AI'}
              </button>
            )}
          </div>

          {/* AI result display */}
          {aiResult && aiCheckpoints && (
            <div className="card border-gold-400/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gold-400">AI Structured Report</p>
                <button onClick={() => setAiResult(null)} className="text-gray-500 hover:text-gray-300">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {aiCheckpoints.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <span className={cn(
                      'flex-shrink-0 text-xs px-2 py-0.5 rounded-full mt-0.5 font-medium',
                      `badge-${item.condition}`
                    )}>
                      {item.condition}
                    </span>
                    <div>
                      <span className="text-white font-medium">{item.name}</span>
                      {item.notes && <span className="text-gray-400 ml-1">— {item.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catering panel — equipment inventory + temperature logs */}
          {isCateringEvent && zone.category.startsWith('catering') && (
            <div className="card border-gold-400/20">
              <button
                onClick={() => setShowCateringPanel(v => !v)}
                className="flex items-center justify-between w-full text-sm font-semibold text-white mb-0"
              >
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" />
                  Catering Documentation
                  {(equipmentInventory.length > 0 || temperatureLogs.length > 0) && (
                    <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded-full">
                      {equipmentInventory.length + temperatureLogs.length} entries
                    </span>
                  )}
                </span>
                {showCateringPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCateringPanel && (
                <div className="mt-4 space-y-5">
                  {/* Equipment Inventory */}
                  <div>
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Equipment Inventory
                    </p>
                    <p className="text-xs text-gray-500 mb-3">Log items being delivered/present — used for return comparison</p>
                    <div className="space-y-2">
                      {equipmentInventory.map((item, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <input
                            type="text"
                            className="input text-sm flex-1"
                            placeholder="Item name (e.g. Wine glasses)"
                            value={item.name}
                            onChange={e => setEquipmentInventory(prev => {
                              const next = [...prev]
                              next[i] = { ...next[i], name: e.target.value }
                              return next
                            })}
                          />
                          <input
                            type="number"
                            className="input text-sm w-16"
                            placeholder="Qty"
                            min="0"
                            value={item.count}
                            onChange={e => setEquipmentInventory(prev => {
                              const next = [...prev]
                              next[i] = { ...next[i], count: Number(e.target.value) }
                              return next
                            })}
                          />
                          <select
                            className="input text-sm w-24"
                            value={item.condition}
                            onChange={e => setEquipmentInventory(prev => {
                              const next = [...prev]
                              next[i] = { ...next[i], condition: e.target.value as EquipmentItem['condition'] }
                              return next
                            })}
                          >
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="damaged">Damaged</option>
                          </select>
                          <button
                            onClick={() => setEquipmentInventory(prev => prev.filter((_, j) => j !== i))}
                            className="text-gray-500 hover:text-red-400 flex-shrink-0 mt-2.5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setEquipmentInventory(prev => [...prev, { name: '', count: 1, condition: 'good', notes: '' }])}
                      className="btn-secondary text-xs mt-2 flex items-center gap-1.5"
                    >
                      + Add Equipment Item
                    </button>
                  </div>

                  {/* Temperature Logs */}
                  {(zone.category === 'catering_service' || zone.category === 'catering_kitchen') && (
                    <div>
                      <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                        Temperature Log
                        <span className="text-gray-500 font-normal ml-2">Cold ≤41°F · Hot ≥135°F</span>
                      </p>
                      <p className="text-xs text-gray-500 mb-3">FDA Food Code compliance — log temps at setup</p>
                      <div className="space-y-2">
                        {temperatureLogs.map((log, i) => {
                          const compliant = log.reading_type === 'cold' ? log.temperature <= 41 : log.temperature >= 135
                          return (
                            <div key={i} className={`flex gap-2 items-start rounded-lg p-2 ${compliant ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                              <input
                                type="text"
                                className="input text-sm flex-1"
                                placeholder="Food item (e.g. Caesar salad)"
                                value={log.item}
                                onChange={e => setTemperatureLogs(prev => {
                                  const next = [...prev]
                                  next[i] = { ...next[i], item: e.target.value }
                                  return next
                                })}
                              />
                              <div className="flex gap-1 items-center flex-shrink-0">
                                <input
                                  type="number"
                                  className={`input text-sm w-20 ${!compliant && log.temperature !== 0 ? 'border-red-500' : ''}`}
                                  placeholder="°F"
                                  value={log.temperature || ''}
                                  onChange={e => {
                                    const temp = Number(e.target.value)
                                    const isCompliant = log.reading_type === 'cold' ? temp <= 41 : temp >= 135
                                    setTemperatureLogs(prev => {
                                      const next = [...prev]
                                      next[i] = { ...next[i], temperature: temp, compliant: isCompliant, timestamp: new Date().toISOString() }
                                      return next
                                    })
                                  }}
                                />
                                <span className="text-gray-500 text-xs">°F</span>
                              </div>
                              <select
                                className="input text-sm w-20"
                                value={log.reading_type}
                                onChange={e => setTemperatureLogs(prev => {
                                  const next = [...prev]
                                  const type = e.target.value as TempReading['reading_type']
                                  const isCompliant = type === 'cold' ? next[i].temperature <= 41 : next[i].temperature >= 135
                                  next[i] = { ...next[i], reading_type: type, compliant: isCompliant }
                                  return next
                                })}
                              >
                                <option value="cold">Cold</option>
                                <option value="hot">Hot</option>
                              </select>
                              <span className={`text-xs font-semibold flex-shrink-0 mt-2.5 ${compliant && log.temperature !== 0 ? 'text-green-400' : log.temperature !== 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {log.temperature !== 0 ? (compliant ? '✓' : '✗') : '--'}
                              </span>
                              <button
                                onClick={() => setTemperatureLogs(prev => prev.filter((_, j) => j !== i))}
                                className="text-gray-500 hover:text-red-400 flex-shrink-0 mt-2.5"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => setTemperatureLogs(prev => [...prev, { item: '', temperature: 0, reading_type: 'cold', timestamp: new Date().toISOString(), compliant: false, notes: '' }])}
                        className="btn-secondary text-xs mt-2 flex items-center gap-1.5"
                      >
                        + Add Temperature Reading
                      </button>

                      {/* Compliance summary */}
                      {temperatureLogs.length > 0 && (
                        <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${temperatureLogs.every(t => t.compliant || t.temperature === 0) ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                          {temperatureLogs.filter(t => !t.compliant && t.temperature !== 0).length === 0
                            ? `✓ All ${temperatureLogs.filter(t => t.temperature !== 0).length} readings compliant`
                            : `✗ ${temperatureLogs.filter(t => !t.compliant && t.temperature !== 0).length} out-of-range reading${temperatureLogs.filter(t => !t.compliant && t.temperature !== 0).length > 1 ? 's' : ''} — document corrective action in notes`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Condition rating */}
          <div>
            <p className="label mb-2">Overall Zone Condition</p>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setConditionRating(r.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                    conditionRating === r.value
                      ? `${r.color} border-transparent scale-105`
                      : 'bg-charcoal-700 text-gray-400 border-transparent hover:border-surface-border'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pb-6">
            <button
              onClick={saveZone}
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {saving ? 'Saving...' : currentZoneIdx < zones.length - 1 ? 'Save & Next Zone' : 'Complete Walkthrough'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
