import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Dummy data for sliders
const initialSliderData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
    title: 'Island Hopping Extravaganza',
    status: 'active',
    displayOrder: 1,
    company: 'Travel Co.',
    createdAt: '29 May 2025, 11:54 am'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100&h=100&fit=crop',
    title: 'Cultural Wonders of Europe',
    status: 'active',
    displayOrder: 2,
    company: 'Euro Tours',
    createdAt: '28 May 2025, 10:54 am'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=100&h=100&fit=crop',
    title: 'Safari Expedition in Africa',
    status: 'pending',
    displayOrder: 3,
    company: 'Wild Adventures',
    createdAt: '27 May 2025, 9:54 am'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
    title: 'Grand Canyon Explorer',
    status: 'cancelled',
    displayOrder: 4,
    company: 'Nature Trips',
    createdAt: '26 May 2025, 8:54 am'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=100&h=100&fit=crop',
    title: 'Historic Cities of Asia',
    status: 'active',
    displayOrder: 5,
    company: 'Asia Explorer',
    createdAt: '25 May 2025, 7:54 am'
  }
];

const SliderManagementPage = () => {
  const [sliders, setSliders] = useState(initialSliderData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSliderId, setSelectedSliderId] = useState(null);

  const handleMenuClick = (event, sliderId) => {
    setAnchorEl(event.currentTarget);
    setSelectedSliderId(sliderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSliderId(null);
  };

  const handleStatusToggle = (sliderId, newStatus) => {
    setSliders(prev => 
      prev.map(slider => 
        slider.id === sliderId 
          ? { ...slider, status: newStatus }
          : slider
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
        Slider Management
      </Typography>
      
      <Paper elevation={2} sx={{ mt: 3, borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Display Order</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sliders.map((slider) => (
                <TableRow 
                  key={slider.id} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f8f9fa' },
                    borderBottom: '1px solid #e0e0e0'
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{slider.id}</TableCell>
                  
                  <TableCell>
                    <Avatar
                      src={slider.image}
                      alt={slider.title}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                      {slider.title}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusLabel(slider.status)}
                      color={getStatusColor(slider.status)}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 500, minWidth: 80 }}
                    />
                  </TableCell>
                  
                  <TableCell sx={{ fontWeight: 500 }}>
                    {slider.displayOrder}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {slider.company}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {slider.createdAt}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Active/Inactive Toggle Buttons */}
                      <Tooltip title="Mark as Active">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusToggle(slider.id, 'active')}
                          sx={{ 
                            color: slider.status === 'active' ? '#4caf50' : '#ccc',
                            '&:hover': { backgroundColor: '#e8f5e8' }
                          }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Mark as Inactive">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusToggle(slider.id, 'inactive')}
                          sx={{ 
                            color: slider.status === 'inactive' ? '#f44336' : '#ccc',
                            '&:hover': { backgroundColor: '#ffeaea' }
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Three dots menu */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, slider.id)}
                        sx={{ color: '#666' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 150,
              mt: 1,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                fontSize: '0.875rem'
              }
            }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <DownloadIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Download
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <PrintIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Print
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ShareIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Share
          </MenuItem>
          <MenuItem 
            onClick={handleMenuClose}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Delete
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default SliderManagementPage;