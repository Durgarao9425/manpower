import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

const DataMappingView = () => {
  // Snackbar state for export success message
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Dummy mapped data (8 fields shown in table)
  const [mappedData] = useState([
    {
      riderId: 'RID001',
      riderName: 'John Smith',
      storeName: 'Downtown Store',
      deliveredOrders: 45,
      cancelledOrders: 2,
      pickupOrders: 8,
      attendance: 22,
      totalEarnings: 5847.50
    },
    {
      riderId: 'RID002',
      riderName: 'Sarah Johnson',
      storeName: 'Mall Branch',
      deliveredOrders: 38,
      cancelledOrders: 1,
      pickupOrders: 5,
      attendance: 20,
      totalEarnings: 4982.75
    },
    {
      riderId: 'RID003',
      riderName: 'Mike Wilson',
      storeName: 'City Center',
      deliveredOrders: 52,
      cancelledOrders: 3,
      pickupOrders: 12,
      attendance: 25,
      totalEarnings: 6234.25
    },
    {
      riderId: 'RID004',
      riderName: 'Emma Davis',
      storeName: 'North Plaza',
      deliveredOrders: 41,
      cancelledOrders: 1,
      pickupOrders: 7,
      attendance: 21,
      totalEarnings: 5156.80
    },
    {
      riderId: 'RID005',
      riderName: 'David Brown',
      storeName: 'West Side',
      deliveredOrders: 33,
      cancelledOrders: 4,
      pickupOrders: 6,
      attendance: 18,
      totalEarnings: 4523.90
    }
  ]);

  // Mapped fields (shown in table)
  const [mappedFields] = useState([
    'Rider ID',
    'Rider Name', 
    'Store Name',
    'Delivered Orders',
    'Cancelled Orders',
    'Pickup Orders',
    'Attendance',
    'Total Earnings'
  ]);

  // 12 unmapped fields
  const [unmappedFields] = useState([
    'commission',
    'taxDeduction',
    'gst',
    'year',
    'month',
    'week',
    'ceeEmploymentCategory',
    'ceeCategory',
    'pan',
    'city',
    'storeType',
    'lmdProvider'
  ]);

  const handleExportExcel = () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Mapped Data
      const mappedDataForExcel = mappedData.map(row => ({
        'Rider ID': row.riderId,
        'Rider Name': row.riderName,
        'Store Name': row.storeName,
        'Delivered Orders': row.deliveredOrders,
        'Cancelled Orders': row.cancelledOrders,
        'Pickup Orders': row.pickupOrders,
        'Attendance': row.attendance,
        'Total Earnings': `₹${row.totalEarnings.toFixed(2)}`
      }));

      const mappedSheet = XLSX.utils.json_to_sheet(mappedDataForExcel);
      XLSX.utils.book_append_sheet(workbook, mappedSheet, 'Mapped Data');

      // Sheet 2: Field Information
      const fieldInfo = [
        { 'Field Type': 'Mapped Fields', 'Field Name': '', 'Status': 'Included in Export' },
        ...mappedFields.map(field => ({
          'Field Type': 'Mapped',
          'Field Name': field,
          'Status': 'Active'
        })),
        { 'Field Type': '', 'Field Name': '', 'Status': '' },
        { 'Field Type': 'Unmapped Fields', 'Field Name': '', 'Status': 'Available but not mapped' },
        ...unmappedFields.map(field => ({
          'Field Type': 'Unmapped',
          'Field Name': field,
          'Status': 'Not Active'
        }))
      ];

      const fieldSheet = XLSX.utils.json_to_sheet(fieldInfo);
      XLSX.utils.book_append_sheet(workbook, fieldSheet, 'Field Information');

      // Sheet 3: Summary
      const summary = [
        { 'Metric': 'Total Records', 'Value': mappedData.length },
        { 'Metric': 'Mapped Fields', 'Value': mappedFields.length },
        { 'Metric': 'Unmapped Fields', 'Value': unmappedFields.length },
        { 'Metric': 'Total Fields Available', 'Value': mappedFields.length + unmappedFields.length },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() },
        { 'Metric': 'Company', 'Value': 'Big Basket' },
        { 'Metric': 'Source File', 'Value': 'payment_data_export.xlsx' }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Data_Mapping_Export_${timestamp}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      // Show a MUI Snackbar/Alert instead of alert
      setSnackbarOpen(true);
      setSnackbarMessage(`Excel file "${filename}" has been downloaded successfully!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error occurred while exporting to Excel. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
          Data Mapping View
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Company: Big Basket | File: payment_data_export.xlsx | Mapped Fields: {mappedFields.length}
        </Typography>
      </Box>

      {/* Mapped Data Table */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Mapped Data Preview
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ boxShadow: 1, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {mappedFields.map((field, index) => (
                    <TableCell key={index} sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: '#e3f2fd',
                      color: '#1565c0'
                    }}>
                      {field}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mappedData.map((row, index) => (
                  <TableRow 
                    key={row.riderId}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    <TableCell>{row.riderId}</TableCell>
                    <TableCell>{row.riderName}</TableCell>
                    <TableCell>{row.storeName}</TableCell>
                    <TableCell align="center">{row.deliveredOrders}</TableCell>
                    <TableCell align="center">{row.cancelledOrders}</TableCell>
                    <TableCell align="center">{row.pickupOrders}</TableCell>
                    <TableCell align="center">{row.attendance}</TableCell>
                    <TableCell align="right">₹{row.totalEarnings.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Showing {mappedData.length} records with {mappedFields.length} mapped fields
          </Typography>
        </CardContent>
      </Card>

      {/* Field Information Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Mapped Fields */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Mapped Fields ({mappedFields.length})
                </Typography>
              </Box>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                These fields are currently displayed in the table and will be exported
              </Alert>
              
              <List dense>
                {mappedFields.map((field, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TableChartIcon sx={{ color: 'success.main', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={field}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Unmapped Fields */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Unmapped Fields ({unmappedFields.length})
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                These fields are available but not currently mapped to the table view
              </Alert>
              
              <List dense>
                {unmappedFields.map((field, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <DescriptionIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={field}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Section */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Export Options
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            The Excel export will include 3 sheets: Mapped Data, Field Information, and Summary
          </Alert>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              sx={{
                backgroundColor: '#2e7d32',
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#1b5e20'
                }
              }}
            >
              Export to Excel
            </Button>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                Download Complete Dataset
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Includes all {mappedData.length} records, field mappings, and summary information
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for export success */}
      <Box>
        {snackbarOpen && (
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1400,
              minWidth: 320
            }}
            onClose={() => setSnackbarOpen(false)}
          >
            {snackbarMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default DataMappingView;