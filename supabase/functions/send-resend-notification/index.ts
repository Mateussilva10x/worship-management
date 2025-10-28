/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'  

interface NotificationPayload {
  targetUserIds?: string[];
  targetRole?: 'admin' | 'member' | 'all';
  subject: string;
  htmlBody: string; 
}

Deno.serve(async (req) => {
  
  console.log(`[send-resend-notification] Função invocada às: ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { targetUserIds, targetRole, subject, htmlBody } = payload;
    console.log("[send-resend-notification] Payload recebido:", payload);


    if (!subject || !htmlBody || (!targetUserIds && !targetRole)) {
      throw new Error('Payload inválido. Campos obrigatórios em falta.');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não encontrada nos segredos.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let finalTargetEmails: string[] = [];

    
    console.log("[send-resend-notification] A buscar e-mails...");
    if (targetUserIds && targetUserIds.length > 0) {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .in('id', targetUserIds);
      if (error) throw new Error(`Erro ao buscar e-mails por ID: ${error.message}`);
      finalTargetEmails = profiles.map(p => p.email).filter(Boolean);
    } else if (targetRole) {
      let query = supabaseAdmin.from('profiles').select('email');
      if (targetRole !== 'all') {
        query = query.eq('role', targetRole);
      }
      const { data: profiles, error } = await query;
      if (error) throw new Error(`Erro ao buscar e-mails por role '${targetRole}': ${error.message}`);
      finalTargetEmails = profiles.map(p => p.email).filter(Boolean);
    }

    if (finalTargetEmails.length === 0) {
      console.log("[send-resend-notification] Nenhum destinatário encontrado.");
      return new Response(JSON.stringify({ success: true, message: "No email recipients found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }
    console.log(`[send-resend-notification] E-mails encontrados: ${finalTargetEmails.join(', ')}`);


    
    console.log("[send-resend-notification] A enviar para a API do Resend...");
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Worship Management <ipc@worshipmanagement.work.gd>', 
        to: finalTargetEmails, 
        subject: subject,
        html: htmlBody,
      }),
    });

    const responseData = await resendResponse.json();
    console.log(`[send-resend-notification] Resposta do Resend (Status: ${resendResponse.status}):`, responseData);

    if (!resendResponse.ok) {
       const errorDetails = responseData.message || JSON.stringify(responseData);
       throw new Error(`Falha ao enviar e-mail via Resend. Status: ${resendResponse.status}. Detalhes: ${errorDetails}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[send-resend-notification] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});