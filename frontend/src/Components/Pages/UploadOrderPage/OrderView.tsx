import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Alert,
    CircularProgress,
    Chip,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    AttachFile as AttachFileIcon,
    TableChart as TableChartIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Publish as PublishIcon,
    Preview as PreviewIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import apiService from '../../../services/apiService';

// --- Interfaces ---
export interface OrderStatement {
    id: number;
    company_id: string;
    payment_date: string;
    month_value: string;
    week_value: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    file_path: string;
    notes: string;
    mapping_status: string;
    row_reference?: string;
}

export interface OrderStatementData {
    id?: number;
    company_id: string;
    payment_date: string;
    month_value: string;
    week_value: string;
    amount: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    file_path?: string;
    notes: string;
    mapping_status: string;
    row_reference?: string;
}

export interface Company {
    id: string;
    name: string;
}

interface ExcelData {
    [key: string]: any;
}

interface ExcelSourceData {
    uploadId?: string;
    fileName: string;
    fileSize: number;
    headers: string[];
    previewRows: any[][];
    fullData: any[][]; // Store full data for client-side export preview
}

interface ExcelColumnOption {
    label: string;
    value: string;
    sampleData?: string;
}

export interface FieldMappingConfig {
    companyColumn: string;
    systemField: string;
    isSelected: boolean;
    sampleData?: string;
}

interface SystemFieldOption {
    value: string;
    label: string;
    color?: string;
    description?: string;
}

// Constants
const MONTHS = [
    { value: '2025', label: 'January 2025' },
    { value: 'feb-2025', label: 'February 2025' },
    { value: 'mar-2025', label: 'March 2025' },
    { value: 'apr-2025', label: 'April 2025' },
    { value: 'may-2025', label: 'May 2025' },
    { value: 'jun-2025', label: 'June 2025' },
    { value: 'jul-2025', label: 'July 2025' },
    { value: 'aug-2025', label: 'August 2025' },
    { value: 'sep-2025', label: 'September 2025' },
    { value: 'oct-2025', label: 'October 2025' },
    { value: 'nov-2025', label: 'November 2025' },
    { value: 'dec-2025', label: 'December 2025' }
];

const WEEKS = [
    { value: '1', label: 'Week 1 (1-7)' },
    { value: '2', label: 'Week 2 (8-14)' },
    { value: '3', label: 'Week 3 (15-21)' },
    { value: '4', label: 'Week 4 (22-28)' },
];

const defaultSystemFields: SystemFieldOption[] = [
    { value: 'none', label: '-- Select System Field --', color: '#757575' },
    { value: 'rider_id', label: 'Rider ID', color: '#1976d2', description: 'Unique identifier for the rider' },
    { value: 'rider_name', label: 'Rider Name', color: '#2196f3', description: 'Full name of the rider' },
    { value: 'order_count', label: 'Order Count', color: '#4caf50', description: 'Number of orders completed' },
    { value: 'distance', label: 'Distance (km)', color: '#ff9800', description: 'Total distance traveled' },
    { value: 'base_pay', label: 'Base Pay', color: '#f44336', description: 'Base payment amount' },
    { value: 'bonus', label: 'Bonus', color: '#9c27b0', description: 'Additional bonus amount' },
    { value: 'total_earnings', label: 'Total Earnings', color: '#e91e63', description: 'Total payment including base pay and bonuses' }
];

