import { Box, Button, Checkbox, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
interface PaymentItem {
  id: number;
  rider: string;
  company: string;
  store: string;
  dailyOrdersTotal: string;
  weeklyStatement: string;
  advanceRequested: string;
  tdsDeduction: string;
  finalPayable: string;
  status: string;
}

interface Column {
  field: keyof PaymentItem;
  headerName: string;
  type?: 'status' | 'currency';
  render?: (value: any, item: PaymentItem) => React.ReactNode;
}

interface TabItem {
  label: string;
  value: string;
  count?: number;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface ActionItem {
  icon: React.ReactNode;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  title: string;
  onClick?: (item: PaymentItem) => void;
}

interface ReusableTableProps {
  title?: string;
  data?: PaymentItem[];
  columns?: Column[];
  tabs?: TabItem[];
  loading?: boolean;
  onDataChange?: (data: PaymentItem[]) => void;
  searchFields?: (keyof PaymentItem)[];
  statusField?: keyof PaymentItem;
  statusColors?: Record<string, string>;
  actions?: ActionItem[];
}

const ProcessPaymentsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  selectedPayments: PaymentItem[];
  onProcess: (paymentData: any) => void;
}> = ({ open, onClose, selectedPayments, onProcess }) => {
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleProcess = () => {
    const paymentData = {
      paymentMethod,
      paymentReference,
      remarks,
      selectedPayments: selectedPayments.map(p => p.id)
    };
    onProcess(paymentData);
    onClose();
  };

  const handleClose = () => {
    setPaymentMethod('Bank Transfer');
    setPaymentReference('');
    setRemarks('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'success.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}
      >
        <Typography variant="h6" component="div">
          Process Payments
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Section - Form */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Payment Method
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Payment Reference
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Transaction ID, Check Number, etc."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Remarks
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                placeholder="Any additional notes about this payment"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Box>
          </Box>

          {/* Right Section - Selected Payments Summary */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Selected Payments ({selectedPayments.length})
            </Typography>
            <Paper 
              sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {selectedPayments.map((payment, index) => (
                <Box key={payment.id}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      {payment.rider}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Company: {payment.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Store: {payment.store}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={payment.status} 
                        size="small" 
                        color={payment.status === 'pending' ? 'warning' : 'info'}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {payment.finalPayable}
                      </Typography>
                    </Box>
                  </Box>
                  {index < selectedPayments.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
            
            {/* Summary */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Payments:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {selectedPayments.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Total Amount:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ₹{selectedPayments.reduce((sum, payment) => {
                    const amount = parseFloat(payment.finalPayable.replace(/[₹,]/g, '')) || 0;
                    return sum + amount;
                  }, 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleProcess}
          variant="contained"
          color="success"
          disabled={selectedPayments.length === 0}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Process Selected Payments
        </Button>
      </DialogActions>
    </Dialog>
  );
};



export const ReusableTable: React.FC<ReusableTableProps> = ({
  title = "Data Listing",
  data = [],
  columns = [],
  tabs = [],
  loading = false,
  onDataChange,
  searchFields = [],
  statusField = 'status',
  statusColors = {},
  actions = []
}) => {
  const [items, setItems] = useState<PaymentItem[]>(data);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [processModalOpen, setProcessModalOpen] = useState(false);

  useEffect(() => {
    setItems(data);
  }, [data]);

  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const currentTab = tabs[selectedTab]?.value;
    const matchesTab = !currentTab || currentTab === 'all' || item[statusField as keyof PaymentItem] === currentTab;
    
    return matchesSearch && matchesTab;
  });

  // Paginated items
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      const newItems = items.filter(item => !selectedItems.includes(item.id));
      setItems(newItems);
      setSelectedItems([]);
      onDataChange?.(newItems);
    }
  };

  const handleProcessPayments = (paymentData: any) => {
    console.log('Processing payments:', paymentData);
    // Here you would typically make an API call to process the payments
    
    // Update the status of selected payments to 'processing'
    const updatedItems = items.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'processing' }
        : item
    );
    
    setItems(updatedItems);
    setSelectedItems([]);
    onDataChange?.(updatedItems);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || 'default';
  };

  const renderCellContent = (item: PaymentItem, column: Column) => {
    const value = item[column.field];
    
    if (column.type === 'status') {
      return (
        <Chip 
          label={value?.toString()} 
          color={getStatusColor(value as string) as any}
          size="small"
          sx={{ minWidth: 80 }}
        />
      );
    }
    
    if (column.type === 'currency') {
      return (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {value}
        </Typography>
      );
    }
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value || 'N/A';
  };

  const selectedPayments = items.filter(item => selectedItems.includes(item.id));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {title}
      </Typography>

      {/* Main Content */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Tabs */}
        {tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              {tabs.map((tab, index) => (
                <Tab 
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.label}
                      {tab.count !== undefined && (
                        <Chip 
                          label={tab.count} 
                          size="small" 
                          color={tab.color || 'default'} 
                        />
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Search and Actions */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedItems.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setProcessModalOpen(true)}
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{ 
                    fontWeight: 'bold',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  Process Selected Payments ({selectedItems.length})
                </Button>
                <IconButton 
                  color="error" 
                  onClick={handleDeleteSelected}
                  sx={{ 
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                    '&:hover': { backgroundColor: 'error.main' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            {searchFields.length > 0 && (
              <TextField
                placeholder="Search riders, company..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Total Records: {filteredItems.length}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedItems.length}
                    checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.field as string} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {column.headerName}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>ACTIONS</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.field as string}>
                        {renderCellContent(item, column)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {actions.map((action, index) => (
                            <IconButton 
                              key={index}
                              size="small" 
                              color={action.color || 'primary'}
                              onClick={() => action.onClick?.(item)}
                              title={action.title}
                              sx={{ minWidth: 'auto' }}
                            >
                              {action.icon}
                            </IconButton>
                          ))}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Process Payments Modal */}
      <ProcessPaymentsModal
        open={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        selectedPayments={selectedPayments}
        onProcess={handleProcessPayments}
      />
    </Container>
  );
};