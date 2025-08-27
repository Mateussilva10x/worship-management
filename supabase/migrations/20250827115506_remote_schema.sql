

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."participation_status" AS ENUM (
    'pending',
    'confirmed',
    'declined'
);


ALTER TYPE "public"."participation_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'worship_director',
    'leader',
    'member',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, whatsapp, role, must_change_password)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    new.raw_user_meta_data->>'whatsapp',
    'member',
    TRUE -- Garante que novos usuários precisem trocar a senha
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."group_members" IS 'Join table for the many-to-many relationship between groups and users (members).';



CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "leader_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."groups" IS 'Stores worship groups or teams.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "whatsapp" "text",
    "must_change_password" boolean DEFAULT true,
    "role" "public"."user_role"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Stores public profile information for each user.';



CREATE TABLE IF NOT EXISTS "public"."schedule_participants" (
    "schedule_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."participation_status" DEFAULT 'pending'::"public"."participation_status" NOT NULL
);


ALTER TABLE "public"."schedule_participants" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_participants" IS 'Stores the participation status (RSVP) of each member for a specific schedule.';



CREATE TABLE IF NOT EXISTS "public"."schedule_songs" (
    "schedule_id" "uuid" NOT NULL,
    "song_id" "uuid" NOT NULL
);


ALTER TABLE "public"."schedule_songs" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_songs" IS 'Join table for the setlist of each schedule.';



CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedules" IS 'Stores the main event schedules.';



CREATE TABLE IF NOT EXISTS "public"."songs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "key" "text",
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "artist" "text",
    "version" "text"
);


ALTER TABLE "public"."songs" OWNER TO "postgres";


COMMENT ON TABLE "public"."songs" IS 'The song library for the application.';



COMMENT ON COLUMN "public"."songs"."status" IS 'text';



COMMENT ON COLUMN "public"."songs"."artist" IS 'name the original artist of the song';



COMMENT ON COLUMN "public"."songs"."version" IS 'name of the artist or band the make the version that will gona be played';



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "user_id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_participants"
    ADD CONSTRAINT "schedule_participants_pkey" PRIMARY KEY ("schedule_id", "user_id");



ALTER TABLE ONLY "public"."schedule_songs"
    ADD CONSTRAINT "schedule_songs_pkey" PRIMARY KEY ("schedule_id", "song_id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_participants"
    ADD CONSTRAINT "schedule_participants_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_participants"
    ADD CONSTRAINT "schedule_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_songs"
    ADD CONSTRAINT "schedule_songs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_songs"
    ADD CONSTRAINT "schedule_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and Directors can view all profiles" ON "public"."profiles" FOR SELECT USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'worship_director'::"text"])));



CREATE POLICY "Admins e líderes podem adicionar músicas a uma escala." ON "public"."schedule_songs" FOR INSERT WITH CHECK ((("public"."get_my_role"() = 'admin'::"text") OR ("auth"."uid"() = ( SELECT "g"."leader_id"
   FROM ("public"."schedules" "s"
     JOIN "public"."groups" "g" ON (("s"."group_id" = "g"."id")))
  WHERE ("s"."id" = "schedule_songs"."schedule_id")))));



CREATE POLICY "Admins e líderes podem remover músicas de uma escala." ON "public"."schedule_songs" FOR DELETE USING ((("public"."get_my_role"() = 'admin'::"text") OR ("auth"."uid"() = ( SELECT "g"."leader_id"
   FROM ("public"."schedules" "s"
     JOIN "public"."groups" "g" ON (("s"."group_id" = "g"."id")))
  WHERE ("s"."id" = "schedule_songs"."schedule_id")))));



CREATE POLICY "Admins podem inserir participantes em uma escala." ON "public"."schedule_participants" FOR INSERT WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins podem ver todos os perfis." ON "public"."profiles" FOR SELECT USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem adicionar membros a grupos." ON "public"."group_members" FOR INSERT WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem apagar escalas." ON "public"."schedules" FOR DELETE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem apagar grupos." ON "public"."groups" FOR DELETE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem criar escalas." ON "public"."schedules" FOR INSERT WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem criar grupos." ON "public"."groups" FOR INSERT WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem editar escalas." ON "public"."schedules" FOR UPDATE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem editar grupos." ON "public"."groups" FOR UPDATE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Apenas admins podem remover membros de grupos." ON "public"."group_members" FOR DELETE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Authenticated users can view all groups" ON "public"."groups" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Leaders can insert and delete members in their own group" ON "public"."group_members" USING ((( SELECT "groups"."leader_id"
   FROM "public"."groups"
  WHERE ("groups"."id" = "group_members"."group_id")) = "auth"."uid"()));



CREATE POLICY "Leaders can view members of their own group" ON "public"."group_members" FOR SELECT USING ((( SELECT "groups"."leader_id"
   FROM "public"."groups"
  WHERE ("groups"."id" = "group_members"."group_id")) = "auth"."uid"()));



CREATE POLICY "Membros podem atualizar seu próprio status de participação." ON "public"."schedule_participants" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Qualquer usuário logado pode gerenciar as músicas." ON "public"."songs" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Qualquer usuário logado pode ver os grupos." ON "public"."groups" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Qualquer usuário logado pode ver quem pertence aos grupos." ON "public"."group_members" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Todos usuários autenticados podem ver escalas" ON "public"."schedules" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários podem atualizar seu próprio perfil." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Usuários podem ver as escalas de seus grupos (e admins veem tu" ON "public"."schedules" FOR SELECT USING ((("public"."get_my_role"() = 'admin'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "schedules"."group_id") AND ("group_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Usuários podem ver as músicas das escalas que eles têm acess" ON "public"."schedule_songs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE ("schedules"."id" = "schedule_songs"."schedule_id"))));



CREATE POLICY "Usuários podem ver os participantes das escalas que eles têm " ON "public"."schedule_participants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE ("schedules"."id" = "schedule_participants"."schedule_id"))));



CREATE POLICY "Usuários podem ver seu próprio perfil." ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Worship Directors can manage all group members" ON "public"."group_members" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role"));



CREATE POLICY "Worship Directors can manage all groups" ON "public"."groups" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role"));



CREATE POLICY "Worship Directors can update profiles" ON "public"."profiles" FOR UPDATE USING ((( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role")) WITH CHECK ((( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role"));



CREATE POLICY "Worship Directors can view all group members" ON "public"."group_members" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'worship_director'::"public"."user_role"));



ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_songs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."songs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































REVOKE ALL ON FUNCTION "public"."get_my_role"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
























GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_participants" TO "anon";
GRANT ALL ON TABLE "public"."schedule_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_participants" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_songs" TO "anon";
GRANT ALL ON TABLE "public"."schedule_songs" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_songs" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."songs" TO "anon";
GRANT ALL ON TABLE "public"."songs" TO "authenticated";
GRANT ALL ON TABLE "public"."songs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
