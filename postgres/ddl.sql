-- public.bills definition

-- Drop table

-- DROP TABLE public.bills;

CREATE TABLE public.bills (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	flat_id uuid NOT NULL,
	amount numeric(10, 2) NOT NULL,
	due_date date NOT NULL,
	status public."bill_status" DEFAULT 'pending'::bill_status NULL,
	description text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT bills_pkey PRIMARY KEY (id)
);


-- public.buildings definition

-- Drop table

-- DROP TABLE public.buildings;

CREATE TABLE public.buildings (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	society_id uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	total_floors int4 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	CONSTRAINT buildings_pkey PRIMARY KEY (id)
);


-- public.complaints definition

-- Drop table

-- DROP TABLE public.complaints;

CREATE TABLE public.complaints (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	member_id uuid NOT NULL,
	title varchar(255) NOT NULL,
	description text NULL,
	status public."complaint_status" DEFAULT 'open'::complaint_status NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT complaints_pkey PRIMARY KEY (id)
);


-- public.events definition

-- Drop table

-- DROP TABLE public.events;

CREATE TABLE public.events (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	society_id uuid NOT NULL,
	"name" varchar(255) NULL,
	event_date date NULL,
	"location" varchar(255) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT events_pkey PRIMARY KEY (id)
);


-- public.flats definition

-- Drop table

-- DROP TABLE public.flats;

CREATE TABLE public.flats (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	building_id uuid NOT NULL,
	flat_number varchar(20) NOT NULL,
	floor_number int4 NULL,
	is_occupied bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	society_id uuid NULL,
	CONSTRAINT flats_pkey PRIMARY KEY (id)
);


-- public.members definition

-- Drop table

-- DROP TABLE public.members;

CREATE TABLE public.members (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	flat_id uuid NOT NULL,
	move_in_date date NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	society_id uuid NOT NULL,
	building_id uuid NOT NULL,
	CONSTRAINT members_pkey PRIMARY KEY (id)
);


-- public.notices definition

-- Drop table

-- DROP TABLE public.notices;

CREATE TABLE public.notices (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	society_id uuid NOT NULL,
	title varchar(255) NOT NULL,
	"content" text NOT NULL,
	created_by uuid NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT notices_pkey PRIMARY KEY (id)
);


-- public.payments definition

-- Drop table

-- DROP TABLE public.payments;

CREATE TABLE public.payments (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	bill_id uuid NOT NULL,
	amount_paid numeric(10, 2) NOT NULL,
	payment_date date DEFAULT CURRENT_DATE NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT payments_pkey PRIMARY KEY (id)
);


-- public.societies definition

-- Drop table

-- DROP TABLE public.societies;

CREATE TABLE public.societies (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	address text NOT NULL,
	city varchar(100) NOT NULL,
	state varchar(100) NOT NULL,
	country varchar(100) DEFAULT 'India'::character varying NOT NULL,
	end_date date NULL,
	opening_balance int4 NULL,
	created_by uuid NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT societies_pkey PRIMARY KEY (id)
);


-- public.user_sessions definition

-- Drop table

-- DROP TABLE public.user_sessions;

CREATE TABLE public.user_sessions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	refresh_token varchar(500) NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	created_by uuid NOT NULL,
	deleted_by uuid NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT employee_sessions_pkey PRIMARY KEY (id),
	CONSTRAINT employee_sessions_refresh_token_key UNIQUE (refresh_token)
);
CREATE INDEX idx_employee_sessions_user_id ON public.user_sessions USING btree (user_id);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"role" public."user_role" NOT NULL,
	society_id uuid NULL,
	login_key int4 NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	phone varchar(20) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	is_deleted bool DEFAULT false NOT NULL,
	created_by uuid NOT NULL,
	CONSTRAINT users_login_key_key UNIQUE (login_key),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- public.bills foreign keys

ALTER TABLE public.bills ADD CONSTRAINT bills_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id);


-- public.buildings foreign keys

ALTER TABLE public.buildings ADD CONSTRAINT buildings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.buildings ADD CONSTRAINT buildings_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);


-- public.complaints foreign keys

