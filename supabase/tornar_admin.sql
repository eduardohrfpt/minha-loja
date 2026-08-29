-- Rode DEPOIS de criar sua conta pelo site (botao "Criar conta").
-- Troque o e-mail abaixo pelo e-mail que voce usou no cadastro.

insert into admins (user_id)
select id from auth.users where email = 'SEU_EMAIL_AQUI';
