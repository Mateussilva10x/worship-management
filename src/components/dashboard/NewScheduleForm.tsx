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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { ptBR } from "date-fns/locale/pt-BR";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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
    if (!formData.date || !formData.worshipGroupId) {
      alert("Por favor, preencha a data e selecione um grupo.");
      return;
    }
    setIsSubmitting(true);

    await onSubmit({ ...formData, date: formData.date.toISOString() });
    setIsSubmitting(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Criar Nova Escala
        </Typography>

        <DateTimePicker
          label="Data e Hora do Culto"
          value={formData.date}
          onChange={(newDate) =>
            setFormData((prev) => ({ ...prev, date: newDate }))
          }
          sx={{ width: "100%", mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="group-select-label">Equipe de Louvor</InputLabel>
          <Select
            labelId="group-select-label"
            name="worshipGroupId"
            value={formData.worshipGroupId}
            onChange={handleSelectChange}
            label="Equipe de Louvor"
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="song-select-label">Músicas</InputLabel>
          <Select
            labelId="song-select-label"
            name="songs"
            multiple
            value={formData.songs}
            onChange={handleSelectChange}
            input={<OutlinedInput label="Músicas" />}
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
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Escala"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default NewScheduleForm;
