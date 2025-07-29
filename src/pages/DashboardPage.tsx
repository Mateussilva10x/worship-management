import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Modal,
} from "@mui/material";
import ScheduleCard from "../components/dashboard/ScheduleCard";
import AddIcon from "@mui/icons-material/Add";

import type {
  Schedule,
  WorshipGroup,
  User,
  Song,
  ParticipationStatus,
} from "../types";
import {
  fetchSchedules,
  fetchGroups,
  fetchUsers,
  createSchedule,
  fetchSongs,
  updateMemberStatus,
} from "../services/api";
import NewScheduleForm from "../components/dashboard/NewScheduleForm";
import ScheduleDetailView from "../components/dashboard/ScheduleDetailView";
import MemberScheduleCard from "../components/dashboard/MemberScheduleCard";

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<WorshipGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Renomeado para clareza
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
      const { date, worshipGroupId, songs } = formData;
      const newSchedule = await createSchedule({
        date,
        worshipGroupId,
        songIds: songs,
      });
      setSchedules((prevSchedules) => [newSchedule, ...prevSchedules]);
      handleCloseCreateModal();
    } catch (err) {
      console.error("Falha ao criar escala:", err);
      alert("Não foi possível criar a escala. Tente novamente.");
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [schedulesData, groupsData, usersData, songsData] =
          await Promise.all([
            fetchSchedules(),
            fetchGroups(),
            fetchUsers(),
            fetchSongs(),
          ]);
        setSchedules(schedulesData);
        setGroups(groupsData);
        setUsers(usersData);
        setSongs(songsData);
      } catch (err) {
        setError("Falha ao carregar os dados do painel.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Próximas Escalas
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenCreateModal}
      >
        Nova Escala
      </Button>
      {schedules.length > 0 ? (
        schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            groups={groups}
            users={users}
            onClick={() => handleViewDetails(schedule)}
          />
        ))
      ) : (
        <Typography>Nenhuma escala encontrada.</Typography>
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
            {" "}
            {/* Usando o mesmo estilo */}
            <ScheduleDetailView
              schedule={viewingSchedule}
              group={groups.find(
                (g) => g.id === viewingSchedule.worshipGroupId
              )}
              users={users}
              songs={songs}
              onClose={handleCloseDetailsModal}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const [mySchedules, setMySchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<WorshipGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null); // Para controlar o estado de "carregando" por card
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadMemberData = async () => {
      try {
        setLoading(true);
        const [schedulesData, groupsData] = await Promise.all([
          fetchSchedules(),
          fetchGroups(),
        ]);

        // Filtra para mostrar apenas as escalas do usuário logado
        const userSchedules = schedulesData.filter((s) =>
          s.membersStatus.some((ms) => ms.memberId === user.id)
        );

        setMySchedules(userSchedules);
        setGroups(groupsData);
      } catch (err) {
        setError("Falha ao carregar suas escalas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, [user]);

  const handleStatusUpdate = async (
    scheduleId: string,
    newStatus: ParticipationStatus
  ) => {
    if (!user) return;
    setUpdatingId(scheduleId);
    try {
      const updatedSchedule = await updateMemberStatus(
        scheduleId,
        user.id,
        newStatus
      );
      // Atualiza a lista de escalas na tela com a nova informação
      setMySchedules((prev) =>
        prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
      );
    } catch (err) {
      alert("Falha ao atualizar seu status. Tente novamente.");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Minhas Próximas Escalas
      </Typography>
      {mySchedules.length > 0 ? (
        mySchedules.map((schedule) => {
          const myStatus =
            schedule.membersStatus.find((ms) => ms.memberId === user?.id)
              ?.status || "pending";
          const groupName =
            groups.find((g) => g.id === schedule.worshipGroupId)?.name || "N/A";
          return (
            <MemberScheduleCard
              key={schedule.id}
              schedule={schedule}
              groupName={groupName}
              myStatus={myStatus}
              onStatusUpdate={(newStatus) =>
                handleStatusUpdate(schedule.id, newStatus)
              }
              isUpdating={updatingId === schedule.id}
            />
          );
        })
      ) : (
        <Typography>Você não está em nenhuma escala futura.</Typography>
      )}
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      {user?.role === "admin" ? <AdminDashboard /> : <MemberDashboard />}
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
};

export default DashboardPage;
