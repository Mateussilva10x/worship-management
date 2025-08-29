import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ParticipationStatus, Schedule } from "../../types";
import { useUpdateMemberStatus } from "../../hooks/useSchedule";
import { useAuth } from "../../contexts/AuthContext";
import { useNotificationDispatch } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";

interface UpdateStatusModalProps {
  schedule: Schedule | null;
  onClose: () => void;
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

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  schedule,
  onClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotificationDispatch();
  const updateStatusMutation = useUpdateMemberStatus();

  const [selectedStatus, setSelectedStatus] =
    useState<ParticipationStatus | null>(null);
  const [reason, setReason] = useState("");

  const myCurrentStatus = schedule?.membersStatus.find(
    (ms) => ms.memberId === user?.id
  )?.status;

  useEffect(() => {
    if (schedule) {
      setSelectedStatus(myCurrentStatus || "pending");
    }
  }, [schedule, myCurrentStatus]);

  if (!schedule || !user) return null;

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    if (selectedStatus === "declined" && !reason.trim()) {
      alert("Por favor, informe o motivo da recusa.");
      return;
    }

    await updateStatusMutation.mutateAsync(
      {
        scheduleId: schedule.id,
        memberId: user.id,
        newStatus: selectedStatus,
        reason: selectedStatus === "declined" ? reason : undefined,
      },
      {
        onSuccess: () => {
          showNotification("Status atualizado com sucesso!");
          onClose();
        },
        onError: (err: any) =>
          showNotification(`Erro: ${err.message}`, "error"),
      }
    );
  };

  return (
    <Modal open={!!schedule} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t("updateScheduleStatus")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("selectYourParticipationStatus")}
        </Typography>

        <ToggleButtonGroup
          value={selectedStatus}
          exclusive
          onChange={(_, newStatus) => {
            if (newStatus) setSelectedStatus(newStatus);
          }}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="confirmed" color="success">
            {t("confirm")}
          </ToggleButton>
          <ToggleButton value="declined" color="error">
            {t("decline")}
          </ToggleButton>
        </ToggleButtonGroup>

        {selectedStatus === "declined" && (
          <TextField
            label={t("reasonForDeclining")}
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose} color="secondary">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("save")
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateStatusModal;
