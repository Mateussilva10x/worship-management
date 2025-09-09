import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Song } from "../../types";
import { SUGGESTED_THEMES } from "../../constants";

interface NewSongFormProps {
  onSubmit: (formData: {
    title: string;
    artist: string;
    version: string;
    key: string;
    link: string;
    reference: string;
    themes: string[];
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
    reference: "",
    themes: [] as string[],
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
        reference: songToEdit.reference || "",
        themes: songToEdit.themes || [],
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
      <Typography variant="h6" gutterBottom id="song-form-modal-title">
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
        required
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
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="reference"
        label={t("songBibleReference")}
        value={formData.reference}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Autocomplete
        multiple
        freeSolo
        disableClearable
        options={SUGGESTED_THEMES}
        value={formData.themes}
        onChange={(_event, newValue) => {
          setFormData((prev) => ({ ...prev, themes: [...new Set(newValue)] }));
        }}
        getOptionLabel={(option) => {
          return t(`themes.${option}`, { defaultValue: option });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={t("songThemes")}
            placeholder={t("songThemesCreate")}
          />
        )}
        sx={{ mt: 2 }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button onClick={onCancel} color="secondary" disabled={isSubmitting}>
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={
            isSubmitting ||
            !formData.title ||
            !formData.key ||
            !formData.artist ||
            !formData.version ||
            !formData.link
          }
          sx={{ minWidth: "100px" }}
        >
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </Box>
    </Box>
  );
};

export default NewSongForm;
