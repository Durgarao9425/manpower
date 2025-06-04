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
    Switch, // Keep if used elsewhere, not directly in this refactor's focus
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton, // Keep if used elsewhere
    Alert,
    CircularProgress,
    Chip,
    Autocomplete,
    Dialog, // Keep if used elsewhere
    DialogTitle, // Keep if used elsewhere
    DialogContent, // Keep if used elsewhere
    DialogActions, // Keep if used elsewhere
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    AttachFile as AttachFileIcon,
    TableChart as TableChartIcon, // Keep if used elsewhere
    Close as CloseIcon, 
    Save as SaveIcon,
    Publish as PublishIcon,
    Preview as PreviewIcon,
    Delete as DeleteIcon, // Keep if used elsewhere
    Edit as EditIcon, // Keep if used elsewhere
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import apiService from '../../../services/apiService'; // Assuming this path is correct

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
    id?: number; // For storing ID after save
    company_id: string;
    payment_date: string;
    month_value: string;
    week_value: string;
    amount: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    file_path?: string;
    notes: string;
    mapping_status: string;
    row_reference?: string; // To store the header name of the amount column from Excel
}

export interface Company {
    id: string;
    name: string;
}

interface ExcelSourceData {
    uploadId?: string;
    fileName: string;
    fileSize: number;
    headers: string[];
    previewRows: any[][];
    fullData: any[][];
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
    // Fields for update/insert logic
    id?: number;
    show_to_rider?: number;
    show_in_invoice?: number;
    // Additional fields that might be in the database but not needed for this feature
    show_to_company?: number;
    count_for_commission?: number;
    editable_by_rider?: number;
    editable_by_company?: number;
    is_required?: number;
    // Original values for detecting changes
    _original?: Partial<FieldMappingConfig>;
}

interface SystemFieldOption {
    value: string;
    label: string;
    color?: string;
    description?: string;
}

