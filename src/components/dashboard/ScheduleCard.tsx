import React from "react";
import type { Schedule, User } from "../../types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  CardActionArea,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface ScheduleCardProps {
  schedule: Schedule;
  users: User[];
  onClick: () => void;
  "data-testid"?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  "data-testid": dataTestId,
}) => {
  const groupName = schedule.group?.name || "Grupo não encontrado";

  const eventDate = new Date(schedule.date);
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const confirmedCount = schedule.membersStatus.filter(
    (m) => m.status === "confirmed"
  ).length;
  const declinedCount = schedule.membersStatus.filter(
    (m) => m.status === "declined"
  ).length;
  const pendingCount = schedule.membersStatus.filter(
    (m) => m.status === "pending"
  ).length;

  return (
    <CardActionArea
      onClick={onClick}
      sx={{ mb: 3, borderRadius: 1 }}
      data-testid={dataTestId}
    >
      <Card sx={{ pointerEvents: "none" }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" color="primary.main">
              {formattedDate} - {formattedTime}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <PeopleAltIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Equipe: {groupName}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Status da Equipe
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${confirmedCount} Confirmados`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<CancelIcon />}
              label={`${declinedCount} Recusaram`}
              color="error"
              variant="outlined"
            />
            <Chip
              icon={<HelpOutlineIcon />}
              label={`${pendingCount} Pendentes`}
              color="warning"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default ScheduleCard;
