import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
} from "@mui/material";
import { useRespondToSwapRequest } from "../../hooks/useRespondToSwapRequest";
import { useTranslation } from "react-i18next";
import { useSwapRequests } from "../../hooks/useSwapRequest";

const SwapRequestsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: swapRequests, isLoading, error } = useSwapRequests();
  const respondMutation = useRespondToSwapRequest();

  const handleResponse = (
    requestId: string,
    response: "accepted" | "rejected"
  ) => {
    respondMutation.mutate({ swap_request_id: requestId, response });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erro ao carregar solicitações: {error.message}
      </Alert>
    );
  }

  if (!swapRequests || swapRequests.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        {t("noPendingSwapRequests")}
      </Typography>
    );
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <List>
        {swapRequests.map((request) => (
          <ListItem
            key={request.id}
            divider
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleResponse(request.id, "accepted")}
                  disabled={respondMutation.isPending}
                >
                  {t("accept")}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleResponse(request.id, "rejected")}
                  disabled={respondMutation.isPending}
                >
                  {t("reject")}
                </Button>
              </Stack>
            }
          >
            <ListItemText
              primary={`Pedido de ${
                request.initiating_leader?.name || "Líder desconhecido"
              }`}
              secondary={
                <>
                  Trocar sua escala de {request.target_schedule?.group?.name} (
                  {new Date(
                    request.target_schedule?.date || ""
                  ).toLocaleDateString(i18n.language)}
                  )
                  <br />
                  Pela escala de {request.initiating_schedule?.group?.name} (
                  {new Date(
                    request.initiating_schedule?.date || ""
                  ).toLocaleDateString(i18n.language)}
                  )
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SwapRequestsList;
