import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

interface NewSongFormProps {
  onSubmit: (formData: {
    title: string;
    key: string;
    link: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const NewSongForm: React.FC<NewSongFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ title: "", key: "", link: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.key) {
      alert("Por favor, preencha pelo menos o título e o tom.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {t("newSongFormTitle")}
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
        >
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </Box>
    </Box>
  );
};

export default NewSongForm;
