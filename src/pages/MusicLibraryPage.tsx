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
import { useData } from "../contexts/DataContext";
import type { Song } from "../types";
import ConfirmationDialog from "../components/common/ConfirmationDialog";

const MusicLibraryPage: React.FC = () => {
  const { songs, createSong, deleteSong, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSong = async (formData: {
    title: string;
    key: string;
    link: string;
  }) => {
    try {
      await createSong(formData);
      setIsModalOpen(false);
    } catch (err) {
      alert("Falha ao salvar a música.");
    }
  };

  const handleConfirmDelete = async () => {
    if (songToDelete) {
      try {
        await deleteSong(songToDelete.id);
        setSongToDelete(null);
      } catch (err) {
        alert("Falha ao excluir a música.");
      }
    }
  };

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [songs, searchTerm]
  );

  if (loading) {
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
        <Typography variant="h4">Biblioteca de Músicas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Nova Música
        </Button>
      </Box>

      <TextField
        label="Buscar por título"
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
                  <TableCell sx={{ fontWeight: "bold" }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tom</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
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
              <Typography variant="body1">
                Nenhuma música encontrada.
              </Typography>
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
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir a música "${songToDelete?.title}"? Esta ação não pode ser desfeita.`}
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
