/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNotificationDispatch } from '../contexts/NotificationContext';

interface RespondSwapPayload {
  swap_request_id: string;
  response: 'accepted' | 'rejected';
}

const respondToSwapRequest = async (payload: RespondSwapPayload) => {
  const { data, error } = await supabase.functions.invoke('respond-swap-request', {
    body: payload,
  });

  if (error) {
    throw error;
  }
  return data;
};

export const useRespondToSwapRequest = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationDispatch();

  return useMutation({
    mutationFn: respondToSwapRequest,
    onSuccess: (_, variables) => { 
      
      queryClient.invalidateQueries({ queryKey: ['swapRequests'] });
      
      if (variables.response === 'accepted') {
        queryClient.invalidateQueries({ queryKey: ['schedules'] }); 
      }
      showNotification(`Solicitação ${variables.response === 'accepted' ? 'aceite' : 'recusada'} com sucesso!`, 'success');
    },
    onError: (error: any) => {
      console.error("Erro ao responder à solicitação de troca:", error);
      showNotification(`Erro: ${error.message || 'Falha ao processar resposta.'}`, 'error');
    },
  });
};