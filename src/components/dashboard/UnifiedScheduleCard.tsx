import React from "react";
import type { Schedule, ParticipationStatus } from "../../types";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

interface UnifiedScheduleCardProps {
  schedule: Schedule;
  isUserInSchedule: boolean;
  leaderName?: string;
  onClick?: () => void;
}

const statusMap: Record<
  ParticipationStatus,
  { label: string; color: "success" | "error" | "warning" }
> = {
  confirmed: { label: "Confirmado", color: "success" },
  declined: { label: "Recusado", color: "error" },
  pending: { label: "Pendente", color: "warning" },
};

const UnifiedScheduleCard: React.FC<UnifiedScheduleCardProps> = ({
  schedule,
  isUserInSchedule,
  onClick,
}) => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();

  const eventDate = new Date(`${schedule.date}T00:00:00`);
  const formattedDate = eventDate.toLocaleDateString(i18n.language, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const myStatus =
    schedule.membersStatus.find((ms) => ms.memberId === user?.id)?.status ||
    "pending";

  return (
    <Card
      onClick={onClick}
      variant="outlined"
      sx={{
        mb: 4,
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          boxShadow: onClick ? 3 : "none",
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <EventIcon color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
          <Typography variant="h6">{formattedDate}</Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pl={0.5}
        >
          <Typography color="text.secondary">
            Equipe: {schedule.group?.name}
          </Typography>

          {isUserInSchedule && (
            <Chip
              label={t(statusMap[myStatus].label)}
              color={statusMap[myStatus].color}
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedScheduleCard;
