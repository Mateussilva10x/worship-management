import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Typography, Box, Paper } from "@mui/material";

const AdminDashboard = () => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h5">Painel do Administrador</Typography>
    <Typography>
      Aqui você poderá gerenciar escalas, grupos e músicas.
    </Typography>
  </Paper>
);

const MemberDashboard = () => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h5">Meu Painel</Typography>
    <Typography>Bem-vindo! Veja aqui suas próximas escalas.</Typography>
  </Paper>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao sistema!
      </Typography>

      {user?.role === "admin" ? <AdminDashboard /> : <MemberDashboard />}
    </Box>
  );
};

export default DashboardPage;
