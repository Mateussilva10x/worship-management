import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Autocomplete,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type {
  Schedule,
  Song,
  User,
  WorshipGroup,
  ParticipationStatus,
} from "../../types";
import { useTranslation } from "react-i18next";

interface EditScheduleSongsProps {
  schedule: Schedule;
  allSongs: Song[];
  group: WorshipGroup | undefined;
  users: User[];
  onSave: (scheduleId: string, newSongIds: string[]) => Promise<void>;
  onClose: () => void;
}

const EditScheduleSongs: React.FC<EditScheduleSongsProps> = ({
  schedule,
  allSongs,
  group,
  users,
  onSave,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const statusMap: Record<
    ParticipationStatus,
    { label: string; color: "success" | "error" | "warning" }
  > = {
    confirmed: { label: t("confirmed"), color: "success" },
    declined: { label: t("declined"), color: "error" },
    pending: { label: t("pending"), color: "warning" },
  };

  useEffect(() => {
    const currentSongs = allSongs.filter((song) =>
      schedule.songs.includes(song.id)
    );
    setSelectedSongs(currentSongs);
  }, [schedule, allSongs]);

  const handleSave = async () => {
    setIsSaving(true);
    const newSongIds = selectedSongs.map((song) => song.id);
    await onSave(schedule.id, newSongIds);
    setIsSaving(false);
  };

  const memberDetails = schedule.membersStatus.map((memberStatus) => ({
    user: users.find((u) => u.id === memberStatus.memberId),
    status: memberStatus.status,
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t("editScheduleSongs")}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {new Date(schedule.date).toLocaleString(i18n.language, {
          dateStyle: "full",
          timeStyle: "short",
        })}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("team")}: {group?.name || "N/A"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        {t("selectedSongs")}
      </Typography>
      <Autocomplete
        multiple
        options={allSongs}
        getOptionLabel={(option) => option.title}
        value={selectedSongs}
        onChange={(_, newValue) => {
          setSelectedSongs(newValue);
        }}
        renderInput={(params) => (
          <TextField {...params} label={t("selectSongs")} />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        {t("teamStatus")}
      </Typography>
      <List dense>
        {memberDetails.map(({ user, status }) => (
          <ListItem
            key={user?.id}
            secondaryAction={
              <Chip
                label={statusMap[status].label}
                color={statusMap[status].color}
                size="small"
              />
            }
          >
            <ListItemText primary={user?.name} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
        <Button onClick={onClose} color="secondary" disabled={isSaving}>
          {t("cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? t("saving") : t("save")}
        </Button>
      </Box>
    </Box>
  );
};

export default EditScheduleSongs;
