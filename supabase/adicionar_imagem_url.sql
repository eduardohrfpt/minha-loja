-- Rode no SQL Editor do Supabase (Painel do projeto > SQL Editor > New query)
-- Permite usar uma imagem real (URL hospedada externamente) no lugar do emoji/ícone
-- genérico por produto. Quando vazio, o produto continua usando o emoji de "image".

alter table products add column if not exists image_url text;
