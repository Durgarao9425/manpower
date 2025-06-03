import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    FormControlLabel,
    Switch,
    Divider,
    // Stack, // Not used
    IconButton,
    FormControl,
    InputLabel, // Added for completeness, though not explicitly used in provided step components
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Visibility as VisibilityIcon,
    // CheckCircle as CheckCircleIcon, // Not used
    // Cancel as CancelIcon, // Not used
    Publish as PublishIcon,
    FileDownload as FileDownloadIcon,
    // Done as DoneIcon, // Not used
    ExpandMore as ExpandMoreIcon, // For Accordion
    CloudUpload as CloudUploadIcon, // Icon for Step 1
    SettingsApplications as SettingsApplicationsIcon, // Icon for Step 2
    Preview as PreviewIcon, // Icon for Step 3
    Edit as EditIcon, // Example, if needed
    Assessment as AssessmentIcon // Example, if needed
} from '@mui/icons-material';
import orderStatementService from '../../../services/orderStatementService';
import type { FieldMapping, OrderStatementPreview, SystemField } from '../../../services/orderStatementService';
import { useLocation } from 'react-router-dom';

// Default Excel data for initial UI rendering
const defaultExcelData: {
    fileName: string;
    uploadDate: string;
    fileSize: string;
    totalRows: number;
    headers: string[];
    rows: any[][];
} = {
    fileName: '',
    uploadDate: '',
    fileSize: '',
    totalRows: 0,
    headers: [],
    rows: []
};

// System field options for mapping with colors
// These will be populated from the API but we define defaults with colors
const defaultSystemFields = [
    { value: 'none', label: '-- Select Field --', color: '#757575' },
    { value: 'rider_id', label: 'Rider ID', color: '#1976d2' },
    { value: 'rider_name', label: 'Rider Name', color: '#388e3c' },
    { value: 'store_name', label: 'Store Name', color: '#f57c00' },
    { value: 'delivered_orders', label: 'Delivered Orders', color: '#7b1fa2' },
    { value: 'cancelled_orders', label: 'Cancelled Orders', color: '#d32f2f' },
    { value: 'pickup_orders', label: 'Pickup Orders', color: '#0288d1' },
    { value: 'attendance', label: 'Attendance', color: '#689f38' },
    { value: 'total_earnings', label: 'Total Earnings', color: '#f9a825' },
    { value: 'commission', label: 'Commission', color: '#e64a19' },
    { value: 'tax_deduction', label: 'Tax Deduction', color: '#5d4037' },
    { value: 'gst', label: 'GST', color: '#455a64' }
];

// Field type options
const fieldTypes = [
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'currency', label: 'Currency', icon: '💰' },
    { value: 'percentage', label: 'Percentage', icon: '📊' },
    { value: 'date', label: 'Date', icon: '📅' },
];

interface FieldMapping {
    companyColumn: string;
    systemField: string;
    fieldType: string;
    showToRiders: boolean;
    showInInvoice: boolean;
    useForCommission: boolean;
    isSelected: boolean;
}

// Step 1: File Preview & Column Selection Combined
const FilePreviewAndSelection: React.FC<{
    excelData: typeof defaultExcelData;
    selectedColumns: string[];
    onColumnChange: (column: string, checked: boolean) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onNext: () => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ 
    excelData, 
    selectedColumns, 
    onColumnChange, 
    onSelectAll, 
    onDeselectAll, 
    onNext, 
    onFileUpload, 
    loading,
    fileInputRef 
}) => {
    return (
        <Box sx={{ py: 1 }}> {/* Reduced padding for accordion content */}
            <Card sx={{ borderRadius: 2, p: 2, bgcolor: '#fff', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary.dark">
                    📊 File Upload & Column Selection
                </Typography>
                
                {/* File Upload Section */}
                {!excelData.fileName ? (
                    <Box 
                        sx={{ 
                            border: '2px dashed #ccc', 
                            borderRadius: 2, 
                            p: 3, 
                            textAlign: 'center',
                            mb: 2,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={onFileUpload}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                        />
                        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Upload Excel File
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Supported formats: .xlsx, .xls, .csv
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => fileInputRef.current?.click()}
                            startIcon={<CloudUploadIcon />}
                            disabled={loading}
                            sx={{ borderRadius: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Select File'}
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">File Name</Typography>
                                <Typography fontWeight={500}>{excelData.fileName}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Upload Date</Typography>
                                <Typography fontWeight={500}>
                                    {excelData.uploadDate ? new Date(excelData.uploadDate).toLocaleDateString() : ''}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">File Size</Typography>
                                <Typography fontWeight={500}>{excelData.fileSize}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Total Records</Typography>
                                <Typography fontWeight={500}>{excelData.totalRows} rows</Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                File Preview ({excelData.headers.length} Columns)
                            </Typography>
                            <Button 
                                size="small" 
                                startIcon={<CloudUploadIcon />} 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                Upload New File
                            </Button>
                        </Box>
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ maxHeight: 180, overflow: 'auto', borderRadius: 1, mb: 2 }}
                        >
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {excelData.headers.map((header) => (
                                            <TableCell key={header} sx={{ fontWeight: 'bold', bgcolor: 'grey.100', fontSize: '0.75rem' }}>
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {excelData.rows.slice(0, 3).map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                            {row.map((cell, cellIdx) => (
                                                <TableCell key={cellIdx} sx={{ fontSize: '0.75rem' }}>
                                                    {cell}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Select Columns to Include
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Button variant="outlined" size="small" onClick={onSelectAll} sx={{ mr: 1 }}>
                                Select All
                            </Button>
                            <Button variant="outlined" size="small" onClick={onDeselectAll}>
                                Deselect All
                            </Button>
                        </Box>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            {excelData.headers.map((column) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={column}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={selectedColumns.includes(column)}
                                                onChange={(e) => onColumnChange(column, e.target.checked)}
                                            />
                                        }
                                        label={<Typography variant="body2">{column}</Typography>}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Box textAlign="right">
                            <Button
                                variant="contained"
                                onClick={onNext}
                                endIcon={<ArrowForwardIcon />}
                                disabled={selectedColumns.length === 0 || loading}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                {loading ? <CircularProgress size={24} /> : `Configure Fields (${selectedColumns.length} selected)`}
                            </Button>
                        </Box>
                    </>
                )}
            </Card>
        </Box>
    );
};

// Step 2: Field Mapping & Configuration
const FieldMappingStep: React.FC<{
    mappings: FieldMapping[];
    onMappingChange: (index: number, field: keyof FieldMapping, value: any) => void;
    onNext: () => void;
    onBack: () => void;
    systemFields: typeof defaultSystemFields;
}> = ({ mappings, onMappingChange, onNext, onBack, systemFields }) => {
    const selectedMappings = mappings.filter(m => m.isSelected);
    return (
        <Box sx={{ py: 1 }}> {/* Reduced padding */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                 {/* Back button is now primarily handled by Accordion, but can be kept for explicit step control if needed */}
                {/* <IconButton onClick={onBack} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton> */}
                <Box>
                    <Typography variant="h6" fontWeight={700} color="primary.dark">
                        Field Mapping & Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Map Excel columns to system fields and configure visibility
                    </Typography>
                </Box>
            </Box>
            <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'primary.main' }}>
                            <TableRow>
                                {[
                                    '📋 Excel Column', '🎯 System Field', '📝 Field Type',
                                    '👁️ Show to Riders', '🧾 Show in Invoice', '💰 Use for Commission',
                                ].map((label) => (
                                    <TableCell key={label} sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedMappings.map((mapping) => {
                                const actualIndex = mappings.findIndex(m => m.companyColumn === mapping.companyColumn);
                                if (actualIndex === -1) return null;
                                return (
                                    <TableRow key={mapping.companyColumn} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                        <TableCell sx={{ fontWeight: 'medium', color: 'primary.dark', fontSize: '0.8rem' }}>{mapping.companyColumn}</TableCell>
                                        <TableCell sx={{minWidth: 150}}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={mappings[actualIndex].systemField}
                                                    onChange={(e) => onMappingChange(actualIndex, 'systemField', e.target.value)}
                                                    sx={{ borderRadius: 1, fontSize: '0.8rem' }}
                                                >
                                                    {systemFields.map(field => (
                                                        <MenuItem key={field.value} value={field.value} sx={{fontSize: '0.8rem'}}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: field.color, mr: 1 }} />
                                                                {field.label}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell sx={{minWidth: 120}}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={mappings[actualIndex].fieldType}
                                                    onChange={(e) => onMappingChange(actualIndex, 'fieldType', e.target.value)}
                                                    sx={{ borderRadius: 1, fontSize: '0.8rem' }}
                                                >
                                                    {fieldTypes.map(type => (
                                                        <MenuItem key={type.value} value={type.value} sx={{fontSize: '0.8rem'}}>
                                                            {type.icon} {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        {['showToRiders', 'showInInvoice', 'useForCommission'].map(optionKey => (
                                            <TableCell key={optionKey} align="center">
                                                <Switch
                                                    size="small"
                                                    checked={mappings[actualIndex][optionKey as keyof FieldMapping] as boolean}
                                                    onChange={(e) => onMappingChange(actualIndex, optionKey as keyof FieldMapping, e.target.checked)}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' },
                                                    }}
                                                    // Default color for unchecked track will be used or can be customized
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={onBack} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />} // Changed icon to ArrowForwardIcon for consistency
                    onClick={onNext}
                    sx={{
                        bgcolor: 'success.main', px: 3, py: 1, fontSize: '0.875rem', fontWeight: 600, borderRadius: 2,
                        '&:hover': { bgcolor: 'success.dark' }
                    }}
                >
                    Preview & Finish
                </Button>
            </Box>
        </Box>
    );
};

// Step 3: Final Preview Component
const FinalPreviewStep: React.FC<{
    mappings: FieldMapping[];
    onBack: () => void;
    onPublish: () => void;
    onExport: () => void;
    excelData: typeof defaultExcelData;
    systemFields: typeof defaultSystemFields;
}> = ({ mappings, onBack, onPublish, onExport, excelData, systemFields }) => {
    const selectedMappings = mappings.filter(m => m.isSelected);
    const unselectedMappings = mappings.filter(m => !m.isSelected);

    return (
        <Box sx={{ py: 1 }}> {/* Reduced padding */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                {/* <IconButton onClick={onBack} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton> */}
                <Box>
                    <Typography variant="h6" fontWeight="600" color="primary.dark">
                        Final Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review your mapped data before publishing
                    </Typography>
                </Box>
            </Box>
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        📊 Mapped Data Preview
                    </Typography>
                </Box>
                <TableContainer sx={{maxHeight: 250}}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                {selectedMappings.map((mapping) => {
                                    const systemField = systemFields.find(f => f.value === mapping.systemField);
                                    return (
                                        <TableCell
                                            key={mapping.companyColumn}
                                            sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: systemField?.color || 'text.primary' }}
                                        >
                                            {systemField?.label || mapping.companyColumn}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {excelData.rows.slice(0, 5).map((row, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                    {selectedMappings.map((mapping) => {
                                        const columnIndex = excelData.headers.indexOf(mapping.companyColumn);
                                        return (
                                            <TableCell key={mapping.companyColumn} sx={{ fontSize: '0.75rem' }}>
                                                {columnIndex !== -1 ? row[columnIndex] : ''}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="success.dark" gutterBottom>
                                ✅ Mapped Fields ({selectedMappings.length})
                            </Typography>
                            <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1, maxHeight: 100, overflowY: 'auto' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {selectedMappings.length > 0 ? selectedMappings.map(m => m.companyColumn).join(', ') : 'None'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>
                                ⚠️ Ignored Fields ({unselectedMappings.length})
                            </Typography>
                            <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1, maxHeight: 100, overflowY: 'auto' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {unselectedMappings.length > 0 ? unselectedMappings.map(m => m.companyColumn).join(', ') : 'None'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt:3 }}>
                <Button onClick={onBack} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Mapping
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={onExport}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PublishIcon />}
                        onClick={onPublish}
                        sx={{ bgcolor: 'success.main', px: 3, py: 1, borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: 'success.dark' }}}
                    >
                        Publish Data
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

// Main Component
const ExcelFieldMapper: React.FC = () => {
    const [expandedPanel, setExpandedPanel] = useState<string | false>('panel1'); // For accordion control
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
    const [excelData, setExcelData] = useState<typeof defaultExcelData>(defaultExcelData);
    const [uploadId, setUploadId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [systemFields, setSystemFields] = useState(defaultSystemFields);
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const location = useLocation();

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        
        try {
            const response = await orderStatementService.uploadOrderStatement(file);
            
            setUploadId(response.uploadId);
            setExcelData({
                fileName: response.fileName,
                uploadDate: response.uploadDate,
                fileSize: response.fileSize || `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                totalRows: response.totalRows,
                headers: response.headers,
                rows: response.previewRows
            });
            
            // Initialize field mappings
            const initialMappings: FieldMapping[] = response.headers.map((header, index) => ({
                companyColumn: header,
                systemField: 'none', // Default to none, user will map
                fieldType: 'text',
                showToRiders: true,
                showInInvoice: true,
                useForCommission: false,
                isSelected: false // No columns are initially selected for mapping
            }));
            
            setFieldMappings(initialMappings);
            setSuccess('File uploaded successfully!');
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Failed to upload file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load system fields from API
    useEffect(() => {
        const loadSystemFields = async () => {
            try {
                // This would normally come from the API
                // For now, we'll use our default fields
                // In a real implementation, you would fetch from the API:
                // const response = await orderStatementService.getSystemFields();
                // setSystemFields([
                //   { value: 'none', label: '-- Select Field --', color: '#757575' },
                //   ...response.map((field, index) => ({
                //     value: field.field_key,
                //     label: field.field_label,
                //     color: defaultSystemFields[index % defaultSystemFields.length]?.color || '#000000'
                //   }))
                // ]);
            } catch (err) {
                console.error('Error loading system fields:', err);
            }
        };
        
        loadSystemFields();
    }, []);

    // Get uploadId from query string
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const uploadIdParam = params.get('uploadId');
        if (uploadIdParam && !excelData.fileName) {
            setLoading(true);
            orderStatementService.getOrderStatementPreview(Number(uploadIdParam))
                .then(response => {
                    setUploadId(Number(uploadIdParam));
                    setExcelData({
                        fileName: response.fileName,
                        uploadDate: response.uploadDate,
                        fileSize: response.fileSize,
                        totalRows: response.totalRows,
                        headers: response.headers,
                        rows: response.previewRows
                    });
                    // Initialize field mappings
                    const initialMappings: FieldMapping[] = response.headers.map((header: string) => ({
                        companyColumn: header,
                        systemField: 'none',
                        fieldType: 'text',
                        showToRiders: true,
                        showInInvoice: true,
                        useForCommission: false,
                        isSelected: false
                    }));
                    setFieldMappings(initialMappings);
                })
                .catch(() => setError('Failed to load uploaded file data.'))
                .finally(() => setLoading(false));
        }
    }, [location.search]);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedPanel(isExpanded ? panel : false);
    };

    const navigateToPanel = (panelId: string) => {
        setExpandedPanel(panelId);
    };

    const handleColumnSelection = (column: string, checked: boolean) => {
        let newSelectedColumns;
        if (checked) {
            newSelectedColumns = [...selectedColumns, column];
        } else {
            newSelectedColumns = selectedColumns.filter(col => col !== column);
        }
        setSelectedColumns(newSelectedColumns);

        setFieldMappings(prev =>
            prev.map(mapping =>
                mapping.companyColumn === column
                    ? { ...mapping, isSelected: checked }
                    : mapping
            )
        );
    };

    const handleSelectAll = () => {
        setSelectedColumns(excelData.headers);
        setFieldMappings(prev => prev.map(mapping => ({ ...mapping, isSelected: true })));
    };

    const handleDeselectAll = () => {
        setSelectedColumns([]);
        setFieldMappings(prev => prev.map(mapping => ({ ...mapping, isSelected: false })));
    };

    const handleMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
        setFieldMappings(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleExport = async () => {
        if (!uploadId) {
            setError('No file has been uploaded');
            return;
        }
        
        const activeMappings = fieldMappings.filter(m => m.isSelected);
        if (activeMappings.length === 0) {
            setError("No fields selected for export.");
            return;
        }
        
        setLoading(true);
        
        try {
            // In a real implementation, you would use the API:
            // const blob = await orderStatementService.exportMappedData(uploadId);
            // const url = window.URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = `mapped_data_${uploadId}.xlsx`;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // window.URL.revokeObjectURL(url);
            
            // For now, we'll simulate with client-side export
            const headers = activeMappings.map(m => {
                const systemField = systemFields.find(f => f.value === m.systemField);
                return systemField?.label || m.companyColumn;
            });

            const csvContent = [
                headers.join(','),
                ...excelData.rows.map(row =>
                    activeMappings.map(mapping => {
                        const columnIndex = excelData.headers.indexOf(mapping.companyColumn);
                        return columnIndex !== -1 ? row[columnIndex] : '';
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mapped_data.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            setSuccess('Data exported successfully!');
        } catch (err) {
            console.error('Error exporting data:', err);
            setError('Failed to export data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!uploadId) {
            setError('No file has been uploaded');
            return;
        }
        
        const activeMappings = fieldMappings.filter(m => m.isSelected);
        if (activeMappings.length === 0) {
            setError("No fields selected for publishing.");
            return;
        }
        
        setLoading(true);
        
        try {
            // In a real implementation, you would use the API:
            await orderStatementService.mapOrderStatement(uploadId, fieldMappings);
            
            setSuccess('Data published successfully!');
            
            // Reset to the first step
            navigateToPanel('panel1');
            setSelectedColumns([]);
            setUploadId(null);
            setExcelData(defaultExcelData);
            
            // Reset mappings
            setFieldMappings([]);
        } catch (err) {
            console.error('Error publishing data:', err);
            setError('Failed to publish data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const accordionData = [
        {
            id: 'panel1',
            title: 'Step 1: File Upload & Column Selection',
            icon: <CloudUploadIcon />,
            content: (
                <FilePreviewAndSelection
                    excelData={excelData}
                    selectedColumns={selectedColumns}
                    onColumnChange={handleColumnSelection}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onNext={() => navigateToPanel('panel2')}
                    onFileUpload={handleFileUpload}
                    loading={loading}
                    fileInputRef={fileInputRef}
                />
            ),
            disabled: false, // Step 1 is always enabled
        },
        {
            id: 'panel2',
            title: 'Step 2: Field Mapping & Configuration',
            icon: <SettingsApplicationsIcon />,
            content: (
                <FieldMappingStep
                    mappings={fieldMappings}
                    onMappingChange={handleMappingChange}
                    onNext={() => navigateToPanel('panel3')}
                    onBack={() => navigateToPanel('panel1')}
                    systemFields={systemFields}
                />
            ),
            disabled: selectedColumns.length === 0 || loading, // Disable if no columns selected from step 1
        },
        {
            id: 'panel3',
            title: 'Step 3: Final Preview & Publish',
            icon: <PreviewIcon />,
            content: (
                <FinalPreviewStep
                    mappings={fieldMappings}
                    onBack={() => navigateToPanel('panel2')}
                    onPublish={handlePublish}
                    onExport={handleExport}
                    excelData={excelData}
                    systemFields={systemFields}
                />
            ),
            disabled: !fieldMappings.some(m => m.isSelected) || loading, // Disable if no fields are actually mapped
        }
    ];

    // Handle notification close
    const handleCloseError = () => {
        setError(null);
    };

    const handleCloseSuccess = () => {
        setSuccess(null);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary" textAlign="center" sx={{mb:3}}>
                Excel Data Field Mapper
            </Typography>
            
            {/* Error Notification */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            
            {/* Success Notification */}
            <Snackbar 
                open={!!success} 
                autoHideDuration={6000} 
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
            
            {accordionData.map((item) => (
                <Accordion
                    key={item.id}
                    expanded={expandedPanel === item.id}
                    onChange={handleAccordionChange(item.id)}
                    disabled={item.disabled}
                    sx={{ 
                        mb: 1.5, 
                        '&.Mui-expanded': { margin: '12px 0' },
                        boxShadow: expandedPanel === item.id ? 5 : 1,
                        '&:before': { display: 'none' } 
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${item.id}-content`}
                        id={`${item.id}-header`}
                        sx={{ 
                            bgcolor: expandedPanel === item.id ? 'primary.main' : 'grey.100',
                            color: expandedPanel === item.id ? 'primary.contrastText' : 'text.primary',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                            minHeight: 56,
                            '& .MuiAccordionSummary-content': { 
                                alignItems: 'center',
                                gap: 1.5 
                            },
                            '& .MuiSvgIcon-root': { 
                                color: expandedPanel === item.id ? 'primary.contrastText' : 'action.active',
                            }
                        }}
                    >
                        {item.icon}
                        <Typography fontWeight="medium">{item.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: {xs: 1, sm: 2}, bgcolor: 'background.paper' }}>
                        {item.content}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
};
export default ExcelFieldMapper;