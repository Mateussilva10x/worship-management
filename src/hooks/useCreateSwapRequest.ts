/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNotificationDispatch } from '../contexts/NotificationContext'; 

interface CreateSwapPayload {
  initiating_schedule_id: string;
  target_schedule_id: string;
}

const createSwapRequest = async (payload: CreateSwapPayload) => {
  const { data, error } = await supabase.functions.invoke('create-swap-request', {
    body: payload,
  });

  if (error) {
    throw error; 
  }
  return data;
};

export const useCreateSwapRequest = () => {
  const { showNotification } = useNotificationDispatch();

  return useMutation({
    mutationFn: createSwapRequest,
    onSuccess: () => {
      
      
      showNotification('Solicitação de troca enviada com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error("Erro ao criar solicitação de troca:", error);
      
      showNotification(`Erro: ${error.message || 'Falha ao enviar solicitação.'}`, 'error');
    },
  });
};