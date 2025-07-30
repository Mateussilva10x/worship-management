import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";

interface NewUserFormProps {
  onSubmit: (formData: { name: string; email: string }) => Promise<void>;
  onCancel: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Cadastrar Novo Membro
      </Typography>
      <TextField
        name="name"
        label="Nome Completo"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        autoFocus
        sx={{ mb: 2 }}
      />
      <TextField
        name="email"
        type="email"
        label="E-mail"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button onClick={onCancel} color="secondary" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Criar Membro"}
        </Button>
      </Box>
    </Box>
  );
};

export default NewUserForm;
