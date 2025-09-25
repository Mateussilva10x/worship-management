import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";

const VITE_ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

const notifyButtonConfig = {
  enable: true,
  prenotify: true,
  showCredit: false,
  text: {
    "tip.state.unsubscribed": "Inscreva-se para receber notificações",
    "tip.state.subscribed": "Você está inscrito!",
    "tip.state.blocked": "Você bloqueou as notificações",
    "message.prenotify": "Clique para se inscrever",
    "message.action.subscribed": "Obrigado por se inscrever!",
    "message.action.resubscribed": "Você está inscrito novamente!",
    "message.action.unsubscribed": "Você não receberá mais notificações.",
    "dialog.main.title": "Gerir Notificações",
    "dialog.main.button.subscribe": "INSCREVER",
    "dialog.main.button.unsubscribe": "REMOVER INSCRIÇÃO",
    "dialog.blocked.title": "Desbloquear Notificações",
    "dialog.blocked.message":
      "Siga estas instruções para permitir notificações:",
    "message.action.subscribing": "Inscrevendo...",
  },
};

let isOneSignalInitialized = false;

const OneSignalManager = (): null => {
  const { user, isAuthenticated } = useAuth();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    if (!VITE_ONESIGNAL_APP_ID) {
      console.error(
        "OneSignal App ID não foi definido nas variáveis de ambiente."
      );
      return;
    }

    const setupOneSignal = async () => {
      if (!isOneSignalInitialized) {
        await OneSignal.init({
          appId: VITE_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: notifyButtonConfig,
        });
        isOneSignalInitialized = true;

        OneSignal.User.PushSubscription.addEventListener("change", async () => {
          console.log("Evento 'change' da subscrição disparado!");

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const subscriptionId = OneSignal.User.PushSubscription.id;

          console.log("Utilizador autenticado ID:", user?.id);
          console.log("OneSignal Subscription ID capturado:", subscriptionId);

          if (subscriptionId && user) {
            console.log(
              `A tentar atualizar o perfil ${user.id} com o ID ${subscriptionId}`
            );

            const { data, error } = await supabase
              .from("profiles")
              .update({ onesignal_subscription_id: subscriptionId })
              .eq("id", user.id);

            if (error) {
              console.error("ERRO ao atualizar o perfil no Supabase:", error);
            } else {
              console.log("SUCESSO: Perfil atualizado no Supabase.", data);
            }
          } else {
            console.warn(
              "Não foi possível atualizar: utilizador não logado ou ID de subscrição em falta."
            );
          }
        });
      }

      if (isAuthenticated && user) {
        await OneSignal.login(user.id);
      } else {
        await OneSignal.logout();
      }
    };

    setupOneSignal();
  }, [isAuthenticated, user]);

  return null;
};

export default OneSignalManager;