ALTER TABLE public.complaints ADD CONSTRAINT complaints_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


-- public.events foreign keys

ALTER TABLE public.events ADD CONSTRAINT events_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);


-- public.flats foreign keys

ALTER TABLE public.flats ADD CONSTRAINT flats_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);
ALTER TABLE public.flats ADD CONSTRAINT flats_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.flats ADD CONSTRAINT flats_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);


-- public.members foreign keys

ALTER TABLE public.members ADD CONSTRAINT members_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);
ALTER TABLE public.members ADD CONSTRAINT members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.members ADD CONSTRAINT members_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id);
ALTER TABLE public.members ADD CONSTRAINT members_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);
ALTER TABLE public.members ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- public.notices foreign keys

ALTER TABLE public.notices ADD CONSTRAINT notices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.notices ADD CONSTRAINT notices_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);


-- public.payments foreign keys

ALTER TABLE public.payments ADD CONSTRAINT payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id);


-- public.societies foreign keys

ALTER TABLE public.societies ADD CONSTRAINT societies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


-- public.user_sessions foreign keys

ALTER TABLE public.user_sessions ADD CONSTRAINT employee_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- public.users foreign keys

ALTER TABLE public.users ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.users ADD CONSTRAINT users_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id);


-- changes



alter table societies 
add column end_date date

alter table societies 
add column opening_balance int

ALTER TABLE public.users
ADD CONSTRAINT unique_login_key_global UNIQUE (login_key);

-- 24-7-25

ALTER TABLE flats
ADD COLUMN square_foot NUMERIC(10, 2);

ALTER TABLE flats 
ADD COLUMN pending_maintenance JSONB;

ALTER TABLE flats 
ADD COLUMN current_maintenance NUMERIC(10, 2);

create type expense_type_enum as enum ('fixed', 'monthly')

CREATE TABLE expense_tracking (
    id UUID DEFAULT gen_random_uuid() NOT null primary key,
    
    society_id UUID NOT NULL REFERENCES societies(id),
    expense_type expense_type_enum NOT NULL,
    expense_reason TEXT NOT NULL,
    expense_amount NUMERIC(10,2) NOT NULL,
    
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    deleted_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.user_sessions ADD ip_address inet NULL;
ALTER TABLE public.user_sessions ADD browser text NULL;
ALTER TABLE public.user_sessions ADD os text NULL;
ALTER TABLE public.user_sessions ADD device text NULL;

ALTER TABLE user_sessions
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN location TEXT;

CREATE TABLE flat_penalties (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
	society_id UUID NOT NULL REFERENCES societies(id),
	building_id UUID NOT NULL REFERENCES buildings(id),
    flat_id UUID NOT NULL REFERENCES flats(id),
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    is_deleted boolean default false NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);


-- 28-7-25

-- CREATE TABLE public.member_monthly_dues (
-- 	id uuid DEFAULT gen_random_uuid() NOT NULL,
-- 	society_id uuid NOT NULL,
-- 	building_id uuid NOT NULL,
-- 	flat_id uuid NOT NULL,
-- 	member_id uuid NOT NULL,
-- 	month_year date NOT NULL,
-- 	maintenance_amount numeric(10, 2) DEFAULT 0 NOT NULL,
-- 	penalty_amount numeric(10, 2) DEFAULT 0 NOT NULL,
-- 	total_due numeric(10, 2) GENERATED ALWAYS AS ((maintenance_amount + penalty_amount)) STORED NULL,
-- 	maintenance_paid bool DEFAULT false NULL,
-- 	maintenance_paid_at timestamptz NULL,
-- 	penalty_paid bool DEFAULT false NULL,
-- 	penalty_paid_at timestamptz NULL,
-- 	created_at timestamptz DEFAULT now() NULL,
-- 	created_by uuid NOT NULL,
-- 	updated_at timestamptz DEFAULT now() NULL,
-- 	updated_by uuid NOT NULL,
-- 	CONSTRAINT member_monthly_dues_flat_id_member_id_month_year_key UNIQUE (flat_id, member_id, month_year),
-- 	CONSTRAINT member_monthly_dues_pkey PRIMARY KEY (id),
-- 	CONSTRAINT member_monthly_dues_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id),
-- 	CONSTRAINT member_monthly_dues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
-- 	CONSTRAINT member_monthly_dues_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id),
-- 	CONSTRAINT member_monthly_dues_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id),
-- 	CONSTRAINT member_monthly_dues_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id)
-- );

