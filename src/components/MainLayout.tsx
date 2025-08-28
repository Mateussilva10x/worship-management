import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  Box,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
  Tooltip,
  AppBar,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";

import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    handleLanguageMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const languages = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          {location.pathname !== "/" && (
            <Tooltip title="Voltar">
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                edge="start"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, ml: location.pathname === "/" ? 0 : 2 }}
          >
            New Worship Management
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {itemsToRender.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{ my: 2, color: "white" }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Tooltip title="Mudar Idioma">
            <IconButton
              size="large"
              edge="end"
              onClick={handleLanguageMenuOpen}
              color="inherit"
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                selected={i18n.language === lang.code}
              >
                <Typography sx={{ mr: 1.5 }}>{lang.flag}</Typography>{" "}
                {lang.name}
              </MenuItem>
            ))}
          </Menu>

          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, pb: { xs: 8, md: 3 } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
