import React from "react";
import type { Schedule, ParticipationStatus } from "../../types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

interface MemberScheduleCardProps {
  schedule: Schedule;
  groupName: string;
  myStatus: ParticipationStatus;
  onStatusUpdate: (newStatus: ParticipationStatus) => void;
  isUpdating: boolean;
  isLeader: boolean;
  onEditSongs: () => void;
}

const MemberScheduleCard: React.FC<MemberScheduleCardProps> = ({
  schedule,
  groupName,
  myStatus,
  onStatusUpdate,
  isUpdating,
  isLeader,
  onEditSongs,
}) => {
  const { t, i18n } = useTranslation();
  const eventDate = new Date(`${schedule.date}T00:00:00`);
  const formattedDate = eventDate.toLocaleDateString(i18n.language, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const statusMap: Record<
    ParticipationStatus,
    { label: string; color: "success" | "error" | "warning" }
  > = {
    confirmed: { label: t("single_confirmed"), color: "success" },
    declined: { label: t("single_declined"), color: "error" },
    pending: { label: t("single_pending"), color: "warning" },
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <EventIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{formattedDate}</Typography>
        </Box>
        <Typography color="text.secondary" gutterBottom>
          {t("team")}: {groupName}
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          {isLeader && (
            <Button
              size="small"
              variant="text"
              startIcon={<EditIcon />}
              onClick={onEditSongs}
              disabled={isUpdating}
              sx={{ ml: 1 }}
            >
              {t("songs")}
            </Button>
          )}
          <Chip
            label={statusMap[myStatus].label}
            color={statusMap[myStatus].color}
          />
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => onStatusUpdate("confirmed")}
              disabled={myStatus === "confirmed" || isUpdating}
            >
              {t("confirm")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onStatusUpdate("declined")}
              disabled={myStatus === "declined" || isUpdating}
            >
              {t("decline")}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberScheduleCard;
