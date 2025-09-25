/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import type {
  Schedule,
  WorshipGroup,
  User,
  Song,
  ParticipationStatus,
} from "../../types";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import { generateSchedulePdf } from "../../utils/pdfGenerator";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

interface ScheduleDetailViewProps {
  schedule: Schedule;
  group: WorshipGroup | undefined;
  users: User[];
  songs: Song[];
  onClose: () => void;
  canEditSongs: boolean;
  canDeleteSchedule: boolean;
  onEditSongs: () => void;
  onDelete: (scheduleId: string) => Promise<void>;
}

const ScheduleDetailView: React.FC<ScheduleDetailViewProps> = ({
  schedule,
  group,
  users,
  songs,
  onClose,
  canEditSongs,
  canDeleteSchedule,
  onEditSongs,
  onDelete,
}) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const statusMap: Record<
    ParticipationStatus,
    { label: string; color: "success" | "error" | "warning" }
  > = {
    confirmed: { label: t("single_confirmed"), color: "success" },
    declined: { label: t("single_declined"), color: "error" },
    pending: { label: t("single_pending"), color: "warning" },
  };

  const scheduleSongs = schedule.songs
    .map((songId) => songs.find((s) => s.id === songId))
    .filter(Boolean) as Song[];

  const memberDetails = schedule.membersStatus.map((memberStatus) => {
    const user = users.find((u) => u.id === memberStatus.memberId);
    return {
      user,
      status: memberStatus.status,
    };
  });

  const handleExportPdf = () => {
    if (group && schedule) {
      const scheduleSongs = schedule.songs
        .map((songId) => songs.find((s) => s.id === songId))
        .filter(Boolean) as Song[];
      generateSchedulePdf(schedule, group, scheduleSongs, users);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(schedule.id);
      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      alert("Falha ao excluir a escala.");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" id="schedule-detail-title">
          {t("scheduleDetails")}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportPdf}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
          <IconButton onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {new Date(`${schedule.date}T00:00:00`).toLocaleString(i18n.language, {
          dateStyle: "full",
        })}
      </Typography>
      <Typography variant="body1">
        {t("team")}: {group?.name || "N/A"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {scheduleSongs.length > 0 ? (
        <>
          <Typography variant="subtitle1" gutterBottom>
            {t("songs")}
          </Typography>
          <List dense>
            {scheduleSongs.map((song) => (
              <ListItem
                key={song.id}
                secondaryAction={
                  <>
                    <Tooltip title="Ver Cifra">
                      <IconButton
                        size="small"
                        component="a"
                        href={song.chart_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!song.chart_link}
                        color="primary"
                      >
                        <LibraryMusicIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ouvir Música">
                      <IconButton
                        size="small"
                        component="a"
                        href={song.song_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!song.song_link}
                        color="primary"
                      >
                        <YouTubeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 30, height: 30 }}
                  >
                    <MusicNoteIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={song.title}
                  secondary={`Tom: ${song.key}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Typography variant="subtitle1" gutterBottom>
          {t("noSongsToSchedule")}
        </Typography>
      )}

      {user?.role !== "member" && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            {t("teamMembers")}
          </Typography>
          <List>
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
                <ListItemText primary={user?.name || t("userNotFound")} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {canEditSongs && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEditSongs}
          >
            {t("editSongs")}
          </Button>
        )}
        {canDeleteSchedule && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsConfirmOpen(true)}
          >
            {t("deleteSchedule")}
          </Button>
        )}
      </Box>
      <ConfirmationDialog
        open={isConfirmOpen}
        title={t("confirmDelete")}
        message={t("confirmDeleteMessage")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Box>
  );
};

export default ScheduleDetailView;
