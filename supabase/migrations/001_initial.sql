-- VenueProof Database Schema
-- All tables use vp_ prefix
-- Run in Supabase SQL Editor

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'free')),
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('starter', 'pro', 'enterprise', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vp_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own record" ON vp_users
  FOR ALL USING (auth.uid() = id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.vp_users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES vp_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  business_type TEXT DEFAULT 'event_venue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vp_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own locations" ON vp_locations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES vp_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  checkpoints JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE vp_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own zones" ON vp_zones
  FOR ALL USING (
    location_id IN (
      SELECT id FROM vp_locations WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES vp_locations(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  event_date DATE NOT NULL,
  guest_count INTEGER,
  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'pre_complete', 'post_complete', 'compared', 'exported')),
  client_signature TEXT, -- base64 PNG
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON vp_events
  FOR ALL USING (
    location_id IN (
      SELECT id FROM vp_locations WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- CONDITION SNAPSHOTS (pre/post per zone)
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_condition_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES vp_events(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES vp_zones(id) ON DELETE CASCADE,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('pre', 'post')),
  photos JSONB NOT NULL DEFAULT '[]',       -- array of base64 strings
  voice_transcript TEXT,
  ai_structured_data JSONB,                -- structured condition report from Claude
  condition_rating TEXT CHECK (
    condition_rating IN ('excellent', 'good', 'fair', 'poor', 'damaged')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, zone_id, snapshot_type)
);

ALTER TABLE vp_condition_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own snapshots" ON vp_condition_snapshots
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM vp_events e
      JOIN vp_locations l ON l.id = e.location_id
      WHERE l.user_id = auth.uid()
    )
  );

-- ============================================================
-- COMPARISONS (AI comparison output per zone)
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES vp_events(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES vp_zones(id) ON DELETE SET NULL,
  zone_name TEXT NOT NULL,
  pre_snapshot_id UUID REFERENCES vp_condition_snapshots(id) ON DELETE SET NULL,
  post_snapshot_id UUID REFERENCES vp_condition_snapshots(id) ON DELETE SET NULL,
  damage_items JSONB,                        -- { unchanged[], new_damage[], missing[], improved[], comparison_notes }
  severity TEXT CHECK (severity IN ('none', 'minor', 'moderate', 'major')),
  deduction_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vp_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own comparisons" ON vp_comparisons
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM vp_events e
      JOIN vp_locations l ON l.id = e.location_id
      WHERE l.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS vp_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES vp_users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vp_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON vp_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vp_locations_user_id ON vp_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_vp_zones_location_id ON vp_zones(location_id);
CREATE INDEX IF NOT EXISTS idx_vp_events_location_id ON vp_events(location_id);
CREATE INDEX IF NOT EXISTS idx_vp_events_event_date ON vp_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_vp_snapshots_event_id ON vp_condition_snapshots(event_id);
CREATE INDEX IF NOT EXISTS idx_vp_comparisons_event_id ON vp_comparisons(event_id);
