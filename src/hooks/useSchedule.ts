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

          const scheduleDateFormatted = new Date(scheduleData.date).toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #f4f1e9;">
              <div style="background-color: #388E3C; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">📄 Nova Escala Disponível</h1>
              </div>
              <div style="padding: 24px; color: #333; line-height: 1.6;">
                <p style="font-size: 16px;">Olá, irmão(ã)!</p>
                <p>Uma nova escala foi publicada para o seu Grupo.</p>
                
                <h2 style="font-size: 20px; color: #333; margin-top: 20px; margin-bottom: 10px;">Grupo: ${group.name}</h2> 
                
                <div style="background-color: #4CAF50; color: white; padding: 16px; border-radius: 8px; font-size: 14px;">
                  <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${scheduleDateFormatted}</p>
                </div>

                <div style="background-color: #FFF9C4; border-left: 5px solid #FBC02D; padding: 10px 15px; margin-top: 20px; font-size: 14px;">
                  <p style="margin: 0;"><strong>Importante:</strong> Por favor, confirme a sua presença ou avise com antecedência caso não possa comparecer.</p>
                </div>
                
                <p style="margin-top: 25px;">Que Deus abençoe!</p>
                <p><strong>Worship Management IPC</strong></p>
              </div>
            </div>
          `;

          const { error: invokeError } = await supabase.functions.invoke('send-resend-notification', {
            body: {
              targetUserIds: targetMembers,
              subject: `Nova Escala: ${group.name} - ${new Date(scheduleData.date).toLocaleDateString()}`,
              htmlBody: emailHtml,
            },
          });

          if (invokeError) throw invokeError;
          console.log('[Resend] Função invocada com sucesso (template simples).');

        }
      } catch (error) {
        console.error("[Resend] AVISO: A escala foi criada, mas a notificação por e-mail falhou:", error);
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