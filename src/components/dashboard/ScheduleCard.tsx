import React from "react";
import type { ParticipationStatus, Schedule } from "../../types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

interface ScheduleCardProps {
  schedule: Schedule;
  onClick: () => void;
  "data-testid"?: string;
  myStatus?: ParticipationStatus;
  onStatusClick?: () => void;
  showRequestSwapButton?: boolean;
  onRequestSwapClick?: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  "data-testid": dataTestId,
  myStatus,
  onStatusClick,
  showRequestSwapButton,
  onRequestSwapClick,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const groupName = schedule.group?.name || t("groupNotFound");

  const eventDate = new Date(`${schedule.date}T00:00:00`);
  const formattedDate = eventDate.toLocaleDateString(i18n.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const myStatusMap: Record<
    ParticipationStatus,
    { label: string; color: "success" | "error" | "warning" }
  > = {
    confirmed: { label: t("single_confirmed"), color: "success" },
    declined: { label: t("single_declined"), color: "error" },
    pending: { label: t("single_pending"), color: "warning" },
  };

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
    <Card
      onClick={onClick}
      sx={{
        mb: 3,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": {
          background: "#3d3d3dff",
        },
      }}
      data-testid={dataTestId}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <EventIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" color="primary.main">
            {formattedDate}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <PeopleAltIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {t("team")}: {groupName}
            </Typography>
          </Box>
          {showRequestSwapButton && onRequestSwapClick && myStatus && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onRequestSwapClick();
              }}
              sx={{ pointerEvents: "auto", mr: 2 }}
            >
              {t("requestSwap")}
            </Button>
          )}
          {myStatus && (
            <Chip
              label={myStatusMap[myStatus].label}
              color={myStatusMap[myStatus].color}
              onClick={
                onStatusClick
                  ? (e) => {
                      e.stopPropagation();
                      onStatusClick();
                    }
                  : undefined
              }
              sx={{
                cursor: onStatusClick ? "pointer" : "default",
                pointerEvents: "auto",
              }}
            />
          )}
        </Box>

        {user?.role === "worship_director" && (
          <>
            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              {t("teamStatus")}
            </Typography>
            <Box
              display="flex"
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
