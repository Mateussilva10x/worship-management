import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

/**
 * @description
 * Este componente verifica o estado de autenticação antes de renderizar uma rota.
 * - Se o contexto ainda estiver carregando (verificando o localStorage), exibe um spinner.
 * - Se o usuário não estiver autenticado, redireciona para a página de login.
 * - Se o usuário estiver autenticado, renderiza o conteúdo da rota filha (através do <Outlet />).
 * @returns {JSX.Element} O conteúdo da rota ou um redirecionamento.
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
