/// <reference types="https://esm.sh/@supabase/functions-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'


interface NotificationPayload {
  targetUserIds: string[];
  title: string;
  message: string;
  url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { targetUserIds, title, message, url }: NotificationPayload = await req.json();
    
    if (!targetUserIds || targetUserIds.length === 0 || !title || !message) {
      throw new Error('Payload inválido. Campos em falta: targetUserIds, title, or message.');
    }

    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error('As credenciais do OneSignal não foram encontradas.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('onesignal_subscription_id')
      .in('id', targetUserIds)
      .not('onesignal_subscription_id', 'is', null);

    if (profileError) {
      throw new Error(`Erro ao procurar perfis: ${profileError.message}`);
    }

    const subscriptionIds = profiles.map(p => p.onesignal_subscription_id);

    if (subscriptionIds.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No subscribed users to notify." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: subscriptionIds,
        headings: { en: title, pt: title },
        contents: { en: message, pt: message },
        web_url: url || Deno.env.get('SUPABASE_URL'),
        android_group: 'new_schedule'
      }),
    });
    
    const responseData = await response.json();

    if (response.status !== 200) {
      console.error('OneSignal API Error:', responseData);
      throw new Error(`Falha ao enviar notificação. OneSignal respondeu com status ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("[send-notification] ERRO FATAL CAPTURADO:", err.message);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});