import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * @description
 * Se o usuário já estiver autenticado, redireciona para o painel.
 * Caso contrário, permite o acesso à rota filha (ex: página de login).
 * Impede que um usuário logado acesse a página de login novamente.
 */
const RedirectIfAuth: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuth;
