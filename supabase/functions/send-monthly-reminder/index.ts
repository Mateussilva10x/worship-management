/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'  



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
      from: 'Worship Management <lideranca@louvoripcatole.work.gd>', 
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
      if (!resendResponse.ok) { /* ... (tratamento de erro) ... */ } 
      else {
        responseData.data?.forEach((item: { id: string, error: object | null }, index: number) => {
          if (item.error) failedEmails.push(batch[index]);
          else successCount++;
        });
      }
    } catch (err) {
      console.error("[Batch] Erro inesperado no fetch do lote:", err);
      failedEmails.push(...batch);
    }
    
    if (i + batchSize < targetEmails.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.log(`[Batch] Envio em lote concluído. Sucesso: ${successCount}, Falhas: ${failedEmails.length}`);
  return { successCount, failedCount: failedEmails.length, failedEmails };
}




const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  console.log(`[send-monthly-reminder] Função invocada às: ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  
  try {
    const payload = await req.json();
    if (payload.secret !== Deno.env.get('FUNCTION_SECRET')) {
      throw new Error("Não autorizado. Segredo da função inválido.");
    }
  } catch (err) {
    
    console.warn("[send-monthly-reminder] Falha na verificação de segredo:", err.message);
    return new Response(JSON.stringify({ error: err.message || "Pedido inválido." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
    });
  }
  
  
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY não encontrada.');

    
    const { data: users, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email');
    if (profileError) throw profileError;

    const allUserEmails = users.map(u => u.email).filter(Boolean); 
    console.log(`[send-monthly-reminder] Encontrados ${allUserEmails.length} e-mails.`);

    
    
    const nomeDoMes = new Date().toLocaleString('pt-BR', { month: 'long' });
    const emailSubject = `Escalas de ${nomeDoMes} Disponíveis!`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #f4f1e9;">
        <div style="background-color: #388E3C; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">🗓️ Lembrete de Escalas</h1>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <p style="font-size: 16px;">Olá, irmão(ã)!</p>
          <p>As escalas para o mês de <strong>${nomeDoMes}</strong> já estão disponíveis no sistema.</p>
          
          <div style="background-color: #FFF9C4; border-left: 5px solid #FBC02D; padding: 10px 15px; margin-top: 20px; font-size: 14px;">
            <p style="margin: 0;"><strong>Lembrete:</strong> Acesse a plataforma para verificar os dias da sua escala e confirmar sua presença.</p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
             <a href="https://wmanagement.vercel.app/dashboard" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                  Acessar Plataforma
             </a>
          </div>

          <p style="margin-top: 25px;">Que Deus abençoe!</p>
          <p><strong>Worship Management IPC</strong></p>
        </div>
      </div>
    `;

    
    console.log("[send-monthly-reminder] A iniciar envio em lote...");
    
    const results = await sendEmailsInBatches(
      allUserEmails,
      emailSubject,
      emailHtml,
      RESEND_API_KEY
    );

    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Envio em lote de lembrete mensal concluído.",
      ...results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[send-monthly-reminder] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});