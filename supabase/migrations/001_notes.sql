-- Notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  slug text not null default 'untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index notes_user_slug_idx on notes (user_id, slug);

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row
  execute function update_updated_at_column();

-- Row Level Security
alter table notes enable row level security;

create policy "Users can view own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on notes for delete
  using (auth.uid() = user_id);
