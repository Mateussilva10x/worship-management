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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import NewSongForm from "../components/library/NewSongForm";
import type { Song } from "../types";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useTranslation } from "react-i18next";
import { useSongs, useCreateSong, useDeleteSong } from "../hooks/useSongs";
import { useNotificationDispatch } from "../contexts/NotificationContext";

const MusicLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: songs = [], isLoading, isError, error } = useSongs();
  const createSongMutation = useCreateSong();
  const deleteSongMutation = useDeleteSong();

  const { showNotification } = useNotificationDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSong = async (formData: {
    title: string;
    key: string;
    link: string;
  }) => {
    await createSongMutation.mutateAsync(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        showNotification("Música criada com sucesso!", "success");
      },
      onError: (err) => {
        showNotification(`Falha ao criar música: ${err.message}`, "error");
      },
    });
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

  if (isError) {
    return (
      <Typography color="error">
        Erro ao carregar as músicas: {error?.message}
      </Typography>
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
                    {t("songKey")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>{song.title}</TableCell>
                    <TableCell>{song.key}</TableCell>
                    <TableCell>
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
                        aria-label="Excluir música"
                        color="error"
                        onClick={() => setSongToDelete(song)}
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
            onSubmit={handleCreateSong}
            onCancel={() => setIsModalOpen(false)}
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
