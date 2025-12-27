-- Create restaurants table
create table if not exists restaurants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  description text,
  location_type text, -- indoor, near, walk, taxi
  category text, -- korean, japanese, chinese, western, etc
  tags text[],
  waiting_info text,
  status text default 'pending', -- approved, pending, rejected
  raw_input text
);

-- Enable RLS
alter table restaurants enable row level security;

-- Policies
create policy "Enable read access for approved restaurants"
on restaurants for select
using (status = 'approved');

create policy "Enable insert for everyone"
on restaurants for insert
with check (true);

-- Allow authenticated users (admin) to update/delete
-- Note: In a real app, strict admin check is needed.
-- For now, we assume authenticated users are admins or we can add specific role checks later.
create policy "Enable all access for authenticated users"
on restaurants for all
using (auth.role() = 'authenticated');