// Mock service for order statements
const orderStatementService = {
    uploadAndParseFile: async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                    
                    if (jsonData.length > 0) {
                        const headers = jsonData[0] as string[];
                        
                        // Get first 5 rows for preview
                        const previewRows = (jsonData.slice(1) as any[][]).slice(0, 5);
                        
                        resolve({
                            uploadId: 'temp-' + Date.now(),
                            fileName: file.name,
                            fileSize: file.size,
                            headers,
                            previewRows,
                            fullData: jsonData.slice(1) as any[][] // Full data for potential client-side export preview
                        });
                    } else {
                        reject(new Error('No data found in the Excel file'));
                    }
                } catch (err) {
                    reject(new Error('Failed to process Excel file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    },
    
    exportMappedDataPreview: async (headers: string[], data: any[][], mappings: FieldMappingConfig[]): Promise<Blob> => {
        console.log(`Simulating export of mapped data preview`);
        
        // Filter only selected mappings with valid system fields
        const activeMappings = mappings.filter(m => m.isSelected && m.systemField !== 'none');
        if (activeMappings.length === 0) {
            return new Blob(["No columns selected or mapped for export."], { type: 'text/plain;charset=utf-8;' });
        }
        
        // Create headers for the export
        const exportHeaders = activeMappings.map(m => {
            const systemField = defaultSystemFields.find(sf => sf.value === m.systemField) || { label: m.systemField };
            return systemField.label;
        });
        
        // Create rows for the export
        const exportedRows: string[][] = [];
        
        data.forEach(row => {
            const newRow: string[] = [];
            activeMappings.forEach(mapping => {
                const headerIndex = headers.indexOf(mapping.companyColumn);
                if (headerIndex !== -1) {
                    newRow.push(row[headerIndex]?.toString() || '');
                } else {
                    newRow.push('');
                }
            });
            exportedRows.push(newRow);
        });
        
        // Convert to CSV
        let csvContent = exportHeaders.join(",") + "\n";
        exportedRows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });
        
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
};

// Initial state for order form data
const initialOrderFormData: OrderStatementData = {
    company_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    month_value: '',
    week_value: '',
    amount: '',
    status: 'pending',
    notes: '',
    mapping_status: 'pending',
    row_reference: ''
};

// Default state for Excel source data
const defaultExcelSourceDataState: ExcelSourceData = {
    fileName: '',
    fileSize: 0,
    headers: [],
    previewRows: [],
    fullData: []
};

const MergedOrderPage: React.FC = () => {
    // Order form state
    const [orderFormData, setOrderFormData] = useState<OrderStatementData>(initialOrderFormData);
    const [companies, setCompanies] = useState<Company[]>([]);
    
    // File upload and Excel data state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [excelSourceData, setExcelSourceData] = useState<ExcelSourceData | null>(defaultExcelSourceDataState);
    const [excelColumnOptionsForAmount, setExcelColumnOptionsForAmount] = useState<ExcelColumnOption[]>([]);
    const [selectedAmountColumn, setSelectedAmountColumn] = useState<ExcelColumnOption | null>(null);
    const [isAmountFromExcel, setIsAmountFromExcel] = useState(false);
    
    // Field mapping state
    const [fieldMappings, setFieldMappings] = useState<FieldMappingConfig[]>([]);
    const [systemFieldsForMapping, setSystemFieldsForMapping] = useState<SystemFieldOption[]>(defaultSystemFields);
    
    // UI state
    const [pageLoading, setPageLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<'order' | 'publish' | 'export' | 'file_process' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    // Load initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true);
            try {
                // Fetch companies
                const comps = await apiService.get('/companies') as Company[];
                setCompanies(comps);
                
                // Fetch system fields (if available from API)
                const sysFieldsFromApi = await apiService.get('/system_fields') as SystemFieldOption[];
                
                // Merge with default fields, keeping the 'none' option at the top
                const noneOption = defaultSystemFields.find(f => f.value === 'none') || { value: 'none', label: '-- Select System Field --', color: '#757575' };
                const uniqueApiFields = sysFieldsFromApi.filter(apiField => apiField.value !== 'none');
                
                setSystemFieldsForMapping([
                    noneOption,
                    ...uniqueApiFields
                ]);
            } catch (err) {
                console.error('Failed to load initial data', err);
                setError('Failed to load initial data. Please refresh the page.');
            } finally {
                setPageLoading(false);
            }
        };
        
        fetchInitialData();
    }, []);
    
    // Fetch companies function
    const fetchCompanies = async () => {
        try {
            const data = await apiService.get('/companies');
            if (!Array.isArray(data)) throw new Error('Malformed companies response');
            const transformedData = data.map((company: any) => ({
                id: company.id,
                name: company.company_name
            }));
            setCompanies(transformedData);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        }
    };

    // useEffect to fetch companies
    useEffect(() => {
        fetchCompanies();
    }, []);
    
    // Handle order form input changes
    const handleOrderInputChange = (field: keyof OrderStatementData, value: string) => {
        setOrderFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Reset amount from Excel if manually editing amount
        if (field === 'amount' && isAmountFromExcel) {
            setIsAmountFromExcel(false);
            setSelectedAmountColumn(null);
        }
    };
    
    // Handle file upload
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid Excel file (.xlsx, .xls)');
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }
        
        setSelectedFile(file);
        setActionLoading('file_process');
        setError(null);
        
        try {
            // Process the file
            const response = await orderStatementService.uploadAndParseFile(file);
            
            // Set Excel source data
            setExcelSourceData({
                uploadId: response.uploadId,
                fileName: response.fileName,
                fileSize: response.fileSize,
                headers: response.headers,
                previewRows: response.previewRows,
                fullData: response.fullData
            });
            
            // Create column options for amount selection
            const colOptsForAmount: ExcelColumnOption[] = response.headers.map((header: string) => {
                const sampleValue = response.previewRows[0]?.[response.headers.indexOf(header)];
                return {
                    label: header,
                    value: header,
                    sampleData: sampleValue !== undefined ? String(sampleValue).substring(0, 20) : 'No data'
                };
            });
            setExcelColumnOptionsForAmount(colOptsForAmount);
            
            // Create initial field mappings
            const initialMappings: FieldMappingConfig[] = response.headers.map((header: string) => ({
                companyColumn: header,
                systemField: 'none',
                isSelected: false,
                sampleData: response.previewRows[0]?.[response.headers.indexOf(header)]
            }));
            setFieldMappings(initialMappings);
            
            setSuccess('File processed successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to process file');
            setExcelSourceData(defaultExcelSourceDataState);
            setExcelColumnOptionsForAmount([]);
            setSelectedAmountColumn(null);
            setFieldMappings([]);
        } finally {
            setActionLoading(null);
        }
    };
    
    // Handle amount column selection
    const handleAmountColumnSelect = (column: ExcelColumnOption | null) => {
        setSelectedAmountColumn(column);
        if (column && excelSourceData) {
            const headerIndex = excelSourceData.headers.indexOf(column.value);
            
            // Find the first row with a valid numeric value in this column
            for (const row of excelSourceData.fullData) {
                if (headerIndex >= 0 && row.length > headerIndex) {
                    const cellValue = row[headerIndex];
                    
                    if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                        try {
                            const potentialAmount = parseFloat(String(cellValue).replace(/[^0-9.-]+/g,"")); // Attempt to clean and parse
                            if (!isNaN(potentialAmount)) {
                                setOrderFormData(prev => ({
                                    ...prev,
                                    amount: potentialAmount.toString(),
                                    row_reference: column.value
                                }));
                                setIsAmountFromExcel(true);
                                setError(null);
                                return;
                            }
                        } catch (e) {
                            // Continue to next row if parsing fails
                        }
                    }
                }
            }
            
            // If we get here, no valid amount was found
            setError('No valid numeric data found in selected column');
            setOrderFormData(prev => ({
                ...prev,
                amount: '',
                row_reference: ''
            }));
            setIsAmountFromExcel(false);
        } else {
            // Reset if no column selected
            setOrderFormData(prev => ({
                ...prev,
                amount: '',
                row_reference: ''
            }));
            setIsAmountFromExcel(false);
        }
    };
    
    // Validate order form
    const validateOrderForm = () => {
        if (!orderFormData.company_id) {
            setError('Please select a company');
            return false;
        }
        if (!orderFormData.month_value && !orderFormData.week_value) {
            setError('Please select at least one period (month or week)');
            return false;
        }
        if (!orderFormData.amount || parseFloat(orderFormData.amount) <= 0) {
            setError('Please enter a valid amount');
            return false;
        }
        if (!selectedFile) {
            setError('Please select an Excel file to upload');
            return false;
        }
        
        setError(null);
        return true;
    };
    
    // Save order details
    const handleSaveOrderDetails = async () => {
        if (!validateOrderForm()) {
            return;
        }
        
        setActionLoading('order');
        try {
            // Prepare order data
            const amountNum = parseFloat(orderFormData.amount);
            const orderPayload = {
                company_id: orderFormData.company_id,
                year: orderFormData.month_value,
                week_number: orderFormData.week_value,
                total_amount: amountNum,
                commission_amount: amountNum * 0.05,
                net_amount: amountNum + (amountNum * 0.05),
                mapping_status: orderFormData.mapping_status,
                published_at: new Date().toISOString(),
                status: 'pending',
                remarks: orderFormData.notes,
                published_by: 1,
                payment_date: orderFormData.payment_date,
                amount: amountNum,
                file_path: selectedFile ? selectedFile.name : ''
            };
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            Object.entries(orderPayload).forEach(([key, value]) => {
                formDataToSend.append(key, value.toString());
            });
            
            if (selectedFile) {
                formDataToSend.append('file_path', 'venkatesh'); // Send file name instead of binary
            }
            
            // Save order
            const response = await apiService.post('/company_payments', formDataToSend);
            
            setSuccess('Order details saved successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save order details');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Handle column selection for mapping
    const handleColumnSelectionForMapping = (columnName: string, checked: boolean) => {
        setFieldMappings(prev => prev.map(mapping => 
            mapping.companyColumn === columnName 
                ? { ...mapping, isSelected: checked } 
                : mapping
        ));
    };
    
    // Handle select all columns for mapping
    const handleSelectAllColumnsForMapping = (selectAll: boolean) => {
        setFieldMappings(prev => prev.map(mapping => ({
            ...mapping,
            isSelected: selectAll
        })));
    };
    
    // Handle mapping configuration change
    const handleMappingConfigChange = (index: number, field: keyof FieldMappingConfig, value: any) => {
        setFieldMappings(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    
    // Save mappings and publish
    const handleSaveMappingsAndPublish = async () => {
        if (!excelSourceData) {
            setError('No file processed. Please upload and process a file first.');
            return;
        }
        
        const activeMappings = fieldMappings.filter(m => m.isSelected);
        if (activeMappings.length === 0) {
            setError('No columns selected for mapping. Please select at least one column.');
            return;
        }
        
        const incompleteMapping = activeMappings.find(m => m.systemField === 'none');
        if (incompleteMapping) {
            setError(`Column "${incompleteMapping.companyColumn}" is selected but not mapped to a system field.`);
            return;
        }
        
        // Check for duplicate system field mappings
        const systemFieldCounts = activeMappings.reduce((acc, m) => {
            acc[m.systemField] = (acc[m.systemField] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const duplicateSystemFields = Object.entries(systemFieldCounts).filter(([key, count]) => count > 1);
        if (duplicateSystemFields.length > 0) {
            const duplicates = duplicateSystemFields.map(([fieldKey]) => systemFieldsForMapping.find(sf => sf.value === fieldKey)?.label || fieldKey).join(', ');
            setError(`Duplicate system field mappings found: ${duplicates}. Each system field should be mapped only once.`);
            return;
        }
        
        setActionLoading('publish');
        try {
            // Prepare payload for mapping and publishing
            const payload = {
                uploadId: excelSourceData.uploadId,
                orderId: orderFormData.id, // If we have an order ID from previous save
                mappings: activeMappings.map(m => ({
                    companyColumn: m.companyColumn,
                    systemField: m.systemField
                }))
            };
            
            // Save mappings and publish
            const response = await apiService.post('/map_and_publish_statement', payload);
            
            setSuccess('Mappings saved and data published successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save mappings and publish data');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Export mapped data preview
    const handleExportMappedDataPreview = async () => {
        if (!excelSourceData) {
            setError('No file processed or data available to export preview from.');
            return;
        }
        
        const activeMappings = fieldMappings.filter(m => m.isSelected && m.systemField !== 'none');
        if (activeMappings.length === 0) {
            setError('No columns selected and mapped to a system field. Configure mappings to export a preview.');
            return;
        }
        
        setActionLoading('export');
        try {
            // Export mapped data preview
            const blob = await orderStatementService.exportMappedDataPreview(
                excelSourceData.headers, 
                excelSourceData.fullData, 
                activeMappings
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mapped_data_preview_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setSuccess('Mapped data preview exported successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to export data preview.');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Render order details section
    const renderOrderDetailsSection = () => (
        <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Order Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="company-select-label">Company</InputLabel>
                        <Select
                            labelId="company-select-label"
                            value={orderFormData.company_id}
                            label="Company"
                            onChange={(e) => handleOrderInputChange('company_id', e.target.value)}
                        >
                            {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Payment Date"
                        type="date"
                        value={orderFormData.payment_date}
                        onChange={(e) => handleOrderInputChange('payment_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="month-select-label">Month</InputLabel>
                        <Select
                            labelId="month-select-label"
                            value={orderFormData.month_value}
                            label="Month"
                            onChange={(e) => handleOrderInputChange('month_value', e.target.value)}
                        >
                            {MONTHS.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="week-select-label">Week</InputLabel>
                        <Select
                            labelId="week-select-label"
                            value={orderFormData.week_value}
                            label="Week"
                            onChange={(e) => handleOrderInputChange('week_value', e.target.value)}
                        >
                            {WEEKS.map((week) => (
                                <MenuItem key={week.value} value={week.value}>
                                    {week.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={orderFormData.amount}
                        onChange={(e) => handleOrderInputChange('amount', e.target.value)}
                        disabled={isAmountFromExcel}
                        InputProps={{
                            startAdornment: isAmountFromExcel ? (
                                <Chip 
                                    label="From Excel" 
                                    color="primary" 
                                    size="small" 
                                    onDelete={() => {
                                        setIsAmountFromExcel(false);
                                        setSelectedAmountColumn(null);
                                    }}
                                    sx={{ mr: 1 }}
                                />
                            ) : null
                        }}
                    />
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Notes"
                        multiline
                        rows={2}
                        value={orderFormData.notes}
                        onChange={(e) => handleOrderInputChange('notes', e.target.value)}
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSaveOrderDetails}
                    disabled={actionLoading === 'order'}
                    startIcon={actionLoading === 'order' ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                    Save Order Details
                </Button>
            </Box>
        </Card>
    );
    
    // Render file upload and preview section
    const renderFileUploadAndPreviewSection = () => (
        <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                File Upload & Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={actionLoading === 'file_process'}
                >
                    {actionLoading === 'file_process' ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Processing...
                        </>
                    ) : (
                        'Upload Excel File'
                    )}
                </Button>
                
                {selectedFile && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </Typography>
                    </Box>
                )}
            </Box>
            
            {excelSourceData && excelSourceData.headers.length > 0 && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Select Amount Column
                        </Typography>
                        <Autocomplete
                            options={excelColumnOptionsForAmount}
                            value={selectedAmountColumn}
                            onChange={(_, newValue) => handleAmountColumnSelect(newValue)}
                            getOptionLabel={(option) => `${option.label} ${option.sampleData ? `(Sample: ${option.sampleData})` : ''}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select column containing amount"
                                    fullWidth
                                />
                            )}
                        />
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                        Data Preview
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {excelSourceData.headers.map((header, index) => (
                                        <TableCell key={index}>
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {excelSourceData.previewRows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {excelSourceData.headers.map((_, cellIndex) => (
                                            <TableCell key={cellIndex}>
                                                {row[cellIndex] !== undefined ? String(row[cellIndex]) : ''}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Card>
    );
    
    // Render field mapping section
    const renderFieldMappingSection = () => {
        if (!excelSourceData || excelSourceData.headers.length === 0) {
            return (
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Field Mapping Configuration
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Upload and process an Excel file to configure field mappings.
                    </Typography>
                </Card>
            );
        }
        
        const selectedForMappingCount = fieldMappings.filter(m => m.isSelected).length;
        const allSelectedHaveSystemField = !fieldMappings.some(m => m.isSelected && m.systemField === 'none');
        
        return (
            <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Field Mapping Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={fieldMappings.length > 0 && fieldMappings.every(m => m.isSelected)}
                                indeterminate={selectedForMappingCount > 0 && selectedForMappingCount < fieldMappings.length}
                                onChange={(e) => handleSelectAllColumnsForMapping(e.target.checked)}
                            />
                        }
                        label={`Select All Columns (${selectedForMappingCount}/${fieldMappings.length})`}
                    />
                </Box>
                
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" width="5%">Select</TableCell>
                                <TableCell width="30%">Excel Column</TableCell>
                                <TableCell width="15%">Sample Data</TableCell>
                                <TableCell width="50%">Map to System Field</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fieldMappings.map((mapping, index) => (
                                <TableRow key={index}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={mapping.isSelected}
                                            onChange={(e) => handleColumnSelectionForMapping(mapping.companyColumn, e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>{mapping.companyColumn}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {mapping.sampleData !== undefined ? String(mapping.sampleData).substring(0, 20) : 'No data'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth size="small" disabled={!mapping.isSelected}>
                                            <Select
                                                value={mapping.systemField}
                                                onChange={(e) => handleMappingConfigChange(index, 'systemField', e.target.value)}
                                                displayEmpty
                                            >
                                                {systemFieldsForMapping.map((field) => {
                                                    const selectedValue = field.value;
                                                    const isAlreadySelected = fieldMappings.some(
                                                        (m, i) => i !== index && m.isSelected && m.systemField === selectedValue && selectedValue !== 'none'
                                                    );
                                                    
                                                    return (
                                                        <MenuItem 
                                                            key={field.value} 
                                                            value={field.value}
                                                            disabled={isAlreadySelected}
                                                            sx={{ 
                                                                color: field.color,
                                                                fontWeight: field.value === 'none' ? 'normal' : 'bold'
                                                            }}
                                                        >
                                                            {field.label}
                                                            {isAlreadySelected && " (already mapped)"}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<PreviewIcon />}
                        onClick={handleExportMappedDataPreview}
                        disabled={actionLoading !== null || !allSelectedHaveSystemField || selectedForMappingCount === 0}
                        title={!allSelectedHaveSystemField ? "Assign system fields to all selected columns to enable export" : "Export a CSV preview of mapped data"}
                    >
                        Export Preview
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={actionLoading === 'publish' ? <CircularProgress size={20} /> : <PublishIcon />}
                        onClick={handleSaveMappingsAndPublish}
                        disabled={actionLoading !== null || !allSelectedHaveSystemField || selectedForMappingCount === 0}
                    >
                        Save Mappings & Publish
                    </Button>
                </Box>
                
                {selectedForMappingCount > 0 && !allSelectedHaveSystemField && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        One or more selected Excel columns do not have a System Field assigned. Please assign one to enable Publish or Export Preview.
                    </Alert>
                )}
            </Card>
        );
    };
    
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Order Statement Processing
            </Typography>
            
            {pageLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}
                    
                    {renderOrderDetailsSection()}
                    {renderFileUploadAndPreviewSection()}
                    {renderFieldMappingSection()}
                </>
            )}
        </Container>
    );
};

export default MergedOrderPage;