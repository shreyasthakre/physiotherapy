-- ════════════════════════════════════════════════════════════════
--  Physiotherapy Clinic — PostgreSQL schema
--  Idempotent: safe to run multiple times.
-- ════════════════════════════════════════════════════════════════

-- gen_random_uuid() is built into PostgreSQL 13+ core. pgcrypto is only
-- needed on older servers; wrap it so it never fails where unavailable
-- (e.g. the embedded PGlite driver).
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ─── Enum types ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'patient');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('booked', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Added later: patient missed / did not attend the session.
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';
-- Front-desk arrival state used by the daily clinic board.
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'checked_in';

DO $$ BEGIN
  CREATE TYPE record_type AS ENUM ('prescription', 'exercise_plan', 'progress_report');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('whatsapp', 'sms', 'email', 'call');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── updated_at trigger helper ──────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role          user_role NOT NULL DEFAULT 'patient',
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── services ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  category          TEXT,
  short_description TEXT,
  description       TEXT,
  duration_minutes  INTEGER NOT NULL DEFAULT 45,
  price             NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url         TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── appointments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  physiotherapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id         UUID REFERENCES services(id) ON DELETE SET NULL,
  scheduled_at       TIMESTAMPTZ NOT NULL,
  duration_minutes   INTEGER NOT NULL DEFAULT 45,
  status             appointment_status NOT NULL DEFAULT 'booked',
  reason             TEXT,
  notes              TEXT,
  reminder_sent_at   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_physio ON appointments(physiotherapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);

DROP TRIGGER IF EXISTS trg_appointments_updated ON appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── patient_records (prescriptions, exercise plans, progress) ──
CREATE TABLE IF NOT EXISTS patient_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  physiotherapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type               record_type NOT NULL,
  title              TEXT NOT NULL,
  body               TEXT,
  data               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_records_patient ON patient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_type ON patient_records(type);

DROP TRIGGER IF EXISTS trg_records_updated ON patient_records;
CREATE TRIGGER trg_records_updated BEFORE UPDATE ON patient_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── blog_posts ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,
  cover_image_url TEXT,
  video_url       TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC);

DROP TRIGGER IF EXISTS trg_blog_updated ON blog_posts;
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── testimonials ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  avatar_url   TEXT,
  rating       INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  quote        TEXT NOT NULL,
  location     TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── contact_messages ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_handled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── newsletter_subscribers ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── notifications (WhatsApp / SMS / email / call log) ──────────
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  sent_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  channel        notification_channel NOT NULL,
  event          TEXT,
  message        TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'sent',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
