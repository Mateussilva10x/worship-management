/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NewSongForm from "../components/library/NewSongForm";
import type { Song, SongStatus } from "../types";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  useAllSongs,
  useCreateSong,
  useDeleteSong,
  useUpdateSongStatus,
  useUpdateSong,
} from "../hooks/useSongs";
import { useNotificationDispatch } from "../contexts/NotificationContext";

const MusicLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: songs = [], isLoading } = useAllSongs();
  const createSongMutation = useCreateSong();
  const deleteSongMutation = useDeleteSong();
  const updateStatusMutation = useUpdateSongStatus();
  const updateSongMutation = useUpdateSong();

  const { showNotification } = useNotificationDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);

  const handleOpenEditModal = (song: Song) => {
    setSongToEdit(song);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSongToEdit(null);
  };

  const handleFormSubmit = async (formData: {
    title: string;
    artist: string;
    version: string;
    key: string;
    link: string;
  }) => {
    if (songToEdit) {
      await updateSongMutation.mutateAsync(
        { id: songToEdit.id, ...formData },
        {
          onSuccess: () => {
            showNotification("Música atualizada com sucesso!", "success");
            handleCloseModal();
          },
          onError: (err) =>
            showNotification(`Falha ao editar música: ${err.message}`, "error"),
        }
      );
    } else {
      await createSongMutation.mutateAsync(formData, {
        onSuccess: () => {
          showNotification("Música criada com sucesso!", "success");
          handleCloseModal();
        },
        onError: (err) =>
          showNotification(`Falha ao criar música: ${err.message}`, "error"),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (songToDelete) {
      await deleteSongMutation.mutateAsync(songToDelete.id, {
        onSuccess: () => {
          setSongToDelete(null);
          showNotification("Música excluída com sucesso!", "success");
        },
        onError: (err) => {
          showNotification(`Falha ao excluir música: ${err.message}`, "error");
        },
      });
    }
  };

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [songs, searchTerm]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleApprove = (songId: string) => {
    updateStatusMutation.mutate({ songId, status: "approved" });
  };

  const handleReject = (songId: string) => {
    updateStatusMutation.mutate({ songId, status: "rejected" });
  };

  const statusMap: Record<
    SongStatus,
    { label: string; color: "success" | "error" | "warning" }
  > = {
    approved: { label: t("approved"), color: "success" },
    rejected: { label: t("rejected"), color: "error" },
    pending: { label: t("single_pending"), color: "warning" },
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
        <Typography variant="h4">{t("musicLibrary")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          {t("newSong")}
        </Button>
      </Box>

      <TextField
        label={t("searchSongs")}
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Paper>
        <TableContainer>
          {songs.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("songTitle")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("artist")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("songKey")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("status")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>
                      {song.title}
                      {song.version && (
                        <Typography variant="caption" display="block">
                          ({song.version})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{song.artist}</TableCell>
                    <TableCell>{song.key}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusMap[song.status].label}
                        color={statusMap[song.status].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user?.role === "admin" && song.status === "pending" && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleApprove(song.id)}
                          >
                            {t("approve")}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleReject(song.id)}
                          >
                            {t("reject")}
                          </Button>
                        </>
                      )}
                      <IconButton
                        aria-label="Abrir link"
                        color="primary"
                        component="a"
                        href={song.link}
                        target={song.link ? "_blank" : undefined}
                        rel={song.link ? "noopener noreferrer" : undefined}
                        disabled={!song.link}
                      >
                        <LinkIcon />
                      </IconButton>
                      <IconButton
                        aria-label="Editar música"
                        color="primary"
                        onClick={() => handleOpenEditModal(song)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="Excluir música"
                        color="error"
                        onClick={() => setSongToDelete(song)}
                        disabled={user?.role !== "admin"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">{t("noSongsFound")}</Typography>
            </Box>
          )}
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <NewSongForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            songToEdit={songToEdit}
          />
        </Box>
      </Modal>
      <ConfirmationDialog
        open={!!songToDelete}
        title={t("confirmDelete")}
        message={t("confirmDeleteSongMessage", {
          songTitle: songToDelete?.title,
        })}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSongToDelete(null)}
      />
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

export default MusicLibraryPage;
