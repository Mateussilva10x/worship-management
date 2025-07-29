/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Modal,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import type { WorshipGroup } from "../types";
import { fetchGroups, createGroup } from "../services/api";
import NewGroupForm from "../components/groups/NewGroupForm";

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<WorshipGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchInitiated = useRef(false);

  useEffect(() => {
    if (fetchInitiated.current) return;
    fetchInitiated.current = true;

    const loadGroups = async () => {
      try {
        setLoading(true);
        const groupsData = await fetchGroups();
        setGroups(groupsData);
      } catch (err) {
        setError("Falha ao carregar os grupos.");
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleCreateGroup = async (formData: { name: string }) => {
    try {
      const newGroup = await createGroup(formData);
      setGroups((prev) => [newGroup, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      alert("Falha ao salvar o grupo.");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

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
          {groups.map((group) => (
            <ListItem key={group.id}>
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
          ))}
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
