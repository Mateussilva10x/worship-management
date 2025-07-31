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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import NewSongForm from "../components/library/NewSongForm";
import { useData } from "../contexts/DataContext";

const MusicLibraryPage: React.FC = () => {
  const { songs, createSong } = useData();
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [songs, searchTerm]
  );

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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
