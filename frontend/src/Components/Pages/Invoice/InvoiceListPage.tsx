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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Dummy invoice data
const dummyInvoices = [
  {
    id: 1,
    customer: 'Amiah Pruitt',
    invoiceNumber: 'INV-19919',
    createDate: '14 May 2025',
    dueDate: '07 Jul 2025',
    amount: 2331.63,
    sent: 9,
    status: 'Paid'
  },
  {
    id: 2,
    customer: 'Ariana Lang',
    invoiceNumber: 'INV-19918',
    createDate: '15 May 2025',
    dueDate: '06 Jul 2025',
    amount: 2372.93,
    sent: 4,
    status: 'Overdue'
  },
  {
    id: 3,
    customer: 'Lawson Bass',
    invoiceNumber: 'INV-19917',
    createDate: '16 May 2025',
    dueDate: '05 Jul 2025',
    amount: 2283.97,
    sent: 9,
    status: 'Paid'
  },
  {
    id: 4,
    customer: 'Selina Boyer',
    invoiceNumber: 'INV-19916',
    createDate: '17 May 2025',
    dueDate: '04 Jul 2025',
    amount: 2251.84,
    sent: 8,
    status: 'Pending'
  },
  {
    id: 5,
    customer: 'Angelique Morse',
    invoiceNumber: 'INV-19915',
    createDate: '18 May 2025',
    dueDate: '03 Jul 2025',
    amount: 2343.51,
    sent: 11,
    status: 'Paid'
  }
];

const InvoiceListPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openWeeklyDialog, setOpenWeeklyDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generateForm, setGenerateForm] = useState({
    company: '',
    startDate: '',
    endDate: ''
  });

  const tabs = [
    { label: 'All', count: 20 },
    { label: 'Paid', count: 10 },
    { label: 'Pending', count: 6 },
    { label: 'Overdue', count: 2 },
    { label: 'Draft', count: 2 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Overdue': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleView = () => {
    setSnackbar({
      open: true,
      message: `Viewing invoice ${selectedInvoice.invoiceNumber}`,
      severity: 'info'
    });
    handleMenuClose();
  };

  const handleDownload = () => {
    setSnackbar({
      open: true,
      message: `Downloading invoice ${selectedInvoice.invoiceNumber}`,
      severity: 'success'
    });
    handleMenuClose();
  };

  const handleEdit = () => {
    setSnackbar({
      open: true,
      message: `Editing invoice ${selectedInvoice.invoiceNumber}`,
      severity: 'info'
    });
    handleMenuClose();
  };

  const handleDelete = () => {
    setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
    setSnackbar({
      open: true,
      message: `Invoice ${selectedInvoice.invoiceNumber} deleted successfully`,
      severity: 'success'
    });
    handleMenuClose();
  };

  const handleGenerateInvoice = () => {
    setOpenGenerateDialog(true);
  };

  const handleGenerateWeekly = () => {
    setOpenWeeklyDialog(true);
  };

  const handleGenerateSubmit = () => {
    setSnackbar({
      open: true,
      message: 'Invoice generated successfully!',
      severity: 'success'
    });
    setOpenGenerateDialog(false);
  };

  const handleWeeklyGenerate = () => {
    setSnackbar({
      open: true,
      message: 'Weekly invoices generated successfully! Check your downloads.',
      severity: 'success'
    });
    setOpenWeeklyDialog(false);
    setGenerateForm({ company: '', startDate: '', endDate: '' });
  };

  const filteredInvoices = activeTab === 0 ? invoices : 
    invoices.filter(inv => inv.status === tabs[activeTab].label);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Invoices
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleGenerateInvoice}
            sx={{ bgcolor: '#4285f4' }}
          >
            Generate Invoice
          </Button>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={handleGenerateWeekly}
            sx={{ bgcolor: '#34a853' }}
          >
            Generate Weekly Invoices
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  <Chip size="small" label={tab.count} />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Customer</TableCell>
              <TableCell>Create</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Sent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width="50"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4285f4', width: 40, height: 40 }}>
                      {getInitials(invoice.customer)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {invoice.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.invoiceNumber}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{invoice.createDate}</Typography>
                  <Typography variant="caption" color="text.secondary">11:33 pm</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{invoice.dueDate}</Typography>
                  <Typography variant="caption" color="text.secondary">6:33 pm</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    ${invoice.amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{invoice.sent}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, invoice)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
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
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Generate Invoice Dialog */}
      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Customer Name"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Invoice Amount"
              variant="outlined"
              type="number"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Due Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateSubmit} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Weekly Invoice Generation Dialog */}
      <Dialog open={openWeeklyDialog} onClose={() => setOpenWeeklyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            Generate Weekly Invoices
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Invoice Generation Process</Typography>
            <Typography variant="body2" paragraph>
              This will generate professional PDF invoices for all companies with mapped order statements from the upload_order_statement.php page.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>The invoices will include:</Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>Company logo and supplier details</li>
              <li>Bill-to information with company name and address</li>
              <li>Detailed breakdown of orders and pricing</li>
              <li>Tax calculations and total amount</li>
              <li>Amount in words</li>
              <li>GST details and bank information</li>
              <li>Supplier address with logo watermark</li>
            </Box>
            <Typography variant="body2">
              The generated PDFs will be stored and linked to the invoice records.
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Are you sure you want to generate invoices for all pending mapped order statements?
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={generateForm.company}
                onChange={(e) => setGenerateForm({...generateForm, company: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={generateForm.startDate}
                onChange={(e) => setGenerateForm({...generateForm, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={generateForm.endDate}
                onChange={(e) => setGenerateForm({...generateForm, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWeeklyDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleWeeklyGenerate} 
            variant="contained" 
            color="success"
            startIcon={<CalendarIcon />}
          >
            Generate Invoices
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceListPage;