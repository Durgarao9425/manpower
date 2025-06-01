import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface OrderStatement {
  id?: number;
  company_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  notes: string;
  file?: File | null;
}

interface Company {
  id: string;
  name: string;
}

const OrderForm = ({ setCurrentComponent }: { setCurrentComponent: React.Dispatch<React.SetStateAction<string>> }) => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderStatement>({
    company_id: '',
    start_date: '',
    end_date: '',
    amount: 0,
    notes: '',
    file: null
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock companies data
  const mockCompanies: Company[] = [
    { id: '1', name: 'Big Basket' },
    { id: '2', name: 'Wuckert Inc' },
    { id: '3', name: 'Feest Group' },
    { id: '4', name: 'Wilson Automotive' },
    { id: '5', name: 'Tech Solutions' }
  ];

  useEffect(() => {
    fetchCompanies();
    if (id && id !== 'new') {
      fetchOrder();
      setIsEditing(true);
    }
  }, [id]);

  const fetchCompanies = async () => {
    try {
      // Replace with actual API call
      // const response = await axios.get('/api/companies');
      // setCompanies(response.data);
      
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await axios.get(`/api/orders/weekly-orders/${id}`);
      // setOrder(response.data);
      
      // Mock data
      setTimeout(() => {
        setOrder({
          company_id: '1',
          start_date: '2025-05-22',
          end_date: '2025-05-31',
          amount: 0.00,
          notes: 'Initial upload for May period'
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('company_id', order.company_id);
      formData.append('start_date', order.start_date);
      formData.append('end_date', order.end_date);
      formData.append('amount', order.amount.toString());
      formData.append('notes', order.notes);
      if (order.file) {
        formData.append('file', order.file);
      }

      if (isEditing && id) {
        // Update existing order
        // await axios.put(`/api/orders/weekly-orders/${id}`, formData);
        console.log('Updating order:', order);
        alert('Order updated successfully!');
      } else {
        // Create new order
        // await axios.post('/api/orders/weekly-orders', formData);
        console.log('Creating order:', order);
        alert('Order created successfully!');
      }
      
      setCurrentComponent('OrdersList');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setOrder(prev => ({ ...prev, file }));
  };

  if (loading && (isEditing || companies.length === 0)) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setCurrentComponent('OrdersList')}
        >
          Back to Orders
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Order Statement' : 'Create New Order Statement'}
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="company_id"
                    value={order.company_id}
                    onChange={(e) => setOrder({ ...order, company_id: e.target.value })}
                    label="Company"
                    required
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="start_date"
                  value={order.start_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="end_date"
                  value={order.end_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  type="number"
                  name="amount"
                  value={order.amount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Upload Excel File
                  </Typography>
                  <Input
                    type="file"
                    inputProps={{ accept: '.xlsx,.xls,.csv' }}
                    onChange={handleFileChange}
                    sx={{ display: 'none' }}
                    id="file-upload"
                    required={!isEditing}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Choose File
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {order.file ? order.file.name : 'No file chosen'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {isEditing ? 'Leave empty to keep existing file' : 'Upload your company\'s order details for the selected period'}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={order.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentComponent('OrdersList')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Order'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderForm;