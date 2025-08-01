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
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { generateSchedulePdf } from "../../utils/pdfGenerator";
import ConfirmationDialog from "../common/ConfirmationDialog";

const statusMap: Record<
  ParticipationStatus,
  { label: string; color: "success" | "error" | "warning" }
> = {
  confirmed: { label: "Confirmado", color: "success" },
  declined: { label: "Recusado", color: "error" },
  pending: { label: "Pendente", color: "warning" },
};

interface ScheduleDetailViewProps {
  schedule: Schedule;
  group: WorshipGroup | undefined;
  users: User[];
  songs: Song[];
  onClose: () => void;
  deleteSchedule: (scheduleId: string) => Promise<void>;
}

const ScheduleDetailView: React.FC<ScheduleDetailViewProps> = ({
  schedule,
  group,
  users,
  songs,
  onClose,
  deleteSchedule,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
      await deleteSchedule(schedule.id);
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
          Detalhes da Escala
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
        {new Date(schedule.date).toLocaleString("pt-BR", {
          dateStyle: "full",
          timeStyle: "short",
        })}
      </Typography>
      <Typography variant="body1">Equipe: {group?.name || "N/A"}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Músicas
      </Typography>
      <List dense>
        {scheduleSongs.map((song) => (
          <ListItem key={song.id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
                <MusicNoteIcon fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={song.title} secondary={`Tom: ${song.key}`} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Membros da Equipe
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
            <ListItemText primary={user?.name || "Usuário não encontrado"} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setIsConfirmOpen(true)}
        >
          Excluir Escala
        </Button>
      </Box>
      <ConfirmationDialog
        open={isConfirmOpen}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Box>
  );
};

export default ScheduleDetailView;
