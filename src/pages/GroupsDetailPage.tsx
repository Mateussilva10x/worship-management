/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Autocomplete,
  TextField,
  Snackbar,
} from "@mui/material";
import type { WorshipGroup, User } from "../types";
import {
  fetchGroupById,
  fetchUsers,
  updateGroupMembers,
} from "../services/api";

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<WorshipGroup | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [groupData, usersData] = await Promise.all([
        fetchGroupById(groupId),
        fetchUsers(),
      ]);

      if (groupData) {
        setGroup(groupData);

        const currentMembers = usersData.filter((user) =>
          groupData.members.includes(user.id)
        );
        setSelectedMembers(currentMembers);
      } else {
        setError("Grupo não encontrado.");
      }

      setAllUsers(usersData.filter((u) => u.role === "member"));
    } catch (err) {
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    const memberIds = selectedMembers.map((member) => member.id);
    try {
      await updateGroupMembers(groupId, memberIds);
      setSnackbarOpen(true);

      loadData();
    } catch (err) {
      alert("Falha ao salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editando Grupo: {group?.name}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Membros da Equipe
        </Typography>
        <Autocomplete
          multiple
          options={allUsers}
          getOptionLabel={(option) => option.name}
          value={selectedMembers}
          onChange={(_event, newValue) => {
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
          <Button variant="outlined" onClick={() => navigate("/groups")}>
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
