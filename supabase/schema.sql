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

-- Produtos de exemplo (apague estas linhas se não quiser o catalogo inicial)
insert into products (name, brand, badges, image, available, delivery_type, duration, original_price, price, discount) values
  ('ChatGPT Plus', 'OpenAI', '{"Mais vendido"}', '🤖', true, 'imediata', '1 mês', 97.90, 88.11, 10),
  ('Notion Plus', 'Notion', '{}', '📝', true, 'imediata', '1 mês', 40.00, 40.00, 0),
  ('Spotify Premium', 'Spotify', '{"Oferta"}', '🎵', true, 'imediata', '1 mês', 21.90, 18.62, 15),
  ('Netflix Padrão', 'Netflix', '{}', '🎬', true, 'imediata', '1 mês', 44.90, 44.90, 0),
  ('Canva Pro', 'Canva', '{"Novo"}', '🎨', true, 'imediata', '1 mês', 34.90, 27.92, 20),
  ('Disney+', 'Disney', '{}', '🏰', false, 'imediata', '1 mês', 33.90, 33.90, 0);
