-- Component state for persistent MDX widgets
create table component_states (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  component_key text not null,
  component_type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (note_id, component_key)
);

create index component_states_note_key_idx on component_states (note_id, component_key);

create trigger component_states_updated_at
  before update on component_states
  for each row
  execute function update_updated_at_column();

-- Row Level Security (access via note ownership)
alter table component_states enable row level security;

create policy "Users can view own component states"
  on component_states for select
  using (
    exists (
      select 1 from notes
      where notes.id = component_states.note_id
        and notes.user_id = auth.uid()
    )
  );

create policy "Users can insert own component states"
  on component_states for insert
  with check (
    exists (
      select 1 from notes
      where notes.id = component_states.note_id
        and notes.user_id = auth.uid()
    )
  );

create policy "Users can update own component states"
  on component_states for update
  using (
    exists (
      select 1 from notes
      where notes.id = component_states.note_id
        and notes.user_id = auth.uid()
    )
  );

create policy "Users can delete own component states"
  on component_states for delete
  using (
    exists (
      select 1 from notes
      where notes.id = component_states.note_id
        and notes.user_id = auth.uid()
    )
  );
