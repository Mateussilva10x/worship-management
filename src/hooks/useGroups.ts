/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { WorshipGroup, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const fetchGroups = async (): Promise<WorshipGroup[]> => {
  const { data, error } = await supabase
    .from('groups')
    .select('*, members:group_members(user_id)')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  
  return data.map((g) => ({
    ...g,
    members: g.members.map((m: any) => m.user_id),
  })) as WorshipGroup[];
};

const fetchGroupById = async (groupId: string): Promise<WorshipGroup> => {
    const { data, error } = await supabase
        .from('groups')
        .select('*, members:group_members(user_id)')
        .eq('id', groupId)
        .single();

    if (error) throw new Error(error.message);

    return {
        ...data,
        members: data.members.map((m: any) => m.user_id),
    } as WorshipGroup;
}



export const useAllGroups = (enabled: boolean) => {
  return useQuery<WorshipGroup[], Error>({
    queryKey: ['groups', 'all'],
    queryFn: fetchGroups,
    enabled,
  });
};

export const useMyGroups = (enabled: boolean) => {
  const { user } = useAuth();
  return useQuery<WorshipGroup[], Error>({
    queryKey: ['groups', 'leader', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('groups')
        .select('*, members:group_members(user_id)')
        .eq('leader_id', user.id)
        .order('name');
      
      if (error) throw new Error(error.message);
      
      return data.map((g: any) => ({
        ...g,
        members: g.members.map((m: any) => m.user_id),
      })) as WorshipGroup[];
    },
    enabled: !!user && enabled,
  });
};

export const useGroups = () => {
  return useQuery<WorshipGroup[], Error>({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });
};

export const useGroup = (groupId: string) => {
    return useQuery<WorshipGroup, Error>({
        queryKey: ['group', groupId],
        queryFn: () => fetchGroupById(groupId),
        enabled: !!groupId, 
    });
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newGroup: { name: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .insert(newGroup)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};



export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};


export const useUsers = () => {
    return useQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw new Error(error.message);
            return data;
        }
    });
};

export const useUpdateGroupDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupId, details }: { groupId: string; details: { memberIds: string[]; leader_id: string } }) => {
            const { memberIds, leader_id: newLeaderId } = details;

            const { data: currentGroupData, error: currentGroupError } = await supabase
                .from('groups')
                .select('leader_id, members:group_members(user_id)')
                .eq('id', groupId)
                .single();
            
            if (currentGroupError) throw currentGroupError;
            const oldLeaderId = currentGroupData?.leader_id;
            const oldMemberIds = new Set(currentGroupData?.members.map((m: any) => m.user_id) || []);

            await supabase
                .from('groups')
                .update({ leader_id: newLeaderId || null })
                .eq('id', groupId);

            await supabase.from("group_members").delete().eq("group_id", groupId);
            if (memberIds.length > 0) {
                const membersToInsert = memberIds.map((userId) => ({ group_id: groupId, user_id: userId }));
                await supabase.from("group_members").insert(membersToInsert);
            }
            
            if (newLeaderId) {
                const { error: promoteError } = await supabase
                    .from('profiles')
                    .update({ role: 'leader' })
                    .eq('id', newLeaderId);
                if (promoteError) console.error("Falha ao promover novo líder:", promoteError);
            }
            
            if (oldLeaderId && oldLeaderId !== newLeaderId) {
                const { count, error: countError } = await supabase
                    .from('groups')
                    .select('id', { count: 'exact' })
                    .eq('leader_id', oldLeaderId);
                
                if (countError) console.error("Falha ao verificar outros grupos do líder antigo:", countError);
                
                if (count === 0) {
                    const { error: demoteError } = await supabase
                        .from('profiles')
                        .update({ role: 'member' })
                        .eq('id', oldLeaderId);
                    if (demoteError) console.error("Falha ao rebaixar líder antigo:", demoteError);
                }
            }

            const newMemberIds = new Set(memberIds);
            const addedMemberIds = memberIds.filter(id => !oldMemberIds.has(id));
            const removedMemberIds = [...oldMemberIds].filter(id => !newMemberIds.has(id));

            const today = new Date().toISOString().split('T')[0];
            const { data: futureSchedules } = await supabase
                .from('schedules')
                .select('id')
                .eq('group_id', groupId)
                .gte('date', today);
            
            if (futureSchedules && futureSchedules.length > 0) {
                const scheduleIds = futureSchedules.map(s => s.id);

                if (addedMemberIds.length > 0) {
                    const participantsToInsert = scheduleIds.flatMap(scheduleId => 
                        addedMemberIds.map(memberId => ({ schedule_id: scheduleId, user_id: memberId, status: 'pending' as const }))
                    );
                    await supabase.from('schedule_participants').insert(participantsToInsert);
                }

                if (removedMemberIds.length > 0) {
                    await supabase
                        .from('schedule_participants')
                        .delete()
                        .in('schedule_id', scheduleIds)
                        .in('user_id', removedMemberIds);
                }
            }

            return { success: true };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};
