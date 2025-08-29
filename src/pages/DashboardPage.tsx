import React, { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Typography,
  Box,
  Button,
  Modal,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateScheduleSongs,
} from "../hooks/useSchedule";
import { useAllGroups } from "../hooks/useGroups";
import { useApprovedSongs } from "../hooks/useSongs";
import { useUsers } from "../hooks/useUsers";
import ScheduleCard from "../components/dashboard/ScheduleCard";
import AddIcon from "@mui/icons-material/Add";
import type { Schedule } from "../types";
import NewScheduleForm from "../components/dashboard/NewScheduleForm";
import ScheduleDetailView from "../components/dashboard/ScheduleDetailView";
import EditScheduleSongs from "../components/dashboard/EditScheduleSongs";
import UpdateStatusModal from "../components/dashboard/UpdateStatusModal";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotificationDispatch();

  const isDirector = user?.role === "worship_director";
  const isManagement =
    user?.role === "worship_director" || user?.role === "admin";
  const isMemberOrLeader = user?.role === "member" || user?.role === "leader";

  const { data: allSchedules = [], isLoading: schedulesLoading } =
    useSchedules();
  const { data: groups = [], isLoading: groupsLoading } =
    useAllGroups(isManagement);
  const { data: songs = [], isLoading: songsLoading } = useApprovedSongs();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const createScheduleMutation = useCreateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const updateScheduleSongsMutation = useUpdateScheduleSongs();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [statusUpdateSchedule, setStatusUpdateSchedule] =
    useState<Schedule | null>(null);

  const [showOnlyMySchedules, setShowOnlyMySchedules] =
    useState(isMemberOrLeader);

  const schedulesToDisplay = useMemo(() => {
    const futureSchedules = allSchedules.filter(
      (s) => new Date(s.date + "T23:59:59") >= new Date()
    );

    if (isMemberOrLeader && showOnlyMySchedules && user) {
      return futureSchedules.filter((s) =>
        s.membersStatus.some((ms) => ms.memberId === user.id)
      );
    }

    return futureSchedules;
  }, [allSchedules, showOnlyMySchedules, user, isMemberOrLeader]);

  const handleCreateSchedule = async (formData: any) => {
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
  const handleSaveSongs = async (scheduleId: string, newSongIds: string[]) => {
    await updateScheduleSongsMutation.mutateAsync(
      { scheduleId, songIds: newSongIds },
      {
        onSuccess: () => {
          setEditingSchedule(null);
          showNotification("Músicas da escala atualizadas!", "success");
        },
        onError: (err: any) =>
          showNotification(`Falha ao salvar músicas: ${err.message}`, "error"),
      }
    );
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5">
          {isMemberOrLeader && showOnlyMySchedules
            ? t("mySchedules")
            : t("upcomingSchedules")}
        </Typography>

        {isDirector && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t("newSchedule")}
          </Button>
        )}

        {isMemberOrLeader && (
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyMySchedules}
                onChange={(e) => setShowOnlyMySchedules(e.target.checked)}
              />
            }
            label={t("seeOwnSchedules")}
          />
        )}
      </Box>

      {schedulesToDisplay.map((schedule: Schedule) => {
        const isUserInSchedule = user
          ? schedule.membersStatus.some((ms) => ms.memberId === user.id)
          : false;
        const myStatus =
          isUserInSchedule && user
            ? schedule.membersStatus.find((ms) => ms.memberId === user.id)
                ?.status
            : undefined;

        return (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            onClick={() => setViewingSchedule(schedule)}
            myStatus={myStatus}
            onStatusClick={
              isUserInSchedule
                ? () => setStatusUpdateSchedule(schedule)
                : undefined
            }
          />
        );
      })}

      <UpdateStatusModal
        schedule={statusUpdateSchedule}
        onClose={() => setStatusUpdateSchedule(null)}
      />
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <NewScheduleForm
            groups={groups}
            songs={songs}
            onSubmit={handleCreateSchedule}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Box>
      </Modal>

      {viewingSchedule && (
        <Modal
          open={!!viewingSchedule}
          onClose={() => setViewingSchedule(null)}
        >
          <Box sx={modalStyle}>
            <ScheduleDetailView
              schedule={viewingSchedule}
              group={viewingSchedule.group}
              users={users}
              songs={songs.filter((s) => viewingSchedule.songs.includes(s.id))}
              onClose={() => setViewingSchedule(null)}
              canEditSongs={
                user?.role === "worship_director" ||
                user?.id === viewingSchedule.group?.leader_id
              }
              canDeleteSchedule={user?.role === "worship_director"}
              onEditSongs={() => {
                setEditingSchedule(viewingSchedule);
                setViewingSchedule(null);
              }}
              onDelete={handleDeleteSchedule}
            />
          </Box>
        </Modal>
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
              users={users}
              onSave={handleSaveSongs}
              onClose={() => setEditingSchedule(null)}
              group={editingSchedule.group}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
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
  maxHeight: "90vh",
  overflowY: "auto",
};

export default DashboardPage;
