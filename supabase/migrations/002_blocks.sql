create table blocks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  position bigint not null,
  type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_blocks_document_position on blocks(document_id, position);

alter table blocks enable row level security;

create policy "Users can select blocks of own documents"
  on blocks for select
  using (
    exists (
      select 1 from documents
      where documents.id = blocks.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert blocks into own documents"
  on blocks for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = blocks.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can update blocks of own documents"
  on blocks for update
  using (
    exists (
      select 1 from documents
      where documents.id = blocks.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can delete blocks of own documents"
  on blocks for delete
  using (
    exists (
      select 1 from documents
      where documents.id = blocks.document_id
        and documents.user_id = auth.uid()
    )
  );

create trigger blocks_updated_at
  before update on blocks
  for each row execute function update_updated_at();
