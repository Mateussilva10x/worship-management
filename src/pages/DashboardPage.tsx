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
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateScheduleSongs,
  useUpdateSchedule,
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
import SwapRequestsList from "../components/dashboard/SwapRequestList";
import RequestSwapModal from "../components/dashboard/RequestSwapModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotificationDispatch();

  const isDirector = user?.role === "worship_director";
  const isManagement =
    user?.role === "worship_director" || user?.role === "admin";
  const isMemberOrLeader = user?.role === "member" || user?.role === "leader";
  const isLeader = user?.role === "leader";

  const { data: allSchedules = [], isLoading: schedulesLoading } =
    useSchedules();
  const { data: groups = [], isLoading: groupsLoading } =
    useAllGroups(isManagement);
  const { data: songs = [], isLoading: songsLoading } = useApprovedSongs();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const createScheduleMutation = useCreateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const updateScheduleSongsMutation = useUpdateScheduleSongs();
  const updateScheduleMutation = useUpdateSchedule();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);
  const [editingScheduleSongs, setEditingScheduleSongs] =
    useState<Schedule | null>(null);
  const [statusUpdateSchedule, setStatusUpdateSchedule] =
    useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<"upcoming" | "past">("upcoming");
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [swapRequestModalOpen, setSwapRequestModalOpen] = useState(false);
  const [initiatingSwapSchedule, setInitiatingSwapSchedule] =
    useState<Schedule | null>(null);

  const [showOnlyMySchedules, setShowOnlyMySchedules] =
    useState(isMemberOrLeader);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOpenSwapRequestModal = (schedule: Schedule) => {
    setInitiatingSwapSchedule(schedule);
    setSwapRequestModalOpen(true);
  };

  const handleCloseSwapRequestModal = () => {
    setInitiatingSwapSchedule(null);
    setSwapRequestModalOpen(false);
  };

  const schedulesToDisplay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredSchedules = allSchedules;

    if (viewMode === "upcoming") {
      filteredSchedules = allSchedules
        .filter((s) => new Date(s.date + "T00:00:00") >= today)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    } else {
      filteredSchedules = allSchedules
        .filter((s) => new Date(s.date + "T00:00:00") < today)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }

    if (isMemberOrLeader && showOnlyMySchedules && user) {
      return filteredSchedules.filter((s) =>
        s.membersStatus.some((ms) => ms.memberId === user.id)
      );
    }

    return filteredSchedules;
  }, [allSchedules, showOnlyMySchedules, user, isMemberOrLeader, viewMode]);

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
          setEditingScheduleSongs(null);
          showNotification("Músicas da escala atualizadas!", "success");
        },
        onError: (err: any) =>
          showNotification(`Falha ao salvar músicas: ${err.message}`, "error"),
      }
    );
  };

  const handleUpdateSchedule = async (formData: any) => {
    if (!editingSchedule) return;

    await updateScheduleMutation.mutateAsync(
      { scheduleId: editingSchedule.id, scheduleData: formData },
      {
        onSuccess: () => {
          showNotification("Escala atualizada com sucesso!", "success");
          setEditingSchedule(null);
        },
        onError: (err) => showNotification(`Erro: ${err.message}`, "error"),
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
          mb: 1,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5">
            {selectedTab === 0
              ? viewMode === "upcoming"
                ? t("upcomingSchedules")
                : t("pastSchedules")
              : t("swapRequests")}
          </Typography>
          {isMemberOrLeader && selectedTab === 0 && (
            <Typography variant="caption">
              {showOnlyMySchedules ? t("mySchedules") : t("allSchedules")}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {selectedTab === 0 && (
            <ToggleButtonGroup
              color="primary"
              value={viewMode}
              exclusive
              onChange={(_event, newMode) => {
                if (newMode) setViewMode(newMode);
              }}
              aria-label="Visualização de escalas"
              size="small"
            >
              <ToggleButton value="upcoming">{t("next")}</ToggleButton>
              <ToggleButton value="past">{t("past")}</ToggleButton>
            </ToggleButtonGroup>
          )}

          {isDirector && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t("newSchedule")}
            </Button>
          )}

          {isMemberOrLeader && selectedTab === 0 && (
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
      </Box>

      {isLeader ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
            <Tabs
              value={selectedTab}
              onChange={handleChangeTab}
              aria-label="Painel do Líder"
            >
              <Tab
                label={t("scheduleView")}
                id="dashboard-tab-0"
                aria-controls="dashboard-tabpanel-0"
              />
              <Tab
                label={t("swapRequests")}
                id="dashboard-tab-1"
                aria-controls="dashboard-tabpanel-1"
              />
            </Tabs>
          </Box>

          <TabPanel value={selectedTab} index={0}>
            {schedulesToDisplay.length > 0 ? (
              schedulesToDisplay.map((schedule: Schedule) => {
                const isUserInSchedule = user
                  ? schedule.membersStatus.some((ms) => ms.memberId === user.id)
                  : false;
                const myStatus =
                  isUserInSchedule && user
                    ? schedule.membersStatus.find(
                        (ms) => ms.memberId === user.id
                      )?.status
                    : undefined;
                const isLeaderOfThisSchedule =
                  user?.id === schedule.group?.leader_id;
                const canRequestSwap =
                  isLeaderOfThisSchedule && viewMode === "upcoming";

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
                    showRequestSwapButton={canRequestSwap}
                    onRequestSwapClick={() =>
                      handleOpenSwapRequestModal(schedule)
                    }
                  />
                );
              })
            ) : (
              <Typography sx={{ textAlign: "center", mt: 4 }}>
                {t("noSchedulesFound")}
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            <SwapRequestsList />
          </TabPanel>
        </>
      ) : (
        <Box sx={{ pt: 3 }}>
          {schedulesToDisplay.length > 0 ? (
            schedulesToDisplay.map((schedule: Schedule) => {
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
                  showRequestSwapButton={false}
                />
              );
            })
          ) : (
            <Typography sx={{ textAlign: "center", mt: 4 }}>
              {t("noSchedulesFound")}
            </Typography>
          )}
        </Box>
      )}

      <UpdateStatusModal
        schedule={statusUpdateSchedule}
        onClose={() => setStatusUpdateSchedule(null)}
      />
      <Modal
        open={isCreateModalOpen || !!editingSchedule}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingSchedule(null);
        }}
      >
        <Box sx={modalStyle}>
          <NewScheduleForm
            groups={groups}
            onSubmit={
              editingSchedule ? handleUpdateSchedule : handleCreateSchedule
            }
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingSchedule(null);
            }}
            scheduleToEdit={editingSchedule}
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
              canEditSongs={user?.id === viewingSchedule.group?.leader_id}
              canDeleteSchedule={isDirector}
              onEditSongs={() => {
                setEditingScheduleSongs(viewingSchedule);
                setViewingSchedule(null);
              }}
              onDelete={handleDeleteSchedule}
              onEdit={() => {
                setEditingSchedule(viewingSchedule);
                setViewingSchedule(null);
              }}
            />
          </Box>
        </Modal>
      )}

      <RequestSwapModal
        open={swapRequestModalOpen}
        onClose={handleCloseSwapRequestModal}
        initiatingSchedule={initiatingSwapSchedule}
      />

      {editingScheduleSongs && (
        <Modal
          open={!!editingScheduleSongs}
          onClose={() => setEditingScheduleSongs(null)}
        >
          <Box sx={modalStyle}>
            <EditScheduleSongs
              schedule={editingScheduleSongs}
              allSongs={songs}
              users={users}
              onSave={handleSaveSongs}
              onClose={() => setEditingScheduleSongs(null)}
              group={editingScheduleSongs.group}
            />
          </Box>
        </Modal>
      )}

      {/* TODO: Adicionar Modal para criar solicitação de troca (a ser aberto pelo onRequestSwapClick) */}
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
