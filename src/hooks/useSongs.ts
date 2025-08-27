import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { Song, SongStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SONGS_PER_PAGE = 5;

export const useAllSongs = (page: number, searchTerm: string) => {
  return useQuery<{ songs: Song[], count: number }, Error>({
    queryKey: ['songs', 'all', page, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * SONGS_PER_PAGE;
      const to = page * SONGS_PER_PAGE - 1;
      query = query.range(from, to);

      query = query.order('title', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      return { songs: data || [], count: count || 0 };
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
      const status: SongStatus = user?.role === 'worship_director' ? 'approved' : 'pending';

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

export const useUpdateSong = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...songData }: Partial<Song>) => {
            if (!id) throw new Error("ID da música é obrigatório para atualização.");
            
            const { data, error } = await supabase
                .from('songs')
                .update(songData)
                .eq('id', id)
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