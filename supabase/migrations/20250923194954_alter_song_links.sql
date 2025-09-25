alter table "public"."songs" drop column "link";

alter table "public"."songs" add column "chart_link" text not null;

alter table "public"."songs" add column "song_link" text;


