
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext'; 


export interface SwapRequestWithDetails {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  initiating_leader_id: string;
  initiating_schedule: {
    id: string;
    date: string;
    group: {
      id: string;
      name: string;
    } | null;
  } | null;
  target_schedule: {
    id: string;
    date: string;
    group: {
      id: string;
      name: string;
    } | null;
  } | null;
  
  initiating_leader?: {
    name: string;
  } | null;
}

const fetchSwapRequests = async (userId: string | undefined): Promise<SwapRequestWithDetails[]> => {
  if (!userId) return []; 

  const { data, error } = await supabase
    .from('schedule_swaps')
    .select(`
      id,
      status,
      created_at,
      initiating_leader_id,
      initiating_schedule:schedules!initiating_schedule_id (
        id,
        date,
        group:groups (id, name)
      ),
      target_schedule:schedules!target_schedule_id (
        id,
        date,
        group:groups (id, name)
      ),
      initiating_leader:profiles!initiating_leader_id ( name )
    `)
    .eq('target_leader_id', userId) 
    .eq('status', 'pending') 
    .order('created_at', { ascending: false }); 

  if (error) {
    console.error("Erro ao buscar solicitações de troca:", error);
    throw new Error(error.message);
  }

  
  return (data?.filter(req => req.initiating_schedule && req.target_schedule) as unknown as SwapRequestWithDetails[]) || [];
};

export const useSwapRequests = () => {
  const { user } = useAuth();
  return useQuery<SwapRequestWithDetails[], Error>({
    queryKey: ['swapRequests', user?.id], 
    queryFn: () => fetchSwapRequests(user?.id),
    enabled: !!user, 
    staleTime: 5 * 60 * 1000, 
  });
};