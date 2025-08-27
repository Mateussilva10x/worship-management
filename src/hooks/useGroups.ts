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
          const { memberIds, leader_id } = details;

          const { data: currentGroupData } = await supabase
            .from('groups')
            .select('members:group_members(user_id)')
            .eq('id', groupId)
            .single();

        const oldMemberIds = new Set(currentGroupData?.members.map((m: any) => m.user_id) || []);
        const addedMemberIds = memberIds.filter(id => !oldMemberIds.has(id));

        const { data: updatedGroupData, error: groupError } = await supabase
            .from('groups')
            .update({ leader_id: leader_id || null })
            .eq('id', groupId)
            .select()
            .single();
        if (groupError) throw groupError;

        await supabase.from("group_members").delete().eq("group_id", groupId);
        if (memberIds.length > 0) {
            const membersToInsert = memberIds.map((userId) => ({ group_id: groupId, user_id: userId }));
            const { error: membersError } = await supabase.from("group_members").insert(membersToInsert);
            if (membersError) throw membersError;
        }

      
        if (leader_id) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'leader' })
                .eq('id', leader_id);      

            if (profileError) {
                console.error("Falha ao promover o novo líder:", profileError);
              
            }
        }
        
      
        if (addedMemberIds.length > 0) {
            const today = new Date().toISOString().split('T')[0];

            const { data: futureSchedules } = await supabase
                .from('schedules')
                .select('id')
                .eq('group_id', groupId)
                .gte('date', today);

            if (futureSchedules && futureSchedules.length > 0) {
                const participantsToInsert = futureSchedules.flatMap(schedule => 
                    addedMemberIds.map(memberId => ({
                        schedule_id: schedule.id,
                        user_id: memberId,
                        status: 'pending' as const
                    }))
                );

                if (participantsToInsert.length > 0) {
                    const { error: insertError } = await supabase.from('schedule_participants').insert(participantsToInsert);
                    if (insertError) {
                        console.error("Failed to add new members to existing schedules:", insertError);
                    }
                }
            }
        }

        return { ...updatedGroupData, members: memberIds };
    },
    onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
    }
});
};
