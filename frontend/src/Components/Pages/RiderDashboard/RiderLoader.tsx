import React from "react";
import { Box, Typography, Fade, keyframes } from "@mui/material";
import { DirectionsBike } from "@mui/icons-material";

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const RiderLoader: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        zIndex: 9999,
      }}
    >
      <Fade in={true} timeout={1000}>
        <Box
          sx={{
            textAlign: 'center',
            position: 'relative',
            width: '120px',
            height: '120px',
          }}
        >
          {/* Outer spinning circle */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: `${spin} 1s linear infinite`,
            }}
          />

          {/* Rider icon with bounce animation */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `${bounce} 1s ease-in-out infinite`,
            }}
          >
            <DirectionsBike
              sx={{
                fontSize: 40,
                color: 'primary.main',
              }}
            />
          </Box>
        </Box>
      </Fade>

      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: 'text.primary',
          fontWeight: 500,
        }}
      >
        Loading Rider Data...
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: 'text.secondary',
          maxWidth: '300px',
          textAlign: 'center',
        }}
      >
        Please wait while we fetch your attendance information
      </Typography>
    </Box>
  );
};

export default RiderLoader; 