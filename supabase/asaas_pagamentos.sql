-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Substitui a integração de pagamento (antes Stripe) por Asaas (Pix, cartão e boleto).
-- Seguro rodar mesmo que supabase/stripe_pagamentos.sql já tenha sido executado antes.

-- Remove a coluna de idempotência do Stripe (se existir) e adiciona a do Asaas.
alter table orders drop column if exists stripe_session_id;
alter table orders add column if not exists asaas_payment_id text unique;

-- Versão de resgatar_codigo() para ser chamada SOMENTE pelo webhook do Asaas (service_role),
-- depois que o pagamento já foi confirmado. Recebe o user_id explicitamente porque a chamada
-- vem do servidor, sem uma sessão de usuário logado (sem auth.uid()).
--
-- IMPORTANTE: esta função nunca deve ser liberada para "authenticated"/"anon" -- como ela aceita
-- um p_user_id arbitrário, qualquer usuário logado poderia usá-la para roubar códigos de outros
-- produtos sem pagar. Só o service_role (usado pelas Vercel Functions) pode executá-la.
create or replace function resgatar_codigo_servidor(
  p_product_id uuid,
  p_user_id uuid,
  p_payment_id text
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
  -- Idempotência: se esse pagamento do Asaas já foi processado (reenvio de webhook),
  -- devolve o mesmo código em vez de tentar entregar um novo.
  select o.id, c.codigo into v_order_id, v_codigo
  from orders o
  join codigos_produto c on c.order_id = o.id
  where o.asaas_payment_id = p_payment_id;

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

  insert into orders (user_id, product_id, status, asaas_payment_id)
  values (p_user_id, p_product_id, 'concluido', p_payment_id)
  returning id into v_order_id;

  update codigos_produto
  set usado = true, order_id = v_order_id
  where id = v_codigo_id;

  return query select v_codigo, v_order_id;
end;
$$;

-- Por padrão o Postgres libera EXECUTE para PUBLIC em toda função nova: revogamos antes de
-- conceder só para service_role.
revoke all on function resgatar_codigo_servidor(uuid, uuid, text) from public;
grant execute on function resgatar_codigo_servidor(uuid, uuid, text) to service_role;
