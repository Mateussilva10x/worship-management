-- supabase/seed.sql
-- Este script irá popular seu banco de dados local com dados de exemplo.

-- Insere usuários de exemplo na tabela de autenticação do Supabase
-- A senha para todos é 'password123'
INSERT INTO
  auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_token,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    email_change_confirm_status
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '8607b344-9372-4d70-a1e6-99a380922850', -- UUID do Diretor de Louvor
    'authenticated',
    'authenticated',
    'diretor@email.com',
    '$2a$10$w4.g..k9Y2w.A4aRFl2a.O4kM2sVd12d2AoyJz0F8b9x3Mtk.8Kgy', -- Senha: password123
    '2024-01-01 00:00:00.000000+00',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Diretor de Louvor"}',
    '2024-01-01 00:00:00.000000+00',
    '2024-01-01 00:00:00.000000+00',
    '',
    '',
    '',
    '',
    0
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00a72098-842b-426b-8a88-e212450b4625', -- UUID do Líder
    'authenticated',
    'authenticated',
    'lider@email.com',
    '$2a$10$w4.g..k9Y2w.A4aRFl2a.O4kM2sVd12d2AoyJz0F8b9x3Mtk.8Kgy', -- Senha: password123
    '2024-01-01 00:00:00.000000+00',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Líder de Grupo"}',
    '2024-01-01 00:00:00.000000+00',
    '2024-01-01 00:00:00.000000+00',
    '',
    '',
    '',
    '',
    0
  ),
    (
    '00000000-0000-0000-0000-000000000000',
    '152d1265-2ac0-4f51-8b3a-a5c2dec119c8', -- UUID do Membro 1
    'authenticated',
    'authenticated',
    'membro1@email.com',
    '$2a$10$w4.g..k9Y2w.A4aRFl2a.O4kM2sVd12d2AoyJz0F8b9x3Mtk.8Kgy', -- Senha: password123
    '2024-01-01 00:00:00.000000+00',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Membro Um"}',
    '2024-01-01 00:00:00.000000+00',
    '2024-01-01 00:00:00.000000+00',
    '',
    '',
    '',
    '',
    0
  ),
    (
    '00000000-0000-0000-0000-000000000000',
    'a53a05a3-7313-4b6c-843c-a99f1b312674', -- UUID do Membro 2
    'authenticated',
    'authenticated',
    'membro2@email.com',
    '$2a$10$w4.g..k9Y2w.A4aRFl2a.O4kM2sVd12d2AoyJz0F8b9x3Mtk.8Kgy', -- Senha: password123
    '2024-01-01 00:00:00.000000+00',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Membro Dois"}',
    '2024-01-01 00:00:00.000000+00',
    '2024-01-01 00:00:00.000000+00',
    '',
    '',
    '',
    '',
    0
  );

-- Insere os perfis correspondentes na tabela `public.profiles`
INSERT INTO
  public.profiles (id, name, email, role, positions)
VALUES
  ('8607b344-9372-4d70-a1e6-99a380922850', 'Diretor de Louvor', 'diretor@email.com', 'worship_director', ARRAY['main_vocal', 'acoustic_guitar']),
  ('00a72098-842b-426b-8a88-e212450b4625', 'Líder de Grupo', 'lider@email.com', 'leader', ARRAY['bass', 'background_vocal']),
  ('152d1265-2ac0-4f51-8b3a-a5c2dec119c8', 'Membro Um', 'membro1@email.com', 'member', ARRAY['drum']),
  ('a53a05a3-7313-4b6c-843c-a99f1b312674', 'Membro Dois', 'membro2@email.com', 'member', ARRAY['keyboard', 'piano']);

-- Insere grupos de exemplo
INSERT INTO
  public.groups (id, name, leader_id)
VALUES
  ('e0da3a2a-4380-4475-a82f-2d6a45749f7b', 'Equipe Ágape', '00a72098-842b-426b-8a88-e212450b4625'),
  ('6b17316a-7888-4903-a267-33c066914560', 'Equipe Koinonia', null);

-- Associa membros aos grupos
INSERT INTO
  public.group_members (group_id, user_id)
VALUES
  ('e0da3a2a-4380-4475-a82f-2d6a45749f7b', '00a72098-842b-426b-8a88-e212450b4625'), -- Líder também é membro
  ('e0da3a2a-4380-4475-a82f-2d6a45749f7b', '152d1265-2ac0-4f51-8b3a-a5c2dec119c8'),
  ('6b17316a-7888-4903-a267-33c066914560', 'a53a05a3-7313-4b6c-843c-a99f1b312674');
  
-- Insere músicas de exemplo
INSERT INTO
  public.songs (title, artist, version, key, link, status, themes)
VALUES
  ('Grande é o Senhor', 'Adhemar de Campos', 'Acústico', 'G', 'https://www.cifraclub.com.br/adhemar-de-campos/grande-e-o-senhor/', 'approved', ARRAY['Adoração', 'Clamor']),
  ('Ousado Amor', 'Isaías Saad', 'Bethel Music', 'A', 'https://www.cifraclub.com.br/isaias-saad/ousado-amor/', 'approved', ARRAY['Adoração', 'Graça']),
  ('Nova Música Pendente', 'Artista Novo', 'Demo', 'C', 'http://example.com', 'pending', ARRAY['Louvor']);