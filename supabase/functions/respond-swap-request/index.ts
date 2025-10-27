/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'
import type { ParticipationStatus } from '../../../src/types/'; 

interface RequestPayload {
  swap_request_id: string;
  response: 'accepted' | 'rejected';
}


const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const getGroupMemberIds = async (groupId: string): Promise<string[]> => {
    const { data, error } = await supabaseAdmin
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
    if (error) throw new Error(`Erro ao buscar membros do grupo ${groupId}: ${error.message}`);
    return data?.map(m => m.user_id) || [];
};


const updateScheduleParticipants = async (scheduleId: string, groupId: string) => {
    
    const { error: deleteError } = await supabaseAdmin
        .from('schedule_participants')
        .delete()
        .eq('schedule_id', scheduleId);
    if (deleteError) throw new Error(`Erro ao apagar participantes antigos da escala ${scheduleId}: ${deleteError.message}`);

    
    const memberIds = await getGroupMemberIds(groupId);
    if (memberIds.length > 0) {
        const newParticipants = memberIds.map(userId => ({
            schedule_id: scheduleId,
            user_id: userId,
            status: 'pending' as ParticipationStatus,
        }));
        const { error: insertError } = await supabaseAdmin
            .from('schedule_participants')
            .insert(newParticipants);
        if (insertError) throw new Error(`Erro ao inserir novos participantes na escala ${scheduleId}: ${insertError.message}`);
    }
    console.log(`[respond-swap-request] Participantes da escala ${scheduleId} atualizados para o grupo ${groupId}.`);
};


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { swap_request_id, response }: RequestPayload = await req.json();
    if (!swap_request_id || !response || !['accepted', 'rejected'].includes(response)) {
      throw new Error("ID da solicitação e resposta ('accepted' ou 'rejected') são obrigatórios.");
    }

     const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Utilizador não autenticado.");
    const responder_id = user.id;

    
    const { data: swapRequest, error: fetchError } = await supabaseAdmin
      .from('schedule_swaps')
      
      .select('*, initiating_schedule:schedules!initiating_schedule_id(id, group_id, date), target_schedule:schedules!target_schedule_id(id, group_id, date)')
      .eq('id', swap_request_id)
      .eq('target_leader_id', responder_id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !swapRequest) {
      throw new Error("Solicitação não encontrada, já respondida, ou você não tem permissão.");
    }

    const initiating_schedule_id = swapRequest.initiating_schedule.id;
    const target_schedule_id = swapRequest.target_schedule.id;
    const original_initiating_group_id = swapRequest.initiating_schedule.group_id;
    const original_target_group_id = swapRequest.target_schedule.group_id;

    
    if (response === 'accepted') {
      console.log(`[respond-swap-request] Aceitando troca. Trocando grupos ${original_initiating_group_id} e ${original_target_group_id} entre escalas ${initiating_schedule_id} e ${target_schedule_id}.`);

      
      
      const { error: errUpdate1 } = await supabaseAdmin
        .from('schedules')
        .update({ group_id: original_target_group_id })
        .eq('id', initiating_schedule_id);
      if (errUpdate1) throw new Error(`Erro ao atualizar escala de origem: ${errUpdate1.message}`);

      
      const { error: errUpdate2 } = await supabaseAdmin
        .from('schedules')
        .update({ group_id: original_initiating_group_id })
        .eq('id', target_schedule_id);
      if (errUpdate2) {
          
          console.error("[respond-swap-request] Erro na segunda atualização, tentando reverter a primeira...");
          await supabaseAdmin.from('schedules').update({ group_id: original_initiating_group_id }).eq('id', initiating_schedule_id);
          throw new Error(`Erro ao atualizar escala de destino: ${errUpdate2.message}. Reversão tentada.`);
      }
      console.log("[respond-swap-request] Grupos das escalas trocados com sucesso.");


      
      await updateScheduleParticipants(initiating_schedule_id, original_target_group_id); 
      await updateScheduleParticipants(target_schedule_id, original_initiating_group_id);   
      

      
      
      

    } else {
        console.log(`[respond-swap-request] Rejeitando troca ${swap_request_id}.`);
    }

    
    const { data: updatedRequest, error: updateStatusError } = await supabaseAdmin
      .from('schedule_swaps')
      .update({ status: response })
      .eq('id', swap_request_id)
      .select()
      .single();

    if (updateStatusError) throw updateStatusError;
    console.log(`[respond-swap-request] Status da solicitação ${swap_request_id} atualizado para ${response}.`);

     
    try {
        const targetProfile = await supabaseAdmin.from('profiles').select('name').eq('id', responder_id).single();
        const responderName = targetProfile.data?.name || 'O outro líder';
        const statusText = response === 'accepted' ? 'ACEITA' : 'RECUSADA';

        const emailHtml = `
            <p>Olá,</p>
            <p>A sua solicitação de troca de escala foi respondida por ${responderName}: <strong>${statusText}</strong>.</p>
            <p><strong>Sua Escala Original:</strong> ${new Date(swapRequest.initiating_schedule.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
            <p><strong>Escala Proposta:</strong> ${new Date(swapRequest.target_schedule.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
            ${response === 'accepted' ? '<p>As escalas foram atualizadas no sistema.</p>' : ''}
            <a href="${Deno.env.get('SITE_URL') || '#'}/dashboard">Ver Painel</a>
        `;

        await supabaseAdmin.functions.invoke('send-resend-notification', {
            body: {
                targetUserIds: [swapRequest.initiating_leader_id],
                subject: `Resposta à sua Solicitação de Troca (${statusText})`,
                htmlBody: emailHtml,
            },
        });
        console.log(`[respond-swap-request] Notificação de resposta enviada para ${swapRequest.initiating_leader_id}`);
    } catch (notificationError) {
        console.error(`[respond-swap-request] AVISO: Resposta processada, mas falha ao enviar notificação:`, notificationError);
    }
    

    return new Response(JSON.stringify(updatedRequest), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[respond-swap-request] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    });
  }
});