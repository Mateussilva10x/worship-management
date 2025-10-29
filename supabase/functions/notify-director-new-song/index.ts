/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'     

interface WebhookPayload {
  type: 'INSERT'; 
  table: 'songs';
  record: { 
    id: string;
    title: string;
    key: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidWebhookPayload(payload: any): payload is WebhookPayload {
  return payload && payload.type === 'INSERT' && payload.table === 'songs' && payload.record && payload.record.title;
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  
  console.log(`[notify-director-new-song] Função invocada às: ${new Date().toISOString()}`);

  
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: unknown = await req.json(); 
    console.log("[notify-director-new-song] Payload recebido:", payload);

    
    if (!isValidWebhookPayload(payload)) {
      throw new Error('Payload inválido ou não corresponde ao evento esperado (INSERT em songs).');
    }

    const newSong = payload.record;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não encontrada nos segredos.');
    }

    
    console.log("[notify-director-new-song] A buscar e-mails dos diretores...");
    const { data: directors, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'worship_director'); 

    if (profileError) {
      throw new Error(`Erro ao buscar diretores: ${profileError.message}`);
    }

    const directorEmails = directors.map(d => d.email).filter(Boolean); 

    if (directorEmails.length === 0) {
      console.log("[notify-director-new-song] Nenhum diretor encontrado para notificar.");
      return new Response(JSON.stringify({ success: true, message: "No directors found to notify." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }
    console.log(`[notify-director-new-song] E-mails encontrados: ${directorEmails.join(', ')}`);

    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Nova Música para Revisão</h1>
        </div>
        <div style="padding: 20px; background-color: #fcf8e3; color: #333;">
          <p>Olá Diretor(a) de Louvor,</p> 
          <p>Uma nova música foi adicionada ao sistema e aguarda a sua revisão:</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0;">
            <p><strong>Título:</strong> ${newSong.title}</p>
            <p><strong>Tom:</strong> ${newSong.key || 'Não informado'}</p>
            
          </div>
          <p>Por favor, acesse à plataforma para revisar a música.</p>
          <br>
          <p>Que Deus abençoe!</p>
          <p><strong>Worship Management IPC</strong></p> 
        </div>
      </div>
    `; 

    
    console.log("[notify-director-new-song] A enviar para a API do Resend...");
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Worship Management <suporte@worshipmanagement.work.gd>', 
        to: directorEmails,
        subject: `Nova Música para Revisão: ${newSong.title}`,
        html: emailHtml,
      }),
    });

    const responseData = await resendResponse.json();
    console.log(`[notify-director-new-song] Resposta do Resend (Status: ${resendResponse.status}):`, responseData);

    if (!resendResponse.ok) {
       const errorDetails = responseData.message || JSON.stringify(responseData);
       throw new Error(`Falha ao enviar e-mail via Resend. Status: ${resendResponse.status}. Detalhes: ${errorDetails}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[notify-director-new-song] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});