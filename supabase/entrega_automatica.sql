-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Cria o estoque de codigos unicos e a entrega automatica.

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

-- Só admins podem ver/gerenciar o estoque de codigos diretamente
create policy "Admins veem os codigos" on codigos_produto
  for select using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins inserem codigos" on codigos_produto
  for insert with check (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins atualizam codigos" on codigos_produto
  for update using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Admins removem codigos" on codigos_produto
  for delete using (exists (select 1 from admins where user_id = auth.uid()));

-- Um cliente comum só pode ver o codigo do PROPRIO pedido (nunca os disponiveis de outros)
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

-- Funcao que entrega o proximo codigo disponivel de forma atomica e segura.
-- "for update skip locked" impede que duas compras simultaneas peguem o mesmo codigo.
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
