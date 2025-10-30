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
  console.log(`[send-bulk-welcome-email] Função invocada às: ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  
  try {
    const payload = await req.json();
    if (payload.secret !== Deno.env.get('FUNCTION_SECRET')) {
      throw new Error("Não autorizado. Segredo da função inválido.");
    }
  } catch (err) {
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

    if (allUserEmails.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum utilizador encontrado." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }
    console.log(`[send-bulk-welcome-email] Encontrados ${allUserEmails.length} e-mails.`);

    
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Bem-vindo(a) a Nossa Comunidade!</h1>
        </div>
        <div style="padding: 20px; background-color: #fcf8e3; color: #333;">
          <p>Olá membro da IPC,</p>
          <p>Obrigado por se inscrever! Estamos muito felizes em tê-lo(a) conosco. Este e-mail é para informar que a nossa comunicação principal será feita por aqui.</p>
          <p>A partir de agora, você receberá:</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0;">
            <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
              <li style="margin-bottom: 10px;"><strong>Novas Escalas:</strong> Quando for escalado(a) por um grupo.</li>
              <li style="margin-bottom: 10px;"><strong>Músicas Novas:</strong> Quando uma música for aprovada e adicionada à biblioteca.</li>
              <li style="margin-bottom: 10px;"><strong>Solicitações de Troca:</strong> Quando um líder solicitar uma troca de escala (Válida apenas para os líderes).</li>
            </ul>
          </div>
          <p><strong>Importante:</strong> Para garantir que não irá perder nada, adicione o nosso endereço (lideranca@louvoripcatole.work.gd) aos seus contatos!</p>
          <p>Se tiver alguma dúvida ou precisar de ajuda, entre em contato com a liderança do louvor da IPC (Neto e Mateus Silva)</p>
          <br>
          <p>Que Deus abençoe!</p>
          <p><strong>Worship Management IPC</strong></p>
        </div>
      </div>
    `;

    
    const emailSubject = 'Bem-vindo(a) ao Worship Management!';
    console.log("[send-bulk-welcome-email] A iniciar envio em lote...");
    
    const results = await sendEmailsInBatches(
      allUserEmails,
      emailSubject,
      emailHtml,
      RESEND_API_KEY
    );

    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Envio em lote concluído.",
      ...results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[send-bulk-welcome-email] ERRO FATAL:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});