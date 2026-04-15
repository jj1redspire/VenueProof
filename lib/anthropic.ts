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

export interface CateringContext {
  isCateringZone: boolean
  zoneCategory?: string
  temperatureLogs?: Array<{ item: string; temperature: number; reading_type: 'hot' | 'cold'; compliant: boolean }>
}

export async function structureSnapshot(
  zoneName: string,
  checkpoints: string[],
  voiceTranscript: string,
  cateringCtx?: CateringContext
): Promise<StructuredSnapshot> {
  const cateringAddendum = cateringCtx?.isCateringZone ? `

CATERING CONTEXT — this is a catering delivery/setup zone, not a standard venue zone.
Zone category: ${cateringCtx.zoneCategory ?? 'catering'}
${cateringCtx.temperatureLogs && cateringCtx.temperatureLogs.length > 0
  ? `Temperature readings captured:
${cateringCtx.temperatureLogs.map(t => `  - ${t.item}: ${t.temperature}°F (${t.reading_type}) — ${t.compliant ? '✓ COMPLIANT' : '✗ OUT OF RANGE'}`).join('\n')}

FDA Food Code: cold foods must be ≤41°F, hot foods must be ≥135°F. Note any non-compliant readings prominently.`
  : ''}

Focus on: delivery path damage, floor/wall scuffs, equipment condition, setup quality, food safety compliance.` : ''

  const prompt = `You are a professional ${cateringCtx?.isCateringZone ? 'catering operations' : 'venue'} inspector analyzing a facility condition walkthrough report.

Zone: ${zoneName}
Checkpoints to evaluate: ${checkpoints.join(', ')}${cateringAddendum}

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

export interface InventoryDiscrepancy {
  item: string
  delivered_count: number
  returned_count: number
  difference: number
  condition_change: string
  deduction_suggestion: number
}

export interface InventoryComparisonResult {
  discrepancies: InventoryDiscrepancy[]
  total_deduction_suggestion: number
  summary: string
}

export async function compareCateringInventory(
  zoneName: string,
  deliveredInventory: Array<{ name: string; count: number; condition: string; notes: string }>,
  returnedInventory: Array<{ name: string; count: number; condition: string; notes: string }>
): Promise<InventoryComparisonResult> {
  const prompt = `You are a professional catering equipment auditor comparing delivery inventory vs return inventory.

Zone: ${zoneName}

DELIVERED INVENTORY:
${JSON.stringify(deliveredInventory, null, 2)}

RETURNED INVENTORY:
${JSON.stringify(returnedInventory, null, 2)}

Compare the inventories and identify:
1. Count discrepancies (items delivered but not returned, or fewer returned)
2. Condition changes (items in worse condition at return)
3. Suggest replacement/repair costs per item based on typical catering equipment costs:
   - Wine glass: $8-15 each
   - Champagne flute: $10-18 each
   - Dinner plate: $12-25 each
   - Chafing dish: $40-120 each
   - Linen (stained/damaged): $15-40 each
   - Serving platter: $20-60 each

Respond ONLY with valid JSON:
{
  "discrepancies": [
    {
      "item": "item name",
      "delivered_count": 12,
      "returned_count": 10,
      "difference": -2,
      "condition_change": "2 wine glasses missing, 1 cracked",
      "deduction_suggestion": 30
    }
  ],
  "total_deduction_suggestion": 0,
  "summary": "2-3 sentence summary of inventory comparison findings"
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude inventory comparison response')
  const result = JSON.parse(jsonMatch[0]) as InventoryComparisonResult
  result.total_deduction_suggestion = result.discrepancies.reduce(
    (sum, d) => sum + (d.deduction_suggestion || 0), 0
  )
  return result
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
