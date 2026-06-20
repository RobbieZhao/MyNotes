alter table datasets
  add column if not exists config jsonb not null default '{}';
