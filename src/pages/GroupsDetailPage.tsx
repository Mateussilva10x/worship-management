/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { User } from "../types";
import { useGroup, useUsers, useUpdateGroupDetails } from "../hooks/useGroups";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import { POSITION_KEYS } from "../constants";

const GroupDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationDispatch();

  const { data: group, isLoading: isGroupLoading } = useGroup(groupId!);
  const { data: allUsers = [], isLoading: areUsersLoading } = useUsers();
  const updateGroupMutation = useUpdateGroupDetails();

  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [leader_id, setleader_id] = useState<string>("");
  const [memberInput, setMemberInput] = useState("");

  useEffect(() => {
    if (group && allUsers.length > 0) {
      const currentMembers = allUsers.filter((u) =>
        group.members.includes(u.id)
      );
      setSelectedMembers(currentMembers);
      setleader_id(group.leader_id || "");
    }
  }, [group, allUsers]);

  const handleSave = async () => {
    if (!groupId) return;
    const memberIds = selectedMembers.map((member) => member.id);
    await updateGroupMutation.mutateAsync(
      { groupId, details: { memberIds, leader_id } },
      {
        onSuccess: () => {
          showNotification("Grupo atualizado com sucesso!", "success");
          navigate("/groups");
        },
        onError: (err: any) =>
          showNotification(`Falha ao salvar: ${err.message}`, "error"),
      }
    );
  };

  const handleRemoveMember = (memberToRemove: User) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => member.id !== memberToRemove.id)
    );
    if (leader_id === memberToRemove.id) {
      setleader_id("");
    }
  };

  const isLoading = isGroupLoading || areUsersLoading;
  if (isLoading) return <CircularProgress />;
  if (!group) return <Alert severity="error">Grupo não encontrado.</Alert>;

  const memberOptions = allUsers.filter(
    (u) =>
      (u.role === "member" || u.role === "leader") &&
      !selectedMembers.some((sm) => sm.id === u.id)
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t("editGroup")}: {group.name}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("teamMembers")}
        </Typography>

        <Autocomplete
          disableClearable
          options={memberOptions}
          getOptionLabel={(option) => option.name}
          inputValue={memberInput}
          onInputChange={(_event, newInputValue, reason) => {
            if (reason === "input") {
              setMemberInput(newInputValue);
            }
          }}
          onChange={(_, newValue) => {
            if (newValue) {
              setSelectedMembers((prev) => [...prev, newValue]);
              setMemberInput("");
            }
          }}
          renderOption={(props, option) => {
            let translatedPositions = t("positions.noneDefined");
            const userPositionsCount = option.positions?.length || 0;
            const totalPositionsCount = POSITION_KEYS.length;

            if (userPositionsCount === totalPositionsCount) {
              translatedPositions = t("positions.all");
            } else if (userPositionsCount > 0) {
              translatedPositions = option
                .positions!.map((key) =>
                  t(`positions.${key}`, { defaultValue: key })
                )
                .join(", ");
            }

            return (
              <Box component="li" {...props}>
                <ListItemText
                  primary={option.name}
                  secondary={translatedPositions}
                />
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label={t("addMembers")} />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{ mb: 2 }}
        />

        <List>
          {selectedMembers.map((member) => (
            <ListItem
              key={member.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="Remover"
                  onClick={() => handleRemoveMember(member)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              <ListItemText
                primary={member.name}
                secondary={(() => {
                  const userPositionsCount = member.positions?.length || 0;
                  const totalPositionsCount = POSITION_KEYS.length;

                  if (userPositionsCount === totalPositionsCount) {
                    return t("positions.all", "Todas as Posições");
                  }

                  if (userPositionsCount === 0) {
                    return t(
                      "positions.noneDefined",
                      "Nenhuma posição definida"
                    );
                  }

                  return member
                    .positions!.map((key) =>
                      t(`positions.${key}`, { defaultValue: key })
                    )
                    .join(", ");
                })()}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="leader-select-label">{t("teamLeader")}</InputLabel>
          <Select
            labelId="leader-select-label"
            value={leader_id}
            label={t("teamLeader")}
            onChange={(e) => setleader_id(e.target.value as string)}
            disabled={selectedMembers.length === 0}
          >
            <MenuItem value="">
              <em>{t("none")}</em>
            </MenuItem>
            {selectedMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateGroupMutation.isPending}
          >
            {updateGroupMutation.isPending ? t("saving") : t("save")}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/groups")}>
            {t("cancel")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GroupDetailPage;
