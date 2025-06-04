import React, { useState } from "react";
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
  Avatar,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

// Dummy invoice data
const dummyInvoices = [
  {
    id: 1,
    customer: "Amiah Pruitt",
    invoiceNumber: "INV-19919",
    createDate: "14 May 2025",
    dueDate: "07 Jul 2025",
    amount: 2331.63,
    sent: 9,
    status: "Paid",
  },
  {
    id: 2,
    customer: "Ariana Lang",
    invoiceNumber: "INV-19918",
    createDate: "15 May 2025",
    dueDate: "06 Jul 2025",
    amount: 2372.93,
    sent: 4,
    status: "Overdue",
  },
  {
    id: 3,
    customer: "Lawson Bass",
    invoiceNumber: "INV-19917",
    createDate: "16 May 2025",
    dueDate: "05 Jul 2025",
    amount: 2283.97,
    sent: 9,
    status: "Paid",
  },
  {
    id: 4,
    customer: "Selina Boyer",
    invoiceNumber: "INV-19916",
    createDate: "17 May 2025",
    dueDate: "04 Jul 2025",
    amount: 2251.84,
    sent: 8,
    status: "Pending",
  },
  {
    id: 5,
    customer: "Angelique Morse",
    invoiceNumber: "INV-19915",
    createDate: "18 May 2025",
    dueDate: "03 Jul 2025",
    amount: 2343.51,
    sent: 11,
    status: "Paid",
  },
];

const InvoiceListPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openWeeklyDialog, setOpenWeeklyDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [generateForm, setGenerateForm] = useState({
    company: "",
    startDate: "",
    endDate: "",
  });
  const [editForm, setEditForm] = useState({
    customer: "",
    amount: "",
    dueDate: "",
    status: "Pending",
  });

  const tabs = [
    { label: "All", count: 20, color: "#1976d2" },
    { label: "Paid", count: 10, color: "#2e7d32" },
    { label: "Pending", count: 6, color: "#ed6c02" },
    { label: "Overdue", count: 2, color: "#d32f2f" },
    { label: "Draft", count: 2, color: "#757575" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return { color: "#2e7d32", bg: "#e8f5e8" };
      case "Overdue":
        return { color: "#d32f2f", bg: "#ffebee" };
      case "Pending":
        return { color: "#ed6c02", bg: "#fff3e0" };
      case "Draft":
        return { color: "#757575", bg: "#f5f5f5" };
      default:
        return { color: "#1976d2", bg: "#e3f2fd" };
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
    setViewMode(true);
    handleMenuClose();
  };

  const handleDownload = () => {
    // Create a simple PDF-like content for demonstration
    const element = document.createElement("a");
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const file = new Blob(
      [
        `
Date: ${today}
`,
      ],
      { type: "text/plain" }
    );

    element.href = URL.createObjectURL(file);
    element.download = `${today}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setSnackbar({
      open: true,
      message: `Invoice ${today} downloaded successfully`,
      severity: "success",
    });
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditForm({
      customer: selectedInvoice.customer,
      amount: selectedInvoice.amount.toString(),
      dueDate: selectedInvoice.dueDate,
      status: selectedInvoice.status,
    });
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleEditSubmit = () => {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            customer: editForm.customer,
            amount: parseFloat(editForm.amount),
            dueDate: editForm.dueDate,
            status: editForm.status,
          }
        : inv
    );
    setInvoices(updatedInvoices);
    setSnackbar({
      open: true,
      message: `Invoice ${selectedInvoice.invoiceNumber} updated successfully`,
      severity: "success",
    });
    setOpenEditDialog(false);
  };

  const handleDelete = () => {
    setInvoices(invoices.filter((inv) => inv.id !== selectedInvoice.id));
    setSnackbar({
      open: true,
      message: `Invoice ${selectedInvoice.invoiceNumber} deleted successfully`,
      severity: "success",
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
      message: "Invoice generated successfully!",
      severity: "success",
    });
    setOpenGenerateDialog(false);
  };

  const handleWeeklyGenerate = () => {
    setSnackbar({
      open: true,
      message: "Weekly invoices generated successfully! Check your downloads.",
      severity: "success",
    });
    setOpenWeeklyDialog(false);
    setGenerateForm({ company: "", startDate: "", endDate: "" });
  };

  const filteredInvoices =
    activeTab === 0
      ? invoices
      : invoices.filter((inv) => inv.status === tabs[activeTab].label);

  if (viewMode) {
    return (
      <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => setViewMode(false)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Invoice Details
          </Typography>
        </Box>

        <Card sx={{ maxWidth: 800, mx: "auto", boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Invoice Header */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  INVOICE
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {selectedInvoice?.invoiceNumber}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Chip
                  label={selectedInvoice?.status}
                  sx={{
                    bgcolor: getStatusColor(selectedInvoice?.status).bg,
                    color: getStatusColor(selectedInvoice?.status).color,
                    fontWeight: "bold",
                    mb: 2,
                  }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    size="small"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    size="small"
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Invoice Details */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Invoice From
                </Typography>
                <Typography variant="body2">Ariana Lang</Typography>
                <Typography variant="body2" color="text.secondary">
                  4642 Demetris Lane Suite 407
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Edmond, AZ / 60888
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +54 11 1234-5678
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Invoice To
                </Typography>
                <Typography variant="body2">
                  {selectedInvoice?.customer}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  74794 Asha Flat Suite 890
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lancaster, OR / 13466
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +64 9 123 4567
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date Created
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedInvoice?.createDate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedInvoice?.dueDate}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Invoice Items */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Qty</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Unit Price</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        Urban Explorer Sneakers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Premium quality footwear
                      </Typography>
                    </TableCell>
                    <TableCell align="center">11</TableCell>
                    <TableCell align="right">$83.74</TableCell>
                    <TableCell align="right">$921.14</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        Classic Leather Loafers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Handcrafted leather shoes
                      </Typography>
                    </TableCell>
                    <TableCell align="center">10</TableCell>
                    <TableCell align="right">$97.14</TableCell>
                    <TableCell align="right">$971.40</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            {/* Totals */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ minWidth: 250 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">$2,373.51</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">-$94.25</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">-$20.54</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">Taxes:</Typography>
                  <Typography variant="body2">$72.91</Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ${selectedInvoice?.amount?.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Notes:</strong> We appreciate your business. Should you
                need us to add VAT or extra notes let us know!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#2c3e50">
          Invoice Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleGenerateInvoice}
            sx={{
              bgcolor: "#3498db",
              "&:hover": { bgcolor: "#2980b9" },
              borderRadius: 2,
              px: 3,
            }}
          >
            Generate Invoice
          </Button>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={handleGenerateWeekly}
            sx={{
              bgcolor: "#27ae60",
              "&:hover": { bgcolor: "#229954" },
              borderRadius: 2,
              px: 3,
            }}
          >
            Generate Weekly
          </Button>
        </Box>
      </Box>

      {/* Enhanced Tabs */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <Box sx={{ p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                mr: 1,
                transition: "all 0.3s ease",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.label}
                    <Chip
                      size="small"
                      label={tab.count}
                      sx={{
                        bgcolor: activeTab === index ? tab.color : "#e0e0e0",
                        color: activeTab === index ? "white" : "#666",
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                }
                sx={{
                  bgcolor:
                    activeTab === index ? `${tab.color}15` : "transparent",
                  color: activeTab === index ? tab.color : "#666",
                  border:
                    activeTab === index
                      ? `2px solid ${tab.color}`
                      : "2px solid transparent",
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {/* Enhanced Table */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Customer
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Create
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Due
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Sent
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                  Status
                </TableCell>
                <TableCell width="50"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "#f8f9fa" },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "#3498db",
                          width: 45,
                          height: 45,
                          fontWeight: "bold",
                        }}
                      >
                        {getInitials(invoice.customer)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="600"
                          color="#2c3e50"
                        >
                          {invoice.customer}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {invoice.invoiceNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {invoice.createDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      11:33 pm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {invoice.dueDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      6:33 pm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="#2c3e50"
                    >
                      ${invoice.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{invoice.sent}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      sx={{
                        bgcolor: getStatusColor(invoice.status).bg,
                        color: getStatusColor(invoice.status).color,
                        fontWeight: "bold",
                        border: `1px solid ${
                          getStatusColor(invoice.status).color
                        }`,
                        "&:hover": {
                          bgcolor: getStatusColor(invoice.status).color,
                          color: "white",
                        },
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, invoice)}
                      size="small"
                      sx={{
                        "&:hover": { bgcolor: "#e3f2fd" },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { boxShadow: 3, borderRadius: 2 },
        }}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1, color: "#3498db" }} fontSize="small" />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, color: "#f39c12" }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Generate Invoice Dialog */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#3498db", color: "white" }}>
          Generate New Invoice
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateSubmit}
            variant="contained"
            sx={{ bgcolor: "#3498db" }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#f39c12", color: "white" }}>
          Edit Invoice
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Customer Name"
            value={editForm.customer}
            onChange={(e) =>
              setEditForm({ ...editForm, customer: e.target.value })
            }
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Invoice Amount"
            value={editForm.amount}
            onChange={(e) =>
              setEditForm({ ...editForm, amount: e.target.value })
            }
            variant="outlined"
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Due Date"
            value={editForm.dueDate}
            onChange={(e) =>
              setEditForm({ ...editForm, dueDate: e.target.value })
            }
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={editForm.status}
            onChange={(e) =>
              setEditForm({ ...editForm, status: e.target.value })
            }
            variant="outlined"
            SelectProps={{ native: true }}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{ bgcolor: "#f39c12" }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Weekly Invoice Generation Dialog */}
      <Dialog
        open={openWeeklyDialog}
        onClose={() => setOpenWeeklyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#27ae60", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon />
            Generate Weekly Invoices
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Generation Process
            </Typography>
            <Typography variant="body2" paragraph>
              This will generate professional PDF invoices for all companies
              with mapped order statements.
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={generateForm.company}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, company: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={generateForm.startDate}
                onChange={(e) =>
                  setGenerateForm({
                    ...generateForm,
                    startDate: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenWeeklyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleWeeklyGenerate}
            variant="contained"
            sx={{ bgcolor: "#27ae60" }}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceListPage;
