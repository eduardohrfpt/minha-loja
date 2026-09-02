-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Tabela de apoio para a tela "Pedidos" do painel de admin. É separada de "orders"
-- (que só registra pedidos já entregues) porque aqui também precisamos enxergar
-- tentativas pendentes e pagamentos que falharam, para dar suporte a clientes.
--
-- Os dados de cliente/produto/valor ficam duplicados aqui de propósito (em vez de só
-- referenciar orders/products/auth.users) pra essa tela poder ser lida direto pelo
-- navegador do admin, sem precisar de uma function de servidor só pra juntar as tabelas.

create table if not exists historico_pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  correlacao text not null unique,
  user_email text not null,
  product_name text not null,
  valor numeric(10,2) not null,
  gateway text not null,
  payment_id text,
  status text not null default 'pendente', -- 'pendente' | 'aprovado' | 'falhou'
  codigo text
);

alter table historico_pedidos enable row level security;

-- Só admins enxergam -- essa tabela guarda e-mail de cliente.
create policy "Admins veem o historico de pedidos" on historico_pedidos
  for select using (exists (select 1 from admins where user_id = auth.uid()));

-- Sem policy de insert/update/delete para authenticated/anon: só as Vercel Functions
-- (usando a service role key, que ignora RLS) escrevem aqui.
