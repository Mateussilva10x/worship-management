/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Autocomplete,
  TextField,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { User } from "../types";
import { useData } from "../contexts/DataContext";

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const {
    groups,
    users,
    updateGroupDetails,
    loading: isDataContextLoading,
  } = useData();

  const group = useMemo(
    () => groups.find((g) => g.id === groupId),
    [groups, groupId]
  );

  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [leader_id, setleader_id] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (group) {
      const currentMembers = users.filter((user) =>
        group.members.includes(user.id)
      );
      setSelectedMembers(currentMembers);
      setleader_id(group.leader_id || "");
    }
  }, [group, users]);

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    const memberIds = selectedMembers.map((member) => member.id);
    try {
      await updateGroupDetails(groupId, { memberIds, leader_id });
      setSnackbarOpen(true);
    } catch (err: any) {
      alert(`Falha ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isDataContextLoading) {
    return <CircularProgress />;
  }

  if (!group) {
    return (
      <Alert severity="error">
        Grupo não encontrado ou você não tem permissão para vê-lo.
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
            if (!newValue.some((member) => member.id === leader_id)) {
              setleader_id("");
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Selecionar Membros" />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel id="leader-select-label">Líder da Equipe</InputLabel>
          <Select
            labelId="leader-select-label"
            value={leader_id}
            label="Líder da Equipe"
            onChange={(e) => setleader_id(e.target.value as string)}
            disabled={selectedMembers.length === 0}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {selectedMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
