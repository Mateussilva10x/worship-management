/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'  

interface NotificationPayload {
  targetUserIds?: string[];
  targetRole?: 'admin' | 'member' | 'all' | 'worship_director';
  subject: string;
  htmlBody: string; 
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function sendEmailsInBatches(
  targetEmails: string[], 
  subject: string, 
  htmlBody: string, 
  resendApiKey: string
) {
  const batchSize = 100; 
  let successCount = 0;
  const failedEmails: string[] = [];

  console.log(`[Batch] Iniciando envio em lotes para ${targetEmails.length} e-mails...`);

  for (let i = 0; i < targetEmails.length; i += batchSize) {
    const batch = targetEmails.slice(i, i + batchSize);
    
    
    const batchData = batch.map(email => ({
      from: 'Praise Schedule App <app@worshipmanagement.work.gd>', 
      to: [email], 
      subject: subject,
      html: htmlBody,
    }));

    console.log(`[Batch] Enviando lote ${Math.floor(i / batchSize) + 1} com ${batch.length} e-mails.`);

    try {
      const resendResponse = await fetch('https://api.resend.com/emails/batch', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData), 
      });

      const responseData = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error(`[Batch] Erro no lote: ${resendResponse.status}`, responseData);
        failedEmails.push(...batch); 
      } else {
        
        responseData.data?.forEach((item: { id: string, error: object | null }, index: number) => {
          if (item.error) {
            console.error(`[Batch] Falha no e-mail: ${batch[index]}`, item.error);
            failedEmails.push(batch[index]);
          } else {
            successCount++;
          }
        });
      }

    } catch (err) {
      console.error("[Batch] Erro inesperado no fetch do lote:", err);
      failedEmails.push(...batch);
    }
  }

  console.log(`[Batch] Envio concluído. Sucesso: ${successCount}, Falhas: ${failedEmails.length}`);
  return { successCount, failedEmails };
}




Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { targetRole, subject, htmlBody } = payload;
    console.log("[send-resend-notification] Payload recebido:", payload);

    if (!subject || !htmlBody || !targetRole) {
      throw new Error('Payload inválido. Campos obrigatórios em falta.');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY não encontrada.');

    
    console.log(`[send-resend-notification] A buscar e-mails para role: ${targetRole}`);
    let query = supabaseAdmin.from('profiles').select('email');
    if (targetRole !== 'all') {
      query = query.eq('role', targetRole);
    }
    const { data: profiles, error: profileError } = await query;

    if (profileError) throw profileError;
    const targetEmails = profiles.map(p => p.email).filter(Boolean);
    
    sendEmailsInBatches(targetEmails, subject, htmlBody, RESEND_API_KEY)
      .then(result => {
        console.log(`[Background Send] Resultado: ${result.successCount} sucesso(s), ${result.failedEmails.length} falha(s).`);
      })
      .catch(err => {
        console.error("[Background Send] Erro fatal no envio em lote:", err);
      });

    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Envio em lote iniciado para ${targetEmails.length} destinatário(s).` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 202, 
    });

  } catch (err) {
    console.error("[send-resend-notification] ERRO FATAL (Handler):", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});