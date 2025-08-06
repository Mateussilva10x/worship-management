import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { DataProvider } from "./contexts/DataContext.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <AuthProvider>
          <DataProvider>
            <CssBaseline />
            <App />
          </DataProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
