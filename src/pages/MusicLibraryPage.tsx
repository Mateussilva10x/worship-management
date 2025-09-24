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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NewSongForm from "../components/library/NewSongForm";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import YouTubeIcon from "@mui/icons-material/YouTube";
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
  useAllThemes,
} from "../hooks/useSongs";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import SongDetailModal from "../components/library/SongDetailModal";

const MusicLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotificationDispatch();

  const [filters, setFilters] = useState<SongFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<SongFilters>({});

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSongs(appliedFilters, user?.role);

  const songs = data?.pages.flatMap((page) => page.songs) ?? [];

  const isManagement =
    user?.role === "worship_director" || user?.role === "admin";

  const createSongMutation = useCreateSong();
  const deleteSongMutation = useDeleteSong();
  const updateSongMutation = useUpdateSong();
  const updateStatusMutation = useUpdateSongStatus();

  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const { data: themeOptions = [] } = useAllThemes();

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
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
  };

  const handleFormSubmit = async (formData: {
    title: string;
    artist: string;
    version: string;
    key: string;
    chart_link: string;
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
          <Typography>{t("searchFilters")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <TextField
                  fullWidth
                  name="title"
                  label={t("songTitle")}
                  value={filters.title || ""}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>

              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <TextField
                  fullWidth
                  name="artist"
                  label={t("artist")}
                  value={filters.artist || ""}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>

              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <TextField
                  fullWidth
                  name="version"
                  label={t("version")}
                  value={filters.version || ""}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>

              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <TextField
                  fullWidth
                  name="key"
                  label={t("songKey")}
                  value={filters.key || ""}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>

              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <TextField
                  fullWidth
                  name="reference"
                  label={t("songBibleReference")}
                  value={filters.reference || ""}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>

              <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
                <Autocomplete
                  multiple
                  freeSolo
                  disableClearable
                  options={themeOptions}
                  value={filters.themes || []}
                  onChange={(_event, newValue) => {
                    setFilters((prev) => ({ ...prev, themes: newValue }));
                  }}
                  getOptionLabel={(option) => {
                    return t(`themes.${option}`, { defaultValue: option });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("songThemes")}
                      placeholder={t("selectTheme")}
                      size="small"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                data-testid="search-filters-search-button"
              >
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
                {isManagement && (
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {t("status")}
                  </TableCell>
                )}
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
                  {isManagement && (
                    <TableCell>
                      <Chip
                        label={statusMap[song.status as SongStatus].label}
                        color={statusMap[song.status as SongStatus].color}
                        size="small"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Tooltip title="Ver Cifra">
                      <IconButton
                        size="small"
                        component="a"
                        href={song.chart_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!song.chart_link}
                        color="primary"
                      >
                        <LibraryMusicIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ouvir Música">
                      <IconButton
                        size="small"
                        component="a"
                        href={song.song_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!song.song_link}
                        color="primary"
                      >
                        <YouTubeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {user?.role === "worship_director" &&
                      song.status === "pending" && (
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
                      )}
                    <>
                      <IconButton
                        size="small"
                        aria-label="Ver detalhes"
                        onClick={() => setViewingSong(song)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {user?.role !== "member" && (
                        <IconButton
                          size="small"
                          aria-label="Editar"
                          color="primary"
                          onClick={() => handleOpenEditModal(song)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {user?.role === "admin" ||
                        (user?.role === "worship_director" && (
                          <IconButton
                            size="small"
                            aria-label="Excluir"
                            color="error"
                            onClick={() => setSongToDelete(song)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        ))}
                    </>
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
                    {isManagement && (
                      <Chip
                        label={statusMap[song.status as SongStatus].label}
                        color={statusMap[song.status as SongStatus].color}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
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
                    song.status === "pending" && (
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
                    )}
                  <>
                    <IconButton
                      size="small"
                      aria-label="Ver detalhes"
                      onClick={() => setViewingSong(song)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {user?.role !== "member" && (
                      <IconButton
                        size="small"
                        aria-label="Editar"
                        color="primary"
                        onClick={() => handleOpenEditModal(song)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {user?.role === "admin" ||
                      (user?.role === "worship_director" && (
                        <IconButton
                          size="small"
                          aria-label="Excluir"
                          color="error"
                          onClick={() => setSongToDelete(song)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      ))}
                  </>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
        <Box sx={{ display: { xs: "block" } }}>
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
      </Box>

      <SongDetailModal
        song={viewingSong}
        onClose={() => setViewingSong(null)}
      />
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false), setSongToEdit(null);
        }}
        aria-labelledby="song-form-modal-title"
      >
        <Box sx={modalStyle} data-testid="song-form-modal">
          <NewSongForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsModalOpen(false), setSongToEdit(null);
            }}
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
