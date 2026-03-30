-- ProposalKit Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS proposals (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title                   TEXT NOT NULL,
  client_name             TEXT,
  client_email            TEXT,
  description             TEXT,
  content                 JSONB,
  amount                  DECIMAL(10,2) NOT NULL DEFAULT 0,
  status                  TEXT DEFAULT 'draft'
                            CHECK (status IN ('draft','sent','signed','paid')),
  signer_name             TEXT,
  signer_email            TEXT,
  signature_data          TEXT,
  signed_at               TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  paid_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their own proposals
DROP POLICY IF EXISTS "owner_all" ON proposals;
CREATE POLICY "owner_all" ON proposals
  FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can read sent/signed/paid proposals (for the public /p/[id] page)
-- Note: service role key bypasses RLS, so the public page uses service role
DROP POLICY IF EXISTS "public_read_sent" ON proposals;
CREATE POLICY "public_read_sent" ON proposals
  FOR SELECT
  USING (status IN ('sent','signed','paid'));

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS proposals_user_id_idx ON proposals(user_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx ON proposals(status);

