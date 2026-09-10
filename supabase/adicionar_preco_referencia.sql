-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Adiciona o preço de referência (opcional, preenchido pelo admin) mostrado riscado acima do
-- preço de venda no catálogo e no modal de detalhes, com a legenda "Você paga bem menos que o
-- preço oficial". É o preço oficial da própria plataforma (ex: valor cobrado direto no site da
-- Disney+), diferente de original_price/discount, que é o desconto da própria HRKeys.
-- Null = a seção não aparece (nunca inventamos um valor).

alter table products add column if not exists preco_referencia numeric;
comment on column products.preco_referencia is 'Preço oficial de referência da plataforma (opcional), mostrado riscado acima do preço de venda pra reforçar o desconto. Null = não mostra.';
