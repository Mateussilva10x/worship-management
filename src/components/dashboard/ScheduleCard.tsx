import React from "react";
import type { Schedule } from "../../types";
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
import { useTranslation } from "react-i18next";

interface ScheduleCardProps {
  schedule: Schedule;
  onClick: () => void;
  "data-testid"?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  "data-testid": dataTestId,
}) => {
  const { t, i18n } = useTranslation();
  const groupName = schedule.group?.name || t("groupNotFound");

  const eventDate = new Date(`${schedule.date}T00:00:00`);
  const formattedDate = eventDate.toLocaleDateString(i18n.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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
              {formattedDate}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <PeopleAltIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {t("team")}: {groupName}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {t("teamStatus")}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${confirmedCount} ${t("confirmed")}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<CancelIcon />}
              label={`${declinedCount} ${t("recused")}`}
              color="error"
              variant="outlined"
            />
            <Chip
              icon={<HelpOutlineIcon />}
              label={`${pendingCount} ${t("pending")}`}
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
