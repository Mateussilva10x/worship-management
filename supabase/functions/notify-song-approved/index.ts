/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'     


interface WebhookPayload {
  type: 'UPDATE';
  table: 'songs';
  record: { 
    id: string;
    title: string;
    key: string;
    status: string; 
    
  };
  old_record: { 
    id: string;
    status: string | null; 
  };
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSongApprovalPayload(payload: any): payload is WebhookPayload {
  return payload &&
         payload.type === 'UPDATE' &&
         payload.table === 'songs' &&
         payload.record &&
         payload.old_record &&
         payload.record.status === 'approved' && 
         payload.old_record.status !== 'approved'; 
}


const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  
  console.log(`[notify-song-approved] Função invocada às: ${new Date().toISOString()}`);

  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: unknown = await req.json();

    
    if (!isSongApprovalPayload(payload)) {
      console.log("[notify-song-approved] Payload não corresponde a um evento de aprovação de música. Ignorando.");
      return new Response(JSON.stringify({ success: true, message: "Event ignored (not a song approval)." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const approvedSong = payload.record;
    console.log(`[notify-song-approved] Música ${approvedSong.title} teve status atualizado para 'approved'.`);

    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não encontrada nos segredos do Supabase.');
    }

    
    
    console.log("[notify-song-approved] A buscar e-mails de todos os utilizadores...");
    const { data: users, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .neq('role', 'admin'); 

    if (profileError) {
      throw new Error(`Erro ao buscar e-mails: ${profileError.message}`);
    }

    const targetEmails = users.map(u => u.email).filter(Boolean); 

    if (targetEmails.length === 0) {
      console.log("[notify-song-approved] Nenhum utilizador encontrado para notificar.");
      return new Response(JSON.stringify({ success: true, message: "No users found to notify." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }
    console.log(`[notify-song-approved] ${targetEmails.length} e-mails de destino encontrados.`);

    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Nova Música Disponível!</h1>
        </div>
        <div style="padding: 20px; background-color: #fcf8e3; color: #333;">
          <p>Olá,</p>
          <p>Uma nova música foi aprovada e adicionada à biblioteca:</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0;">
            <p><strong>Título:</strong> ${approvedSong.title}</p>
            <p><strong>Tom:</strong> ${approvedSong.key || 'Não informado'}</p>
            </div>
          <p>Você já pode visualizá-la na plataforma.</p>
          <br>
          <p>Que Deus abençoe!</p>
          <p><strong>Worship Management IPC</strong></p>
        </div>
      </div>
    `;

    
    console.log("[notify-song-approved] A enviar para a API do Resend...");
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Worship Management <suporte@worshipmanagement.work.gd>', 
        to: targetEmails,
        subject: `Nova Música Aprovada: ${approvedSong.title}`,
        html: emailHtml,
      }),
    });

    const responseData = await resendResponse.json();
    console.log(`[notify-song-approved] Resposta do Resend (Status: ${resendResponse.status}):`, responseData);

    if (!resendResponse.ok) {
       const errorDetails = responseData.message || JSON.stringify(responseData);
       throw new Error(`Falha ao enviar e-mail via Resend. Status: ${resendResponse.status}. Detalhes: ${errorDetails}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[notify-song-approved] ERRO FATAL:", err.message);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});