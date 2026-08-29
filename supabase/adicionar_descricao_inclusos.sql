-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Adiciona as colunas de descricao completa e "o que esta incluso" na tabela products ja existente.

alter table products add column if not exists description text;
alter table products add column if not exists features text[] not null default '{}';
