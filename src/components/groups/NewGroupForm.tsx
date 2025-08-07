import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

interface NewGroupFormProps {
  onSubmit: (formData: { name: string }) => Promise<void>;
  onCancel: () => void;
}

const NewGroupForm: React.FC<NewGroupFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      alert("Por favor, insira um nome para o grupo.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit({ name });
    setIsSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        {t("createNewGroup")}
      </Typography>
      <TextField
        label={t("groupName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        autoFocus
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

export default NewGroupForm;
