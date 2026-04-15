import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { compareSnapshots } from '@/lib/anthropic'
import type { StructuredSnapshot } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { event_id } = await request.json()
    if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 })

    // Verify event belongs to user
    const { data: event } = await supabase
      .from('vp_events')
      .select('id, location_id, status')
      .eq('id', event_id)
      .single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Get all zones for this location
    const { data: zones } = await supabase
      .from('vp_zones')
      .select('*')
      .eq('location_id', event.location_id)
      .order('sort_order')

    if (!zones || zones.length === 0) {
      return NextResponse.json({ error: 'No zones found' }, { status: 400 })
    }

    // Get all pre/post snapshots for this event
    const { data: snapshots } = await supabase
      .from('vp_condition_snapshots')
      .select('*')
      .eq('event_id', event_id)

    type SnapRow = NonNullable<typeof snapshots>[number]
    const preMap = new Map<string, SnapRow>()
    const postMap = new Map<string, SnapRow>()
    ;(snapshots ?? []).forEach((snap: SnapRow) => {
      if (snap.snapshot_type === 'pre') preMap.set(snap.zone_id, snap)
      else postMap.set(snap.zone_id, snap)
    })

    // Clear existing comparisons
    await supabase.from('vp_comparisons').delete().eq('event_id', event_id)

    const comparisons = []
    let totalDeduction = 0

    // Compare each zone
    for (const zone of zones) {
      const pre = preMap.get(zone.id)
      const post = postMap.get(zone.id)

      if (!pre && !post) continue

      let compResult = null
      let severity = 'none'
      let deduction = 0

      if (pre && post && pre.ai_structured_data && post.ai_structured_data) {
        try {
          compResult = await compareSnapshots(
            zone.name,
            pre.ai_structured_data as StructuredSnapshot,
            post.ai_structured_data as StructuredSnapshot
          )
          deduction = compResult.total_deduction_suggestion
          totalDeduction += deduction

          // Determine zone severity from damage items
          const damages = compResult.new_damage ?? []
          if (damages.some(d => d.severity === 'major')) severity = 'major'
          else if (damages.some(d => d.severity === 'moderate')) severity = 'moderate'
          else if (damages.length > 0) severity = 'minor'
        } catch (err) {
          console.error(`Comparison error for zone ${zone.name}:`, err)
        }
      } else if (pre && !post) {
        // Post snapshot missing — treat as concerning
        compResult = {
          zone_name: zone.name,
          unchanged: [],
          new_damage: [],
          missing: ['Post-event walkthrough not completed for this zone'],
          improved: [],
          total_deduction_suggestion: 0,
          comparison_notes: 'Post-event walkthrough was not completed for this zone.',
        }
      }

      const { data: inserted } = await supabase
        .from('vp_comparisons')
        .insert({
          event_id,
          zone_id: zone.id,
          zone_name: zone.name,
          pre_snapshot_id: pre?.id ?? null,
          post_snapshot_id: post?.id ?? null,
          damage_items: compResult,
          severity,
          deduction_amount: deduction,
        })
        .select()
        .single()

      if (inserted) comparisons.push(inserted)
    }

    // Update event status to 'compared'
    await supabase
      .from('vp_events')
      .update({ status: 'compared' })
      .eq('id', event_id)

    return NextResponse.json({
      comparisons,
      total_deduction: totalDeduction,
      zones_compared: comparisons.length,
    })
  } catch (error) {
    console.error('compare-snapshots error:', error)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
