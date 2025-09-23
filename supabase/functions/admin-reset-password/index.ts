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
    if (!user) throw new Error("Token inválido.");


    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'worship_director') {
      throw new Error("Permissão negada. Apenas Diretores de Louvor podem resetar senhas.");
    }


    const { userIdToReset, newPassword } = await req.json();
    if (!userIdToReset || !newPassword) {
      throw new Error("ID do usuário e nova senha são obrigatórios.");
    }
    if (newPassword.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }


    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );


    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      userIdToReset,
      { password: newPassword }
    );
    if (updateUserError) throw updateUserError;


    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', userIdToReset);
    if (profileError) throw profileError;

    return new Response(JSON.stringify({ message: "Senha do usuário redefinida com sucesso." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})