-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Adiciona Mercado Pago (Checkout Pro) como um segundo gateway, ao lado do Asaas.
-- Generaliza a coluna de idempotência de "asaas_payment_id" pra "payment_id" (gateway-agnostica),
-- já que agora dois gateways diferentes podem chamar a mesma resgatar_codigo_servidor().
-- Seguro rodar independente do estado atual do banco (com ou sem asaas_pagamentos.sql aplicado).

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'asaas_payment_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'payment_id'
  ) then
    alter table orders rename column asaas_payment_id to payment_id;
  end if;
end $$;

alter table orders add column if not exists payment_id text unique;
alter table orders add column if not exists payment_gateway text;

-- Mesma lógica de sempre (idempotente via payment_id, "for update skip locked" pra concorrência),
-- só passa a registrar também qual gateway processou o pagamento. p_gateway tem default null
-- pra não quebrar quem já chama a função com só 3 argumentos.
--
-- IMPORTANTE: nunca liberar para "authenticated"/"anon" -- como ela aceita um p_user_id
-- arbitrário, qualquer usuário logado poderia usá-la pra roubar códigos sem pagar.
create or replace function resgatar_codigo_servidor(
  p_product_id uuid,
  p_user_id uuid,
  p_payment_id text,
  p_gateway text default null
)
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
  select o.id, c.codigo into v_order_id, v_codigo
  from orders o
  join codigos_produto c on c.order_id = o.id
  where o.payment_id = p_payment_id;

  if v_order_id is not null then
    return query select v_codigo, v_order_id;
    return;
  end if;

  select id, codigos_produto.codigo into v_codigo_id, v_codigo
  from codigos_produto
  where product_id = p_product_id and usado = false
  order by created_at
  limit 1
  for update skip locked;

  if v_codigo_id is null then
    raise exception 'Nenhum codigo disponivel para este produto';
  end if;

  insert into orders (user_id, product_id, status, payment_id, payment_gateway)
  values (p_user_id, p_product_id, 'concluido', p_payment_id, p_gateway)
  returning id into v_order_id;

  update codigos_produto
  set usado = true, order_id = v_order_id
  where id = v_codigo_id;

  return query select v_codigo, v_order_id;
end;
$$;

revoke all on function resgatar_codigo_servidor(uuid, uuid, text, text) from public;
grant execute on function resgatar_codigo_servidor(uuid, uuid, text, text) to service_role;
