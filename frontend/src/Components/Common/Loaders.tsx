import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Paper,
  keyframes
} from '@mui/material';
import {
  DeliveryDining as DeliveryIcon,
  DirectionsBike as BikeIcon,
  LocalShipping as TruckIcon,
//   Motorcycle as MotorcycleIcon,
  TwoWheeler as ScooterIcon
} from '@mui/icons-material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';


// Keyframes for animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const slideIn = keyframes`
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  50% {
    transform: translateX(10px);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Main Delivery Loader Component
const DeliveryLoader = ({
  open = true,
  message = "Loading...",
  submessage = "Please wait while we process your request",
  variant = "delivery", // delivery, bike, truck, motorcycle, scooter, minimal
  size = "medium", // small, medium, large
  backdrop = true,
  color = "primary"
}) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { iconSize: 40, progressSize: 50, containerSize: 200 };
      case 'large':
        return { iconSize: 80, progressSize: 100, containerSize: 400 };
      default:
        return { iconSize: 60, progressSize: 70, containerSize: 300 };
    }
  };

  const { iconSize, progressSize, containerSize } = getSizeProps();

  const getIcon = () => {
    const iconProps = {
      sx: { 
        fontSize: iconSize,
        color: `${color}.main`,
        animation: `${pulse} 2s infinite ease-in-out`
      }
    };

    switch (variant) {
      case 'bike':
        return <BikeIcon {...iconProps} />;
      case 'truck':
        return <TruckIcon {...iconProps} />;
      case 'motorcycle':
        return <TwoWheelerIcon {...iconProps} />;
      case 'scooter':
        return <ScooterIcon {...iconProps} />;
      default:
        return <DeliveryIcon {...iconProps} />;
    }
  };

  const LoaderContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size === 'small' ? 150 : 200,
        width: containerSize,
        maxWidth: '90vw',
        padding: 3,
        textAlign: 'center'
      }}
    >
      {/* Animated Icon with Progress */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        {/* Background Circle Progress */}
        <CircularProgress
          size={progressSize}
          thickness={3}
          sx={{
            color: `${color}.light`,
            opacity: 0.3,
            position: 'absolute'
          }}
          variant="determinate"
          value={100}
        />
        
        {/* Animated Progress */}
        <CircularProgress
          size={progressSize}
          thickness={3}
          sx={{
            color: `${color}.main`,
            position: 'absolute',
            animation: `${rotate} 2s linear infinite`
          }}
        />
        
        {/* Delivery Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${bounce} 2s infinite`
          }}
        >
          {getIcon()}
        </Box>
      </Box>

      {/* Loading Text */}
      <Typography
        variant={size === 'small' ? 'body1' : 'h6'}
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
          animation: `${slideIn} 1s ease-out`
        }}
      >
        {message}
      </Typography>

      {/* Sub Message */}
      {submessage && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            opacity: 0.8,
            animation: `${slideIn} 1s ease-out 0.2s both`
          }}
        >
          {submessage}
        </Typography>
      )}

      {/* Animated Dots */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          mt: 2,
          '& > span': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: `${color}.main`,
            animation: `${bounce} 1.4s infinite ease-in-out both`,
            '&:nth-of-type(1)': { animationDelay: '-0.32s' },
            '&:nth-of-type(2)': { animationDelay: '-0.16s' }
          }
        }}
      >
        <span />
        <span />
        <span />
      </Box>
    </Box>
  );

  if (backdrop) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={open}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(10px)'
          }}
        >
          <LoaderContent />
        </Paper>
      </Backdrop>
    );
  }

  return open ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 200
      }}
    >
      <LoaderContent />
    </Box>
  ) : null;
};

// Compact Inline Loader
const InlineDeliveryLoader = ({
  message = "Loading...",
  variant = "delivery",
  size = 20,
  color = "primary"
}) => {
  const getIcon = () => {
    const iconProps = {
      sx: { 
        fontSize: size,
        color: `${color}.main`,
        animation: `${pulse} 1.5s infinite ease-in-out`
      }
    };

    switch (variant) {
      case 'bike':
        return <BikeIcon {...iconProps} />;
      case 'truck':
        return <TruckIcon {...iconProps} />;
      case 'motorcycle':
        return <TwoWheelerIcon {...iconProps} />;
      case 'scooter':
        return <ScooterIcon {...iconProps} />;
      default:
        return <DeliveryIcon {...iconProps} />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1
      }}
    >
      {getIcon()}
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      <CircularProgress size={16} thickness={4} sx={{ ml: 1 }} />
    </Box>
  );
};

// Table Loading Skeleton
const TableDeliveryLoader = ({ rows = 5, columns = 6 }) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <DeliveryIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 1, width: '200px' }} />
          <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, width: '150px' }} />
        </Box>
      </Box>

      {/* Table Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Box
              key={colIndex}
              sx={{
                height: 20,
                bgcolor: 'grey.200',
                borderRadius: 1,
                flex: 1,
                animation: `${pulse} 2s infinite ease-in-out`,
                animationDelay: `${(rowIndex + colIndex) * 0.1}s`
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

// Demo Component showing all loader variants
const DeliveryLoaderDemo = () => {
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState('delivery');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Delivery Loader Components Demo
      </Typography>

      {/* Main Loader Demo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Main Backdrop Loader
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {['delivery', 'bike', 'truck', 'motorcycle', 'scooter'].map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              style={{
                padding: '8px 16px',
                border: variant === v ? '2px solid #1976d2' : '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: variant === v ? '#e3f2fd' : 'white',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {v}
            </button>
          ))}
        </Box>
        <button
          onClick={() => setLoading(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Loader
        </button>
      </Paper>

      {/* Inline Loader Demo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Inline Loaders
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <InlineDeliveryLoader message="Fetching delivery data..." variant="delivery" />
          <InlineDeliveryLoader message="Loading riders..." variant="bike" />
          <InlineDeliveryLoader message="Processing orders..." variant="truck" />
        </Box>
      </Paper>

      {/* Table Loader Demo */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Table Loading Skeleton
        </Typography>
        <TableDeliveryLoader rows={5} columns={8} />
      </Paper>

      {/* Main Loader */}
      <DeliveryLoader
        open={loading}
        message="Processing Delivery Data"
        submessage="Fetching rider information and order details..."
        variant={variant}
        size="medium"
        color="primary"
      />
    </Box>
  );
};

export { DeliveryLoader, InlineDeliveryLoader, TableDeliveryLoader };
export default DeliveryLoaderDemo;