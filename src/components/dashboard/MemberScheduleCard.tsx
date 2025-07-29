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

interface MemberScheduleCardProps {
  schedule: Schedule;
  groupName: string;
  myStatus: ParticipationStatus;
  onStatusUpdate: (newStatus: ParticipationStatus) => void;
  isUpdating: boolean;
}

const statusMap: Record<
  ParticipationStatus,
  { label: string; color: "success" | "error" | "warning" }
> = {
  confirmed: { label: "Você confirmou", color: "success" },
  declined: { label: "Você recusou", color: "error" },
  pending: { label: "Pendente", color: "warning" },
};

const MemberScheduleCard: React.FC<MemberScheduleCardProps> = ({
  schedule,
  groupName,
  myStatus,
  onStatusUpdate,
  isUpdating,
}) => {
  const eventDate = new Date(schedule.date);
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const formattedTime = eventDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <EventIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {formattedDate} às {formattedTime}
          </Typography>
        </Box>
        <Typography color="text.secondary" gutterBottom>
          Equipe: {groupName}
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
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
              Confirmar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onStatusUpdate("declined")}
              disabled={myStatus === "declined" || isUpdating}
            >
              Recusar
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberScheduleCard;
