import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logoIPC from "../assets/church-logo.svg";
import { useAuth } from "../contexts/AuthContext";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";

type MenuItemCardProps = {
  to: string;
  icon: React.ReactNode;
  title: string;
};

const MenuItemCard: React.FC<MenuItemCardProps> = ({ to, icon, title }) => (
  <Card
    component={RouterLink}
    to={to}
    sx={{
      textDecoration: "none",
      display: "flex",
      flexDirection: "column",
      flex: "1 1 150px",
      maxWidth: { xs: "calc(50% - 8px)", sm: "200px" },
    }}
  >
    <CardActionArea
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        flexGrow: 1,
      }}
    >
      {icon}
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Typography component="div">{title}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
    logout();
  };

  const menuItems = {
    worship_director: [
      {
        to: "/dashboard",
        icon: <DashboardIcon color="primary" />,
        title: t("schedules"),
      },
      {
        to: "/songs",
        icon: <MusicNoteIcon color="primary" />,
        title: t("songs"),
      },
      {
        to: "/groups",
        icon: <PeopleIcon color="primary" />,
        title: t("groups"),
      },
      {
        to: "/users",
        icon: <GroupAddIcon color="primary" />,
        title: t("users"),
      },
    ],
    leader: [
      {
        to: "/dashboard",
        icon: <DashboardIcon color="primary" />,
        title: t("schedules"),
      },
      {
        to: "/groups",
        icon: <PeopleIcon color="primary" />,
        title: t("groups"),
      },
      {
        to: "/songs",
        icon: <MusicNoteIcon color="primary" />,
        title: t("songs"),
      },
    ],
    member: [
      {
        to: "/dashboard",
        icon: <DashboardIcon color="primary" />,
        title: t("schedules"),
      },
      {
        to: "/songs",
        icon: <MusicNoteIcon color="primary" />,
        title: t("songs"),
      },
    ],
    admin: [
      {
        to: "/dashboard",
        icon: <DashboardIcon color="primary" />,
        title: t("schedules"),
      },
      {
        to: "/songs",
        icon: <MusicNoteIcon color="primary" />,
        title: t("songs"),
      },
      {
        to: "/groups",
        icon: <PeopleIcon color="primary" />,
        title: t("groups"),
      },
    ],
  };

  const itemsToRender = user ? menuItems[user.role] || [] : [];

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={logoIPC}
          alt="Logo IPC"
          style={{
            maxWidth: "100%",
            width: "230px",
            height: "auto",
            marginBottom: "4px",
          }}
        />

        {isAuthenticated && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {itemsToRender.map((item) => (
              <MenuItemCard key={item.to} {...item} />
            ))}
            <Card
              sx={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                flex: "1 1 150px",
                maxWidth: { xs: "calc(50% - 8px)", sm: "200px" },
              }}
              onClick={handleLogout}
            >
              <CardActionArea
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  flexGrow: 1,
                }}
              >
                <LogoutIcon color="error" />
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography component="div">{t("logout")}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
