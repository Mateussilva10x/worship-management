import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  const { open, message, severity, handleClose } = useNotificationState();
  return (
    <>
      <Router>
        <Routes>
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
                <Route path="/groups/:groupId" element={<GroupDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>

              <Route path="/reset-password" element={<ChangePasswordPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
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
