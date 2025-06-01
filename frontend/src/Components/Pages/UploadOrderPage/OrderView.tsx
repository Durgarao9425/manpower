import React, { useState, useEffect } from 'react';
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
    Stack,
    IconButton,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Publish as PublishIcon,
    FileDownload as FileDownloadIcon,
    Done as DoneIcon
} from '@mui/icons-material';

// Dummy Excel data - This would come from your file upload
const dummyExcelData = {
    fileName: 'order_statement_2025.xlsx',
    uploadDate: '2025-06-01',
    fileSize: '2.5 MB',
    totalRows: 150,
    headers: [
        'RIDER ID', 'RIDER NAME', 'STORE NAME', 'DELIVERED ORDERS',
        'CANCELLED ORDERS', 'PICKUP ORDERS', 'ATTENDANCE', 'TOTAL EARNINGS',
        'COMMISSION', 'TAX DEDUCTION', 'GST'
    ],
    rows: [
        ['585609', 'BONDADA TARUN', 'RAM NAGAR', '131', '1', '0', '6', '6059.25', '302.96', '0', '1145.19'],
        ['585610', 'Kanda Bala Gangadhar', 'RAM NAGAR', '131', '1', '0', '6', '6059.25', '302.96', '0', '1145.19'],
        ['585611', 'Rajesh Kumar', 'CITY CENTER', '125', '2', '1', '7', '5850.75', '285.45', '50', '1089.54'],
        ['585612', 'Priya Sharma', 'MALL ROAD', '142', '0', '2', '8', '6789.50', '325.78', '25', '1298.76'],
        ['585613', 'Amit Singh', 'PARK STREET', '118', '3', '1', '5', '5234.25', '245.67', '75', '985.21']
    ]
};

