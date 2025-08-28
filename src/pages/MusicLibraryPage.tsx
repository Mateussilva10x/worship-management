/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
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
  Card,
  Pagination,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NewSongForm from "../components/library/NewSongForm";
import type { Song, SongStatus } from "../types";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  useCreateSong,
  useDeleteSong,
  useUpdateSongStatus,
  useUpdateSong,
  useInfiniteSongs,
  type SongFilters,
} from "../hooks/useSongs";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import SongDetailModal from "../components/library/SongDetailModal";

const SONGS_PER_PAGE = 15;

const MusicLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotificationDispatch();

  const [filters, setFilters] = useState<{
    title?: string;
    artist?: string;
    version?: string;
    key?: string;
    themes: string;
  }>({ themes: "" });
  const [appliedFilters, setAppliedFilters] = useState<SongFilters>({});

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSongs(appliedFilters);

  const songs = data?.pages.flatMap((page) => page.songs) ?? [];
  const totalSongsCount = data?.pages[0]?.count ?? 0;
  const pageCount = Math.ceil(totalSongsCount / SONGS_PER_PAGE);
  const currentPage = data?.pages.length ?? 1;

  const createSongMutation = useCreateSong();
  const deleteSongMutation = useDeleteSong();
  const updateSongMutation = useUpdateSong();
  const updateStatusMutation = useUpdateSongStatus();

  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);

  const handleOpenEditModal = (song: Song) => {
    setSongToEdit(song);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSongToEdit(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => {
    const themesArray = filters.themes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setAppliedFilters({
      ...filters,
      themes: themesArray,
    });
  };

  const handleClearFilters = () => {
    setFilters({ themes: "" });
    setAppliedFilters({});
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
          sx={{ whiteSpace: "nowrap", px: 4 }}
        >
          {t("newSong")}
        </Button>
      </Box>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Filtros de Pesquisa</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  fullWidth
                  name="title"
                  label="Nome da Música"
                  value={filters.title || ""}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  name="artist"
                  label="Artista"
                  value={filters.artist || ""}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  name="version"
                  label="Versão"
                  value={filters.version || ""}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  name="key"
                  label="Tom"
                  value={filters.key || ""}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  name="themes"
                  label={t("songThemesFilter")}
                  value={filters.themes}
                  onChange={handleFilterChange}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleSearch}>
                {t("search")}
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                {t("clear")}
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <TableContainer
        component={Paper}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        {songs.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {t("songTitle")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("artist")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {t("songKey")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("status")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {t("actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songs.map((song) => (
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
                      label={statusMap[song.status as SongStatus].label}
                      color={statusMap[song.status as SongStatus].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user?.role === "worship_director" &&
                      song.status === "pending" && (
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
                      size="small"
                      aria-label="Ver detalhes"
                      onClick={() => setViewingSong(song)}
                    >
                      <VisibilityIcon fontSize="small" />
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
                      disabled={
                        user?.role !== "worship_director" &&
                        user?.role !== "admin"
                      }
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

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {songs.map((song) => (
            <Card key={song.id} variant="outlined">
              <Box
                sx={{ display: "flex", alignItems: "center", p: 1.5, gap: 1 }}
              >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight="bold" noWrap>
                    {song.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {song.artist} {song.version && `(${song.version})`}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ bgcolor: "action.hover", px: 1, borderRadius: 1 }}
                    >
                      {t("songKey")}: {song.key}
                    </Typography>
                    <Chip
                      label={statusMap[song.status as SongStatus].label}
                      color={statusMap[song.status as SongStatus].color}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    ml: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    aria-label="Link"
                    component="a"
                    href={song.link}
                    target="_blank"
                    disabled={!song.link}
                    color="primary"
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                  {user?.role === "worship_director" &&
                    (song.status === "pending" ? (
                      <>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleApprove(song.id)}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {t("approve")}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleReject(song.id)}
                          sx={{ whiteSpace: "nowrap", ml: 0.5 }}
                        >
                          {t("reject")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          aria-label="Ver detalhes"
                          onClick={() => setViewingSong(song)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Editar"
                          onClick={() => handleOpenEditModal(song)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Excluir"
                          color="error"
                          onClick={() => setSongToDelete(song)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    ))}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          {hasNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outlined"
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar Mais"}
            </Button>
          )}
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={(_event, value) => {
                if (value > currentPage) {
                  fetchNextPage();
                }
              }}
              color="primary"
            />
          )}
        </Box>
      </Box>

      <SongDetailModal
        song={viewingSong}
        onClose={() => setViewingSong(null)}
      />
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
