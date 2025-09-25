import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataProvider } from "./contexts/DataContext.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <DataProvider>
            <NotificationProvider>
              <CssBaseline />
              <App />
            </NotificationProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
