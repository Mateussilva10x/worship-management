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
  Tooltip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockResetIcon from "@mui/icons-material/LockReset";

import NewUserForm from "../components/users/NewUserForm";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import { Trans, useTranslation } from "react-i18next";
import {
  useUsers,
  useCreateUser,
  useAdminResetPassword,
} from "../hooks/useUsers";
import type { User } from "../types";
import AdminResetPasswordModal from "../components/users/AdminResetPasswordModal";

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
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const createUserMutation = useCreateUser();
  const adminResetPasswordMutation = useAdminResetPassword();

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
          `Olá ${formData.name}! Sua conta no sistema "Worship Management" foi criada. E-mail: ${formData.email} | Senha Temporária: ${tempPassword}, URL: https://wmanagement.vercel.app/login`
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

  const handleConfirmResetPassword = async (
    userId: string,
    newPassword: string
  ) => {
    await adminResetPasswordMutation.mutateAsync(
      { userIdToReset: userId, newPassword },
      {
        onSuccess: () => {
          showNotification("Senha redefinida com sucesso!", "success");
          setUserToReset(null);
        },
        onError: (err: any) =>
          showNotification(`Erro: ${err.message}`, "error"),
      }
    );
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
                    <TableCell align="right">
                      <Tooltip title="Resetar Senha">
                        <IconButton onClick={() => setUserToReset(user)}>
                          <LockResetIcon />
                        </IconButton>
                      </Tooltip>
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

      <AdminResetPasswordModal
        open={!!userToReset}
        onClose={() => setUserToReset(null)}
        user={userToReset}
        onSubmit={handleConfirmResetPassword}
      />
    </Box>
  );
};

export default UsersPage;
