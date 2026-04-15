-- VenueProof Migration 002: Catering Vertical
-- Run in Supabase SQL Editor AFTER 001_initial.sql

-- ============================================================
-- 1. Add catering business types to vp_locations
-- ============================================================
-- The business_type column is TEXT with no CHECK constraint in the original schema,
-- so no constraint change needed. Just document supported values:
-- 'catering_company' and 'event_catering' are now valid business types.
-- Catering locations get CATERING_ZONES seeded instead of VENUE_ZONES.

-- Add a comment for documentation
COMMENT ON COLUMN vp_locations.business_type IS
  'Venue types: event_venue, wedding_venue, hotel_ballroom, rooftop, winery_barn, restaurant_private, other. '
  'Catering types: catering_company, event_catering. '
  'Catering locations use CATERING_ZONES template (5 zones). Venue locations use VENUE_ZONES (10 zones).';

-- ============================================================
-- 2. Add catering_type to vp_events
-- ============================================================
ALTER TABLE vp_events
  ADD COLUMN IF NOT EXISTS catering_type TEXT
  CHECK (catering_type IN ('delivery', 'full_service', 'drop_off') OR catering_type IS NULL);

COMMENT ON COLUMN vp_events.catering_type IS
  'NULL for standard venue events. '
  'delivery: deliver and set up only. '
  'full_service: deliver, set up, serve, clean up. '
  'drop_off: drop food only, no setup.';

-- ============================================================
-- 3. Add equipment_inventory and temperature_logs to vp_condition_snapshots
-- ============================================================
-- equipment_inventory: JSONB array of { name, count, condition, notes }
-- Used for delivery inventory logging and return comparison.
ALTER TABLE vp_condition_snapshots
  ADD COLUMN IF NOT EXISTS equipment_inventory JSONB DEFAULT NULL;

-- temperature_logs: JSONB array of { item, temperature, reading_type, timestamp, compliant, notes }
-- FDA Food Code: cold ≤41°F, hot ≥135°F. Used for food safety compliance documentation.
ALTER TABLE vp_condition_snapshots
  ADD COLUMN IF NOT EXISTS temperature_logs JSONB DEFAULT NULL;

COMMENT ON COLUMN vp_condition_snapshots.equipment_inventory IS
  'Array of { name: string, count: number, condition: good|fair|damaged, notes: string }. '
  'Used for catering delivery/return equipment tracking and AI comparison.';

COMMENT ON COLUMN vp_condition_snapshots.temperature_logs IS
  'Array of { item: string, temperature: number, reading_type: hot|cold, timestamp: ISO string, compliant: boolean, notes: string }. '
  'FDA Food Code: cold ≤41°F, hot ≥135°F. Timestamped compliance documentation.';

-- ============================================================
-- 4. Index for catering queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vp_events_catering_type
  ON vp_events(catering_type)
  WHERE catering_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vp_snapshots_equipment_inventory
  ON vp_condition_snapshots USING gin(equipment_inventory)
  WHERE equipment_inventory IS NOT NULL;

-- ============================================================
-- 5. Helper view: temperature compliance summary per event
-- ============================================================
CREATE OR REPLACE VIEW vp_temperature_compliance AS
SELECT
  s.event_id,
  s.zone_id,
  s.snapshot_type,
  s.created_at,
  jsonb_array_length(s.temperature_logs) AS total_readings,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(s.temperature_logs) t
    WHERE (t->>'compliant')::boolean = true
  ) AS compliant_readings,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(s.temperature_logs) t
    WHERE (t->>'compliant')::boolean = false AND (t->>'temperature')::numeric != 0
  ) AS non_compliant_readings
FROM vp_condition_snapshots s
WHERE s.temperature_logs IS NOT NULL
  AND jsonb_array_length(s.temperature_logs) > 0;
