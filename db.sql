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