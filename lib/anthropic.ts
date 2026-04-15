import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface CheckpointItem {
  name: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | 'not_checked'
  notes: string
}

export interface StructuredSnapshot {
  condition_rating: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  summary: string
  checkpoint_items: CheckpointItem[]
  overall_notes: string
}

export interface DamageItem {
  item: string
  severity: 'minor' | 'moderate' | 'major'
  pre_condition: string
  post_condition: string
  description: string
  deduction_suggestion: number
}

export interface ComparisonResult {
  zone_name: string
  unchanged: string[]
  new_damage: DamageItem[]
  missing: string[]
  improved: string[]
  total_deduction_suggestion: number
  comparison_notes: string
}

export async function structureSnapshot(
  zoneName: string,
  checkpoints: string[],
  voiceTranscript: string
): Promise<StructuredSnapshot> {
  const prompt = `You are a professional venue inspector analyzing a facility condition walkthrough report.

Zone: ${zoneName}
Checkpoints to evaluate: ${checkpoints.join(', ')}

Voice transcript from inspector:
"${voiceTranscript}"

Based on the transcript, produce a structured JSON condition report for this zone. Be thorough and specific. If a checkpoint isn't mentioned, set it to "not_checked".

Respond ONLY with valid JSON in this exact format:
{
  "condition_rating": "excellent|good|fair|poor|damaged",
  "summary": "2-3 sentence summary of overall zone condition",
  "checkpoint_items": [
    {
      "name": "checkpoint name",
      "condition": "excellent|good|fair|poor|damaged|not_checked",
      "notes": "specific observations about this item"
    }
  ],
  "overall_notes": "any additional observations not captured in checkpoints"
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude response')
  return JSON.parse(jsonMatch[0]) as StructuredSnapshot
}

export async function compareSnapshots(
  zoneName: string,
  preData: StructuredSnapshot,
  postData: StructuredSnapshot
): Promise<ComparisonResult> {
  const prompt = `You are a professional venue damage assessor comparing pre-event and post-event condition reports.

Zone: ${zoneName}

PRE-EVENT CONDITION:
${JSON.stringify(preData, null, 2)}

POST-EVENT CONDITION:
${JSON.stringify(postData, null, 2)}

Compare these reports and identify:
1. Items with unchanged condition (same or better)
2. NEW damage that appeared during the event (not present pre-event)
3. Missing items (present pre-event, not mentioned post-event — may be stolen/removed)
4. Improved items (damage pre-event that was cleaned/fixed by event staff)

For new damage, estimate a reasonable monetary deduction from a security deposit based on severity and typical repair costs. Be fair and realistic — these amounts may be presented to clients.
- Minor: $50-200 (surface scratches, small stains, minor scuffs)
- Moderate: $200-750 (significant stains, small repairs, broken items)
- Major: $750-3000 (structural damage, major equipment damage, flooding)

Respond ONLY with valid JSON:
{
  "zone_name": "${zoneName}",
  "unchanged": ["item descriptions that are unchanged"],
  "new_damage": [
    {
      "item": "item name",
      "severity": "minor|moderate|major",
      "pre_condition": "condition before event",
      "post_condition": "condition after event",
      "description": "detailed description of damage",
      "deduction_suggestion": 150
    }
  ],
  "missing": ["items that were present pre-event but missing post-event"],
  "improved": ["items that improved during event"],
  "total_deduction_suggestion": 0,
  "comparison_notes": "overall assessment of what happened in this zone during the event"
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude comparison response')
  const result = JSON.parse(jsonMatch[0]) as ComparisonResult
  // Ensure total matches sum of items
  result.total_deduction_suggestion = result.new_damage.reduce(
    (sum, item) => sum + (item.deduction_suggestion || 0),
    0
  )
  return result
}