// System field options for mapping
const systemFields = [
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
    selectedColumns: string[];
    onColumnChange: (column: string, checked: boolean) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onNext: () => void;
}> = ({ selectedColumns, onColumnChange, onSelectAll, onDeselectAll, onNext }) => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* File Overview */}
            <Card sx={{ borderRadius: 4, p: 3, bgcolor: '#fff', mb: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
                    📊 File Overview & Column Selection
                </Typography>

                {/* File Details Grid */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="text.secondary">File Name</Typography>
                        <Typography fontWeight={500}>{dummyExcelData.fileName}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="text.secondary">Upload Date</Typography>
                        <Typography fontWeight={500}>
                            {new Date(dummyExcelData.uploadDate).toLocaleDateString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="text.secondary">File Size</Typography>
                        <Typography fontWeight={500}>{dummyExcelData.fileSize}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="text.secondary">Total Records</Typography>
                        <Typography fontWeight={500}>{dummyExcelData.totalRows} rows</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* File Preview */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    File Preview ({dummyExcelData.headers.length} Columns)
                </Typography>

                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ maxHeight: 200, overflow: 'auto', borderRadius: 2, mb: 3 }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {dummyExcelData.headers.map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: 600, bgcolor: '#f1f3f5' }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dummyExcelData.rows.slice(0, 3).map((row, idx) => (
                                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                    {row.map((cell, cellIdx) => (
                                        <TableCell key={cellIdx} sx={{ fontSize: '0.8rem' }}>
                                            {cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                {/* Column Selection */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Select Columns to Include
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Button variant="outlined" size="small" onClick={onSelectAll} sx={{ mr: 2 }}>
                        Select All
                    </Button>
                    <Button variant="outlined" size="small" onClick={onDeselectAll}>
                        Deselect All
                    </Button>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {dummyExcelData.headers.map((column) => (
                        <Grid item xs={12} sm={6} md={4} key={column}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedColumns.includes(column)}
                                        onChange={(e) => onColumnChange(column, e.target.checked)}
                                    />
                                }
                                label={column}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Box textAlign="right">
                    <Button
                        variant="contained"
                        onClick={onNext}
                        endIcon={<ArrowForwardIcon />}
                        disabled={selectedColumns.length === 0}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Configure Fields ({selectedColumns.length} selected)
                    </Button>
                </Box>
            </Card>
        </Container>
    );
};

// Step 2: Field Mapping & Configuration
const FieldMappingStep: React.FC<{
    mappings: FieldMapping[];
    onMappingChange: (index: number, field: keyof FieldMapping, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}> = ({ mappings, onMappingChange, onNext, onBack }) => {
    const selectedMappings = mappings.filter(m => m.isSelected);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={onBack} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="#1a237e">
                        Field Mapping & Configuration
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Map Excel columns to system fields and configure visibility
                    </Typography>
                </Box>
            </Box>

            {/* Table */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#1a237e' }}>
                            <TableRow>
                                {[
                                    '📋 Excel Column',
                                    '🎯 System Field',
                                    '📝 Field Type',
                                    '👁️ Show to Riders',
                                    '🧾 Show in Invoice',
                                    '💰 Use for Commission',
                                ].map((label) => (
                                    <TableCell key={label} sx={{ color: '#fff', fontWeight: 600 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedMappings.map((mapping, i) => {
                                const actualIndex = mappings.findIndex(m => m.companyColumn === mapping.companyColumn);

                                return (
                                    <TableRow key={mapping.companyColumn} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                        {/* Excel Column */}
                                        <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>{mapping.companyColumn}</TableCell>

                                        {/* System Field Select */}
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={mapping.systemField}
                                                    onChange={(e) => onMappingChange(actualIndex, 'systemField', e.target.value)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {systemFields.map(field => (
                                                        <MenuItem key={field.value} value={field.value}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: field.color, mr: 1 }} />
                                                                {field.label}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>

                                        {/* Field Type Select */}
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={mapping.fieldType}
                                                    onChange={(e) => onMappingChange(actualIndex, 'fieldType', e.target.value)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {fieldTypes.map(type => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.icon} {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>

                                        {/* Show to Riders */}
                                        <TableCell>
                                            <Switch
                                                checked={mapping.showToRiders}
                                                onChange={(e) => onMappingChange(actualIndex, 'showToRiders', e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: mapping.showToRiders ? '#4caf50' : '#f44336',
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        {/* Show in Invoice */}
                                        <TableCell>
                                            <Switch
                                                checked={mapping.showInInvoice}
                                                onChange={(e) => onMappingChange(actualIndex, 'showInInvoice', e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: mapping.showInInvoice ? '#4caf50' : '#f44336',
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        {/* Use for Commission */}
                                        <TableCell>
                                            <Switch
                                                checked={mapping.useForCommission}
                                                onChange={(e) => onMappingChange(actualIndex, 'useForCommission', e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: mapping.useForCommission ? '#4caf50' : '#f44336',
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={onBack} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    endIcon={<VisibilityIcon />}
                    onClick={onNext}
                    sx={{
                        bgcolor: '#4caf50',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        '&:hover': { bgcolor: '#388e3c' }
                    }}
                >
                    Preview & Finish
                </Button>
            </Box>
        </Container>
    );
};

// Step 3: Final Preview Component
const FinalPreviewStep: React.FC<{
    mappings: FieldMapping[];
    onBack: () => void;
    onPublish: () => void;
    onExport: () => void;
}> = ({ mappings, onBack, onPublish, onExport }) => {
    const selectedMappings = mappings.filter(m => m.isSelected);
    const unselectedMappings = mappings.filter(m => !m.isSelected);
    console.log(selectedMappings, "selectedMappings---------------")
    console.log(unselectedMappings, "unselectedMappings")

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={onBack} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="600" color="#1a237e">
                        Final Preview
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Review your mapped data before publishing
                    </Typography>
                </Box>
            </Box>

            {/* Data Preview */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 3 }}>
                    <Typography variant="h6" fontWeight="600">
                        📊 Mapped Data Preview
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Showing sample data with your field mappings
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                {selectedMappings.map((mapping) => {
                                    const systemField = systemFields.find(f => f.value === mapping.systemField);
                                    return (
                                        <TableCell
                                            key={mapping.companyColumn}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                color: systemField?.color || '#495057'
                                            }}
                                        >
                                            {systemField?.label || mapping.companyColumn}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dummyExcelData.rows.slice(0, 5).map((row, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                    {selectedMappings.map((mapping) => {
                                        const columnIndex = dummyExcelData.headers.indexOf(mapping.companyColumn);
                                        return (
                                            <TableCell key={mapping.companyColumn} sx={{ fontSize: '0.8rem' }}>
                                                {row[columnIndex]}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" color="#1a237e" gutterBottom>
                                ✅ Mapped Fields
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                                <Typography variant="body1" fontWeight="600" color="#4caf50" gutterBottom>
                                    Mapped Fields:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedMappings.length > 0
                                        ? selectedMappings.map(m => m.companyColumn).join(', ')
                                        : 'None'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" color="#1a237e" gutterBottom>
                                ⚠️ Ignored Fields
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                                <Typography variant="body1" fontWeight="600" color="#ff9800" gutterBottom>
                                    Ignored Fields:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {unselectedMappings.length > 0
                                        ? unselectedMappings.map(m => m.companyColumn).join(', ')
                                        : 'None'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* Navigation & Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={onBack} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Mapping
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={onExport}
                        sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: '#1565c0',
                                color: '#1565c0',
                                bgcolor: '#e3f2fd',
                            }
                        }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PublishIcon />}
                        onClick={onPublish}
                        sx={{
                            bgcolor: '#4caf50',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                                bgcolor: '#43a047',
                                boxShadow: '0 12px 32px rgba(76, 175, 80, 0.4)',
                            }
                        }}
                    >
                        Publish Data
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

// Main Component
const ExcelFieldMapper: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<'preview-selection' | 'mapping' | 'final-preview'>('preview-selection');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

    // Initialize field mappings when component mounts
    useEffect(() => {
        const initialMappings: FieldMapping[] = dummyExcelData.headers.map((header, index) => ({
            companyColumn: header,
            systemField: index < systemFields.length - 1 ? systemFields[index + 1].value : 'none',
            fieldType: 'text',
            showToRiders: true,
            showInInvoice: true,
            useForCommission: false,
            isSelected: false
        }));
        setFieldMappings(initialMappings);
    }, []);

    // Handle column selection/deselection
    const handleColumnSelection = (column: string, checked: boolean) => {
        if (checked) {
            setSelectedColumns([...selectedColumns, column]);
        } else {
            setSelectedColumns(selectedColumns.filter(col => col !== column));
        }

        // Update field mappings
        setFieldMappings(prev =>
            prev.map(mapping =>
                mapping.companyColumn === column
                    ? { ...mapping, isSelected: checked }
                    : mapping
            )
        );
    };

    // Select all columns
    const handleSelectAll = () => {
        setSelectedColumns(dummyExcelData.headers);
        setFieldMappings(prev => prev.map(mapping => ({ ...mapping, isSelected: true })));
    };

    // Deselect all columns
    const handleDeselectAll = () => {
        setSelectedColumns([]);
        setFieldMappings(prev => prev.map(mapping => ({ ...mapping, isSelected: false })));
    };

    // Handle field mapping changes
    const handleMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
        setFieldMappings(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Handle Excel export
    const handleExport = () => {
        const selectedMappings = fieldMappings.filter(m => m.isSelected);
        const headers = selectedMappings.map(m => {
            const systemField = systemFields.find(f => f.value === m.systemField);
            return systemField?.label || m.companyColumn;
        });

        const csvContent = [
            headers.join(','),
            ...dummyExcelData.rows.map(row =>
                selectedMappings.map(mapping => {
                    const columnIndex = dummyExcelData.headers.indexOf(mapping.companyColumn);
                    return row[columnIndex];
                }).join(',')
            )
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapped_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Handle publish (redirect to first page)
    const handlePublish = () => {
        alert('Data published successfully!');
        setCurrentStep('preview-selection');
        setSelectedColumns([]);
        setFieldMappings(prev => prev.map(mapping => ({ ...mapping, isSelected: false })));
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            {currentStep === 'preview-selection' && (
                <FilePreviewAndSelection
                    selectedColumns={selectedColumns}
                    onColumnChange={handleColumnSelection}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onNext={() => setCurrentStep('mapping')}
                />
            )}

            {currentStep === 'mapping' && (
                <FieldMappingStep
                    mappings={fieldMappings}
                    onMappingChange={handleMappingChange}
                    onNext={() => setCurrentStep('final-preview')}
                    onBack={() => setCurrentStep('preview-selection')}
                />
            )}

            {currentStep === 'final-preview' && (
                <FinalPreviewStep
                    mappings={fieldMappings}
                    onBack={() => setCurrentStep('mapping')}
                    onPublish={handlePublish}
                    onExport={handleExport}
                />
            )}
        </Box>
    );
};

export default ExcelFieldMapper;