import React, { useEffect, useState } from "react";
import type { Schedule, WorshipGroup } from "../../types";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale/pt-BR";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";
import { useData } from "../../contexts/DataContext";

interface FormData {
  date: Date | null;
  worshipGroupId: string;
}

interface NewScheduleFormProps {
  groups: WorshipGroup[];
  onSubmit: (formData: {
    date: string;
    worshipGroupId: string;
  }) => Promise<void>;
  onCancel: () => void;
  scheduleToEdit?: Schedule | null;
}

const NewScheduleForm: React.FC<NewScheduleFormProps> = ({
  groups,
  onSubmit,
  onCancel,
  scheduleToEdit,
}) => {
  const { t } = useTranslation();
  const { updateScheduleGroup, updateScheduleDate } = useData();
  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    worshipGroupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scheduleToEdit) {
      setFormData({
        date: new Date(scheduleToEdit.date),
        worshipGroupId: scheduleToEdit.group.id,
      });
    }
  }, [scheduleToEdit]);

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.date || !formData.worshipGroupId) {
      return;
    }
    setIsSubmitting(true);

    const dateISO = formData.date.toISOString();

    try {
      if (scheduleToEdit) {
        const hasGroupChanged =
          scheduleToEdit.group.id !== formData.worshipGroupId;
        const hasDateChanged =
          new Date(scheduleToEdit.date).toISOString() !== dateISO;

        if (hasGroupChanged) {
          await updateScheduleGroup(scheduleToEdit.id, formData.worshipGroupId);
          if (hasDateChanged) {
            await updateScheduleDate(scheduleToEdit.id, dateISO);
          }
        } else if (hasDateChanged) {
          await updateScheduleDate(scheduleToEdit.id, dateISO);
        }
      } else {
        await onSubmit({
          date: dateISO,
          worshipGroupId: formData.worshipGroupId,
        });
      }
      onCancel();
    } catch (error) {
      console.error("Falha ao salvar a escala:", error);
      alert("Ocorreu um erro ao salvar a escala.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          {scheduleToEdit ? t("editSchedule") : t("createNewSchedule")}
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
