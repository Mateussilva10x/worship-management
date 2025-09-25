/* eslint-disable @typescript-eslint/no-unused-vars */
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
      throw new Error('Missing required fields: targetUserIds, title, or message.');
    }

    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error('OneSignal credentials are not set in environment variables.');
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: targetUserIds,
        headings: { en: title, pt: title },
        contents: { en: message, pt: message },
        channel_for_external_user_ids: 'push',
        web_url: url || Deno.env.get('SUPABASE_URL'), 
      }),
    });

    const responseData = await response.json();

    if (response.status !== 200) {
        console.error('OneSignal API Error:', responseData);
        throw new Error(`Failed to send notification. Status: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});