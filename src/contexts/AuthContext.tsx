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
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuthUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    console.log(
      "AuthProvider montado. Configurando listener onAuthStateChange..."
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(
          `%cAuth State Mudou! Evento: ${event}`,
          "color: orange; font-weight: bold;",
          session
        );

        if (session?.user) {
          console.log(
            "Sessão encontrada. Buscando perfil para o usuário ID:",
            session.user.id
          );

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error(
              "%cERRO DE BANCO DE DADOS AO BUSCAR PERFIL:",
              "color: red; font-weight: bold;",
              error
            );
            setUser(null);
          } else if (profile) {
            console.log(
              "%cPerfil encontrado com sucesso:",
              "color: green;",
              profile
            );
            setUser(profile);
          } else {
            console.warn(
              "%cAVISO: Perfil não encontrado para o usuário logado.",
              "color: yellow;"
            );
            setUser(null);
          }
        } else {
          console.log("Nenhuma sessão encontrada. Deslogando usuário.");
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      console.log("AuthProvider desmontado. Removendo listener.");
      subscription.unsubscribe();
    };
  }, []);
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const refreshAuthUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
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
