
-- Adiciona a coluna 'positions' à tabela de perfis, se ela não existir.
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS "positions" text[];

-- Adiciona a coluna 'themes' à tabela de músicas, se ela não existir.
ALTER TABLE "public"."songs"
ADD COLUMN IF NOT EXISTS "themes" text[];

-- Torna as colunas 'version' e 'link' obrigatórias na tabela de músicas.
-- ATENÇÃO: Estes dois últimos comandos falharão se você tiver músicas em PRODUÇÃO
-- com valores nulos (vazios) nestas colunas.
-- Se for o caso, preencha-os primeiro no painel do Supabase antes de prosseguir.
ALTER TABLE "public"."songs"
ALTER COLUMN "version" SET NOT NULL;

ALTER TABLE "public"."songs"
ALTER COLUMN "link" SET NOT NULL;