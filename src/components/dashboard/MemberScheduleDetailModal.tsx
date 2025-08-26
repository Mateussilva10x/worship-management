import React from "react";
import type { Schedule, Song, User, ParticipationStatus } from "../../types";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdateMemberStatus } from "../../hooks/useSchedule";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../../contexts/NotificationContext";

interface MemberScheduleDetailModalProps {
  open: boolean;
  onClose: () => void;
  schedule: Schedule;
  songs: Song[];
  user: User | null;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const MemberScheduleDetailModal: React.FC<MemberScheduleDetailModalProps> = ({
  open,
  onClose,
  schedule,
  songs,
  user,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationDispatch();
  const updateStatusMutation = useUpdateMemberStatus();

  const myStatus =
    schedule.membersStatus.find((ms) => ms.memberId === user?.id)?.status ||
    "pending";

  const handleStatusUpdate = async (newStatus: ParticipationStatus) => {
    if (!user) return;

    await updateStatusMutation.mutateAsync(
      { scheduleId: schedule.id, memberId: user.id, newStatus },
      {
        onSuccess: () => {
          showNotification("Status atualizado com sucesso!", "success");
          onClose();
        },
        onError: (err: any) => {
          showNotification(`Erro ao atualizar status: ${err.message}`, "error");
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t("scheduleDetails")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          {t("songs")}
        </Typography>
        <List dense>
          {songs.map((song) => (
            <ListItem key={song.id}>
              <MusicNoteIcon color="primary" sx={{ mr: 2 }} />
              <ListItemText
                primary={song.title}
                secondary={`${song.artist} - Tom: ${song.key}`}
              />
            </ListItem>
          ))}
          {songs.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhuma música definida para esta escala." />
            </ListItem>
          )}
        </List>
        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="flex-end" gap={1}>
          {updateStatusMutation.isPending ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusUpdate("confirmed")}
                disabled={myStatus === "confirmed"}
              >
                {t("confirm")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusUpdate("declined")}
                disabled={myStatus === "declined"}
              >
                {t("decline")}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default MemberScheduleDetailModal;