-- INSERT INTO public.member_monthly_dues (
--   society_id,
--   building_id,
--   flat_id,
--   member_id,
--   month_year,
--   maintenance_amount,
--   penalty_amount,
--   created_by,
--   created_at,
--   updated_by,
--   updated_at
-- )
-- SELECT
--   m.society_id,
--   m.building_id,
--   m.flat_id,
--   m.id as member_id,
--   date_trunc('month', CURRENT_DATE)::date as month_year,
--   f.current_maintenance,
--   COALESCE((
--     SELECT SUM(p.amount)
--     FROM public.flat_penalties p
--     WHERE p.flat_id = m.flat_id
--       AND date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)
--       AND p.is_deleted = false
--   ), 0) as penalty_amount,
--   '537a3518-e7f7-4049-9867-7254ca1486da' -- replace with real user ID
--   NOW(),
--   '537a3518-e7f7-4049-9867-7254ca1486da' -- replace with real user ID
--   NOW()
-- FROM public.members m
-- JOIN public.flats f ON f.id = m.flat_id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.member_monthly_dues d
--   WHERE d.member_id = m.id AND d.month_year = date_trunc('month', CURRENT_DATE)
-- );


CREATE TABLE public.member_monthly_dues (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	society_id uuid NOT NULL,
	building_id uuid NOT NULL,
	flat_id uuid NOT NULL,
	member_ids uuid[] NOT NULL,
	month_year date NOT NULL,
	maintenance_amount numeric(10, 2) DEFAULT 0 NOT NULL,
	penalty_amount numeric(10, 2) DEFAULT 0 NOT NULL,
	total_due numeric(10, 2) GENERATED ALWAYS AS ((maintenance_amount + penalty_amount)) STORED,
	maintenance_paid bool DEFAULT false,
	maintenance_paid_at timestamptz,
	penalty_paid bool DEFAULT false,
	penalty_paid_at timestamptz,
	created_at timestamptz DEFAULT now(),
	created_by uuid NOT NULL,
	updated_at timestamptz DEFAULT now(),
	updated_by uuid NOT NULL,
	CONSTRAINT member_monthly_dues_pkey PRIMARY KEY (id),
	CONSTRAINT member_monthly_dues_flat_id_month_year_key UNIQUE (flat_id, month_year),
	CONSTRAINT member_monthly_dues_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id),
	CONSTRAINT member_monthly_dues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT member_monthly_dues_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id),
	CONSTRAINT member_monthly_dues_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(id)
);


INSERT INTO public.member_monthly_dues (
  society_id,
  building_id,
  flat_id,
  member_ids,
  month_year,
  maintenance_amount,
  penalty_amount,
  created_by,
  created_at,
  updated_by,
  updated_at
)
SELECT
  m.society_id,
  m.building_id,
  m.flat_id,
  array_agg(m.id) AS member_ids,
  date_trunc('month', CURRENT_DATE)::date as month_year,
  f.current_maintenance,
  COALESCE((
    SELECT SUM(p.amount)
    FROM public.flat_penalties p
    WHERE p.flat_id = m.flat_id
      AND date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)
      AND p.is_deleted = false
  ), 0) as penalty_amount,
  '537a3518-e7f7-4049-9867-7254ca1486da', -- created_by
  NOW(),                                  -- created_at
  '537a3518-e7f7-4049-9867-7254ca1486da', -- updated_by
  NOW()                                   -- updated_at
FROM public.members m
JOIN public.flats f ON f.id = m.flat_id
GROUP BY m.society_id, m.building_id, m.flat_id, f.current_maintenance
HAVING NOT EXISTS (
  SELECT 1 FROM public.member_monthly_dues d
  WHERE d.flat_id = m.flat_id AND d.month_year = date_trunc('month', CURRENT_DATE)::date
);
