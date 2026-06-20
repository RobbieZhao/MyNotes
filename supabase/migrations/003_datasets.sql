create table datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table datasets enable row level security;

create policy "Users can select own datasets"
  on datasets for select
  using (auth.uid() = user_id);

create policy "Users can insert own datasets"
  on datasets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own datasets"
  on datasets for update
  using (auth.uid() = user_id);

create policy "Users can delete own datasets"
  on datasets for delete
  using (auth.uid() = user_id);

create trigger datasets_updated_at
  before update on datasets
  for each row execute function update_updated_at();
