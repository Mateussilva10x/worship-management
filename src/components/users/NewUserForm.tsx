import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { POSITION_KEYS } from "../../constants";

interface NewUserFormProps {
  onSubmit: (formData: {
    name: string;
    email: string;
    whatsapp: string;
    positions: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    positions: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setFormData((prev) => {
      const newPositions = checked
        ? [...prev.positions, value]
        : prev.positions.filter((p) => p !== value);
      return { ...prev, positions: newPositions };
    });
  };

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setFormData((prev) => ({ ...prev, positions: POSITION_KEYS }));
    } else {
      setFormData((prev) => ({ ...prev, positions: [] }));
    }
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

  const areAllPositionsSelected =
    formData.positions.length === POSITION_KEYS.length;

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

      <FormControlLabel
        label={<strong>{t("allPositions")}</strong>}
        control={
          <Checkbox
            checked={areAllPositionsSelected}
            indeterminate={
              !areAllPositionsSelected && formData.positions.length > 0
            }
            onChange={handleSelectAllChange}
          />
        }
        sx={{ width: "100%" }}
      />
      <Divider sx={{ width: "100%", my: 1 }} />
      <FormControl
        component="fieldset"
        variant="standard"
        sx={{ mt: 2, mb: 2 }}
      >
        <FormLabel component="legend">Disponível para</FormLabel>
        <FormGroup
          sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {POSITION_KEYS.map((positionKey) => (
            <FormControlLabel
              key={positionKey}
              control={
                <Checkbox
                  checked={formData.positions.includes(positionKey)}
                  onChange={handlePositionChange}
                  value={positionKey}
                />
              }
              label={t(`positions.${positionKey}`)}
              sx={{ minWidth: "150px" }}
            />
          ))}
        </FormGroup>
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button onClick={onCancel} color="secondary">
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
