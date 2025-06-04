import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { TwoWheeler } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animation for the delivery icon
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Animation for the circular progress
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      icon: 24,
      progress: 20,
      message: 'body2'
    },
    medium: {
      icon: 40,
      progress: 30,
      message: 'h6'
    },
    large: {
      icon: 60,
      progress: 40,
      message: 'h4'
    }
  };

  const config = sizeConfig[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999
        })
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Circular Progress */}
        <CircularProgress
          size={config.progress}
          thickness={4}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: `-${config.progress / 2}px`,
            marginLeft: `-${config.progress / 2}px`,
            animation: `${spin} 1s linear infinite`
          }}
        />
        
        {/* Rider Icon */}
        <TwoWheeler
          sx={{
            fontSize: config.icon,
            color: 'primary.main',
            animation: `${bounce} 1s ease-in-out infinite`,
            position: 'relative',
            zIndex: 1
          }}
        />
      </Box>

      {/* Loading Message */}
      <Typography
        variant={config.message as any}
        sx={{
          color: 'text.secondary',
          fontWeight: 500
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;

