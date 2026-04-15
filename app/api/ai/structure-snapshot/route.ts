import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { structureSnapshot } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { text_input, zone_name, checkpoints, event_id, zone_id, snapshot_type } = body

    if (!zone_name || !checkpoints) {
      return NextResponse.json({ error: 'zone_name and checkpoints required' }, { status: 400 })
    }

    const transcript = (text_input ?? '').trim()

    if (!transcript) {
      return NextResponse.json({ transcript: '', ai_result: null })
    }

    // Structure the transcript into condition data
    const aiResult = await structureSnapshot(zone_name, checkpoints, transcript)

    // Save snapshot if event_id and zone_id provided
    if (event_id && zone_id && snapshot_type) {
      const { data: existing } = await supabase
        .from('vp_condition_snapshots')
        .select('id')
        .eq('event_id', event_id)
        .eq('zone_id', zone_id)
        .eq('snapshot_type', snapshot_type)
        .single()

      const payload = {
        event_id,
        zone_id,
        snapshot_type,
        voice_transcript: transcript,
        ai_structured_data: aiResult,
        condition_rating: aiResult.condition_rating,
      }

      if (existing) {
        await supabase.from('vp_condition_snapshots').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('vp_condition_snapshots').insert(payload)
      }
    }

    return NextResponse.json({ transcript, ai_result: aiResult })
  } catch (error) {
    console.error('structure-snapshot error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
