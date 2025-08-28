import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import logoIPC from "../assets/logo.svg";
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
  onClick?: () => void;
};

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  to,
  icon,
  title,
  onClick,
}) => (
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
    onClick={onClick}
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

  const handleLogout = () => {
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
      {
        to: "/login",
        icon: <LogoutIcon color="error" />,
        title: t("logout"),
        onclick: handleLogout,
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
      {
        to: "/login",
        icon: <LogoutIcon color="error" />,
        title: t("logout"),
        onclick: handleLogout,
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
      {
        to: "/login",
        icon: <LogoutIcon color="error" />,
        title: t("logout"),
        onclick: handleLogout,
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
      {
        to: "/login",
        icon: <LogoutIcon color="error" />,
        title: t("logout"),
        onclick: handleLogout,
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
            width: "500px",
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
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
