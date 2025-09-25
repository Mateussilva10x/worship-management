/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

interface UpdatePayload {
  schedule_id: string;
  new_group_id: string;
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { schedule_id, new_group_id }: UpdatePayload = await req.json();

    if (!schedule_id || !new_group_id) {
      throw new Error('É necessário fornecer o ID da escala e o ID do novo grupo.');
    }

  
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

  
    const { error: deleteError } = await supabaseAdmin
      .from('schedule_participants')
      .delete()
      .eq('schedule_id', schedule_id);

    if (deleteError) {
      throw new Error(`Erro ao apagar participantes antigos: ${deleteError.message}`);
    }

  
    const { data: newMembers, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select('user_id')
      .eq('group_id', new_group_id);

    if (membersError) {
      throw new Error(`Erro ao procurar membros do novo grupo: ${membersError.message}`);
    }

  
    if (newMembers && newMembers.length > 0) {
      const newParticipants = newMembers.map(member => ({
        schedule_id: schedule_id,
        user_id: member.user_id,
        status: 'pending'
      }));

      const { error: insertError } = await supabaseAdmin
        .from('schedule_participants')
        .insert(newParticipants);

      if (insertError) {
        throw new Error(`Erro ao inserir novos participantes: ${insertError.message}`);
      }
    }

  
    const { data: updatedSchedule, error: updateError } = await supabaseAdmin
      .from('schedules')
      .update({ group_id: new_group_id })
      .eq('id', schedule_id)
      .select(`
        *,
        group:groups (*),
        schedule_songs ( song_id ),
        schedule_participants ( user_id, status )
      `)
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar a escala: ${updateError.message}`);
    }

  

    return new Response(JSON.stringify({ success: true, data: updatedSchedule }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Erro na função update-schedule-group:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});