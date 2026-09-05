-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Adiciona o campo de instrucoes de ativacao (passo a passo, escrito pelo admin) exibido
-- na secao "Como ativar" do modal de Detalhes do produto.

alter table products add column if not exists instrucoes_ativacao text;
