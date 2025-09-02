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
import { useNotificationDispatch } from "../contexts/NotificationContext";
import { Trans, useTranslation } from "react-i18next";
import { useUsers, useCreateUser } from "../hooks/useUsers";

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
  maxHeight: "90vh",
  overflowY: "auto",
};

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: users = [], isLoading } = useUsers();
  const { showNotification } = useNotificationDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createUserMutation = useCreateUser();

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
    whatsapp: string;
  }) => {
    await createUserMutation.mutateAsync(formData, {
      onSuccess: () => {
        const numeroLimpo = formData.whatsapp.replace(/\D/g, "");
        const numeroFinal = numeroLimpo.startsWith("55")
          ? numeroLimpo
          : `55${numeroLimpo}`;
        const tempPassword = "senha123";
        const message = encodeURIComponent(
          `Olá ${formData.name}! Sua conta no sistema "New Worship Management" foi criada. E-mail: ${formData.email} | Senha Temporária: ${tempPassword}, link do sistema: https://nwmanagement-ipc.vercel.app/login`
        );
        const whatsappUrl = `https://wa.me/${numeroFinal}?text=${message}`;

        showNotification(
          <Trans
            i18nKey="userCreatedSuccess"
            components={{
              1: (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", fontWeight: "bold" }}
                />
              ),
            }}
          />,
          "success"
        );
        setIsModalOpen(false);
      },
      onError: (err) => {
        showNotification(err.message, "error");
      },
    });
  };

  if (isLoading) {
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
        <Typography variant="h4">{t("usersPage")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ whiteSpace: "nowrap", px: 4 }}
        >
          {t("newUser")}
        </Button>
      </Box>

      <Paper>
        {users.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t("name")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("email")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{t("role")}</TableCell>
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
            {t("noUsersFound")}
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
