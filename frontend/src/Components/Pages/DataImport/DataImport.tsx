import React, { useState, useRef, useEffect } from 'react';
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
    Snackbar
} from '@mui/material';
import {
    Download as DownloadIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Attachment as AttachmentIcon
} from '@mui/icons-material';

// Dummy data based on your tables
const TABLE_CONFIGS = {
    users: {
        name: 'Users',
        fields: [
            { name: 'id', label: 'ID', type: 'number', required: true },
            { name: 'company_id', label: 'Company ID', type: 'number', required: false },
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'user_type', label: 'User Type', type: 'select', required: true, options: ['admin', 'company', 'rider', 'store_manager'] },
            { name: 'full_name', label: 'Full Name', type: 'text', required: true },
            { name: 'phone', label: 'Phone', type: 'tel', required: false },
            { name: 'address', label: 'Address', type: 'textarea', required: false },
            { name: 'profile_image', label: 'Profile Image', type: 'text', required: false },
            { name: 'status', label: 'Status', type: 'select', required: false, options: ['active', 'inactive', 'suspended'] }
        ]
    },
    riders: {
        name: 'Riders',
        fields: [
            { name: 'id', label: 'ID', type: 'number', required: true },
            { name: 'rider_id', label: 'Rider ID', type: 'text', required: false },
            { name: 'user_id', label: 'User ID', type: 'number', required: true },
            { name: 'rider_code', label: 'Rider Code', type: 'text', required: false },
            { name: 'id_proof', label: 'ID Proof', type: 'text', required: false },
            { name: 'emergency_contact', label: 'Emergency Contact', type: 'tel', required: false },
            { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false },
            { name: 'blood_group', label: 'Blood Group', type: 'text', required: false },
            { name: 'joining_date', label: 'Joining Date', type: 'date', required: false },
            { name: 'bank_name', label: 'Bank Name', type: 'text', required: false },
            { name: 'account_number', label: 'Account Number', type: 'text', required: false },
            { name: 'ifsc_code', label: 'IFSC Code', type: 'text', required: false },
            { name: 'account_holder_name', label: 'Account Holder Name', type: 'text', required: false },
            { name: 'upi_id', label: 'UPI ID', type: 'text', required: false },
            { name: 'performance_tier', label: 'Performance Tier', type: 'select', required: false, options: ['low', 'medium', 'high'] },
            { name: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Inactive'] },
            { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', required: false, options: ['2_wheeler', '3_wheeler', '4_wheeler'] },
            { name: 'vehicle_number', label: 'Vehicle Number', type: 'text', required: false }
        ]
    }
};

// Dummy guidance data
const GUIDANCE_DATA = {
    users: [
        { field: 'Email', formats: ['example@domain.com'], note: 'Must be a valid email format' },
        { field: 'User Type', formats: ['admin', 'company', 'rider', 'store_manager'], note: 'Select from available options' },
        { field: 'Phone', formats: ['+1234567890', '1234567890'], note: 'Include country code if international' }
    ],
    riders: [
        { field: 'Date of Birth', formats: ['YYYY-MM-DD', 'DD-MM-YYYY'], note: 'Use standard date formats' },
        { field: 'Joining Date', formats: ['YYYY-MM-DD', 'DD-MM-YYYY'], note: 'Employee joining date' },
        { field: 'Vehicle Type', formats: ['2_wheeler', '3_wheeler', '4_wheeler'], note: 'Select appropriate vehicle type' },
        { field: 'Performance Tier', formats: ['low', 'medium', 'high'], note: 'Based on rider performance' }
    ]
};

// Dummy import records
const DUMMY_IMPORT_RECORDS = [
    { id: 1, table: 'users', filename: 'users_import_2024.csv', status: 'completed', records: 150, date: '2024-01-15', errors: 0 },
    { id: 2, table: 'riders', filename: 'riders_batch_1.csv', status: 'processing', records: 75, date: '2024-01-14', errors: 2 },
    { id: 3, table: 'users', filename: 'users_bulk_update.csv', status: 'failed', records: 200, date: '2024-01-13', errors: 15 },
    { id: 4, table: 'riders', filename: 'new_riders_jan.csv', status: 'completed', records: 45, date: '2024-01-12', errors: 1 }
];

const DataImportSystem = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [selectedFields, setSelectedFields] = useState([]);
    const [exportType, setExportType] = useState('blank_template');
    const [fileType, setFileType] = useState('csv');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [guidanceDrawerOpen, setGuidanceDrawerOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [activeTab, setActiveTab] = useState('import');

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (selectedTable && TABLE_CONFIGS[selectedTable]) {
            const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
                .filter(field => field.required)
                .map(field => field.name);
            setSelectedFields(mandatoryFields);
        }
    }, [selectedTable]);

    const handleTableSelect = (event) => {
        setSelectedTable(event.target.value);
        setAttachedFiles([]);
        setPreviewData(null);
    };

    const handleExportModalOpen = () => {
        if (!selectedTable) {
            setSnackbar({ open: true, message: 'Please select a table first', severity: 'warning' });
            return;
        }
        setExportModalOpen(true);
    };

    const handleFieldSelection = (fieldName) => {
        setSelectedFields(prev => {
            if (prev.includes(fieldName)) {
                // Don't allow deselecting required fields
                const field = TABLE_CONFIGS[selectedTable].fields.find(f => f.name === fieldName);
                if (field && field.required) {
                    setSnackbar({ open: true, message: 'Cannot deselect mandatory fields', severity: 'warning' });
                    return prev;
                }
                return prev.filter(f => f !== fieldName);
            } else {
                return [...prev, fieldName];
            }
        });
    };

    const handleSelectAll = () => {
        const allFields = TABLE_CONFIGS[selectedTable].fields.map(field => field.name);
        setSelectedFields(allFields);
    };

    const handleUnselectAll = () => {
        setSelectedFields([]); // Clear all selected fields, including mandatory ones
    };

    const handleSelectMandatory = () => {
        const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
            .filter(field => field.required)
            .map(field => field.name);
        setSelectedFields(mandatoryFields);
    };

    const generateExcelData = () => {
        const fields = TABLE_CONFIGS[selectedTable].fields.filter(field =>
            selectedFields.includes(field.name)
        );

        let data = [];

        if (exportType === 'blank_template') {
            data = [fields.map(field => field.label)];
        } else if (exportType === '5_records') {
            data = [
                fields.map(field => field.label),
                ...Array(5).fill().map((_, index) =>
                    fields.map(field => {
                        switch (field.type) {
                            case 'email': return `user${index + 1}@example.com`;
                            case 'text': return field.name === 'username' ? `user${index + 1}` : `Sample ${field.label} ${index + 1}`;
                            case 'number': return index + 1;
                            case 'date': return '2024-01-01';
                            case 'select': return field.options ? field.options[0] : 'Option1';
                            default: return `Sample Data ${index + 1}`;
                        }
                    })
                )
            ];
        }

        return data;
    };

    const handleExport = () => {
        if (selectedFields.length === 0) {
            setSnackbar({ open: true, message: 'Please select at least one field', severity: 'error' });
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const data = generateExcelData();
            const csvContent = data.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTable}_template.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            setLoading(false);
            setExportModalOpen(false);
            setSnackbar({ open: true, message: 'Template downloaded successfully', severity: 'success' });
        }, 1000);
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const csvFiles = files.filter(file => file.name.toLowerCase().endsWith('.csv'));

        if (csvFiles.length !== files.length) {
            setSnackbar({ open: true, message: 'Only CSV files are allowed', severity: 'error' });
            return;
        }

        setAttachedFiles(prev => [...prev, ...csvFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewData(null);
    };

    const handlePreview = () => {
        if (attachedFiles.length === 0) return;

        setLoading(true);

        // Simulate file processing
        setTimeout(() => {
            const dummyPreview = {
                columns: ['ID', 'Name', 'Email', 'Phone'],
                data: [
                    ['1', 'John Doe', 'john@example.com', '1234567890'],
                    ['2', 'Jane Smith', 'jane@example.com', '0987654321'],
                    ['3', 'Bob Johnson', 'bob@example.com', '5555555555']
                ],
                warnings: [
                    { column: 2, message: 'Email format validation required' },
                    { column: 3, message: 'Phone number format inconsistent' }
                ]
            };

            setPreviewData(dummyPreview);
            setLoading(false);
            setSnackbar({ open: true, message: 'File preview generated', severity: 'success' });
        }, 2000);
    };

    const handleStartImport = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSnackbar({ open: true, message: 'Import started successfully. Check status in listings.', severity: 'success' });
            setAttachedFiles([]);
            setPreviewData(null);
            setSelectedTable('');
        }, 1500);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            completed: { color: 'success', icon: CheckCircleIcon },
            processing: { color: 'warning', icon: WarningIcon },
            failed: { color: 'error', icon: WarningIcon }
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
        <Box sx={{ p: 3, minWidth: '77vw', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                    Data Import System
                </Typography>

                {/* Tab Navigation */}
                <Box>
                    <Button
                        variant={activeTab === 'import' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('import')}
                        sx={{ mr: 2 }}
                    >
                        Import Data
                    </Button>
                    <Button
                        variant={activeTab === 'listings' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('listings')}
                    >
                        Import History
                    </Button>
                </Box>
            </Box>


            {activeTab === 'import' ? (
                <>
                    <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa', mb: 4 }}>
                        <Grid container spacing={3}>
                            {/* Document Type and Buttons */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                                        Document Type <span style={{ color: 'red' }}>*</span>
                                    </FormLabel>
                                    <Select value={selectedTable} onChange={handleTableSelect} displayEmpty>
                                        <MenuItem value="">Select Table</MenuItem>
                                        {Object.entries(TABLE_CONFIGS).map(([key, config]) => (
                                            <MenuItem key={key} value={key}>{config.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportModalOpen}
                                    disabled={!selectedTable}
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
                                    <Typography variant="h6" gutterBottom>Import File</Typography>

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
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                File Type Allowed: CSV
                                            </Typography>
                                        </Box>
                                    ) : (
      <Box sx={{width:'30%'}}>
  <Typography variant="subtitle2" gutterBottom>
    Attachments
  </Typography>
  {attachedFiles.map((file, index) => (
    <Box
      key={index}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: 1,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography sx={{ wordBreak: 'break-all' }}>{file.name}</Typography>
      <IconButton size="small" color="error" onClick={() => removeFile(index)}>
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
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                </Grid>
                            )}

                            {/* Upload and Preview Button */}
                            {attachedFiles.length > 0 && !previewData && (
                                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                                    <Button variant="contained" onClick={handlePreview} disabled={loading}>
                                        {loading ? 'Processing...' : 'Upload and Preview'}
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
                                        <Typography variant="h6" gutterBottom>Preview</Typography>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {previewData.columns.map((col, index) => (
                                                            <TableCell key={index} sx={{ fontWeight: 600 }}>
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
                                            <Typography variant="h6" gutterBottom>Import Logs and Warnings</Typography>
                                            {previewData.warnings.map((warning, index) => (
                                                <Alert severity="warning" key={index} sx={{ mb: 1 }}>
                                                    <Typography variant="subtitle2">Column: {warning.column}</Typography>
                                                    <Typography variant="body2">{warning.message}</Typography>
                                                </Alert>
                                            ))}
                                        </Grid>
                                    )}

                                    {/* Final Import Button */}
                                    <Grid item xs={12} sx={{ textAlign: 'right' }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleStartImport}
                                            disabled={loading}
                                        >
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
                                    {DUMMY_IMPORT_RECORDS.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{record.id}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={TABLE_CONFIGS[record.table]?.name || record.table}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{record.filename}</TableCell>
                                            <TableCell>{getStatusChip(record.status)}</TableCell>
                                            <TableCell>{record.records}</TableCell>
                                            <TableCell>
                                                {record.errors > 0 ? (
                                                    <Chip label={record.errors} color="error" size="small" />
                                                ) : (
                                                    <Chip label="0" color="success" size="small" />
                                                )}
                                            </TableCell>
                                            <TableCell>{record.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Export Modal */}
            <Dialog open={exportModalOpen} onClose={() => setExportModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Export Data
                    <IconButton
                        onClick={() => setExportModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <FormLabel sx={{ mb: 1 }}>File Type</FormLabel>
                                <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                                    <MenuItem value="csv">CSV</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <FormLabel sx={{ mb: 1 }}>Export Type</FormLabel>
                                <Select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                                    <MenuItem value="blank_template">Blank Template</MenuItem>
                                    <MenuItem value="5_records">5 Sample Records</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                        Select Fields To Export
                    </Typography>

                    <Box sx={{ mb: 2, }}>
                        <Button size="small" onClick={handleSelectAll} sx={{ mr: 1, border: '1px solid' }}>
                            Select All
                        </Button>
                        <Button size="small" onClick={handleUnselectAll} sx={{ mr: 1, border: '1px solid' }}>
                            Unselect All
                        </Button>
                        <Button size="small" onClick={handleSelectMandatory} sx={{ border: '1px solid' }}>
                            Select Mandatory
                        </Button>
                    </Box>

                    <Grid container spacing={1}>
                        {selectedTable && TABLE_CONFIGS[selectedTable].fields.map((field) => (
                            <Grid item xs={12} sm={6} key={field.name}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedFields.includes(field.name)}
                                            onChange={() => handleFieldSelection(field.name)}
                                        />
                                    }
                                    label={
                                        <Typography
                                            color={field.required ? 'error' : 'inherit'}
                                            sx={{ fontSize: '0.9rem' }}
                                        >
                                            {field.label}
                                        </Typography>
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        disabled={selectedFields.length === 0 || loading}
                    >
                        {loading ? 'Exporting...' : 'Export'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Guidance Drawer */}
            <Drawer
                anchor="right"
                open={guidanceDrawerOpen}
                onClose={() => setGuidanceDrawerOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: 400 } }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Data Filling Guidance
                    </Typography>

                    {selectedTable && GUIDANCE_DATA[selectedTable] && (
                        <List>
                            {GUIDANCE_DATA[selectedTable].map((item, index) => (
                                <Accordion key={index}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle2">{item.field}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Formats:</strong>
                                        </Typography>
                                        {item.formats.map((format, i) => (
                                            <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                                                • {format}
                                            </Typography>
                                        ))}
                                        {item.note && (
                                            <>
                                                <Typography variant="body2" sx={{ mt: 1 }} gutterBottom>
                                                    <strong>Note:</strong>
                                                </Typography>
                                                <Typography variant="body2">{item.note}</Typography>
                                            </>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </List>
                    )}
                </Box>
            </Drawer>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DataImportSystem;