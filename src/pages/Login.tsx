import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Link,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import logoIPC from "../assets/church-logo.svg";
import { Link as RouterLink } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message || "E-mail ou senha inválidos.");
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <img
            src={logoIPC}
            alt="Logo da igreja"
            style={{
              maxWidth: "100%",
              width: "200px",
              height: "auto",
              marginBottom: "4px",
            }}
          />
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Entrar"
            )}
          </Button>
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Grid>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
              >
                Esqueceu sua senha?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
