import React, { useState } from "react";
import type { WorshipGroup, Song } from "../../types";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  type SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale/pt-BR";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

interface FormData {
  date: Date | null;
  worshipGroupId: string;
  songs: string[];
}

interface NewScheduleFormProps {
  groups: WorshipGroup[];
  songs: Song[];
  onSubmit: (
    formData: Omit<FormData, "date"> & { date: string }
  ) => Promise<void>;
  onCancel: () => void;
}

const NewScheduleForm: React.FC<NewScheduleFormProps> = ({
  groups,
  songs,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    worshipGroupId: "",
    songs: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formData.date) {
      setIsSubmitting(false);
      return;
    }
    const date = new Date(formData.date);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const dateWithoutTimezone = new Date(date.getTime() - timezoneOffset);
    const formattedDate = dateWithoutTimezone.toISOString().split("T")[0];

    await onSubmit({ ...formData, date: formattedDate });
    setIsSubmitting(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          {t("createNewSchedule")}
        </Typography>

        <DatePicker
          label={t("scheduleDate")}
          value={formData.date}
          onChange={(newDate) =>
            setFormData((prev) => ({ ...prev, date: newDate }))
          }
          sx={{ width: "100%", mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="group-select-label">{t("worshipTeam")}</InputLabel>
          <Select
            labelId="group-select-label"
            name="worshipGroupId"
            value={formData.worshipGroupId}
            onChange={handleSelectChange}
            label={t("worshipTeam")}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="song-select-label">{t("songs")}</InputLabel>
          <Select
            labelId="song-select-label"
            name="songs"
            multiple
            value={formData.songs}
            onChange={handleSelectChange}
            input={<OutlinedInput label={t("songs")} />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip
                    key={value}
                    label={songs.find((s) => s.id === value)?.title || ""}
                  />
                ))}
              </Box>
            )}
          >
            {songs.map((song) => (
              <MenuItem key={song.id} value={song.id}>
                {song.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button onClick={onCancel} color="secondary" disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              isSubmitting || !formData.date || !formData.worshipGroupId
            }
          >
            {isSubmitting ? t("saving") : t("saveSchedule")}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default NewScheduleForm;
