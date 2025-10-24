/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts'; 
import nodemailer from 'https://esm.sh/nodemailer@6.9.14?target=deno&deno-std=0.132.0&no-check';

interface NotificationPayload {
  targetUserIds?: string[];
  targetRole?: 'admin' | 'member' | 'all';
  subject: string;
  htmlBody: string; 
  
}


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: Deno.env.get('GMAIL_USER')!, 
    pass: Deno.env.get('GMAIL_APP_PASSWORD')!, 
  },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { targetUserIds, targetRole, subject, htmlBody } = payload;

    if (!subject || !htmlBody || (!targetUserIds && !targetRole)) {
      throw new Error('Payload inválido. Campos obrigatórios em falta.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let finalTargetEmails: string[] = [];

    
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
      console.log("Nenhum destinatário de e-mail encontrado.");
      return new Response(JSON.stringify({ success: true, message: "No email recipients found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    
    const info = await transporter.sendMail({
      from: `"Worship Management App" <${Deno.env.get('GMAIL_USER')!}>`, 
      to: finalTargetEmails.join(', '), 
      subject: subject,
      html: htmlBody, 
    });

    console.log("E-mail enviado com sucesso:", info.messageId);

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (err) {
    console.error("[send-gmail-notification] ERRO:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500, 
    });
  }
});