import React from "react";
import { Box, Typography } from "@mui/material";
import appLogo from "../../assets/logo.svg";

interface CopyrightProps {
  sx?: object;
}

const Copyright: React.FC<CopyrightProps> = ({ sx }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <img src={appLogo} alt="Logo" style={{ height: "35px", width: "auto" }} />
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={sx}
      >
        {`© ${new Date().getFullYear()} New Worship Management - v${__APP_VERSION__}`}
      </Typography>
    </Box>
  );
};

export default Copyright;
