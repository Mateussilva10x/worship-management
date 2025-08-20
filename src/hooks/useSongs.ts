import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { Song, SongStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useAllSongs = () => {
  return useQuery<Song[], Error>({
    queryKey: ['songs', 'all'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('songs').select('*').order('title');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};


export const useApprovedSongs = () => {
  return useQuery<Song[], Error>({
    queryKey: ['songs', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('status', 'approved') 
        .order('title');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};


export const useCreateSong = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); 

  return useMutation({
    mutationFn: async (newSongData: Omit<Song, 'id' | 'status'>) => {
      const status: SongStatus = user?.role === 'admin' ? 'approved' : 'pending';
      const { data, error } = await supabase
        .from('songs')
        .insert({ ...newSongData, status })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};


export const useUpdateSongStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ songId, status }: { songId: string, status: SongStatus }) => {
            const { data, error } = await supabase
                .from('songs')
                .update({ status })
                .eq('id', songId)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['songs'] });
        }
    });
};


export const useDeleteSong = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase.from('songs').delete().eq('id', songId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};