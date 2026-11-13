#!/usr/bin/env node
/**
 * Exporta todas as músicas cadastradas (tabela public.songs) para um arquivo JSON.
 *
 * Como usar:
 *   1. Garanta que o .env da raiz tenha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 *      (os mesmos usados pelo app).
 *   2. Rode um dos modos abaixo:
 *
 *   a) Login com seu usuário do app (recomendado, não precisa de chave secreta):
 *        node scripts/export-songs.mjs --email seu@email.com --password 'suaSenha'
 *
 *   b) Com a service_role key (lê sem passar pela RLS):
 *        SUPABASE_SERVICE_ROLE_KEY='...' node scripts/export-songs.mjs
 *
 * Saída: songs-dump-<timestamp>.json na raiz do projeto (ou --out <arquivo>).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Lê um .env simples (KEY=VALUE) sem dependências externas. */
function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Parser mínimo de argumentos: --chave valor / --flag */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const fileEnv = loadEnvFile(resolve(ROOT, ".env"));
const env = { ...fileEnv, ...process.env };

const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("✗ VITE_SUPABASE_URL não encontrada (.env ou variável de ambiente).");
  process.exit(1);
}

const email = args.email || env.SUPABASE_EMAIL;
const password = args.password || env.SUPABASE_PASSWORD;
const useServiceKey = Boolean(SERVICE_KEY) && !email;

if (!useServiceKey && !ANON_KEY) {
  console.error("✗ VITE_SUPABASE_ANON_KEY não encontrada (.env ou variável de ambiente).");
  process.exit(1);
}
if (!useServiceKey && !(email && password)) {
  console.error(
    "✗ Informe --email e --password (usuário do app), ou defina SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  A tabela songs tem RLS exigindo usuário autenticado; a chave anon sozinha não lê os dados."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, useServiceKey ? SERVICE_KEY : ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (useServiceKey) {
  console.log("→ Autenticando com service_role key.");
} else {
  console.log(`→ Autenticando como ${email}...`);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`✗ Falha no login: ${error.message}`);
    process.exit(1);
  }
  console.log("✓ Login OK.");
}

// Busca paginada: o Supabase limita o retorno por requisição (1000 por padrão).
const PAGE_SIZE = 1000;
const songs = [];
for (let from = 0; ; from += PAGE_SIZE) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("title", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error(`✗ Erro ao consultar songs: ${error.message}`);
    process.exit(1);
  }
  songs.push(...data);
  process.stdout.write(`\r→ ${songs.length} música(s) carregada(s)...`);
  if (data.length < PAGE_SIZE) break;
}
process.stdout.write("\n");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outPath = resolve(ROOT, args.out || `songs-dump-${stamp}.json`);

const dump = {
  exported_at: new Date().toISOString(),
  source: SUPABASE_URL,
  table: "public.songs",
  total: songs.length,
  songs,
};

writeFileSync(outPath, JSON.stringify(dump, null, 2), "utf8");

const byStatus = songs.reduce((acc, s) => {
  const k = s.status ?? "null";
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

console.log(`✓ ${songs.length} música(s) exportada(s) para ${outPath}`);
console.log(`  Por status: ${JSON.stringify(byStatus)}`);
