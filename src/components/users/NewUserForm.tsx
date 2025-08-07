import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

interface NewUserFormProps {
  onSubmit: (formData: {
    name: string;
    email: string;
    whatsapp: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        {t("createNewUser")}
      </Typography>
      <TextField
        name="name"
        label={t("userName")}
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        autoFocus
        sx={{ mb: 2 }}
      />
      <TextField
        name="email"
        type="email"
        label={t("email")}
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="whatsapp"
        label="Whatsapp (Ex: 5583999998888)"
        value={formData.whatsapp}
        onChange={handleChange}
        fullWidth
        required
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
          disabled={
            isSubmitting ||
            !formData.name ||
            !formData.email ||
            !formData.whatsapp
          }
        >
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </Box>
    </Box>
  );
};

export default NewUserForm;
