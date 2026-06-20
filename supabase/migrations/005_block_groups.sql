create table block_groups (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  name text not null default 'Untitled Group',
  position bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_block_groups_document_position on block_groups(document_id, position);

alter table blocks add column group_id uuid references block_groups(id) on delete set null;

create index idx_blocks_document_group on blocks(document_id, group_id);

alter table block_groups enable row level security;

create policy "Users can select block groups of own documents"
  on block_groups for select
  using (
    exists (
      select 1 from documents
      where documents.id = block_groups.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert block groups into own documents"
  on block_groups for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = block_groups.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can update block groups of own documents"
  on block_groups for update
  using (
    exists (
      select 1 from documents
      where documents.id = block_groups.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can delete block groups of own documents"
  on block_groups for delete
  using (
    exists (
      select 1 from documents
      where documents.id = block_groups.document_id
        and documents.user_id = auth.uid()
    )
  );

create trigger block_groups_updated_at
  before update on block_groups
  for each row execute function update_updated_at();
