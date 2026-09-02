-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Passo a passo customizado (por produto) exibido na tela de "Pagamento aprovado",
-- separado do "passos_ativacao" (que aparece antes da compra, na ficha do produto).

alter table products add column if not exists guia_uso_codigo text[] not null default '{}';
