/// <reference types="https://esm.sh/@supabase/functions-js@2" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts';


interface Profile {
  name: string;
  email: string;
  whatsapp: string;
}
interface Group {
  name: string;
  leader: Profile;
}
interface Schedule {
  id: string;
  date: string;
  group: Group;
  schedule_participants: { status: string }[];
}

Deno.serve(async (req) => {
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const targetDateStart = sevenDaysFromNow.toISOString().split('T')[0] + 'T00:00:00Z';
    const targetDateEnd = sevenDaysFromNow.toISOString().split('T')[0] + 'T23:59:59Z';

    
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        date,
        group:groups (
          name,
          leader:profiles!leader_id ( name, email, whatsapp )
        ),
        schedule_participants ( status )
      `)
      .gte('date', targetDateStart)
      .lte('date', targetDateEnd);

    if (schedulesError) throw schedulesError;

    
    const pendingSchedules = schedules.filter(s => 
      s.schedule_participants.some((p: { status: string }) => p.status === 'pending')
    ) as Schedule[];

    if (pendingSchedules.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma escala pendente encontrada para a data alvo.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'admin');
    
    if (adminsError) throw adminsError;
    const adminEmails = admins.map(a => a.email);

    if (adminEmails.length === 0) {
      throw new Error("Nenhum administrador encontrado para enviar a notificação.");
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error("A chave da API do Resend (RESEND_API_KEY) não foi encontrada nos segredos.");

    
    for (const schedule of pendingSchedules) {
      const leader = schedule.group.leader as Profile;
      
      if (!leader || !leader.whatsapp) continue;

      const scheduleDate = new Date(schedule.date).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'});
      const phone = leader.whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(`Lembrete (Louvor na Escala): A escala do grupo "${schedule.group.name}" para o dia ${scheduleDate} tem membros pendentes. Por favor, verifique com a equipe.`);
      const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

      const emailSubject = `Lembrete: Escala de "${schedule.group.name}" com pendências`;
      const emailBody = `
        <html>
          <body>
            <p>Olá,</p>
            <p>A escala da equipe "<strong>${schedule.group.name}</strong>" para o dia <strong>${scheduleDate}</strong> ainda possui membros com status pendente.</p>
            <p>Por favor, entre em contato com o líder da equipe, <strong>${leader.name}</strong>, para verificar.</p>
            <br>
            <a href="${whatsappUrl}" style="background-color:#25d366;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;font-size:16px;">
              Enviar Lembrete via WhatsApp para o Líder
            </a>
            <br><br>
            <p>Obrigado!</p>
          </body>
        </html>
      `;

      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Louvor na Escala <onboarding@resend.dev>', 
          to: adminEmails,
          subject: emailSubject,
          html: emailBody
        }),
      });
    }

    return new Response(JSON.stringify({ message: `${pendingSchedules.length} lembrete(s) enviados para os administradores.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    
    console.error("Erro na execução da função:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});