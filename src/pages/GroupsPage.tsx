/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import NewGroupForm from "../components/groups/NewGroupForm";
import { useNavigate } from "react-router-dom";
import type { WorshipGroup } from "../types";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useTranslation } from "react-i18next";
import { useNotificationDispatch } from "../contexts/NotificationContext";
import { useGroups, useCreateGroup, useDeleteGroup } from "../hooks/useGroups";

const GroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showNotification } = useNotificationDispatch();

  const { data: groups = [], isLoading } = useGroups();
  const createGroupMutation = useCreateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<WorshipGroup | null>(null);

  const handleCreateGroup = async (formData: { name: string }) => {
    await createGroupMutation.mutateAsync(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        showNotification("Grupo criado com sucesso!", "success");
      },
      onError: (err) => {
        showNotification(`Falha ao criar grupo: ${err.message}`, "error");
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (groupToDelete) {
      await deleteGroupMutation.mutateAsync(groupToDelete.id, {
        onSuccess: () => {
          setGroupToDelete(null);
          showNotification("Grupo excluído com sucesso!", "success");
        },
        onError: (err) => {
          showNotification(`Falha ao excluir grupo: ${err.message}`, "error");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{t("groupsPage")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ whiteSpace: "nowrap", px: 4 }}
        >
          {t("newGroup")}
        </Button>
      </Box>

      <Paper>
        <List>
          {groups.length > 0 ? (
            groups.map((group) => (
              <ListItem
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <GroupIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={group.name}
                  secondary={`${group.members.length} ${t("member(s)")}`}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    setGroupToDelete(group);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: "center" }}>
              {t("noGroupsFound")}
            </Typography>
          )}
        </List>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <NewGroupForm
            onSubmit={handleCreateGroup}
            onCancel={() => setIsModalOpen(false)}
          />
        </Box>
      </Modal>
      <ConfirmationDialog
        open={!!groupToDelete}
        title={t("confirmDelete")}
        message={t("confirmGroupDelete", { groupName: groupToDelete?.name })}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGroupToDelete(null)}
      />
    </Box>
  );
};

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default GroupsPage;
