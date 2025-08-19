import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { Song } from '../types';


const fetchSongs = async (): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};


export const useSongs = () => {
  return useQuery<Song[], Error>({
    queryKey: ['songs'], 
    queryFn: fetchSongs,  
  });
};


export const useCreateSong = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSong: Omit<Song, 'id'>) => {
      const { data, error } = await supabase
        .from('songs')
        .insert(newSong)
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