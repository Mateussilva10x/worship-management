/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { Schedule, ParticipationStatus } from '../types';
import { useGroups } from './useGroups'; 

const fetchSchedules = async (): Promise<Schedule[]> => {
  const { data, error } = await supabase
    .from('schedules')
    .select(`
      id, date, created_at,
      group:groups (*),
      schedule_songs ( song_id ),
      schedule_participants ( user_id, status )
    `)
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((s: any) => ({
    id: s.id,
    date: s.date,
    group: s.group,
    songs: s.schedule_songs.map((song: any) => song.song_id),
    membersStatus: s.schedule_participants.map((p: any) => ({
      memberId: p.user_id,
      status: p.status,
    })),
  }));
};


export const useSchedules = () => {
  return useQuery<Schedule[], Error>({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const { data: groups } = useGroups();

  return useMutation({
    mutationFn: async (scheduleData: { date: string; worshipGroupId: string; }) => {
      const group = groups?.find((g) => g.id === scheduleData.worshipGroupId);
      if (!group) throw new Error("Grupo selecionado não foi encontrado.");

      const { data: newSchedule, error: scheduleError } = await supabase
        .from('schedules')
        .insert({ date: scheduleData.date, group_id: scheduleData.worshipGroupId })
        .select()
        .single();
      if (scheduleError) throw scheduleError;

      const participantsToInsert = group.members.map((memberId) => ({
        schedule_id: newSchedule.id,
        user_id: memberId,
        status: 'pending' as ParticipationStatus,
      }));
      if (participantsToInsert.length > 0) {
        const { error } = await supabase.from('schedule_participants').insert(participantsToInsert);
        if (error) throw error;
      }

      try {
        const targetMembers = group.members;
        if (targetMembers.length > 0) {
          const { error: invokeError } = await supabase.functions.invoke('send-notification', {
            body: {
              targetUserIds: targetMembers,
              title: 'Nova Escala!',
              message: `Você foi escalado com a equipe "${group.name}" para o dia ${new Date(scheduleData.date).toLocaleDateString()}.`,
              url: `${window.location.origin}/dashboard`
            },
          });
          if (invokeError) throw invokeError;
        }
      } catch (error) {
        console.error("[OneSignal] AVISO: A escala foi criada, mas a notificação falhou:", error);
      }

      return newSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
        console.error("[useCreateSchedule] Erro na mutação:", error);
        alert(`Falha ao criar a escala: ${error.message}`);
    }
  });
};
export const useUpdateMemberStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ scheduleId, memberId, newStatus, reason }: { 
            scheduleId: string; 
            memberId: string; 
            newStatus: ParticipationStatus;
            reason?: string; 
        }) => {
            const updateData: { status: ParticipationStatus; decline_reason?: string | null } = {
                status: newStatus,
                decline_reason: newStatus === 'declined' ? reason : null,
            };

            const { data, error } = await supabase
                .from('schedule_participants')
                .update(updateData)
                .match({ schedule_id: scheduleId, user_id: memberId })
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });
};

export const useUpdateScheduleSongs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ scheduleId, songIds }: { scheduleId: string; songIds: string[] }) => {
            await supabase.from('schedule_songs').delete().eq('schedule_id', scheduleId);

            if (songIds.length > 0) {
                const songsToInsert = songIds.map((songId) => ({
                    schedule_id: scheduleId,
                    song_id: songId,
                }));
                const { error } = await supabase.from('schedule_songs').insert(songsToInsert);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });
};

export const useDeleteSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (scheduleId: string) => {
            const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
    });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ scheduleId, scheduleData }: { 
        scheduleId: string, 
        scheduleData: { date: string; worshipGroupId: string; } 
    }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          date: scheduleData.date,
          group_id: scheduleData.worshipGroupId,
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};