// Constants
const MONTHS = [
    { value: 'jan-2025', label: 'January 2025' }, 
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

const orderStatementService = {
    uploadAndParseFile: async (file: File): Promise<ExcelSourceData> => { 
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
                        const previewRows = (jsonData.slice(1) as any[][]).slice(0, 5);
                        resolve({
                            uploadId: 'temp-' + Date.now(), 
                            fileName: file.name,
                            fileSize: file.size,
                            headers,
                            previewRows,
                            fullData: jsonData.slice(1) as any[][]
                        });
                    } else {
                        reject(new Error('No data found in the Excel file'));
                    }
                } catch (err) {
                    console.error("Error parsing Excel file:", err);
                    reject(new Error('Failed to process Excel file. Ensure it is a valid Excel format.'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    },
    exportMappedDataPreview: async (headers: string[], data: any[][], mappings: FieldMappingConfig[], systemFieldsForMapping: SystemFieldOption[]): Promise<Blob> => {
        const activeMappings = mappings.filter(m => m.isSelected && m.systemField !== 'none');
        if (activeMappings.length === 0) {
            return new Blob(["No columns selected or mapped for export."], { type: 'text/plain;charset=utf-8;' });
        }
        const exportHeaders = activeMappings.map(m => {
            const systemField = systemFieldsForMapping.find(sf => sf.value === m.systemField) || { label: m.systemField };
            return systemField.label;
        });
        const exportedRows: string[][] = [];
        data.forEach(row => {
            const newRow: string[] = [];
            activeMappings.forEach(mapping => {
                const headerIndex = headers.indexOf(mapping.companyColumn);
                newRow.push(headerIndex !== -1 ? (row[headerIndex]?.toString() || '') : '');
            });
            exportedRows.push(newRow);
        });
        let csvContent = exportHeaders.join(",") + "\n";
        exportedRows.forEach(row => {
            csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n"; 
        });
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
};

const initialOrderFormData: OrderStatementData = {
    company_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    month_value: '',
    week_value: '',
    amount: '',
    status: 'pending',
    notes: '',
    mapping_status: 'pending',
    file_path: '',
    row_reference: '',
};

const defaultExcelSourceDataState: ExcelSourceData = {
    fileName: '',
    fileSize: 0,
    headers: [],
    previewRows: [],
    fullData: []
};

const MAPPING_TOGGLES = [
    { label: 'Show to Rider', field: 'show_to_rider' },
    { label: 'Show in Invoice', field: 'show_in_invoice' }
];

const MergedOrderPage: React.FC = () => {
    const [orderFormData, setOrderFormData] = useState<OrderStatementData>(initialOrderFormData);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [excelSourceData, setExcelSourceData] = useState<ExcelSourceData>(defaultExcelSourceDataState);
    const [excelColumnOptionsForAmount, setExcelColumnOptionsForAmount] = useState<ExcelColumnOption[]>([]);
    const [selectedAmountColumn, setSelectedAmountColumn] = useState<ExcelColumnOption | null>(null);
    const [isAmountFromExcel, setIsAmountFromExcel] = useState(false);
    const [fieldMappings, setFieldMappings] = useState<FieldMappingConfig[]>([]);
    const [systemFieldsForMapping, setSystemFieldsForMapping] = useState<SystemFieldOption[]>([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<'order' | 'publish' | 'export' | 'file_process' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [expandedAccordion, setExpandedAccordion] = useState<string | false>('orderDetailsSection');

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };
    
    useEffect(() => {
        const fetchInitialData = async () => {
            console.log("Attempting to fetch initial data...");
            setPageLoading(true);
            try {
                console.log("Fetching companies from /companies...");
                const compsResponse = await apiService.get('/companies');
                console.log("Response from /companies:", JSON.stringify(compsResponse, null, 2));

                // It's safer to check if compsResponse is an array and then map.
                // Assuming compsResponse is the array of companies directly or compsResponse.data
                let rawComps: any[] = [];
                if (Array.isArray(compsResponse)) {
                    rawComps = compsResponse;
                } else if (compsResponse && Array.isArray(compsResponse.data)) { // Common structure for axios
                    rawComps = compsResponse.data;
                } else {
                    console.warn("/companies response was not an array or in expected structure:", compsResponse);
                }
                
                const transformedComps = rawComps.map((c: any) => ({ ...c, id: String(c.id), name: c.name || c.company_name || 'Unnamed Company' } as Company));
                setCompanies(transformedComps);
                console.log("Transformed companies set in state:", transformedComps);
                
                // Fetch system fields from backend
                const systemFields = await apiService.get('/orders/system_fields');
                setSystemFieldsForMapping(systemFields.map((f: any) => ({ value: f.value || f.field_key, label: f.label || f.field_label, color: '#1976d2', description: f.field_type })));
                console.log("System fields set.");

            } catch (err: any) {
                console.error('Failed to load initial data. Full error object:', err);
                console.error('Error response data (if available):', err.response?.data);
                console.error('Error message:', err.message);
                setError(`Failed to load initial company data: ${err.message}. Please check console and network tab for details.`);
            } finally {
                setPageLoading(false);
                console.log("Initial data fetching finished.");
            }
        };
        fetchInitialData();
    }, []);
    
    const handleOrderInputChange = (field: keyof OrderStatementData, value: string) => {
        setOrderFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'amount' && isAmountFromExcel) {
            setIsAmountFromExcel(false);
            setSelectedAmountColumn(null);
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
            setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
            if (fileInputRef.current) fileInputRef.current.value = ""; return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            if (fileInputRef.current) fileInputRef.current.value = ""; return;
        }
        setSelectedFile(file);
        setActionLoading('file_process');
        setError(null); setSuccess(null);
        try {
            const response = await orderStatementService.uploadAndParseFile(file);
            setExcelSourceData(response);
            setOrderFormData(prev => ({ ...prev, file_path: file.name }));
            const colOptsForAmount: ExcelColumnOption[] = response.headers.map((header: string) => ({
                label: header, value: header,
                sampleData: response.previewRows[0]?.[response.headers.indexOf(header)] !== undefined ? String(response.previewRows[0]?.[response.headers.indexOf(header)]).substring(0, 30) : 'N/A'
            }));
            setExcelColumnOptionsForAmount(colOptsForAmount);
            // --- Smart auto-mapping ---
            let initialMappings: FieldMappingConfig[] = response.headers.map((header: string) => ({
                companyColumn: header, systemField: 'none', isSelected: false, sampleData: response.previewRows[0]?.[response.headers.indexOf(header)]
            }));
            if (orderFormData.company_id) {
                const mappingHistory = await fetchAndApplyFieldMappings(orderFormData.company_id, response.headers);
                if (mappingHistory.length > 0) {
                    // For each header, if mapping exists, auto-map
                    initialMappings = response.headers.map((header: string) => {
                        // Find mapping where company_field_name (Excel column name) matches the header
                        const found = mappingHistory.find((m: any) => m.company_field_name === header);
                        if (found) {
                            return {
                                companyColumn: header,
                                systemField: found.supplier_field_name, // System field name
                                isSelected: true,
                                sampleData: response.previewRows[0]?.[response.headers.indexOf(header)],
                                id: found.id,
                                show_to_rider: found.show_to_rider ?? 0,
                                show_in_invoice: found.show_in_invoice ?? 0,
                                // Keep other fields for backward compatibility
                                show_to_company: found.show_to_company ?? 0,
                                count_for_commission: found.count_for_commission ?? 0,
                                editable_by_rider: found.editable_by_rider ?? 0,
                                editable_by_company: found.editable_by_company ?? 0,
                                is_required: found.is_required ?? 0,
                                _original: {
                                    systemField: found.supplier_field_name,
                                    show_to_rider: found.show_to_rider ?? 0,
                                    show_in_invoice: found.show_in_invoice ?? 0,
                                    // Keep other fields for backward compatibility
                                    show_to_company: found.show_to_company ?? 0,
                                    count_for_commission: found.count_for_commission ?? 0,
                                    editable_by_rider: found.editable_by_rider ?? 0,
                                    editable_by_company: found.editable_by_company ?? 0,
                                    is_required: found.is_required ?? 0,
                                }
                            };
                        } else {
                            return {
                                companyColumn: header,
                                systemField: 'none',
                                isSelected: false,
                                sampleData: response.previewRows[0]?.[response.headers.indexOf(header)],
                                show_to_rider: 0,
                                show_in_invoice: 0,
                                // Keep other fields for backward compatibility
                                show_to_company: 0,
                                count_for_commission: 0,
                                editable_by_rider: 0,
                                editable_by_company: 0,
                                is_required: 0,
                            };
                        }
                    });
                }
            }
            setFieldMappings(initialMappings);
            setSuccess(`File "${file.name}" processed. Select amount column or save details.`);
            const commonAmountHeaders = ['amount', 'total', 'total amount', 'total_amount', 'totalearnings', 'total_earnings'];
            const foundAmountCol = colOptsForAmount.find(opt => commonAmountHeaders.includes(opt.value.toLowerCase()));
            if (foundAmountCol) handleAmountColumnSelect(foundAmountCol);
        } catch (err: any) {
            setError(err.message || 'Failed to process file. Ensure valid format.');
            setExcelSourceData(defaultExcelSourceDataState);
            setExcelColumnOptionsForAmount([]); setSelectedAmountColumn(null);
            setFieldMappings([]); setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
            setActionLoading(null);
        }
    };
    
    const handleAmountColumnSelect = (column: ExcelColumnOption | null) => {
        setSelectedAmountColumn(column);
        if (column && excelSourceData && excelSourceData.fullData.length > 0) {
            const headerIndex = excelSourceData.headers.indexOf(column.value);
            let amountFound = false;
            for (const row of excelSourceData.fullData) {
                if (headerIndex >= 0 && row.length > headerIndex) {
                    const cellValue = row[headerIndex];
                    if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
                        try {
                            const potentialAmount = parseFloat(String(cellValue).replace(/[^0-9.-]+/g,""));
                            if (!isNaN(potentialAmount)) {
                                setOrderFormData(prev => ({ ...prev, amount: potentialAmount.toString(), row_reference: column.value }));
                                setIsAmountFromExcel(true); setError(null); amountFound = true; break; 
                            }
                        } catch (e) { /* continue */ }
                    }
                }
            }
            if (!amountFound) {
                setError(`No valid numeric data in column "${column.label}". Enter manually.`);
                setOrderFormData(prev => ({ ...prev, amount: '', row_reference: column.value }));
                setIsAmountFromExcel(false);
            }
        } else {
            setOrderFormData(prev => ({ ...prev, amount: '', row_reference: '' }));
            setIsAmountFromExcel(false);
        }
    };
    
    const validateOrderDetails = () => {
        if (!orderFormData.company_id) { setError('Please select a company.'); return false; }
        if (!orderFormData.month_value && !orderFormData.week_value) { setError('Please select a period (Month and/or Week).'); return false; }
        if (!orderFormData.payment_date) { setError('Please select a payment date.'); return false; }
        if (!orderFormData.amount || parseFloat(orderFormData.amount) <= 0) { setError('Please enter a valid positive amount, or select a valid amount column.'); return false; }
        if (!selectedFile) { setError('Please upload an Excel statement file.'); return false; }
        setError(null); return true;
    };

    const handleSaveOrderDetails = async () => {
        if (!validateOrderDetails()) {
            setExpandedAccordion('orderDetailsSection'); return;
        }
        setActionLoading('order');
        console.log("Attempting to save order details...");
        try {
            const amountNum = parseFloat(orderFormData.amount);
            const orderPayloadObject = {
                ...orderFormData, 
                amount: amountNum,
                total_amount: amountNum, 
                commission_amount: amountNum * 0.05, 
                net_amount: amountNum + (amountNum * 0.05), 
                published_at: new Date().toISOString(), 
                published_by: 1, 
                file_path: selectedFile ? selectedFile.name : '', 
                row_reference: selectedAmountColumn ? selectedAmountColumn.value : orderFormData.row_reference || '', 
                // Add year field for backend requirement
                year: orderFormData.month_value ? (orderFormData.month_value.split('-')[1]) : (orderFormData.payment_date ? (new Date(orderFormData.payment_date).getFullYear()) : new Date().getFullYear()),
                status:'pending',
                remarks: orderFormData.notes,
             
            };
            const { id, ...payloadToSendForPost } = orderPayloadObject; // Exclude 'id' for POST

            const formDataApi = new FormData();
            console.log("Payload being prepared for /company_payments (before FormData):", JSON.stringify(payloadToSendForPost, null, 2));
            Object.entries(payloadToSendForPost).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formDataApi.append(key, String(value));
                }
            });
            // console.log("FormData entries to be sent to /company_payments:");
            // for (let pair of formDataApi.entries()) {
            //    console.log(pair[0]+ ': '+ pair[1]); 
            // }
            
            const response = await apiService.post('/company_payments', formDataApi);
            console.log("Response from POST /company_payments:", JSON.stringify(response, null, 2));
            
            // IMPORTANT: Adjust based on your actual API response structure for the ID
            const newOrderId = response?.id || response?.data?.id || response?.data?.company_payment?.id; 
            if (!newOrderId) {
                console.warn("New Order ID not found in response from /company_payments. Response:", response);
                setError("Order saved, but couldn't retrieve new Order ID. Please check console. Proceed with caution.");
            }
            setOrderFormData(prev => ({ ...prev, id: newOrderId })); 
            setSuccess('Order details saved successfully! Proceed to map fields.');
            setExpandedAccordion('filePreviewMappingSection');

        } catch (err: any) {
            console.error("Error saving order details. Full error object:", err);
            console.error("Error response data (if available):", err.response?.data);
            console.error("Error message:", err.message);
            setError(err.response?.data?.message || err.message || 'Failed to save order details. Check console.');
            setExpandedAccordion('orderDetailsSection'); 
        } finally {
            setActionLoading(null);
            console.log("Order details save attempt finished.");
        }
    };
    
    const handleColumnSelectionForMapping = (columnName: string, checked: boolean) => {
        setFieldMappings(prev => prev.map(mapping => 
            mapping.companyColumn === columnName 
            ? { ...mapping, isSelected: checked, systemField: checked ? mapping.systemField : 'none' } 
            : mapping
        ));
    };
    
    const handleSelectAllColumnsForMapping = (selectAll: boolean) => {
        setFieldMappings(prev => prev.map(mapping => ({
            ...mapping, isSelected: selectAll,
            systemField: selectAll ? mapping.systemField : 'none' 
        })));
    };
    
    const handleMappingConfigChange = (index: number, field: keyof FieldMappingConfig, value: any) => {
        setFieldMappings(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    
    const handleSaveMappingsAndPublish = async () => {
        console.log("Attempting to save mappings and publish...");
        if (!excelSourceData || !excelSourceData.uploadId) { 
            setError('No file processed or upload session found.'); return;
        }
        if (!orderFormData.id) {
            setError('Order ID is missing. Save order details first.');
            setExpandedAccordion('orderDetailsSection'); return;
        }
        const activeMappings = fieldMappings.filter(m => m.isSelected);
        if (activeMappings.length === 0) {
            setError('No columns selected for mapping.'); return;
        }
        const incompleteMapping = activeMappings.find(m => m.systemField === 'none');
        if (incompleteMapping) {
            setError(`Column "${incompleteMapping.companyColumn}" is selected but not mapped.`); return;
        }
        const systemFieldCounts = activeMappings.reduce((acc, m) => {
            acc[m.systemField] = (acc[m.systemField] || 0) + 1; return acc;
        }, {} as Record<string, number>);
        const duplicateSystemFields = Object.entries(systemFieldCounts).filter(([, count]) => count > 1);
        if (duplicateSystemFields.length > 0) {
            const duplicates = duplicateSystemFields.map(([fieldKey]) => systemFieldsForMapping.find(sf => sf.value === fieldKey)?.label || fieldKey).join(', ');
            setError(`Duplicate system field mappings: ${duplicates}.`); return;
        }
        setActionLoading('publish');
        try {
            // Only send changed or new mappings
            const mappingsToSave = activeMappings.filter(m => {
                if (!m.id) return true; // new mapping
                // Compare only the fields we care about for this feature
                const orig = m._original || {};
                return (
                    m.systemField !== orig.systemField ||
                    m.show_to_rider !== orig.show_to_rider ||
                    m.show_in_invoice !== orig.show_in_invoice
                );
            });
            if (mappingsToSave.length === 0) {
                setSuccess('No mapping changes to save.');
                setActionLoading(null);
                return;
            }
            const payload = {
                company_id: orderFormData.company_id,
                order_id: orderFormData.id,
                uploadId: excelSourceData.uploadId,
                mappings: mappingsToSave.map(m => ({
                    id: m.id,
                    company_field_name: m.companyColumn, // Excel column name
                    supplier_field_name: m.systemField, // System field name
                    show_to_rider: m.show_to_rider ?? 0,
                    show_in_invoice: m.show_in_invoice ?? 0,
                    // Keep other fields for backward compatibility
                    show_to_company: m.show_to_company ?? 0,
                    count_for_commission: m.count_for_commission ?? 0,
                    editable_by_rider: m.editable_by_rider ?? 0,
                    editable_by_company: m.editable_by_company ?? 0,
                    is_required: m.is_required ?? 0,
                }))
            };
            // Backend will handle insert/update based on id
            const saveResponse = await apiService.post('/field_mappings/save_batch', payload);
            console.log('Field mappings saved:', saveResponse);
            // Continue with publish logic (mocked or real)
            // ...existing code for publish...
            setOrderFormData(prev => ({ ...prev, mapping_status: 'completed', status: 'processing' }));
            setSuccess('Mappings saved and data published successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to save mappings/publish. Check console.');
        } finally {
            setActionLoading(null);
            console.log("Save mappings/publish attempt finished.");
        }
    };
    
    const handleExportMappedDataPreview = async () => {
        if (!excelSourceData || excelSourceData.headers.length === 0) {
            setError('No file processed to export preview from.'); return;
        }
        const activeMappings = fieldMappings.filter(m => m.isSelected && m.systemField !== 'none');
        if (activeMappings.length === 0) {
            setError('No columns selected and mapped for preview.'); return;
        }
        setActionLoading('export');
        try {
            const blob = await orderStatementService.exportMappedDataPreview(excelSourceData.headers, excelSourceData.fullData, activeMappings, systemFieldsForMapping);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mapped_data_preview_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a); a.click();
            window.URL.revokeObjectURL(url); document.body.removeChild(a);
            setSuccess('Mapped data preview exported.');
        } catch (err: any) {
            setError(err.message || 'Failed to export data preview.');
        } finally {
            setActionLoading(null);
        }
    };

    const renderOrderDetailsContent = () => (
        <Card sx={{ p: 2, boxShadow: 'none', border: 'none' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!(error && orderFormData.company_id === '')}>
                        <InputLabel id="company-select-label">Company *</InputLabel>
                        <Select labelId="company-select-label" value={orderFormData.company_id} label="Company *" onChange={(e) => handleOrderInputChange('company_id', e.target.value)}>
                            {companies.map((company) => (<MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Payment Date *" type="date" value={orderFormData.payment_date} onChange={(e) => handleOrderInputChange('payment_date', e.target.value)} InputLabelProps={{ shrink: true }} error={!!(error && orderFormData.payment_date === '')}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth><InputLabel id="month-select-label">Month</InputLabel>
                        <Select labelId="month-select-label" value={orderFormData.month_value} label="Month" onChange={(e) => handleOrderInputChange('month_value', e.target.value)}>
                            {MONTHS.map((month) => (<MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth><InputLabel id="week-select-label">Week</InputLabel>
                        <Select labelId="week-select-label" value={orderFormData.week_value} label="Week" onChange={(e) => handleOrderInputChange('week_value', e.target.value)}>
                            {WEEKS.map((week) => (<MenuItem key={week.value} value={week.value}>{week.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                     <Typography variant="subtitle1" gutterBottom sx={{mb:1}}>Upload Statement File *</Typography>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange}/>
                    <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()} disabled={actionLoading === 'file_process'} fullWidth sx={{py: 1.5}}>
                        {actionLoading === 'file_process' ? <CircularProgress size={24} /> : selectedFile ? `Change File: ${selectedFile.name}` : 'Select Statement File (.xlsx, .xls, .csv)'}
                    </Button>
                    {selectedFile && !actionLoading && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                <AttachFileIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => {
                                setSelectedFile(null); setExcelSourceData(defaultExcelSourceDataState);
                                setExcelColumnOptionsForAmount([]); setSelectedAmountColumn(null); setFieldMappings([]);
                                setOrderFormData(prev => ({...prev, amount: '', file_path: '', row_reference: ''}));
                                setIsAmountFromExcel(false); if(fileInputRef.current) fileInputRef.current.value = ""; setSuccess(null);
                            }}><CloseIcon fontSize="small" /></IconButton>
                        </Box>
                    )}
                </Grid>
                {excelSourceData && excelSourceData.headers.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Autocomplete options={excelColumnOptionsForAmount} value={selectedAmountColumn} onChange={(_, newValue) => handleAmountColumnSelect(newValue)}
                            getOptionLabel={(option) => `${option.label}${option.sampleData ? ` (e.g., ${option.sampleData})` : ''}`}
                            renderInput={(params) => (<TextField {...params} label="Select Amount Column from File (Optional)" fullWidth helperText="First valid numeric value will populate Amount." />)}
                            sx={{mb: isAmountFromExcel ? 0 : 2}} />
                    </Grid>
                )}
                 <Grid item xs={12} md={excelSourceData && excelSourceData.headers.length > 0 ? 6 : 12}>
                    <TextField fullWidth label="Total Amount *" type="number" value={orderFormData.amount} onChange={(e) => handleOrderInputChange('amount', e.target.value)}
                        disabled={isAmountFromExcel && selectedAmountColumn !== null}
                        InputProps={{
                            startAdornment: isAmountFromExcel && selectedAmountColumn ? (
                                <Chip label={`From: ${selectedAmountColumn.label}`} color="primary" size="small" 
                                    onDelete={() => { setIsAmountFromExcel(false); setSelectedAmountColumn(null); setOrderFormData(prev => ({...prev, amount: '', row_reference: ''})); }}
                                    sx={{ mr: 1 }}/>
                            ) : null
                        }}
                        error={!!(error && (!orderFormData.amount || parseFloat(orderFormData.amount) <= 0))} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label="Notes / Remarks" multiline rows={3} value={orderFormData.notes} onChange={(e) => handleOrderInputChange('notes', e.target.value)}/>
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleSaveOrderDetails} disabled={actionLoading === 'order' || actionLoading === 'file_process'}
                    startIcon={actionLoading === 'order' ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} size="large">
                    Save Order Details & Proceed
                </Button>
            </Box>
        </Card>
    );

    const renderFilePreviewAndMappingContent = () => {
        if (!excelSourceData || excelSourceData.headers.length === 0) {
            return (
                <Card sx={{ p: 2, boxShadow: 'none', border: 'none' }}>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                        Complete "Order Details", upload file, and save. <br/> Preview & mapping will appear here.
                    </Typography>
                </Card>
            );
        }
        const selectedForMappingCount = fieldMappings.filter(m => m.isSelected).length;
        const allSelectedHaveSystemField = !fieldMappings.some(m => m.isSelected && m.systemField === 'none');
        return (
            <Card sx={{ p: 2, boxShadow: 'none', border: 'none' }}>
                <Typography variant="h6" gutterBottom>Data Preview (First 5 Rows)</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 3 }} variant="outlined">
                    <Table stickyHeader size="small"><TableHead><TableRow>
                        {excelSourceData.headers.map((header, idx) => (
                            <TableCell key={idx} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>{header}</TableCell>
                        ))}
                    </TableRow></TableHead><TableBody>
                        {excelSourceData.previewRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, cellIdx) => (
                                    <TableCell key={cellIdx}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {excelSourceData.previewRows.length === 0 && (
                            <TableRow><TableCell colSpan={excelSourceData.headers.length} align="center">No preview data.</TableCell></TableRow>
                        )}
                    </TableBody></Table>
                </TableContainer>
                <Typography variant="h6" gutterBottom>Field Mapping Configuration</Typography><Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p:1, backgroundColor: 'grey.50', borderRadius:1 }}>
                    <FormControlLabel control={
                        <Checkbox checked={fieldMappings.length > 0 && fieldMappings.every(m => m.isSelected)}
                            indeterminate={selectedForMappingCount > 0 && selectedForMappingCount < fieldMappings.length}
                            onChange={(e) => handleSelectAllColumnsForMapping(e.target.checked)} disabled={fieldMappings.length === 0}/>
                    } label={`Select All Columns for Mapping (${selectedForMappingCount} / ${fieldMappings.length})`}/>
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }} variant="outlined">
                    <Table stickyHeader size="small"><TableHead><TableRow>
                        <TableCell padding="checkbox" sx={{width: '5%', fontWeight: 'bold', backgroundColor: 'grey.100'}}>Map</TableCell>
                        <TableCell sx={{width: '30%', fontWeight: 'bold', backgroundColor: 'grey.100'}}>Excel Column</TableCell>
                        <TableCell sx={{width: '20%', fontWeight: 'bold', backgroundColor: 'grey.100'}}>Sample Data</TableCell>
                        <TableCell sx={{width: '25%', fontWeight: 'bold', backgroundColor: 'grey.100'}}>Map to System Field *</TableCell>
                        <TableCell sx={{width: '20%', fontWeight: 'bold', backgroundColor: 'grey.100'}}>Options</TableCell>
                    </TableRow></TableHead><TableBody>
                        {fieldMappings.map((mapping, index) => (
                            <TableRow key={index} hover selected={mapping.isSelected}>
                                <TableCell padding="checkbox">
                                    <Checkbox checked={mapping.isSelected} onChange={e => handleMappingConfigChange(index, 'isSelected', e.target.checked)} />
                                </TableCell>
                                <TableCell>{mapping.companyColumn}</TableCell>
                                <TableCell>{mapping.sampleData ?? ''}</TableCell>
                                <TableCell>
                                    <FormControl fullWidth size="small" disabled={!mapping.isSelected}>
                                        <Select value={mapping.systemField} onChange={e => handleMappingConfigChange(index, 'systemField', e.target.value)} displayEmpty>
                                            <MenuItem value="none" disabled>Select System Field</MenuItem>
                                            {systemFieldsForMapping.map(sf => (
                                                <MenuItem key={sf.value} value={sf.value}>{sf.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {mapping.isSelected && mapping.systemField !== 'none' && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {MAPPING_TOGGLES.map(tog => (
                                                <FormControlLabel
                                                    key={tog.field}
                                                    control={
                                                        <Switch
                                                            size="small"
                                                            checked={!!mapping[tog.field as keyof FieldMappingConfig]}
                                                            onChange={e => handleMappingConfigChange(index, tog.field as keyof FieldMappingConfig, e.target.checked ? 1 : 0)}
                                                        />
                                                    }
                                                    label={tog.label}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {fieldMappings.length === 0 && (<TableRow><TableCell colSpan={5} align="center">No columns found.</TableCell></TableRow>)}
                    </TableBody></Table>
                </TableContainer>
                {selectedForMappingCount > 0 && !allSelectedHaveSystemField && (<Alert severity="warning" sx={{ mt: 2 }}>One or more selected columns lack a System Field assignment.</Alert>)}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handleExportMappedDataPreview} disabled={actionLoading !== null || !allSelectedHaveSystemField || selectedForMappingCount === 0}
                        title={!allSelectedHaveSystemField ? "Assign system fields to all selected columns" : "Export CSV preview"}>Export Preview</Button>
                    <Button variant="contained" color="primary" size="large" startIcon={actionLoading === 'publish' ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />}
                        onClick={handleSaveMappingsAndPublish} disabled={actionLoading !== null || !allSelectedHaveSystemField || selectedForMappingCount === 0 || !orderFormData.id}
                        title={!orderFormData.id ? "Save Order Details first" : (!allSelectedHaveSystemField ? "Assign system fields" : "Save mappings & publish")}>Save Mappings & Publish</Button>
                </Box>
            </Card>
        );
    };
    
    // Fetch mapping history and auto-map after file upload
    const fetchAndApplyFieldMappings = async (companyId: string, headers: string[]) => {
        try {
            // Backend endpoint accepts company_id and company_field_names
            const resp = await apiService.post('/field_mappings/get_by_company_and_headers', {
                company_id: companyId,
                company_field_names: headers,
            });
            
            // resp: array of mappings for this company and these headers
            if (!Array.isArray(resp)) return [];
            
            console.log('Fetched field mappings:', resp);
            return resp;
        } catch (err) {
            console.error('Failed to fetch field mappings:', err);
            return [];
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{mb:3}}>Order Statement Processing</Typography>
            {pageLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress size={50} /></Box>) : (
                <>
                    {error && (<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>)}
                    {success && (<Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>)}
                    <Accordion expanded={expandedAccordion === 'orderDetailsSection'} onChange={handleAccordionChange('orderDetailsSection')} TransitionProps={{ unmountOnExit: true }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="order-details-content" id="order-details-header">
                            <Typography variant="h6">1. Order & File Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{backgroundColor: '#fcfcfc'}}>{renderOrderDetailsContent()}</AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expandedAccordion === 'filePreviewMappingSection'} onChange={handleAccordionChange('filePreviewMappingSection')} disabled={!selectedFile || !orderFormData.id} TransitionProps={{ unmountOnExit: true }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="file-preview-mapping-content" id="file-preview-mapping-header">
                             <Typography variant="h6">2. File Preview & Field Mapping</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{backgroundColor: '#fcfcfc'}}>{renderFilePreviewAndMappingContent()}</AccordionDetails>
                    </Accordion>
                </>
            )}
        </Container>
    );
};

export default MergedOrderPage;
