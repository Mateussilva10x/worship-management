import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { User } from "../../types";

interface AdminResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (userId: string, newPassword: string) => Promise<void>;
}

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

const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  open,
  onClose,
  user,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      alert("A senha temporária deve ter pelo menos 6 caracteres.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(user.id, newPassword);
    setIsSubmitting(false);
    setNewPassword("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Resetar Senha</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
          Você está definindo uma nova senha temporária para{" "}
          <strong>{user.name}</strong>. O usuário será forçado a alterá-la no
          próximo login.
        </Typography>

        <TextField
          label="Nova Senha Temporária"
          type="text"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoFocus
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              "Salvar Nova Senha"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdminResetPasswordModal;
