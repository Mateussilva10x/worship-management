import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import MusicLibraryPage from "./pages/MusicLibraryPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupsDetailPage";
import UsersPage from "./pages/UsersPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RedirectIfAuth from "./components/auth/RedirectIfAuth";
import AuthGate from "./components/auth/AuthGate";
import { useNotificationState } from "./contexts/NotificationContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { Box } from "@mui/material";
import Footer from "./components/common/Footer";
import { supabase } from "./supabaseClient";
import { useEffect } from "react";

const AuthEventHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};
function App() {
  const { open, message, severity, handleClose } = useNotificationState();
  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Router>
          <AuthEventHandler />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ChangePasswordPage />} />
              <Route element={<RedirectIfAuth />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AuthGate />}>
                  <Route path="/" element={<HomePage />} />

                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/songs" element={<MusicLibraryPage />} />
                    <Route path="/groups" element={<GroupsPage />} />
                    <Route
                      path="/groups/:groupId"
                      element={<GroupDetailPage />}
                    />
                    <Route path="/users" element={<UsersPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Box>
          <Footer />
        </Router>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
