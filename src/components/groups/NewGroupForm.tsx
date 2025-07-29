import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";

interface NewGroupFormProps {
  onSubmit: (formData: { name: string }) => Promise<void>;
  onCancel: () => void;
}

const NewGroupForm: React.FC<NewGroupFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      alert("Por favor, insira um nome para o grupo.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit({ name });
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Criar Novo Grupo
      </Typography>
      <TextField
        label="Nome do Grupo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        autoFocus
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
          {isSubmitting ? "Salvando..." : "Salvar Grupo"}
        </Button>
      </Box>
    </Box>
  );
};

export default NewGroupForm;
