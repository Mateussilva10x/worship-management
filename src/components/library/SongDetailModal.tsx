import React from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import YouTubeIcon from "@mui/icons-material/YouTube";
import type { Song } from "../../types";
import { useTranslation } from "react-i18next";

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
}

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

const SongDetailModal: React.FC<SongDetailModalProps> = ({ song, onClose }) => {
  const { t } = useTranslation();
  if (!song) return null;

  return (
    <Modal open={!!song} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            {song.title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {song.artist} {song.version && `(${song.version})`}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>{t("songKey")}:</strong> {song.key}
          </Typography>
          <Box sx={{ display: "flex" }}>
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
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          {t("songThemes")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {song.themes && song.themes.length > 0 ? (
            song.themes.map((theme) => (
              <Chip key={theme} label={t(`themes.${theme}`)} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("noThemes")}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SongDetailModal;
