/// <reference types="https://esm.sh/@supabase/functions-js@2" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    
    
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Token de acesso inválido.");

    
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      throw new Error("Permissão negada: esta ação requer privilégios de administrador.");
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { name, email, whatsapp } = await req.json();

    
    const { data: newUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'senha123',
      email_confirm: true,
      user_metadata: { name, whatsapp },
    });

    if (createUserError) throw createUserError;

    return new Response(JSON.stringify({ user: newUserData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401, 
    });
  }
})