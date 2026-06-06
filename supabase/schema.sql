-- MyKitchenUpgrade Quote Portal — Supabase Schema
-- Run in SQL Editor at supabase.com/dashboard/project/sdsekudmtxhvfkerghyh

-- QUOTES PORTAL (contractor-created quotes)
create table if not exists quotes_portal (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  quote_number   text unique not null,
  quote_date     text not null,
  client_name    text not null,
  client_address text,
  client_city    text,
  client_email   text,
  project_address text,
  project_city   text,
  line_items     jsonb not null default '[]',
  subtotal       numeric not null default 0,
  hst            numeric not null default 0,
  total          numeric not null default 0,
  commission_10  numeric,
  commission_12  numeric,
  status         text default 'unpaid',   -- unpaid | paid | deleted
  notes          text,
  paid_at        timestamptz
);

create index if not exists quotes_portal_status_idx on quotes_portal (status);
create index if not exists quotes_portal_created_at_idx on quotes_portal (created_at desc);

alter table quotes_portal enable row level security;
create policy "authenticated users can read quotes" on quotes_portal for select using (auth.role() = 'authenticated');
create policy "authenticated users can insert quotes" on quotes_portal for insert with check (auth.role() = 'authenticated');
create policy "authenticated users can update quotes" on quotes_portal for update using (auth.role() = 'authenticated');
create policy "service role full access to quotes" on quotes_portal for all using (true) with check (true);

-- Public read for client view links
create policy "public can read individual quotes by id" on quotes_portal
  for select using (true);

-- USERS (portal accounts)
create table if not exists users (
  id    uuid references auth.users primary key,
  email text,
  name  text,
  role  text default 'contractor'   -- contractor | admin
);

alter table users enable row level security;
create policy "users can read own profile" on users for select using (auth.uid() = id);
create policy "service role full access to users" on users for all using (true) with check (true);
