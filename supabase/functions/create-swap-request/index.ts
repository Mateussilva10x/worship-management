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
    if (!initiating_schedule_id || !target_schedule_id) {
      throw new Error("IDs das escalas de origem e destino são obrigatórios.");
    }

    
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Utilizador não autenticado.");
    const initiating_leader_id = user.id;

    
    const { data: initiatingData, error: err1 } = await supabaseAdmin
      .from('schedules')
      .select('date, group:groups!inner(leader_id, name), initiating_leader:profiles!inner(name)')
      .eq('id', initiating_schedule_id)
      .eq('group.leader_id', initiating_leader_id) 
      .single();

    if (err1 || !initiatingData) {
      throw new Error("Permissão negada: Você não é o líder da escala de origem ou a escala não existe.");
    }

    
    const { data: targetData, error: err2 } = await supabaseAdmin
      .from('schedules')
      .select('date, group:groups!inner(leader_id, name)')
      .eq('id', target_schedule_id)
      .single();
      
    if (err2 || !targetData || !targetData.group?.leader_id) {
      throw new Error("Não foi possível encontrar o líder ou detalhes da escala de destino.");
    }
    const target_leader_id = targetData.group.leader_id;

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

    
    const { data: targetProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', target_leader_id)
        .single();
    
    if (profileError || !targetProfile?.email) {
        throw new Error("Pedido de troca criado, mas não foi possível encontrar o e-mail do líder de destino.");
    }

    
    const initiatorName = initiatingData.initiating_leader?.name || 'Um líder';
    const initiatorScheduleDate = new Date(initiatingData.date).toLocaleDateString('pt-BR', { dateStyle: 'full' });
    const targetScheduleDate = new Date(targetData.date).toLocaleDateString('pt-BR', { dateStyle: 'full' });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Solicitação de Troca de Escala</h1>
        </div>
        <div style="padding: 20px; background-color: #fcf8e3; color: #333;">
          <p>Olá,</p>
          <p>O líder <strong>${initiatorName}</strong> (Grupo: ${initiatingData.group.name}) solicitou uma troca de escala com o seu grupo.</p>
          <p>Abaixo estão os detalhes:</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0;">
            <p><strong>A escala Deles:</strong> ${initiatingData.group.name}</p>
            <p><strong>Data:</strong> ${initiatorScheduleDate}</p>
          </div>
          <p style="text-align: center; font-weight: bold; margin: 10px 0;">POR</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0;">
            <p><strong>A sua escala:</strong> ${targetData.group.name}</p>
            <p><strong>Data:</strong> ${targetScheduleDate}</p>
          </div>
          <p>Por favor, acesse a plataforma para aceitar ou recusar esta solicitação.</p>
          <br>
          <p>Que Deus abençoe!</p>
          <p><strong>Worship Management IPC</strong></p>
        </div>
      </div>
    `;

    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY não encontrada.');

    const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Worship Management <suporte@worshipmanagement.work.gd>', 
            to: [targetProfile.email],
            subject: 'Você recebeu um pedido de troca de escala!',
            html: emailHtml,
        }),
    });

    if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error("Erro ao enviar e-mail pelo Resend:", errorData);
        
        console.warn(`[create-swap-request] AVISO: Pedido criado, mas falha ao enviar notificação.`);
    }

    return new Response(JSON.stringify(newSwapRequest), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201,
    });

  } catch (err) {
    console.error("[create-swap-request] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    });
  }
});