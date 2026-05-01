-- Tour Management System — Chiang Mai Clicks
-- Schema v1.0 · April 2026
-- Run this in the Supabase SQL Editor to initialise your database.

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────
create type user_role         as enum ('ADMIN');
create type tour_category     as enum ('ADVENTURE', 'CULTURAL', 'ANIMALS', 'CULINARY');
create type tour_type         as enum ('ELEPHANTS', 'BAMBOO_RAFTING', 'COOKING_CLASS', 'MUAY_THAI', 'TEMPLE_TOUR', 'WATERFALLS');
create type tour_status       as enum ('ACTIVE', 'INACTIVE', 'DRAFT');
create type commission_type   as enum ('FIXED', 'PERCENTAGE');
create type payment_status    as enum ('UNPAID', 'DEPOSIT', 'PAID');
create type booking_status    as enum ('CONFIRMED', 'PENDING', 'CANCELLED', 'NO_SHOW');
create type booking_source    as enum ('WALK_IN', 'WHATSAPP', 'WEBSITE', 'PARTNER');

-- ─────────────────────────────────────────────
-- tour_providers
-- ─────────────────────────────────────────────
create table tour_providers (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  "contactName" text,
  phone         text,
  email         text,
  address       text,
  notes         text,
  "isActive"    boolean not null default true,
  "createdAt"   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- banks
-- ─────────────────────────────────────────────
create table banks (
  id            text primary key default gen_random_uuid()::text,
  "providerId"  text not null references tour_providers(id) on delete cascade,
  "bankName"    text not null,
  "accountName" text not null,
  "accountNo"   text not null,
  "isPrimary"   boolean not null default false,
  "createdAt"   timestamptz not null default now()
);

create index banks_provider_idx on banks("providerId");

-- ─────────────────────────────────────────────
-- tours
-- ─────────────────────────────────────────────
create table tours (
  id               text primary key default gen_random_uuid()::text,
  name             text not null,
  category         tour_category[] not null default '{}',
  "tourType"       tour_type not null,
  "providerId"     text not null references tour_providers(id),
  duration         text not null,
  "departureTimes" text[] not null default '{}',
  "includeLunch"   boolean not null default false,
  inclusions       text[] not null default '{}',
  exclusions       text[] not null default '{}',
  "adultPrice"     numeric(12,2) not null default 0,
  "childPrice"     numeric(12,2) not null default 0,
  "infantPrice"    numeric(12,2) not null default 0,
  "commissionType"         commission_type not null,
  "adultCommissionValue"   numeric(12,2) not null default 0,
  "childCommissionValue"   numeric(12,2) not null default 0,
  "minPax"         integer,
  "maxPax"         integer,
  "featuredImage"  text,
  status           tour_status not null default 'DRAFT',
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now()
);

create index tours_provider_idx on tours("providerId");
create index tours_status_idx   on tours(status);

-- auto-update updatedAt
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new."updatedAt" = now(); return new; end;
$$;

create trigger tours_updated_at
  before update on tours
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- clients
-- ─────────────────────────────────────────────
create table clients (
  id            text primary key default gen_random_uuid()::text,
  "fullName"    text not null,
  whatsapp      text not null,
  email         text,
  nationality   text,
  "isRepeat"    boolean not null default false,
  "createdAt"   timestamptz not null default now()
);

create index clients_name_idx      on clients("fullName");
create index clients_whatsapp_idx  on clients(whatsapp);

-- ─────────────────────────────────────────────
-- pickup_locations
-- ─────────────────────────────────────────────
create table pickup_locations (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  zone        text,
  "isActive"  boolean not null default true
);

-- ─────────────────────────────────────────────
-- bookings — sequence for human-readable ref
-- ─────────────────────────────────────────────
create sequence booking_seq start 1;

create table bookings (
  id                  text primary key default gen_random_uuid()::text,
  "bookingRef"        text not null unique default
                        'TMS-' || extract(year from now())::text || '-' || lpad(nextval('booking_seq')::text, 4, '0'),
  "clientId"          text not null references clients(id),
  "tourId"            text not null references tours(id),
  "tourDate"          date not null,
  "bookingDate"       date not null default current_date,
  "departureTime"     text,
  "adultPax"          integer not null default 0,
  "childPax"          integer not null default 0,
  "infantPax"         integer not null default 0,
  "pickupLocationId"  text references pickup_locations(id),
  "hotelName"         text,
  "hotelRoom"         text,
  notes               text,
  "adultUnitPrice"    numeric(12,2) not null default 0,
  "childUnitPrice"    numeric(12,2) not null default 0,
  "infantUnitPrice"   numeric(12,2) not null default 0,
  "totalAmount"       numeric(12,2) not null default 0,
  "commissionAmount"  numeric(12,2) not null default 0,
  "netAmount"         numeric(12,2) not null default 0,
  "paymentStatus"     payment_status not null default 'UNPAID',
  "amountReceived"    numeric(12,2),
  "bookingSource"     booking_source,
  "bookingStatus"     booking_status not null default 'PENDING',
  "createdBy"         uuid references auth.users(id),
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

create index bookings_client_idx  on bookings("clientId");
create index bookings_tour_idx    on bookings("tourId");
create index bookings_date_idx    on bookings("tourDate");
create index bookings_status_idx  on bookings("bookingStatus");

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- Auto-flag repeat clients after 2+ bookings
create or replace function flag_repeat_client()
returns trigger language plpgsql as $$
declare
  booking_count integer;
begin
  select count(*) into booking_count
  from bookings
  where "clientId" = new."clientId"
    and "bookingStatus" != 'CANCELLED';

  if booking_count >= 2 then
    update clients set "isRepeat" = true where id = new."clientId";
  end if;
  return new;
end;
$$;

create trigger bookings_flag_repeat
  after insert on bookings
  for each row execute function flag_repeat_client();

-- ─────────────────────────────────────────────
-- provider_transfers
-- ─────────────────────────────────────────────
create table provider_transfers (
  id             text primary key default gen_random_uuid()::text,
  "providerId"   text not null references tour_providers(id),
  "bankId"       text not null references banks(id),
  "transferDate" date not null,
  amount         numeric(12,2) not null,
  "referenceNo"  text,
  notes          text,
  "bookingIds"   text[] not null default '{}',
  "loggedBy"     uuid references auth.users(id),
  "createdAt"    timestamptz not null default now()
);

create index transfers_provider_idx on provider_transfers("providerId");

-- ─────────────────────────────────────────────
-- Row Level Security — all tables admin-only
-- ─────────────────────────────────────────────
alter table tour_providers      enable row level security;
alter table banks               enable row level security;
alter table tours               enable row level security;
alter table clients             enable row level security;
alter table pickup_locations    enable row level security;
alter table bookings            enable row level security;
alter table provider_transfers  enable row level security;

-- Policy: authenticated users (admin only via Supabase Auth) have full access
create policy "authenticated_full_access" on tour_providers
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on banks
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on tours
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on clients
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on pickup_locations
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on bookings
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on provider_transfers
  for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────
-- Seed: default pickup locations (Chiang Mai)
-- ─────────────────────────────────────────────
insert into pickup_locations (name, zone) values
  ('Nimman Area',           'West'),
  ('Old City',              'Center'),
  ('Night Bazaar',          'East'),
  ('Chang Klan Road',       'East'),
  ('Chiang Mai Gate',       'South'),
  ('Santitham Area',        'North'),
  ('Mae Rim',               'North'),
  ('Chiang Mai Airport',    'Airport'),
  ('Train Station',         'East'),
  ('Chiang Mai University', 'West');
