CREATE TABLE IF NOT EXISTS staff (
  id uuid not null default gen_random_uuid (),
  name text not null,
  mobile text not null,
  staff_id text not null,
  password text null,
  is_password_set boolean null default false,
  role text null default 'staff'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  police_verification_url text null,
  base_salary numeric null DEFAULT 0,
  branch TEXT, -- Assigned branch (e.g., Thiruvarur 01, Kodavasal 01)
  current_lat NUMERIC,
  current_lng NUMERIC,
  last_active TIMESTAMP WITH TIME ZONE,
  constraint staff_pkey primary key (id),
  constraint staff_staff_id_key unique (staff_id)
);

-- Leave Management
CREATE TABLE IF NOT EXISTS staff_leaves (
    id BIGSERIAL PRIMARY KEY,
    staff_id TEXT REFERENCES staff(staff_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS staff_attendance (
    id BIGSERIAL PRIMARY KEY,
    staff_id TEXT REFERENCES staff(staff_id),
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    check_in_lat NUMERIC,
    check_in_lng NUMERIC,
    check_out_lat NUMERIC,
    check_out_lng NUMERIC,
    status TEXT DEFAULT 'Present',
    UNIQUE(staff_id, date)
);

-- Staff Real-time Location History
CREATE TABLE IF NOT EXISTS staff_locations (
    id BIGSERIAL PRIMARY KEY,
    staff_id TEXT REFERENCES staff(staff_id),
    latitude NUMERIC,
    longitude NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Salary Disbursement Tracking
CREATE TABLE IF NOT EXISTS salary_payments (
    id BIGSERIAL PRIMARY KEY,
    staff_id TEXT REFERENCES staff(staff_id),
    month_year TEXT NOT NULL, -- Format: "MM-YYYY"
    present_days INTEGER DEFAULT 0,
    base_salary NUMERIC,
    gross_salary NUMERIC,
    deductions NUMERIC DEFAULT 0,
    net_salary NUMERIC,
    status TEXT DEFAULT 'Paid',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, month_year)
);

-- Applicants Table (New Candidate Pipeline)
CREATE TABLE IF NOT EXISTS applicants (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    alternative_mobile TEXT,
    email TEXT,
    area TEXT,
    fathers_name TEXT,
    mothers_name TEXT,
    experience TEXT,
    degree TEXT,
    role TEXT DEFAULT 'Staff',
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    image_url TEXT,
    cert_10th_url TEXT,
    cert_12th_url TEXT,
    cert_degree_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

