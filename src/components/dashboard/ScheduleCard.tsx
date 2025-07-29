import React from "react";
import type { Schedule, WorshipGroup, User } from "../../types";
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
  groups: WorshipGroup[];
  users: User[];
  onClick: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  groups,
  onClick,
}) => {
  const groupName =
    groups.find((g) => g.id === schedule.worshipGroupId)?.name ||
    "Grupo não encontrado";

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
    <CardActionArea onClick={onClick} sx={{ mb: 3, borderRadius: 1 }}>
      <Card sx={{ pointerEvents: "none" }}>
        <CardContent>
          {/* Cabeçalho com a Data */}
          <Box display="flex" alignItems="center" mb={2}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" color="primary.main">
              {formattedDate} - {formattedTime}
            </Typography>
          </Box>

          {/* Nome do Grupo */}
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
