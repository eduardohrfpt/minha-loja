-- Rode este script inteiro no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- Tabela de produtos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  badges text[] not null default '{}',
  image text,
  available boolean not null default true,
  delivery_type text not null default 'imediata',
  duration text,
  original_price numeric(10,2) not null,
  price numeric(10,2) not null,
  discount numeric(5,2) not null default 0,
  description text,
  features text[] not null default '{}',
  tagline text,
  beneficios text[] not null default '{}',
  estoque integer,
  passos_ativacao text[] not null default '{}',
  aviso_prazo text,
  resumo_final text,
  created_at timestamptz not null default now()
);

-- Tabela de administradores: define quem pode gerenciar o catálogo
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Tabela de pedidos
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

-- Ativa Row Level Security (obrigatório para proteger os dados)
alter table products enable row level security;
alter table admins enable row level security;
alter table orders enable row level security;

-- Produtos: qualquer pessoa pode ver o catálogo
create policy "Produtos sao publicos" on products
  for select using (true);

-- Produtos: só quem estiver na tabela admins pode criar/editar/remover
create policy "Admins podem inserir produtos" on products
  for insert with check (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins podem editar produtos" on products
  for update using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins podem remover produtos" on products
  for delete using (exists (select 1 from admins where user_id = auth.uid()));

-- Admins: cada usuário só pode checar se ele mesmo é admin
create policy "Usuario ve sua propria entrada de admin" on admins
  for select using (auth.uid() = user_id);

-- Pedidos: cada usuário só vê e cria os próprios pedidos
create policy "Usuario ve seus pedidos" on orders
  for select using (auth.uid() = user_id);

create policy "Usuario cria seus pedidos" on orders
  for insert with check (auth.uid() = user_id);

-- Tabela de codigos de ativacao (o estoque real de cada produto)
create table if not exists codigos_produto (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  codigo text not null,
  usado boolean not null default false,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table codigos_produto enable row level security;

create policy "Admins veem os codigos" on codigos_produto
  for select using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins inserem codigos" on codigos_produto
  for insert with check (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins atualizam codigos" on codigos_produto
  for update using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins removem codigos" on codigos_produto
  for delete using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Usuario ve o codigo do proprio pedido" on codigos_produto
  for select using (
    exists (select 1 from orders where orders.id = codigos_produto.order_id and orders.user_id = auth.uid())
  );

-- View publica so com a CONTAGEM de codigos disponiveis (nunca expoe os codigos em si)
create or replace view estoque_disponivel as
select product_id, count(*) as disponivel
from codigos_produto
where usado = false
group by product_id;

grant select on estoque_disponivel to anon, authenticated;

-- Funcao que entrega o proximo codigo disponivel de forma atomica e segura
create or replace function resgatar_codigo(p_product_id uuid)
returns table (codigo text, order_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo_id uuid;
  v_codigo text;
  v_order_id uuid;
begin
  select id, codigos_produto.codigo into v_codigo_id, v_codigo
  from codigos_produto
  where product_id = p_product_id and usado = false
  order by created_at
  limit 1
  for update skip locked;

  if v_codigo_id is null then
    raise exception 'Nenhum codigo disponivel para este produto';
  end if;

  insert into orders (user_id, product_id, status)
  values (auth.uid(), p_product_id, 'concluido')
  returning id into v_order_id;

  update codigos_produto
  set usado = true, order_id = v_order_id
  where id = v_codigo_id;

  return query select v_codigo, v_order_id;
end;
$$;

grant execute on function resgatar_codigo(uuid) to authenticated;

-- Produtos de exemplo (apague estas linhas se não quiser o catalogo inicial)
insert into products (name, brand, badges, image, available, delivery_type, duration, original_price, price, discount) values
  ('ChatGPT Plus', 'OpenAI', '{"Mais vendido"}', '🤖', true, 'imediata', '1 mês', 97.90, 88.11, 10),
  ('Notion Plus', 'Notion', '{}', '📝', true, 'imediata', '1 mês', 40.00, 40.00, 0),
  ('Spotify Premium', 'Spotify', '{"Oferta"}', '🎵', true, 'imediata', '1 mês', 21.90, 18.62, 15),
  ('Netflix Padrão', 'Netflix', '{}', '🎬', true, 'imediata', '1 mês', 44.90, 44.90, 0),
  ('Canva Pro', 'Canva', '{"Novo"}', '🎨', true, 'imediata', '1 mês', 34.90, 27.92, 20),
  ('Disney+', 'Disney', '{}', '🏰', false, 'imediata', '1 mês', 33.90, 33.90, 0);
