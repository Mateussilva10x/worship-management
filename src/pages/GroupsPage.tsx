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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import NewGroupForm from "../components/groups/NewGroupForm";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/DataContext";

const GroupsPage: React.FC = () => {
  const { groups, createGroup, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateGroup = async (formData: { name: string }) => {
    try {
      await createGroup(formData);
      setIsModalOpen(false);
    } catch (err) {
      alert("Falha ao salvar grupo.");
    }
  };

  if (loading) {
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
        <Typography variant="h4">Gestão de Grupos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Grupo
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
                  secondary={`${group.members.length} membro(s)`}
                />
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: "center" }}>
              Nenhum grupo encontrado.
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
