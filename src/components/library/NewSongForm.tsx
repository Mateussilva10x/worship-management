import React, { useEffect, useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Song } from "../../types";

interface NewSongFormProps {
  onSubmit: (formData: {
    title: string;
    artist: string;
    version: string;
    key: string;
    link: string;
  }) => Promise<void>;
  onCancel: () => void;
  songToEdit?: Song | null;
}

const NewSongForm: React.FC<NewSongFormProps> = ({
  onSubmit,
  onCancel,
  songToEdit,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    version: "",
    key: "",
    link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (songToEdit) {
      setFormData({
        title: songToEdit.title,
        artist: songToEdit.artist,
        version: songToEdit.version || "",
        key: songToEdit.key,
        link: songToEdit.link,
      });
    }
  }, [songToEdit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.key || !formData.artist) {
      alert("Por favor, preencha pelo menos o título, Artistat e o tom.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {songToEdit ? t("editSong") : t("newSongFormTitle")}
      </Typography>
      <TextField
        name="title"
        label={t("songTitle")}
        value={formData.title}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="artist"
        label={t("artist")}
        value={formData.artist}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="version"
        label={t("version")}
        value={formData.version}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        name="key"
        label={t("songKey")}
        value={formData.key}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="link"
        label={t("songLink")}
        value={formData.link}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button onClick={onCancel} color="secondary" disabled={isSubmitting}>
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ minWidth: "100px" }}
        >
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </Box>
    </Box>
  );
};

export default NewSongForm;
