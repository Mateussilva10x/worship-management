import React, { useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useSchedules } from "../../hooks/useSchedule";
import { useCreateSwapRequest } from "../../hooks/useCreateSwapRequest";
import { useAuth } from "../../contexts/AuthContext";
import type { Schedule } from "../../types";
import { useTranslation } from "react-i18next";

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
  maxHeight: "90vh",
  overflowY: "auto",
};

interface RequestSwapModalProps {
  open: boolean;
  onClose: () => void;
  initiatingSchedule: Schedule | null;
}

const RequestSwapModal: React.FC<RequestSwapModalProps> = ({
  open,
  onClose,
  initiatingSchedule,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: allSchedules = [], isLoading: isLoadingSchedules } =
    useSchedules();
  const createSwapMutation = useCreateSwapRequest();
  const [selectedTargetScheduleId, setSelectedTargetScheduleId] = useState<
    string | null
  >(null);

  const eligibleSchedules = useMemo(() => {
    if (!initiatingSchedule || !user) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allSchedules
      .filter(
        (schedule) =>
          new Date(schedule.date + "T12:00:00") >= today &&
          schedule.id !== initiatingSchedule.id &&
          schedule.group?.leader_id !== user.id
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allSchedules, initiatingSchedule, user]);

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedTargetScheduleId(scheduleId);
  };

  const handleSubmit = () => {
    if (!initiatingSchedule || !selectedTargetScheduleId) return;

    createSwapMutation.mutate(
      {
        initiating_schedule_id: initiatingSchedule.id,
        target_schedule_id: selectedTargetScheduleId,
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedTargetScheduleId(null);
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedTargetScheduleId(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          {t("requestScheduleSwapTitle")}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {t("requestSwapInstructions")}{" "}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sua escala: {initiatingSchedule?.group?.name} (
          {initiatingSchedule
            ? new Date(
                `${initiatingSchedule.date}T12:00:00`
              ).toLocaleDateString(i18n.language)
            : ""}
          )
        </Typography>

        {isLoadingSchedules ? (
          <CircularProgress />
        ) : eligibleSchedules.length === 0 ? (
          <Alert severity="info">{t("noEligibleSchedulesForSwap")}</Alert>
        ) : (
          <Paper sx={{ maxHeight: 300, overflow: "auto", mb: 2 }}>
            <List dense>
              {eligibleSchedules.map((schedule) => (
                <ListItemButton
                  key={schedule.id}
                  selected={selectedTargetScheduleId === schedule.id}
                  onClick={() => handleSelectSchedule(schedule.id)}
                >
                  <ListItemText
                    primary={schedule.group?.name || "Grupo Desconhecido"}
                    secondary={new Date(
                      `${schedule.date}T12:00:00`
                    ).toLocaleDateString(i18n.language)}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={createSwapMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !selectedTargetScheduleId ||
              createSwapMutation.isPending ||
              eligibleSchedules.length === 0
            }
          >
            {createSwapMutation.isPending ? t("sending") : t("sendRequest")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RequestSwapModal;
