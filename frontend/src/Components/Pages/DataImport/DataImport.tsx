import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  LinearProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Attachment as AttachmentIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

// API Service simulation
const apiService = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock API responses
    switch (endpoint) {
      case "/users":
        return [
          {
            id: 1,
            company_id: 101,
            username: "john_doe",
            email: "john@example.com",
            user_type: "admin",
            full_name: "John Doe",
            phone: "1234567890",
            address: "123 Main St",
            profile_image: "profile1.jpg",
            status: "active"
          },
          {
            id: 2,
            company_id: 102,
            username: "jane_smith",
            email: "jane@example.com",
            user_type: "company",
            full_name: "Jane Smith",
            phone: "0987654321",
            address: "456 Oak Ave",
            profile_image: "profile2.jpg",
            status: "active"
          }
        ];
      case "/riders":
        return [
          {
            id: 1,
            rider_id: "R001",
            user_id: 1,
            rider_code: "RC001",
            id_proof: "ID123456",
            emergency_contact: "9876543210",
            date_of_birth: "1990-01-15",
            blood_group: "O+",
            joining_date: "2024-01-01",
            bank_name: "ABC Bank",
            account_number: "1234567890",
            ifsc_code: "ABC0001234",
            account_holder_name: "John Rider",
            upi_id: "john@upi",
            performance_tier: "high",
            status: "Active",
            vehicle_type: "2_wheeler",
            vehicle_number: "KA01AB1234"
          }
        ];
      case "/companies":
        return [
          {
            id: 1,
            name: "Tech Corp",
            email: "info@techcorp.com",
            phone: "1234567890",
            address: "Tech Street 123",
            status: "active"
          }
        ];
      default:
        return [];
    }
  },
  post: async (endpoint, data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful response
    return {
      success: true,
      message: "Data imported successfully",
      imported_records: data.length || 0,
      errors: Math.floor(Math.random() * 3) // Random errors for demo
    };
  }
};

// Table configurations
const TABLE_CONFIGS = {
  users: {
    name: "Users",
    endpoint: "/users",
    fields: [
      { name: "id", label: "ID", type: "number", required: true },
      { name: "company_id", label: "Company ID", type: "number", required: false },
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "user_type",
        label: "User Type",
        type: "select",
        required: true,
        options: ["admin", "company", "rider", "store_manager"],
      },
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: false },
      { name: "address", label: "Address", type: "textarea", required: false },
      { name: "profile_image", label: "Profile Image", type: "text", required: false },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        options: ["active", "inactive", "suspended"],
      },
    ],
  },
  riders: {
    name: "Riders",
    endpoint: "/riders",
    fields: [
      { name: "id", label: "ID", type: "number", required: true },
      { name: "rider_id", label: "Rider ID", type: "text", required: false },
      { name: "user_id", label: "User ID", type: "number", required: true },
      { name: "rider_code", label: "Rider Code", type: "text", required: false },
      { name: "id_proof", label: "ID Proof", type: "text", required: false },
      { name: "emergency_contact", label: "Emergency Contact", type: "tel", required: false },
      { name: "date_of_birth", label: "Date of Birth", type: "date", required: false },
      { name: "blood_group", label: "Blood Group", type: "text", required: false },
      { name: "joining_date", label: "Joining Date", type: "date", required: false },
      { name: "bank_name", label: "Bank Name", type: "text", required: false },
      { name: "account_number", label: "Account Number", type: "text", required: false },
      { name: "ifsc_code", label: "IFSC Code", type: "text", required: false },
      { name: "account_holder_name", label: "Account Holder Name", type: "text", required: false },
      { name: "upi_id", label: "UPI ID", type: "text", required: false },
      {
        name: "performance_tier",
        label: "Performance Tier",
        type: "select",
        required: false,
        options: ["low", "medium", "high"],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["Active", "Inactive"],
      },
      {
        name: "vehicle_type",
        label: "Vehicle Type",
        type: "select",
        required: false,
        options: ["2_wheeler", "3_wheeler", "4_wheeler"],
      },
      { name: "vehicle_number", label: "Vehicle Number", type: "text", required: false },
    ],
  },
  companies: {
    name: "Companies",
    endpoint: "/companies",
    fields: [
      { name: "id", label: "ID", type: "number", required: true },
      { name: "name", label: "Company Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: false },
      { name: "address", label: "Address", type: "textarea", required: false },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        options: ["active", "inactive"],
      },
    ],
  },
};

