import React from "react";
import {
  Box,
  Container,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PeopleIcon from "@mui/icons-material/People";
import { useTranslation } from "react-i18next";
import Copyright from "./Copyright";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    worship_director: [
      { path: "/", label: t("home"), icon: <HomeIcon /> },
      { path: "/dashboard", label: t("schedules"), icon: <DashboardIcon /> },
      { path: "/songs", label: t("songs"), icon: <MusicNoteIcon /> },
      { path: "/groups", label: t("groups"), icon: <PeopleIcon /> },
      { path: "/users", label: t("users"), icon: <PeopleIcon /> },
    ],
    leader: [
      { path: "/", label: t("home"), icon: <HomeIcon /> },
      { path: "/dashboard", label: t("schedules"), icon: <DashboardIcon /> },
      { path: "/songs", label: t("songs"), icon: <MusicNoteIcon /> },
      { path: "/groups", label: t("groups"), icon: <PeopleIcon /> },
    ],
    member: [
      { path: "/", label: t("home"), icon: <HomeIcon /> },
      { path: "/dashboard", label: t("schedules"), icon: <DashboardIcon /> },
      { path: "/songs", label: t("songs"), icon: <MusicNoteIcon /> },
    ],
    admin: [
      { path: "/", label: t("home"), icon: <HomeIcon /> },
      { path: "/dashboard", label: t("schedules"), icon: <DashboardIcon /> },
      { path: "/songs", label: t("songs"), icon: <MusicNoteIcon /> },
      { path: "/groups", label: t("groups"), icon: <PeopleIcon /> },
    ],
  };

  const itemsToRender = user ? menuItems[user.role] || [] : [];

  if (isMobile) {
    return (
      <Paper
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
        elevation={3}
      >
        {location.pathname !== "/" && user && (
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_event, newValue) => navigate(newValue)}
          >
            {itemsToRender.map((item: any) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
                sx={{
                  minWidth: "auto",
                  px: 1,
                  "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem" },
                }}
              />
            ))}
          </BottomNavigation>
        )}

        <Box sx={{ bgcolor: "background.paper", py: 0.5 }}>
          <Copyright />
        </Box>
      </Paper>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[200],
        position: "sticky",
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        width: "100%",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Copyright />
      </Container>
    </Box>
  );
};

export default Footer;
