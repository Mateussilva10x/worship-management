import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { User } from '../types';


interface NewUserData {
  name: string;
  email: string;
  whatsapp: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const createUser = async (userData: NewUserData) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: userData,
  });
  if (error) throw new Error(error.message);
  return data.user;
};

const updateUserPassword = async ({ userId, password }: { userId: string, password: string }) => {
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) throw authError;

    
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw profileError;
    return updatedProfile;
}

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserPassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUserPassword,
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(['users'], (oldData: User[] | undefined) => 
                oldData ? oldData.map(u => u.id === updatedProfile.id ? updatedProfile : u) : []
            );
        }
    })
}