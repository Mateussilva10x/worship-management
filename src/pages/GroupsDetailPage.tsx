/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Paper,
  Button,
  Autocomplete,
  TextField,
  Snackbar,
} from "@mui/material";
import type { User } from "../types";
import { useData } from "../contexts/DataContext";

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { groups, users, updateGroupMembers } = useData();

  const group = useMemo(
    () => groups.find((g) => g.id === groupId),
    [groups, groupId]
  );

  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (group) {
      const currentMembers = users.filter((user) =>
        group.members.includes(user.id)
      );
      setSelectedMembers(currentMembers);
    }
  }, [group, users]);

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    const memberIds = selectedMembers.map((member) => member.id);
    try {
      await updateGroupMembers(groupId, memberIds);
      setSnackbarOpen(true);
    } catch (err: any) {
      alert(`Falha ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!group) {
    return (
      <Alert severity="error">
        Grupo não encontrado. Verifique o endereço e tente novamente.
      </Alert>
    );
  }

  const memberOptions = users.filter((u) => u.role === "member");

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editando Grupo: {group.name}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Membros da Equipe
        </Typography>
        <Autocomplete
          multiple
          options={memberOptions}
          getOptionLabel={(option) => option.name}
          value={selectedMembers}
          onChange={(_, newValue) => {
            setSelectedMembers(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Selecionar Membros"
              placeholder="Digite para buscar..."
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/grupos")}>
            Voltar
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Grupo atualizado com sucesso!"
      />
    </Box>
  );
};

export default GroupDetailPage;
