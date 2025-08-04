/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import NewUserForm from "../components/users/NewUserForm";
import { useData } from "../contexts/DataContext";
import { useNotificationDispatch } from "../contexts/NotificationContext";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const UsersPage: React.FC = () => {
  const { users, createUser, loading } = useData();
  const { showNotification } = useNotificationDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
    whatsapp: string;
  }) => {
    try {
      await createUser(formData);
      const numeroDigitado = formData.whatsapp;

      const numeroLimpo = numeroDigitado.replace(/\D/g, "");

      const numeroFinal = numeroLimpo.startsWith("55")
        ? numeroLimpo
        : `55${numeroLimpo}`;

      const tempPassword = "senha123";
      const message = encodeURIComponent(
        `Olá ${formData.name}! Sua conta no sistema "Escala Louvor IPC" foi criada. E-mail: ${formData.email} | Senha Temporária: ${tempPassword}`
      );

      const whatsappUrl = `https://wa.me/${numeroFinal}?text=${message}`;

      showNotification(
        `Usuário criado! Use este link para notificar: ${whatsappUrl}`,
        "success"
      );
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Gestão de Usuários</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Membro
        </Button>
      </Box>

      <Paper>
        {users.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Papel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {user.role}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            Nenhum usuário encontrado.
          </Typography>
        )}
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <NewUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsModalOpen(false)}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default UsersPage;
