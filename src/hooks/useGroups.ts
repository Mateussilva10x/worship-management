/* eslint-disable @typescript-eslint/no-explicit-any */


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { WorshipGroup, User } from '../types';


interface GroupUpdateDetails {
  memberIds: string[];
  leader_id: string;
}

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

export const useUpdateGroupDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupId, details }: { groupId: string; details: GroupUpdateDetails }) => {
            const { memberIds, leader_id } = details;

            
            const { data: updatedGroupData, error: groupError } = await supabase
                .from('groups')
                .update({ leader_id: leader_id || null })
                .eq('id', groupId)
                .select()
                .single();
            if (groupError) throw groupError;

            
            await supabase.from('group_members').delete().eq('group_id', groupId);

            
            if (memberIds.length > 0) {
                const membersToInsert = memberIds.map((userId) => ({
                    group_id: groupId,
                    user_id: userId,
                }));
                const { error: membersError } = await supabase
                    .from('group_members')
                    .insert(membersToInsert);
                if (membersError) throw membersError;
            }

            return { ...updatedGroupData, members: memberIds };
        },
        onSuccess: (_data, variables) => {
            
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
        }
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