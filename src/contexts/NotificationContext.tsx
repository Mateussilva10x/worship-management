/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import type { AlertColor } from "@mui/material/Alert";

interface NotificationContextType {
  showNotification: (message: React.ReactNode, severity?: AlertColor) => void;
}

interface NotificationState {
  open: boolean;
  message: React.ReactNode;
  severity: AlertColor;
  handleClose: (event?: SyntheticEvent | Event, reason?: string) => void;
}

export const NotificationStateContext = createContext<
  NotificationState | undefined
>(undefined);
export const NotificationDispatchContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const handleClose = (_?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const showNotification = (
    newMessage: React.ReactNode,
    newSeverity: AlertColor = "success"
  ) => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setOpen(true);
  };

  const stateValue = { open, message, severity, handleClose };
  const dispatchValue = { showNotification };

  return (
    <NotificationStateContext.Provider value={stateValue}>
      <NotificationDispatchContext.Provider value={dispatchValue}>
        {children}
      </NotificationDispatchContext.Provider>
    </NotificationStateContext.Provider>
  );
};

export const useNotificationState = () => {
  const context = useContext(NotificationStateContext);
  if (context === undefined)
    throw new Error(
      "useNotificationState must be used within a NotificationProvider"
    );
  return context;
};

export const useNotificationDispatch = () => {
  const context = useContext(NotificationDispatchContext);
  if (context === undefined)
    throw new Error(
      "useNotificationDispatch must be used within a NotificationProvider"
    );
  return context;
};
