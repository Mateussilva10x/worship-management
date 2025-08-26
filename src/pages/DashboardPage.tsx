/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Typography,
  Box,
  Button,
  Modal,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateScheduleSongs,
} from "../hooks/useSchedule";
import { useGroups } from "../hooks/useGroups";
import { useApprovedSongs } from "../hooks/useSongs";
import { useUsers } from "../hooks/useUsers";
import ScheduleCard from "../components/dashboard/ScheduleCard";
import AddIcon from "@mui/icons-material/Add";

import type { Schedule } from "../types";

import NewScheduleForm from "../components/dashboard/NewScheduleForm";
import ScheduleDetailView from "../components/dashboard/ScheduleDetailView";
import EditScheduleSongs from "../components/dashboard/EditScheduleSongs";
import MemberScheduleDetailModal from "../components/dashboard/MemberScheduleDetailModal";
import UnifiedScheduleCard from "../components/dashboard/UnifiedScheduleCard";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: songs = [], isLoading: songsLoading } = useApprovedSongs();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { showNotification } = useNotificationDispatch();

  const createScheduleMutation = useCreateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handleViewDetails = (schedule: Schedule) =>
    setViewingSchedule(schedule);
  const handleCloseDetailsModal = () => setViewingSchedule(null);

  const handleCreateSchedule = async (formData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => {
    await createScheduleMutation.mutateAsync(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        showNotification("Escala criada com sucesso!", "success");
      },
      onError: (err: any) => {
        showNotification(`Falha ao criar escala: ${err.message}`, "error");
      },
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteScheduleMutation.mutateAsync(scheduleId, {
      onSuccess: () => {
        setViewingSchedule(null);
        showNotification("Escala excluída com sucesso!", "success");
      },
      onError: (err: any) => {
        showNotification(`Falha ao excluir escala: ${err.message}`, "error");
      },
    });
  };

  const isLoading =
    schedulesLoading || groupsLoading || songsLoading || usersLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          {t("upcomingSchedules")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          {t("newSchedule")}
        </Button>
      </Box>
      {schedules.length > 0 ? (
        schedules.map((schedule: Schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            onClick={() => handleViewDetails(schedule)}
            data-testid={`schedule-card-${schedule.id}`}
          />
        ))
      ) : (
        <Typography>{t("noSchedulesFound")}</Typography>
      )}
      <Modal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        aria-labelledby="create-schedule-modal-title"
      >
        <Box sx={modalStyle}>
          <NewScheduleForm
            groups={groups}
            songs={songs}
            onSubmit={handleCreateSchedule}
            onCancel={handleCloseCreateModal}
          />
        </Box>
      </Modal>

      {viewingSchedule && (
        <Modal open={!!viewingSchedule} onClose={handleCloseDetailsModal}>
          <Box sx={modalStyle}>
            <ScheduleDetailView
              schedule={viewingSchedule}
              group={viewingSchedule.group}
              users={users}
              songs={songs}
              onClose={handleCloseDetailsModal}
              deleteSchedule={handleDeleteSchedule}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showNotification } = useNotificationDispatch();
  const { data: allSchedules = [], isLoading: schedulesLoading } =
    useSchedules();
  const { data: songs = [], isLoading: songsLoading } = useApprovedSongs();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const updateScheduleSongsMutation = useUpdateScheduleSongs();

  const [showOnlyMySchedules, setShowOnlyMySchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.id, u.name]));
  }, [users]);

  const schedulesToDisplay = useMemo(() => {
    const futureSchedules = allSchedules.filter(
      (s) => new Date(s.date + "T23:59:59") >= new Date()
    );

    if (showOnlyMySchedules && user) {
      return futureSchedules.filter((s) =>
        s.membersStatus.some((ms) => ms.memberId === user.id)
      );
    }
    return futureSchedules;
  }, [allSchedules, showOnlyMySchedules, user]);

  const handleSaveSongs = async (scheduleId: string, newSongIds: string[]) => {
    await updateScheduleSongsMutation.mutateAsync(
      { scheduleId, songIds: newSongIds },
      {
        onSuccess: () => {
          setEditingSchedule(null);
          showNotification("Músicas da escala atualizadas!", "success");
        },
        onError: (err: any) => {
          showNotification(`Falha ao salvar músicas: ${err.message}`, "error");
        },
      }
    );
  };

  const isLoading = schedulesLoading || songsLoading || usersLoading;
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {showOnlyMySchedules ? t("mySchedules") : t("upcomingSchedules")}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showOnlyMySchedules}
            onChange={(e) => setShowOnlyMySchedules(e.target.checked)}
          />
        }
        label={t("seeOwnSchedules")}
        sx={{ mb: 2 }}
      />
      {schedulesToDisplay.length > 0 ? (
        schedulesToDisplay.map((schedule) => {
          const isUserInSchedule = schedule.membersStatus.some(
            (ms) => ms.memberId === user?.id
          );
          const leaderName = userMap.get(schedule.group?.leader_id || "");

          return (
            <UnifiedScheduleCard
              key={schedule.id}
              schedule={schedule}
              isUserInSchedule={isUserInSchedule}
              leaderName={leaderName}
              onClick={
                isUserInSchedule
                  ? () => setSelectedSchedule(schedule)
                  : undefined
              }
            />
          );
        })
      ) : (
        <Typography>{t("noSchedulesFound")}</Typography>
      )}

      {selectedSchedule && (
        <MemberScheduleDetailModal
          open={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          schedule={selectedSchedule}
          songs={songs.filter((s) => selectedSchedule.songs.includes(s.id))}
          user={user}
        />
      )}
      {editingSchedule && (
        <Modal
          open={!!editingSchedule}
          onClose={() => setEditingSchedule(null)}
        >
          <Box sx={modalStyle}>
            <EditScheduleSongs
              schedule={editingSchedule}
              allSongs={songs}
              group={editingSchedule.group}
              users={users}
              onSave={handleSaveSongs}
              onClose={() => setEditingSchedule(null)}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return user?.role === "admin" ? <AdminDashboard /> : <MemberDashboard />;
};

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

export default DashboardPage;
