/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Typography,
  Box,
  Button,
  Modal,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ScheduleCard from "../components/dashboard/ScheduleCard";
import AddIcon from "@mui/icons-material/Add";

import type { Schedule, ParticipationStatus } from "../types";

import NewScheduleForm from "../components/dashboard/NewScheduleForm";
import ScheduleDetailView from "../components/dashboard/ScheduleDetailView";
import MemberScheduleCard from "../components/dashboard/MemberScheduleCard";
import { useData } from "../contexts/DataContext";
import EditScheduleSongs from "../components/dashboard/EditScheduleSongs";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { schedules, groups, users, songs, createSchedule, deleteSchedule } =
    useData();
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
    try {
      await createSchedule(formData);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

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
        schedules.map((schedule) => (
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
              deleteSchedule={deleteSchedule}
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
  const { schedules, songs, users, updateMemberStatus, updateScheduleSongs } =
    useData();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const mySchedules = useMemo(() => {
    if (!user || !schedules) return [];
    return schedules.filter((s) =>
      s.membersStatus.some((ms) => ms.memberId === user.id)
    );
  }, [schedules, user]);

  const handleStatusUpdate = async (
    scheduleId: string,
    newStatus: ParticipationStatus
  ) => {
    if (!user) return;
    setUpdatingId(scheduleId);
    try {
      await updateMemberStatus(scheduleId, user.id, newStatus);
    } catch (err) {
      alert("Falha ao atualizar seu status. Tente novamente.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveSongs = async (scheduleId: string, newSongIds: string[]) => {
    try {
      await updateScheduleSongs(scheduleId, newSongIds);
      setEditingSchedule(null);
    } catch (err) {
      alert("Falha ao salvar as músicas. Tente novamente.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("mySchedules")}
      </Typography>
      {mySchedules.length > 0 ? (
        mySchedules.map((schedule) => {
          const myStatus =
            schedule.membersStatus.find((ms) => ms.memberId === user?.id)
              ?.status || "pending";
          const group = schedule.group;
          const isLeader = group?.leader_id === user?.id;
          return (
            <MemberScheduleCard
              key={schedule.id}
              schedule={schedule}
              groupName={group?.name || "Grupo Desconhecido"}
              isLeader={isLeader}
              myStatus={myStatus}
              onStatusUpdate={(newStatus) =>
                handleStatusUpdate(schedule.id, newStatus)
              }
              isUpdating={updatingId === schedule.id}
              onEditSongs={() => setEditingSchedule(schedule)}
            />
          );
        })
      ) : (
        <Typography>{t("noSchedules")}</Typography>
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
  const { loading } = useData();

  if (loading) {
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
