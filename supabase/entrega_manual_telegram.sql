-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Suporte a entrega manual via Telegram (produtos com delivery_type = 'manual') e ao toggle
-- de horário de funcionamento da loja.

-- Guarda o id da mensagem do Telegram que avisou sobre o pedido, pra quando o admin responder
-- (reply) a gente saber a qual pedido aquela resposta se refere.
alter table orders add column if not exists telegram_message_id bigint;

-- Configuração global da loja (linha única, id sempre 1).
create table if not exists configuracoes_loja (
  id int primary key default 1,
  aberta boolean not null default true,
  mensagem_fechado text not null default 'Fora do horário de atendimento. Voltamos às 8h.',
  updated_at timestamptz not null default now()
);

insert into configuracoes_loja (id, aberta) values (1, true)
  on conflict (id) do nothing;

alter table configuracoes_loja enable row level security;

-- Todo mundo precisa ler (pra saber se pode comprar), só admin pode alterar.
create policy "Configuracao da loja e publica para leitura" on configuracoes_loja
  for select using (true);

create policy "Admins atualizam a configuracao da loja" on configuracoes_loja
  for update using (exists (select 1 from admins where user_id = auth.uid()));

grant select on configuracoes_loja to anon, authenticated;
grant update (aberta, mensagem_fechado, updated_at) on configuracoes_loja to authenticated;
