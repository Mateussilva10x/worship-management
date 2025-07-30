/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import NewUserForm from "../components/users/NewUserForm";
import { useData } from "../contexts/DataContext";

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

const UsersPage: React.FC = () => {
  const { users, createUser } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
  }) => {
    try {
      const newUser = await createUser(formData);
      alert(
        `Usuário ${newUser.name} criado com sucesso! A senha temporária é "senha123".`
      );
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

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
        <Typography variant="h4">Gestão de Usuários</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Membro
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Papel</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {user.role}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <NewUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsModalOpen(false)}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default UsersPage;