// Guidance data
const GUIDANCE_DATA = {
  users: [
    {
      field: "Email",
      formats: ["example@domain.com"],
      note: "Must be a valid email format",
    },
    {
      field: "User Type",
      formats: ["admin", "company", "rider", "store_manager"],
      note: "Select from available options",
    },
    {
      field: "Phone",
      formats: ["+1234567890", "1234567890"],
      note: "Include country code if international",
    },
  ],
  riders: [
    {
      field: "Date of Birth",
      formats: ["YYYY-MM-DD", "DD-MM-YYYY"],
      note: "Use standard date formats",
    },
    {
      field: "Joining Date",
      formats: ["YYYY-MM-DD", "DD-MM-YYYY"],
      note: "Employee joining date",
    },
    {
      field: "Vehicle Type",
      formats: ["2_wheeler", "3_wheeler", "4_wheeler"],
      note: "Select appropriate vehicle type",
    },
  ],
  companies: [
    {
      field: "Email",
      formats: ["company@domain.com"],
      note: "Company official email address",
    },
    {
      field: "Status",
      formats: ["active", "inactive"],
      note: "Company operational status",
    },
  ],
};

const DataImportSystem = () => {
  const [selectedTable, setSelectedTable] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewDataModalOpen, setViewDataModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [exportType, setExportType] = useState("blank_template");
  const [fileType, setFileType] = useState("csv");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidanceDrawerOpen, setGuidanceDrawerOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [importRecords, setImportRecords] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [activeTab, setActiveTab] = useState("import");

  const fileInputRef = useRef(null);

  // Load table data when table is selected
  useEffect(() => {
    if (selectedTable && TABLE_CONFIGS[selectedTable]) {
      const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
        .filter((field) => field.required)
        .map((field) => field.name);
      setSelectedFields(mandatoryFields);
      
      // Load existing data
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const loadTableData = async (table) => {
    try {
      setLoading(true);
      const config = TABLE_CONFIGS[table];
      const data = await apiService.get(config.endpoint);
      setTableData(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to load table data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (event) => {
    setSelectedTable(event.target.value);
    setAttachedFiles([]);
    setPreviewData(null);
    setTableData([]);
  };

  const handleViewData = () => {
    if (!selectedTable) {
      setSnackbar({
        open: true,
        message: "Please select a table first",
        severity: "warning",
      });
      return;
    }
    setViewDataModalOpen(true);
  };

  const handleExportModalOpen = () => {
    if (!selectedTable) {
      setSnackbar({
        open: true,
        message: "Please select a table first",
        severity: "warning",
      });
      return;
    }
    setExportModalOpen(true);
  };

  const handleFieldSelection = (fieldName) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldName)) {
        const field = TABLE_CONFIGS[selectedTable].fields.find(
          (f) => f.name === fieldName
        );
        if (field && field.required) {
          setSnackbar({
            open: true,
            message: "Cannot deselect mandatory fields",
            severity: "warning",
          });
          return prev;
        }
        return prev.filter((f) => f !== fieldName);
      } else {
        return [...prev, fieldName];
      }
    });
  };

  const handleSelectAll = () => {
    const allFields = TABLE_CONFIGS[selectedTable].fields.map(
      (field) => field.name
    );
    setSelectedFields(allFields);
  };

  const handleUnselectAll = () => {
    const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
      .filter((field) => field.required)
      .map((field) => field.name);
    setSelectedFields(mandatoryFields);
  };

  const handleSelectMandatory = () => {
    const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
      .filter((field) => field.required)
      .map((field) => field.name);
    setSelectedFields(mandatoryFields);
  };

  const generateTemplateData = () => {
    const fields = TABLE_CONFIGS[selectedTable].fields.filter((field) =>
      selectedFields.includes(field.name)
    );

    let data = [];

    if (exportType === "blank_template") {
      data = [fields.map((field) => field.label)];
    } else if (exportType === "5_records") {
      data = [
        fields.map((field) => field.label),
        ...Array(5)
          .fill()
          .map((_, index) =>
            fields.map((field) => {
              switch (field.type) {
                case "email":
                  return `user${index + 1}@example.com`;
                case "text":
                  return field.name === "username"
                    ? `user${index + 1}`
                    : `Sample ${field.label} ${index + 1}`;
                case "number":
                  return index + 1;
                case "date":
                  return "2024-01-01";
                case "select":
                  return field.options ? field.options[0] : "Option1";
                default:
                  return `Sample Data ${index + 1}`;
              }
            })
          ),
      ];
    } else if (exportType === "existing_data") {
      // Export existing data with selected fields
      data = [
        fields.map((field) => field.label),
        ...tableData.map(record =>
          fields.map(field => record[field.name] || "")
        )
      ];
    }

    return data;
  };

  const downloadCSV = (data, filename) => {
    const csvContent = data.map((row) => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one field",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const data = generateTemplateData();
      const filename = `${selectedTable}_${exportType}_${new Date().getTime()}.csv`;
      downloadCSV(data, filename);

      setLoading(false);
      setExportModalOpen(false);
      setSnackbar({
        open: true,
        message: "File downloaded successfully",
        severity: "success",
      });
    }, 1000);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const csvFiles = files.filter((file) =>
      file.name.toLowerCase().endsWith(".csv")
    );

    if (csvFiles.length !== files.length) {
      setSnackbar({
        open: true,
        message: "Only CSV files are allowed",
        severity: "error",
      });
      return;
    }

    setAttachedFiles((prev) => [...prev, ...csvFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewData(null);
  };

  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          reject(new Error('Empty file'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return values;
        });
        
        resolve({ headers, data });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handlePreview = async () => {
    if (attachedFiles.length === 0) return;

    setLoading(true);

    try {
      const file = attachedFiles[0];
      const { headers, data } = await parseCSVFile(file);
      
      const warnings = [];
      const tableFields = TABLE_CONFIGS[selectedTable].fields;
      
      // Validate headers against table structure
      headers.forEach((header, index) => {
        const field = tableFields.find(f => 
          f.label.toLowerCase() === header.toLowerCase() ||
          f.name.toLowerCase() === header.toLowerCase()
        );
        
        if (!field) {
          warnings.push({
            column: index + 1,
            message: `Column "${header}" not found in table structure`
          });
        }
      });

      setPreviewData({
        columns: headers,
        data: data.slice(0, 10), // Show first 10 rows
        warnings,
        totalRows: data.length
      });

      setSnackbar({
        open: true,
        message: `File preview generated. Found ${data.length} rows.`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to parse CSV file: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartImport = async () => {
    if (!previewData) return;
    
    setLoading(true);

    try {
      // Convert preview data to import format
      const importData = previewData.data.map(row => {
        const record = {};
        previewData.columns.forEach((col, index) => {
          const field = TABLE_CONFIGS[selectedTable].fields.find(f => 
            f.label.toLowerCase() === col.toLowerCase() ||
            f.name.toLowerCase() === col.toLowerCase()
          );
          if (field) {
            record[field.name] = row[index];
          }
        });
        return record;
      });

      // Post data to API
      const config = TABLE_CONFIGS[selectedTable];
      const result = await apiService.post(config.endpoint, importData);

      // Add to import records
      const newRecord = {
        id: Date.now(),
        table: selectedTable,
        filename: attachedFiles[0].name,
        status: result.success ? "completed" : "failed",
        records: result.imported_records,
        date: new Date().toISOString().split('T')[0],
        errors: result.errors || 0,
      };

      setImportRecords(prev => [newRecord, ...prev]);

      setSnackbar({
        open: true,
        message: result.message || "Import completed successfully",
        severity: result.success ? "success" : "error",
      });

      // Reset form
      setAttachedFiles([]);
      setPreviewData(null);
      
      // Reload table data
      await loadTableData(selectedTable);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Import failed: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { color: "success", icon: CheckCircleIcon },
      processing: { color: "warning", icon: WarningIcon },
      failed: { color: "error", icon: WarningIcon },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon />}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95vw", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "#1976d2" }}
        >
          Data Import System
        </Typography>

        <Box>
          <Button
            variant={activeTab === "import" ? "contained" : "outlined"}
            onClick={() => setActiveTab("import")}
            sx={{ mr: 2 }}
          >
            Import Data
          </Button>
          <Button
            variant={activeTab === "listings" ? "contained" : "outlined"}
            onClick={() => setActiveTab("listings")}
          >
            Import History
          </Button>
        </Box>
      </Box>

      {activeTab === "import" ? (
        <>
          <Box
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#fafafa",
              mb: 4,
            }}
          >
            <Grid container spacing={3}>
              {/* Document Type and Buttons */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                    Document Type <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Select
                    value={selectedTable}
                    onChange={handleTableSelect}
                    displayEmpty
                  >
                    <MenuItem value="">Select Table</MenuItem>
                    {Object.entries(TABLE_CONFIGS).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        {config.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}
              >
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewData}
                  disabled={!selectedTable}
                  size="small"
                >
                  View Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportModalOpen}
                  disabled={!selectedTable}
                  size="small"
                >
                  Download Template
                </Button>
                <IconButton
                  color="primary"
                  onClick={() => setGuidanceDrawerOpen(true)}
                  disabled={!selectedTable}
                >
                  <InfoIcon />
                </IconButton>
              </Grid>

              {/* File Upload Section */}
              {selectedTable && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Import File
                  </Typography>

                  {attachedFiles.length === 0 ? (
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<AttachmentIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ mb: 2 }}
                      >
                        Attach File
                      </Button>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        File Type Allowed: CSV
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: "50%" }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments
                      </Typography>
                      {attachedFiles.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 1,
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Typography sx={{ wordBreak: "break-all" }}>
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFile(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </Grid>
              )}

              {/* Upload and Preview Button */}
              {attachedFiles.length > 0 && !previewData && (
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    onClick={handlePreview}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Upload and Preview"}
                  </Button>
                </Grid>
              )}

              {/* Loading Indicator */}
              {loading && (
                <Grid item xs={12}>
                  <LinearProgress />
                </Grid>
              )}

              {/* Preview Section */}
              {previewData && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Preview ({previewData.totalRows} total rows, showing first 10)
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            {previewData.columns.map((col, index) => (
                              <TableCell key={index} sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                                {col} ({index + 1})
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {previewData.data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Warnings */}
                  {previewData.warnings.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Import Logs and Warnings
                      </Typography>
                      {previewData.warnings.map((warning, index) => (
                        <Alert severity="warning" key={index} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">
                            Column: {warning.column}
                          </Typography>
                          <Typography variant="body2">
                            {warning.message}
                          </Typography>
                        </Alert>
                      ))}
                    </Grid>
                  )}

                  {/* Final Import Button */}
                  <Grid item xs={12} sx={{ textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleStartImport}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                      Start Import
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </>
      ) : (
        /* Listings Section */
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import History
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Table</TableCell>
                    <TableCell>Filename</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Records</TableCell>
                    <TableCell>Errors</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No import records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    importRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>{record.table}</TableCell>
                        <TableCell>{record.filename}</TableCell>
                        <TableCell>{getStatusChip(record.status)}</TableCell>
                        <TableCell>{record.records}</TableCell>
                        <TableCell>{record.errors}</TableCell>
                        <TableCell>{record.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onClose={() => setExportModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Export Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>Export Type</FormLabel>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <MenuItem value="blank_template">Blank Template</MenuItem>
                  <MenuItem value="5_records">Template with 5 Sample Records</MenuItem>
                  <MenuItem value="existing_data">Existing Data</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>File Type</FormLabel>
                <Select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Field Selection
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  sx={{ mr: 1 }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleUnselectAll}
                  sx={{ mr: 1 }}
                >
                  Unselect All
                </Button>
                <Button
                  size="small"
                  onClick={handleSelectMandatory}
                >
                  Mandatory Only
                </Button>
              </Box>

              <Grid container spacing={2}>
                {selectedTable &&
                  TABLE_CONFIGS[selectedTable].fields.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedFields.includes(field.name)}
                            onChange={() => handleFieldSelection(field.name)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {field.label}
                              {field.required && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="error"
                                  sx={{ ml: 1, height: 16 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={loading || selectedFields.length === 0}
          >
            {loading ? "Exporting..." : "Export"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Data Modal */}
      <Dialog open={viewDataModalOpen} onClose={() => setViewDataModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          View Data - {selectedTable && TABLE_CONFIGS[selectedTable].name}
          <IconButton
            onClick={() => setViewDataModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {selectedTable && TABLE_CONFIGS[selectedTable].fields.map((field) => (
                      <TableCell key={field.name} sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                        {field.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={selectedTable ? TABLE_CONFIGS[selectedTable].fields.length : 1} align="center">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableData.map((row, index) => (
                      <TableRow key={index}>
                        {selectedTable && TABLE_CONFIGS[selectedTable].fields.map((field) => (
                          <TableCell key={field.name}>
                            {row[field.name] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Guidance Drawer */}
      <Drawer
        anchor="right"
        open={guidanceDrawerOpen}
        onClose={() => setGuidanceDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Data Format Guidelines</Typography>
          <IconButton onClick={() => setGuidanceDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {selectedTable && GUIDANCE_DATA[selectedTable] && (
          <List>
            {GUIDANCE_DATA[selectedTable].map((item, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.field}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.note}
                </Typography>
                <Box>
                  {item.formats.map((format, formatIndex) => (
                    <Chip
                      key={formatIndex}
                      label={format}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataImportSystem;