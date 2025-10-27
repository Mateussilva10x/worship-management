/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

interface RequestPayload {
  initiating_schedule_id: string;
  target_schedule_id: string;
}


const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { initiating_schedule_id, target_schedule_id }: RequestPayload = await req.json();
    if (!initiating_schedule_id || !target_schedule_id) throw new Error("IDs das escalas são obrigatórios.");

    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Utilizador não autenticado.");
    const initiating_leader_id = user.id;

    
    const { data: initiatingScheduleData, error: err1 } = await supabaseAdmin
      .from('schedules')
      .select('date, group:groups!inner(leader_id, name)')
      .eq('id', initiating_schedule_id)
      .single();
    if (err1 || !initiatingScheduleData || initiatingScheduleData.group?.leader_id !== initiating_leader_id) {
      throw new Error("Permissão negada: Você não é o líder da escala de origem ou a escala não existe.");
    }

    
    const { data: targetScheduleData, error: err2 } = await supabaseAdmin
      .from('schedules')
      .select('date, group:groups!inner(leader_id, name)')
      .eq('id', target_schedule_id)
      .single();
    if (err2 || !targetScheduleData || !targetScheduleData.group?.leader_id) {
      throw new Error("Não foi possível encontrar o líder ou detalhes da escala de destino.");
    }
    const target_leader_id = targetScheduleData.group.leader_id;

    if (target_leader_id === initiating_leader_id) {
        throw new Error("Não pode solicitar troca consigo mesmo.");
    }

    
    const { data: newSwapRequest, error: insertError } = await supabaseAdmin
      .from('schedule_swaps')
      .insert({
        initiating_schedule_id,
        target_schedule_id,
        initiating_leader_id,
        target_leader_id,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      
      if (insertError.code === '23505') { 
          throw new Error("Já existe uma solicitação de troca pendente entre estas escalas.");
      }
      throw insertError; 
    }

    
    try {
      const initiatorProfile = await supabaseAdmin.from('profiles').select('name').eq('id', initiating_leader_id).single();
      const initiatorName = initiatorProfile.data?.name || 'Um líder';

      const emailHtml = `
        <p>Olá,</p>
        <p>${initiatorName} solicitou uma troca de escala consigo.</p>
        <p><strong>Escala Original (${initiatingScheduleData.group.name}):</strong> ${new Date(initiatingScheduleData.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
        <p><strong>Escala Proposta (${targetScheduleData.group.name}):</strong> ${new Date(targetScheduleData.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
        <p>Por favor, aceda ao painel para aceitar ou recusar.</p>
        <a href="${Deno.env.get('SITE_URL') || '#'}/dashboard">Ir para o Painel</a>
      `; 

      await supabaseAdmin.functions.invoke('send-resend-notification', {
        body: {
          targetUserIds: [target_leader_id],
          subject: 'Solicitação de Troca de Escala Recebida',
          htmlBody: emailHtml,
        },
      });
      console.log(`[create-swap-request] Notificação enviada para o líder ${target_leader_id}`);
    } catch (notificationError) {
      console.error(`[create-swap-request] AVISO: Pedido criado, mas falha ao enviar notificação:`, notificationError);
      
    }
    

    return new Response(JSON.stringify(newSwapRequest), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201,
    });

  } catch (err) {
    console.error("[create-swap-request] ERRO:", err);
    
    const status = err.message.startsWith("Permissão negada") ? 403 : 400;
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: status,
    });
  }
});