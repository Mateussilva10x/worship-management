import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  AppBar,
  Menu,
  MenuItem,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";

import { useTheme, type Theme, type CSSObject } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LanguageIcon from "@mui/icons-material/Language";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const languages = [
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
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

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: t("dashboard"), icon: <DashboardIcon />, path: "/dashboard" },
    { text: t("songs"), icon: <MusicNoteIcon />, path: "/songs" },
    {
      text: t("groups"),
      icon: <PeopleIcon />,
      path: "/groups",
      adminOnly: true,
    },
    {
      text: t("users"),
      icon: <GroupAddIcon />,
      path: "/users",
      adminOnly: true,
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ marginRight: 2 }}
          >
            {open && !isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Escalas Louvor IPC
          </Typography>

          <Typography sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>
            {t("hello")}, {user?.name.split(" ")[0]}
          </Typography>
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
            <IconButton
              color="inherit"
              onClick={handleLogout}
              aria-label="Sair"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <MuiDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          ...(!isMobile && {
            ...(open && {
              ...openedMixin(theme),
              "& .MuiDrawer-paper": openedMixin(theme),
            }),
            ...(!open && {
              ...closedMixin(theme),
              "& .MuiDrawer-paper": closedMixin(theme),
            }),
          }),
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => {
            if (!item.adminOnly || (item.adminOnly && user?.role === "admin")) {
              return (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Tooltip
                    title={item.text}
                    placement="right"
                    disableHoverListener={open}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                      }}
                      onClick={() => navigate(item.path)}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      </MuiDrawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
