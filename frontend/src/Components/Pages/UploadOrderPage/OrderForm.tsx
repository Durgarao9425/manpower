import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Paper,
    Autocomplete
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    AttachFile as AttachFileIcon,
    TableChart as TableChartIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import apiService from '../../../services/apiService';

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

export interface Company {
    id: string;
    name: string;
}

interface OrderFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order?: OrderStatement | null;
    companies: Company[];
    isEditing: boolean;
}

interface ExcelData {
    [key: string]: any;
}

interface ColumnOption {
    label: string;
    value: string;
    sampleData?: string;
}

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


const OrderFormModal: React.FC<OrderFormModalProps> = ({
    open,
    onClose,
    onSuccess,
    order,
    companies,
    isEditing
}) => {
    const [formData, setFormData] = useState({
        company_id: '',
        payment_date: '',
        month_value: '',
        week_value: '',
        amount: '',
        status: 'pending' as const,
        notes: '',
        mapping_status: 'pending',
        row_reference: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<ExcelData[]>([]);
    const [columnOptions, setColumnOptions] = useState<ColumnOption[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<ColumnOption | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAmountFromExcel, setIsAmountFromExcel] = useState(false);
    const [mappingStatusModalOpen, setMappingStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderStatement | null>(null);

    useEffect(() => {
        if (open) {
            if (isEditing && order) {
                setFormData({
                    company_id: order.company_id,
                    payment_date: order.payment_date,
                    year: order.month_value || '',
                    week_number: order.week_value || '',
                    total_amount: order.amount.toString(),
                    status: order.status,
                    notes: order.notes,
                    mapping_status: order.mapping_status,
                    row_reference: order.row_reference || ''
                });
            } else {
                // Reset form for new order
                setFormData({
                    company_id: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    month_value: '',
                    week_value: '',
                    amount: '',
                    status: 'pending',
                    notes: '',
                    mapping_status: 'pending',
                    row_reference: ''
                });
            }
            setSelectedFile(null);
            setExcelData([]);
            setColumnOptions([]);
            setSelectedColumn(null);
            setError('');
            setIsAmountFromExcel(false);
        }
    }, [open, isEditing, order]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleColumnSelect = (column: ColumnOption | null) => {
        setSelectedColumn(column);
        if (column && excelData.length > 0) {
            // Find the first row with a valid numeric value in this column
            const foundRow = excelData.find(row => {
                const value = row[column.value];
                return value !== undefined && value !== null && value !== '';
            });

            if (foundRow && foundRow[column.value] !== undefined) {
                const amount = parseFloat(foundRow[column.value].toString());
                if (!isNaN(amount)) {
                    setFormData(prev => ({
                        ...prev,
                        amount: amount.toString(),
                        row_reference: column.value
                    }));
                    setIsAmountFromExcel(true);
                    setError('');
                    return;
                }
            }
            setError('No valid numeric data found in selected column');
            setIsAmountFromExcel(false);
        } else {
            setFormData(prev => ({
                ...prev,
                amount: '',
                row_reference: ''
            }));
            setIsAmountFromExcel(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
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
            processExcelFile(file);
            setError('');
        }
    };

    const processExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    const headers = jsonData[0] as string[];
                    const rows = jsonData.slice(1).map((row: any[]) => {
                        const obj: ExcelData = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    // Create column options with sample data
                    const options: ColumnOption[] = headers.map(header => {
                        const sampleValue = rows.find(row => row[header] !== undefined && row[header] !== null && row[header] !== '')
                            ?.[header];
                        return {
                            label: header,
                            value: header,
                            sampleData: sampleValue ? sampleValue.toString().substring(0, 20) + (sampleValue.toString().length > 20 ? '...' : '') : 'No data'
                        };
                    });

                    setExcelData(rows);
                    setColumnOptions(options);
                }
            } catch (err) {
                setError('Failed to process Excel file. Please check the file format.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const validateForm = () => {
        if (!formData.company_id) {
            setError('Please select a company');
            return false;
        }
        if (!formData.month_value && !formData.week_value) {
            setError('Please select at least one period (month or week)');
            return false;
        }
        if (!formData.amount || parseFloat(formData.amount) < 0) {
            setError('Please enter a valid amount');
            return false;
        }
        if (!isEditing && !selectedFile) {
            setError('Please select an Excel file to upload');
            return false;
        }

        setError('');
        return true;
    };

    // Example: Fetch data on mount (if needed)
    // const [data, setData] = useState<any>(null);
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const result = await apiService.get('localhost:4003/company_payments');
    //             setData(result);
    //             console.log(result, "data----------------------------------------");
    //         } catch (err) {
    //             console.error("Failed to fetch data", err);
    //         }
    //     };
    //     fetchData();
    // }, []);

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                company_id: formData.company_id,
                year: formData.month_value,
                week_number: formData.week_value,
                total_amount: parseFloat(formData.amount),
                commission_amount: parseFloat(formData.amount) * 0.05,
                net_amount: parseFloat(formData.amount) + parseFloat(formData.amount) * 0.05,
                mapping_status: formData.status,
                published_at: new Date().toISOString(),
                status:'pending',
                remarks: formData.notes,
                published_by:1,
                payment_date: new Date().toISOString(),
                amount: parseFloat(formData.amount),
            };

            if (isEditing && order) {
                await apiService.put(`localhost:4003/api/company_payments/${order.id}`, submitData);
            } else {
                // Create FormData for file upload
                const formDataToSend = new FormData();
                Object.entries(submitData).forEach(([key, value]) => {
                    formDataToSend.append(key, value.toString());
                });
                if (selectedFile) {
                    formDataToSend.append('file_path', selectedFile.name); // Send file name instead of binary
                }
    await apiService.post('/company_payments', formDataToSend);
            
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Create a new modal for editing mapping status
    const MappingStatusModal: React.FC<{ open: boolean; onClose: () => void; order: OrderStatement | null; }> = ({ open, onClose, order }) => {
        const [mappingStatus, setMappingStatus] = useState(order?.mapping_status || '');

        const handleSave = () => {
            // Logic to save mapping status
            console.log('Mapping status updated:', mappingStatus);
            onClose();
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Mapping Status</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Mapping Status"
                        value={mappingStatus}
                        onChange={(e) => setMappingStatus(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        );
    };

    // Add logic to open the new modal
    const openMappingStatusModal = (order: OrderStatement) => {
        setSelectedOrder(order);
        setMappingStatusModalOpen(true);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '500px',
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
            }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {isEditing ? 'Edit Order Statement' : 'Add New Order Statement'}
                </Typography>
                <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, px: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Company Selection */}
                    <Grid item xs={12} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Company"
                            value={formData.company_id}
                            onChange={(e) => handleInputChange('company_id', e.target.value)}
                            required
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                        >
                            {companies.map((comp) => (
                                <MenuItem key={comp.id} value={comp.id}>
                                    {comp.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Month Selection */}
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={formData.month_value}
                                label="Month"
                                onChange={(e) => handleInputChange('month_value', e.target.value)}
                                disabled={loading}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {MONTHS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Week Selection */}
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Week</InputLabel>
                            <Select
                                value={formData.week_value}
                                label="Week"
                                onChange={(e) => handleInputChange('week_value', e.target.value)}
                                disabled={loading}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {WEEKS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* File Upload */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                border: '2px dashed #e0e0e0',
                                borderRadius: 3,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: '#fafafa',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: '#f5f7ff'
                                }
                            }}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-upload"
                                disabled={loading}
                            />
                            <label htmlFor="file-upload">
                                <Box sx={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
                                        {selectedFile ? selectedFile.name : 'Upload Excel File'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Supports Excel files (.xlsx, .xls) up to 10MB
                                    </Typography>
                                    {selectedFile && (
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <AttachFileIcon color="success" />
                                            <Typography variant="body2" color="success.main">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </label>
                        </Paper>

                        {columnOptions.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TableChartIcon fontSize="small" />
                                    Available Columns:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {columnOptions.slice(0, 8).map((col, index) => (
                                        <Chip
                                            key={index}
                                            label={col.label}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    ))}
                                    {columnOptions.length > 8 && (
                                        <Chip
                                            label={`+${columnOptions.length - 8} more`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Grid>

                    {/* Column Selection with Search */}
                    {columnOptions.length > 0 && (
                        <Grid item xs={12}>
                            <Autocomplete
                                options={columnOptions}
                                value={selectedColumn}
                                onChange={(event, newValue) => handleColumnSelect(newValue)}
                                getOptionLabel={(option) => option.label}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {option.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Sample: {option.sampleData}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Column for Amount"
                                        placeholder="Search columns..."
                                        helperText="Select a column to automatically fill the amount field"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: isAmountFromExcel ? '#f0f8f0' : 'transparent'
                                            }
                                        }}
                                    />
                                )}
                                disabled={loading}
                                fullWidth
                            />
                        </Grid>
                    )}

                    {/* Amount */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => {
                                handleInputChange('amount', e.target.value);
                                if (e.target.value !== formData.amount) {
                                    setIsAmountFromExcel(false);
                                }
                            }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, fontWeight: 'bold' }}>₹</Typography>
                            }}
                            disabled={loading}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: isAmountFromExcel ? '#f0f8f0' : 'transparent'
                                }
                            }}
                            helperText={isAmountFromExcel ? "Amount fetched from Excel column" : "Enter amount manually or select column above"}
                        />
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Add any additional notes..."
                            disabled={loading}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2, bgcolor: '#fafafa', borderRadius: '0 0 12px 12px' }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#ddd',
                        color: '#666'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        minWidth: 120,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                    }}
                >
                    {loading ? 'Saving...' : (isEditing ? 'Update Order' : 'Create Order')}
                </Button>
            </DialogActions>

            {/* Render the new modal */}
            <MappingStatusModal
                open={mappingStatusModalOpen}
                onClose={() => setMappingStatusModalOpen(false)}
                order={selectedOrder}
            />
        </Dialog>
    );
};

export default OrderFormModal;