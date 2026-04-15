export interface VPUser {
  id: string
  email: string
  stripe_customer_id: string | null
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'free'
  plan: 'starter' | 'pro' | 'enterprise' | 'free'
  created_at: string
}

export interface VPLocation {
  id: string
  user_id: string
  name: string
  address: string | null
  business_type: string | null
  created_at: string
}

export interface VPZone {
  id: string
  location_id: string
  name: string
  category: string
  checkpoints: string[]
  sort_order: number
}

export type EventStatus = 'pending' | 'pre_complete' | 'post_complete' | 'compared' | 'exported'
export type CateringType = 'delivery' | 'full_service' | 'drop_off' | null

export interface VPEvent {
  id: string
  location_id: string
  event_name: string
  client_name: string
  client_email: string | null
  event_date: string
  guest_count: number | null
  deposit_amount: number
  status: EventStatus
  client_signature: string | null
  catering_type: CateringType
  created_at: string
}

export interface EquipmentItem {
  name: string
  count: number
  condition: 'good' | 'fair' | 'damaged'
  notes: string
}

export interface TempReading {
  item: string
  temperature: number
  reading_type: 'hot' | 'cold'
  timestamp: string
  compliant: boolean
  notes: string
}

export type SnapshotType = 'pre' | 'post'

export interface VPConditionSnapshot {
  id: string
  event_id: string
  zone_id: string
  snapshot_type: SnapshotType
  photos: string[]
  voice_transcript: string | null
  ai_structured_data: Record<string, unknown> | null
  condition_rating: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | null
  equipment_inventory: EquipmentItem[] | null
  temperature_logs: TempReading[] | null
  created_at: string
}

export interface VPComparison {
  id: string
  event_id: string
  zone_id: string
  zone_name: string
  pre_snapshot_id: string | null
  post_snapshot_id: string | null
  damage_items: {
    unchanged: string[]
    new_damage: Array<{
      item: string
      severity: 'minor' | 'moderate' | 'major'
      pre_condition: string
      post_condition: string
      description: string
      deduction_suggestion: number
    }>
    missing: string[]
    improved: string[]
    comparison_notes: string
  } | null
  severity: 'none' | 'minor' | 'moderate' | 'major' | null
  deduction_amount: number
  created_at: string
}

export interface VPSubscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}
