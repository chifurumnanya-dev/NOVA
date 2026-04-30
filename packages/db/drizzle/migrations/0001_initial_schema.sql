-- NOVA Database Migration: 0001_initial_schema.sql
-- Run with: npx drizzle-kit migrate

CREATE TYPE verification_status AS ENUM (
  'unverified', 'community_submitted', 'source_verified',
  'admin_verified', 'stale', 'rejected'
);

CREATE TYPE facility_type AS ENUM (
  'teaching_hospital', 'federal_medical_centre', 'general_hospital',
  'primary_health_centre', 'private_hospital', 'mission_hospital',
  'specialist_hospital', 'diagnostic_centre', 'laboratory',
  'pharmacy', 'maternity_centre', 'dialysis_centre', 'emergency_centre'
);

CREATE TYPE ownership AS ENUM ('public', 'private', 'mission', 'ngo', 'military');

CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE day_of_week AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
);

-- States
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  geojson JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- LGAs
CREATE TABLE IF NOT EXISTS lgas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX lgas_state_idx ON lgas(state_id);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Specialties
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Sources
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  facility_type facility_type NOT NULL,
  ownership ownership NOT NULL DEFAULT 'public',
  state_id UUID NOT NULL REFERENCES states(id),
  lga_id UUID REFERENCES lgas(id),
  ward VARCHAR(150),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(150),
  website VARCHAR(255),
  opening_hours TEXT,
  latitude REAL,
  longitude REAL,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  data_source VARCHAR(255),
  source_url TEXT,
  source_id UUID REFERENCES sources(id),
  submitted_by VARCHAR(255),
  verified_by VARCHAR(255),
  last_verified_at TIMESTAMP,
  confidence_score REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX facilities_state_idx ON facilities(state_id);
CREATE INDEX facilities_lga_idx ON facilities(lga_id);
CREATE INDEX facilities_type_idx ON facilities(facility_type);
CREATE INDEX facilities_ownership_idx ON facilities(ownership);
CREATE INDEX facilities_verification_idx ON facilities(verification_status);

-- Facility Services (M2M)
CREATE TABLE IF NOT EXISTS facility_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (facility_id, service_id)
);

-- Clinic Schedules
CREATE TABLE IF NOT EXISTS clinic_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id),
  clinic_name VARCHAR(255) NOT NULL,
  day_of_week day_of_week NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  appointment_process TEXT,
  referral_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  data_source VARCHAR(255),
  source_url TEXT,
  submitted_by VARCHAR(255),
  verified_by VARCHAR(255),
  last_verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX schedules_facility_idx ON clinic_schedules(facility_id);
CREATE INDEX schedules_specialty_idx ON clinic_schedules(specialty_id);
CREATE INDEX schedules_day_idx ON clinic_schedules(day_of_week);

-- Contributions
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  payload JSONB NOT NULL,
  status contribution_status NOT NULL DEFAULT 'pending',
  submitted_by VARCHAR(255),
  submitter_email VARCHAR(255),
  reviewed_by VARCHAR(255),
  review_note TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  last_used_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  before JSONB,
  after JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
