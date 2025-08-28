/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useUpdateUserPassword } from "../hooks/useUsers";
import { supabase } from "../supabaseClient";

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, refreshAuthUser } = useAuth();
  const navigate = useNavigate();
  const updateUserPasswordMutation = useUpdateUserPassword();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage(
          "Sessão de recuperação iniciada. Por favor, defina sua nova senha."
        );
      }
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (!user) return;

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else if (user) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id)
        .select()
        .single();

      refreshAuthUser(updatedProfile);
      navigate("/");
    } else {
      setMessage(
        "Senha atualizada com sucesso! Redirecionando para o login..."
      );
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ display: "flex", alignItems: "center", height: "100vh" }}
    >
      <Paper sx={{ p: 4, width: "100%" }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {t("changePasswordTitle")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
          align="center"
        >
          {t("changePasswordDescription")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("newPassword")}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t("confirmPassword")}
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {message && !error && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={updateUserPasswordMutation.isPending}
          >
            {updateUserPasswordMutation.isPending ? t("saving") : t("save")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;
