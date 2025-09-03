import React from "react";
import { Box, Typography } from "@mui/material";

interface CopyrightProps {
  sx?: object;
}

const Copyright: React.FC<CopyrightProps> = ({ sx }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={sx}
      >
        {`© ${new Date().getFullYear()} Worship Management - v${__APP_VERSION__}`}
      </Typography>
    </Box>
  );
};

export default Copyright;
