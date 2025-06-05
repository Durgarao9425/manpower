import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  TablePagination,
  Grid,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { fetchSliderImages, addSliderImage, updateSliderImage, deleteSliderImage, fetchCompanies } from '../../../services/apiService.ts';

// Define Slider type
interface Slider {
  id: number;
  title: string;
  description: string;
  image_path: string;
  status: string;
  display_order: number;
  company_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Correct TypeScript types
interface FormData {
  id?: number; // Optional for new sliders
  title: string;
  description: string;
  image_path: string;
  status: string;
  display_order: number;
  company_id: number;
  created_by: string;
}

// Define component
const SliderManagementPage = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSliderId, setSelectedSliderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Form state for new slider
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_path: '',
    status: 'active',
    display_order: 0,
    company_id: 0,
    created_by: 'Current User' // This would typically come from auth context
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const loadSliders = async () => {
      try {
        const data: Slider[] = await fetchSliderImages();
        setSliders(data);
      } catch (error) {
        console.error('Error fetching slider images:', error);
      }
    };
    loadSliders();
  }, []);

  // Fetch companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    loadCompanies();
  }, []);

  // Fix type errors and add proper type annotations
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, sliderId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSliderId(sliderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSliderId(null);
  };

  const handleStatusToggle = (sliderId: number, newStatus: string) => {
    setSliders((prev) =>
      prev.map((slider) =>
        slider.id === sliderId
          ? { ...slider, status: newStatus, updated_at: new Date().toISOString().replace('T', ' ').slice(0, -5) }
          : slider
      )
    );
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setOpenModal(true);
    // Set next display order
    const maxOrder = Math.max(...sliders.map(s => s.display_order), 0);
    setFormData({
      title: '',
      description: '',
      image_path: '',
      status: 'active',
      display_order: maxOrder + 1,
      company_id: 0,
      created_by: 'Current User'
    });
    setImagePreview('');
    setErrors({});
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setFormData({
      title: '',
      description: '',
      image_path: '',
      status: 'active',
      display_order: 0,
      company_id: 0,
      created_by: 'Current User'
    });
    setImagePreview('');
    setErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, image_path: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.image_path) {
      newErrors.image_path = 'Image is required';
    }
    
    if (!formData.company_id) {
      newErrors.company_id = 'Company is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOrEditSlider = async (): Promise<void> => {
    try {
      if (!validateForm()) {
        return;
      }
      
      if (isEditMode) {
        await handleUpdateSlider();
      } else {
        await handleAddSlider();
      }
    } catch (error) {
      console.error('Error adding or editing slider:', error);
    }
  };

  const handleDeleteSlider = async (sliderId: number): Promise<void> => {
    try {
      await deleteSliderImage(sliderId);
      setSliders((prev) => prev.filter((slider) => slider.id !== sliderId));
    } catch (error) {
      console.error('Error deleting slider image:', error);
    }
  };

  const handleEditSlider = (sliderId: number): void => {
    const sliderToEdit = sliders.find(slider => slider.id === sliderId);
    if (sliderToEdit) {
      setIsEditMode(true);
      setFormData({ ...sliderToEdit });
      setImagePreview(sliderToEdit.image_path);
      setOpenModal(true);
    }
    handleMenuClose();
  };

  const handleDownloadSlider = (sliderId: number): void => {
    const sliderToDownload = sliders.find(slider => slider.id === sliderId);
    if (sliderToDownload) {
      try {
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(sliderToDownload, null, 2)
        )}`;
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `slider_${sliderToDownload.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } catch (error) {
        alert('Error downloading file. Please try again.');
        console.error('Download error:', error);
      }
    }
    handleMenuClose();
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getCompanyName = (companyId: number): string => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.company_name : 'Unknown';
  };
  
  // Helper function to get full image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://placehold.co/350x150/4CAF50/FFFFFF?text=No+Image';
    
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a base64 data URL, return as is
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    // Otherwise, construct full URL with your API base URL
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4003';
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Use the direct image endpoint for better reliability
    const directUrl = `${API_BASE}/api/direct-image/${cleanPath}`;
    console.log(`Using direct image URL: ${directUrl} from path: ${imagePath}`);
    
    return directUrl;
  };

  // Add these inside the SliderManagementPage component
  const handleAddSlider = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      const newSlider = await addSliderImage(formData);
      console.log('New slider added:', newSlider);
      
      // Use the returned image_path if available
      const updatedImagePath = newSlider.image_path || formData.image_path;
      
      setSliders((prev) => [...prev, { 
        ...formData, 
        id: newSlider.id, 
        image_path: updatedImagePath,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }]);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error adding slider image:', error);
    }
  };

  const handleUpdateSlider = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      const response = await updateSliderImage(selectedSliderId, formData);
      console.log('Slider updated:', response);
      
      // Use the returned image_path if available
      const updatedImagePath = response.image_path || formData.image_path;
      
      setSliders((prev) => prev.map((slider) => (
        slider.id === selectedSliderId 
          ? { 
              ...slider, 
              ...formData, 
              image_path: updatedImagePath,
              updated_at: new Date().toISOString() 
            } 
          : slider
      )));
      
      handleCloseModal();
    } catch (error) {
      console.error('Error updating slider image:', error);
    }
  };

  // Paginated data
  const paginatedSliders = sliders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
          Slider Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{ 
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Add New Slider
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Table Section */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Order</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSliders.map((slider) => (
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
                          src={getImageUrl(slider.image_path)}
                          alt={slider.title}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                          onError={(e) => {
                            console.error(`Failed to load image for slider ${slider.id}`);
                            
                            // Try with a direct proxy approach
                            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4003';
                            const proxyUrl = `${API_BASE}/api/image-proxy?url=${encodeURIComponent(getImageUrl(slider.image_path))}`;
                            console.log(`Trying proxy URL: ${proxyUrl}`);
                            
                            // Update the image source to use the proxy
                            (e.target as HTMLImageElement).src = proxyUrl;
                            
                            // If proxy fails, use fallback
                            (e.target as HTMLImageElement).onerror = () => {
                              console.error(`Proxy also failed, using fallback`);
                              (e.target as HTMLImageElement).src = 'https://placehold.co/350x150/9E9E9E/FFFFFF?text=Image+Not+Found';
                            };
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                          {slider.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {slider.description.length > 50 
                            ? `${slider.description.substring(0, 50)}...` 
                            : slider.description
                          }
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
                        {slider.display_order}
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getCompanyName(slider.company_id)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(slider.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sliders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>

        {/* Recent Images Preview */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Images
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sliders.slice(0, 4).map((slider) => (
                <Card key={slider.id} sx={{ display: 'flex', height: 80 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 80, height: 80 }}
                    image={slider.image_path}
                    alt={slider.title}
                  />
                  <CardContent sx={{ flex: 1, p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                      {slider.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getCompanyName(slider.company_id)}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getStatusLabel(slider.status)}
                        color={getStatusColor(slider.status)}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 18 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add/Edit Slider Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {isEditMode ? 'Edit Slider' : 'Add New Slider'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                  helperText="Lower numbers will be displayed first"
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.company_id}>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={formData.company_id || ''}
                    onChange={(e) => handleInputChange('company_id', Number(e.target.value))}
                    label="Company"
                    displayEmpty
                  >
                    <MenuItem value="">Select Company</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.company_id && <FormHelperText>{errors.company_id}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      {imagePreview ? 'Change Image' : 'Choose Image'}
                    </Button>
                  </label>
                  
                  {errors.image_path && (
                    <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                      {errors.image_path}
                    </Typography>
                  )}
                  
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxWidth: 300,
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ddd'
                        }}
                      />
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Recommended size: 1200x400 pixels. Max file size: 5MB.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleAddOrEditSlider} 
            variant="contained"
            sx={{ backgroundColor: '#1976d2' }}
          >
            {isEditMode ? 'Update Slider' : 'Add Slider'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
        <MenuItem onClick={() => handleDownloadSlider(selectedSliderId || 0)}>
          <DownloadIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => handleEditSlider(selectedSliderId || 0)}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteSlider(selectedSliderId || 0)}
          sx={{ color: '#f44336' }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SliderManagementPage;