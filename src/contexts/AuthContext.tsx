/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { supabase } from "../supabaseClient";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuthUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (isMounted && session?.user) {
          const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id);

          if (profileError) throw profileError;

          if (isMounted) {
            if (profiles && profiles.length > 0) {
              if (profiles.length > 1) {
                console.warn(
                  `AVISO: Múltiplos perfis encontrados para o usuário ID ${session.user.id}. Usando o primeiro.`
                );
              }

              setUser(profiles[0]);
            } else {
              console.warn(
                `AVISO: Usuário autenticado ${session.user.id} não possui um perfil correspondente.`
              );
              setUser(null);
            }
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao resolver a sessão:", error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    resolveSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        resolveSession();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshAuthUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    logout,
    refreshAuthUser,
  };

  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
