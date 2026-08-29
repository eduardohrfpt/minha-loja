-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Adiciona os novos campos editaveis usados no modal de Detalhes do produto.

alter table products add column if not exists tagline text;
alter table products add column if not exists beneficios text[] not null default '{}';
alter table products add column if not exists estoque integer;
alter table products add column if not exists passos_ativacao text[] not null default '{}';
alter table products add column if not exists aviso_prazo text;
alter table products add column if not exists resumo_final text;
