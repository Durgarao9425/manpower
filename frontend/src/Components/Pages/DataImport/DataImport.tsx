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
  TablePagination,
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
import axios from 'axios';
import * as XLSX from 'xlsx';
import apiService from "../../../services/apiService";

// Types
interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface TableConfig {
  name: string;
  endpoint: string;
  fields: Field[];
}

interface TableConfigs {
  [key: string]: TableConfig;
}

interface PreviewData {
  columns: string[];
  data: any[][];
  warnings: { column: number; message: string }[];
  totalRows: number;
}

interface ImportRecord {
  id: number;
  table: string;
  filename: string;
  status: string;
  records: number;
  errors: number;
  date: string;
  details: {
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{
      row: number;
      message: string;
      data: any;
    }>;
  };
}

interface ParsedCSV {
  headers: string[];
  data: string[][];
}

// Add new interface for import history
interface ImportHistoryRecord {
  id: number;
  table_name: string;
  filename: string;
  status: 'completed' | 'completed_with_errors' | 'failed';
  total_records: number;
  success_count: number;
  failed_count: number;
  skipped_count: number;
  error_details: any;
  created_at: string;
}

// Table configurations
const TABLE_CONFIGS: TableConfigs = {
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
      { name: "company_name", label: "Company Name", type: "text", required: true },
      { name: "company_email", label: "Email", type: "email", required: true },
      { name: "company_phone", label: "Phone", type: "tel", required: false },
      { name: "company_gst", label: "GST", type: "text", required: false },
      { name: "company_address", label: "Address", type: "textarea", required: false },
      { name: "industry", label: "Industry", type: "text", required: false },
      { name: "payment_terms", label: "Payment Terms", type: "text", required: false },
    ],
  },
};


const DataImportSystem = () => {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewDataModalOpen, setViewDataModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportType, setExportType] = useState("blank_template");
  const [fileType, setFileType] = useState<'csv' | 'excel'>('csv');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [guidanceDrawerOpen, setGuidanceDrawerOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [importRecords, setImportRecords] = useState<ImportHistoryRecord[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "warning" | "error",
  });
  const [activeTab, setActiveTab] = useState("import");
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(0);
  // Add pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Add state for error details dialog
  const [errorDetailsOpen, setErrorDetailsOpen] = useState(false);
  const [selectedErrorDetails, setSelectedErrorDetails] = useState<any>(null);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    processed: number;
    success: number;
    failed: number;
    skipped: number;
  }>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load import history from API on component mount
  useEffect(() => {
    loadImportHistory();
  }, []);
  
  // Reset pagination when switching to the listings tab
  useEffect(() => {
    if (activeTab === "listings") {
      setPage(0);
    }
  }, [activeTab]);

  const loadImportHistory = async () => {
    try {
      console.log('Loading import history...');
      const response = await apiService.get('/import-history');
      console.log('Import history response:', response);
      
      if (response && response.success) {
        // Initialize with empty array if data is null or undefined
        const historyData = response.data || [];
        console.log('Setting import records:', historyData);
        setImportRecords(historyData);
        // Reset to first page when new data is loaded
        setPage(0);
      } else {
        console.warn('Unexpected response format:', response);
        // Initialize with empty array if response is invalid
        setImportRecords([]);
        throw new Error(response?.error || 'Failed to load import history');
      }
    } catch (error: any) {
      console.error('Error loading import history:', error);
      // Initialize with empty array on error
      setImportRecords([]);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load import history',
        severity: 'error'
      });
    }
  };

  // Add error handling for unauthorized access
  const handleApiError = (error: any) => {
    if (error.message === 'Session expired. Please login again.') {
      // Redirect to login page or show login modal
      window.location.href = '/login'; // Adjust the login path as needed
    } else {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'An error occurred',
        severity: 'error'
      });
    }
  };

  const loadTableData = async (table: string) => {
    try {
      setLoading(true);
      const config = TABLE_CONFIGS[table];
      const data = await apiService.get(config.endpoint);
      setTableData(data);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFieldSelection = (fieldName: string) => {
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

    let data: string[][] = [];

    if (exportType === "blank_template") {
      data = [fields.map((field) => field.label)];
    } else if (exportType === "5_records") {
      data = [
        fields.map((field) => field.label),
        ...Array(5)
          .fill(null)
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
                  return String(index + 1);
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
          fields.map(field => String(record[field.name] || ""))
        )
      ];
    }

    return data;
  };

  const downloadCSV = (data: string[][], filename: string) => {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file: File) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension === 'csv' || extension === 'xlsx' || extension === 'xls';
    });

    if (validFiles.length !== files.length) {
      setSnackbar({
        open: true,
        message: "Only CSV and Excel files are allowed",
        severity: "error",
      });
      return;
    }

    setAttachedFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewData(null);
  };

  const parseCSVFile = (file: File): Promise<ParsedCSV> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result;
        if (!text || typeof text !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }

        const lines = text.split('\n').filter((line: string) => line.trim());
        if (lines.length === 0) {
          reject(new Error('Empty file'));
          return;
        }
        
        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line: string) => {
          const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
          return values;
        });
        
        resolve({ headers, data });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseExcelFile = (file: File): Promise<ParsedCSV> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            reject(new Error('Empty file'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as string[][];

          resolve({ headers, data: rows });
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  // Update handleStartImport to handle the new API response format
  const handleStartImport = async () => {
    console.log('=== STARTING IMPORT PROCESS ===');
    console.log('previewData:', previewData);
    console.log('attachedFiles:', attachedFiles);
    console.log('parsedRecords length:', parsedRecords?.length);
    console.log('selectedTable:', selectedTable);
    
    if (!previewData || !attachedFiles[0]) {
      console.error('Missing required data for import');
      setSnackbar({
        open: true,
        message: 'Missing preview data or file for import',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    // Safety timeout to ensure loading state is reset even if there's an unexpected error
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout triggered - resetting loading state');
      setLoading(false);
    }, 30000); // 30 seconds timeout
    
    try {
      console.log('Initializing progress...');
      // Initialize progress
      setImportProgress({
        total: parsedRecords.length,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0
      });

      console.log('Starting processRecords...');
      const results = await processRecords(parsedRecords, previewData.columns);
      console.log('processRecords completed:', results);
      
      // Save import record to backend
      const importRecord = {
        table_name: selectedTable,
        filename: attachedFiles[0].name,
        status: results.failed === 0 ? "completed" : "completed_with_errors",
        total_records: parsedRecords.length,
        success_count: results.success,
        failed_count: results.failed,
        skipped_count: results.skipped,
        error_details: results.errors
      };

      try {
        console.log('Saving import history record:', importRecord);
        const response = await apiService.post('/import-history', importRecord);
        console.log('Import history save response:', response);
        
        if (!response || (!response.success && !response.id)) {
          console.warn('Import history save warning:', response);
          // Continue execution even if saving history fails
        }
      } catch (historyError) {
        console.error('Failed to save import history:', historyError);
        // Continue execution even if saving history fails
      }

      // Reload import history
      await loadImportHistory();

      // Show summary message
      setSnackbar({
        open: true,
        message: `Import completed. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`,
        severity: results.failed === 0 ? "success" : "warning",
      });

      // Reset state
      console.log('Resetting state...');
      setParsedRecords([]);
      setPreviewData(null);
      setAttachedFiles([]);
      
    } catch (error: any) {
      console.error('Import failed with error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to import records',
        severity: 'error'
      });
    } finally {
      console.log('Import process finished, setting loading to false');
      // Clear the safety timeout
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  // Fixed processRecords function with better error handling and logging
  const processRecords = async (records, headers) => {
    console.log('=== PROCESSING RECORDS ===');
    console.log('Total records to process:', records.length);
    console.log('Headers:', headers);
    console.log('Selected table:', selectedTable);
    
    // Safety check - if no records, return early
    if (!records || records.length === 0) {
      console.warn('No records to process');
      return {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };
    }
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Process records one by one to ensure reliable API calls
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`Processing record ${i + 1}/${records.length}:`, record);
      
      try {
        // Normalize record keys to lowercase
        const normalizedRecord = Object.keys(record).reduce((acc, key) => {
          acc[key.toLowerCase()] = record[key];
          return acc;
        }, {});

        const validationErrors = validateRecord(normalizedRecord, headers);
        console.log(`Validation errors for record ${i + 1}:`, validationErrors);

        if (validationErrors.length > 0) {
          console.log(`Skipping record ${i + 1} due to validation errors`);
          results.skipped++;
          results.errors.push({
            row: i + 1,
            message: validationErrors.join(', '),
            data: normalizedRecord,
            reason: 'Validation failed'
          });
          
          // Update progress after each record
          setImportProgress(prev => ({
            ...prev,
            processed: i + 1,
            success: results.success,
            failed: results.failed,
            skipped: results.skipped
          }));
          continue;
        }

        // Convert record to match backend format
        const formattedRecord = headers.reduce((acc, header) => {
          const field = TABLE_CONFIGS[selectedTable].fields.find(f => 
            f.label.toLowerCase() === header.toLowerCase() ||
            f.name.toLowerCase() === header.toLowerCase()
          );
          if (field) {
            // Use the normalized record with lowercase keys
            const headerLower = header.toLowerCase();
            if (normalizedRecord[headerLower] !== undefined && normalizedRecord[headerLower] !== '') {
              // Convert numeric values if the field type is number
              if (field.type === 'number' && !isNaN(Number(normalizedRecord[headerLower]))) {
                acc[field.name] = Number(normalizedRecord[headerLower]);
              } else {
                acc[field.name] = normalizedRecord[headerLower];
              }
              console.log(`Mapped ${headerLower} -> ${field.name}: ${normalizedRecord[headerLower]}`);
            }
          }
          return acc;
        }, {});

        console.log(`Formatted record ${i + 1}:`, formattedRecord);

        // Send record to backend
        const endpoint = TABLE_CONFIGS[selectedTable].endpoint;
        console.log(`Sending POST request to: ${endpoint}`);
        console.log('Request payload:', formattedRecord);
        
        try {
          // Check if we have the minimum required fields for this table
          const requiredFields = TABLE_CONFIGS[selectedTable].fields
            .filter(f => f.required)
            .map(f => f.name);
            
          const missingRequiredFields = requiredFields.filter(field => 
            formattedRecord[field] === undefined || formattedRecord[field] === null || formattedRecord[field] === ''
          );
          
          if (missingRequiredFields.length > 0) {
            console.error(`Missing required fields for record ${i + 1}:`, missingRequiredFields);
            results.failed++;
            results.errors.push({
              row: i + 1,
              message: `Missing required fields: ${missingRequiredFields.join(', ')}`,
              data: normalizedRecord,
              reason: 'Missing required fields'
            });
          } else {
            // Send to backend only if all required fields are present
            const response = await apiService.post(endpoint, formattedRecord);
            console.log(`Response for record ${i + 1}:`, response);
            
            if (response && (response.success || response.id)) {
              results.success++;
              console.log(`Record ${i + 1} saved successfully`);
            } else {
              console.error(`Error response for record ${i + 1}:`, response);
              results.failed++;
              results.errors.push({
                row: i + 1,
                message: response?.error || 'Unknown error',
                data: normalizedRecord,
                reason: 'API error'
              });
            }
          }
        } catch (apiError) {
          console.error(`API error for record ${i + 1}:`, apiError);
          results.failed++;
          results.errors.push({
            row: i + 1,
            message: apiError.message || 'API request failed',
            data: normalizedRecord,
            reason: 'API error'
          });
        }
        
      } catch (error: any) {
        console.error(`Error processing record ${i + 1}:`, error);
        results.failed++;
        
        // Get detailed error message from response
        let errorMessage = 'Failed to save record';
        let errorReason = 'Unknown error';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          errorReason = 'Server error';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
          errorReason = 'Server error';
        } else if (error.message) {
          errorMessage = error.message;
          errorReason = 'Client error';
        }
        
        console.log(`Error message for record ${i + 1}:`, errorMessage);
        
        // Don't show error toast for each failed record - we'll show a summary at the end
        // Just log the error for debugging
        console.log(`Error in row ${i + 1}: ${errorMessage}`);
        
        results.errors.push({
          row: i + 1,
          message: errorMessage,
          data: record,
          reason: errorReason
        });
      }

      // Update progress after each record
      setImportProgress(prev => ({
        ...prev,
        processed: i + 1,
        success: results.success,
        failed: results.failed,
        skipped: results.skipped
      }));
      
      console.log(`Progress after record ${i + 1}:`, {
        processed: i + 1,
        success: results.success,
        failed: results.failed,
        skipped: results.skipped
      });
    }

    console.log('=== PROCESSING COMPLETE ===');
    console.log('Final results:', results);
    return results;
  };

  // Fixed validateRecord function with better logging
  const validateRecord = (record, headers) => {
    console.log('Validating record:', record);
    console.log('Available headers:', headers);
    
    const tableFields = TABLE_CONFIGS[selectedTable].fields;
    const errors = [];

    // Map headers to field names
    const headerToField = headers.reduce((acc, header, index) => {
      const field = tableFields.find(f => 
        f.label.toLowerCase() === header.toLowerCase() ||
        f.name.toLowerCase() === header.toLowerCase()
      );
      if (field) {
        // Store with lowercase header for consistent lookup
        acc[header.toLowerCase()] = field;
        console.log(`Mapped header "${header}" to field:`, field);
      } else {
        console.log(`No field found for header "${header}"`);
      }
      return acc;
    }, {});

    console.log('Header to field mapping:', headerToField);

    // Check for required fields that are missing
    tableFields.forEach(field => {
      if (field.required) {
        // Check if any header maps to this required field
        const headerExists = Object.values(headerToField).some(f => f.name === field.name);
        if (!headerExists) {
          const error = `${field.label} column is missing`;
          errors.push(error);
          console.log(`Validation error: ${error}`);
        }
      }
    });

    // Validate each field
    Object.entries(headerToField).forEach(([headerLower, field]) => {
      // Use lowercase header for lookup
      const value = record[headerLower];
      console.log(`Validating field ${field.name} (${headerLower}):`, value);
      
      // Check required fields
      if (field.required && (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))) {
        const error = `${field.label} is required`;
        errors.push(error);
        console.log(`Validation error: ${error}`);
      }

      // Skip validation if value is empty and not required
      if (!value && !field.required) {
        console.log(`Field ${field.name} is empty but not required, skipping validation`);
        return;
      }

      // Validate email format
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          const error = `${field.label} must be a valid email address`;
          errors.push(error);
          console.log(`Validation error: ${error}`);
        }
      }

      // Validate select options
      if (field.type === 'select' && field.options && value) {
        if (!field.options.includes(String(value))) {
          const error = `${field.label} must be one of: ${field.options.join(', ')}`;
          errors.push(error);
          console.log(`Validation error: ${error}`);
        }
      }

      // Validate date format
      if (field.type === 'date' && value) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(String(value))) {
          const error = `${field.label} must be in YYYY-MM-DD format`;
          errors.push(error);
          console.log(`Validation error: ${error}`);
        }
      }
    });

    console.log('Validation completed. Errors found:', errors);
    return errors;
  };

  // Also make sure your handlePreview function correctly sets parsedRecords
  const handlePreview = async () => {
    console.log('=== STARTING PREVIEW ===');
    console.log('Attached files:', attachedFiles);
    
    if (attachedFiles.length === 0) {
      console.log('No files attached');
      return;
    }

    setLoading(true);
    
    // Safety timeout to ensure loading state is reset even if there's an unexpected error
    const safetyTimeout = setTimeout(() => {
      console.log('Preview safety timeout triggered - resetting loading state');
      setLoading(false);
    }, 15000); // 15 seconds timeout

    try {
      const file = attachedFiles[0];
      console.log('Processing file:', file.name, 'Size:', file.size);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      console.log('File extension:', fileExtension);
      
      const { headers, data } = fileExtension === 'csv' 
        ? await parseCSVFile(file)
        : await parseExcelFile(file);
      
      console.log('Parsed headers:', headers);
      console.log('Parsed data length:', data.length);
      console.log('First few data rows:', data.slice(0, 3));
      
      const warnings = [];
      const tableFields = TABLE_CONFIGS[selectedTable].fields;
      
      // Validate headers against table structure
      headers.forEach((header, index) => {
        const field = tableFields.find(f => 
          f.label.toLowerCase() === header.toLowerCase() ||
          f.name.toLowerCase() === header.toLowerCase()
        );
        
        if (!field) {
          const warning = {
            column: index + 1,
            message: `Column "${header}" not found in table structure`
          };
          warnings.push(warning);
          console.log('Header validation warning:', warning);
        }
      });

      // Convert data to objects with header keys
      const records = data.map((row, rowIndex) => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index];
        });
        console.log(`Record ${rowIndex + 1}:`, record);
        return record;
      });

      console.log('Total records created:', records.length);
      setParsedRecords(records);
      
      setPreviewData({
        columns: headers,
        data: data.slice(0, 10), // Show first 10 rows
        warnings,
        totalRows: data.length
      });

      setImportProgress({
        total: data.length,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0
      });

      console.log('Preview data set successfully');
      setSnackbar({
        open: true,
        message: `File preview generated. Found ${data.length} rows.`,
        severity: "success",
      });
    } catch (error) {
      console.error('Preview failed:', error);
      setSnackbar({
        open: true,
        message: "Failed to parse file: " + error.message,
        severity: "error",
      });
    } finally {
      // Clear the safety timeout
      clearTimeout(safetyTimeout);
      setLoading(false);
      console.log('=== PREVIEW COMPLETED ===');
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

  const handleDownloadAll = async () => {
    if (!selectedTable) {
      setSnackbar({
        open: true,
        message: "Please select a table first",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const config = TABLE_CONFIGS[selectedTable];
      const data = await apiService.get(config.endpoint);
      
      // Convert data to CSV format
      const headers = config.fields.map(field => field.label);
      const csvData = [
        headers,
        ...data.map(record => 
          config.fields.map(field => record[field.name] || '')
        )
      ];
      
      downloadCSV(csvData, `${selectedTable}_all_data_${new Date().getTime()}.csv`);
      
      setSnackbar({
        open: true,
        message: "Data downloaded successfully",
        severity: "success",
      });
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedTable) {
      setSnackbar({
        open: true,
        message: "Please select a table first",
        severity: "warning",
      });
      return;
    }
    setFieldSelectionOpen(true);
  };

  const handleFieldSelectionDownload = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one field",
        severity: "warning",
      });
      return;
    }

    const fields = TABLE_CONFIGS[selectedTable].fields.filter(field => 
      selectedFields.includes(field.name)
    );

    const data = [
      fields.map(field => field.label),
      ...Array(5).fill(null).map((_, index) =>
        fields.map(field => {
          switch (field.type) {
            case "email":
              return `example${index + 1}@domain.com`;
            case "text":
              return `Sample ${field.label} ${index + 1}`;
            case "number":
              return String(index + 1);
            case "date":
              return "2024-01-01";
            case "select":
              return field.options ? field.options[0] : "Option1";
            default:
              return `Sample Data ${index + 1}`;
          }
        })
      )
    ];

    downloadCSV(data, `${selectedTable}_template_${new Date().getTime()}.csv`);
    setFieldSelectionOpen(false);
    setSnackbar({
      open: true,
      message: "Template downloaded successfully",
      severity: "success",
    });
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
                  onClick={handleDownloadTemplate}
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
                        File Types Allowed: CSV, Excel (.xlsx, .xls)
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
                    accept=".csv,.xlsx,.xls"
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
                    <TableCell>Total Records</TableCell>
                    <TableCell>Success</TableCell>
                    <TableCell>Failed</TableCell>
                    <TableCell>Skipped</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No import records found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Import data using the "Import Data" tab to see records here.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Apply pagination to the records
                    // Sort by ID in descending order (newest first) and then paginate
                    [...importRecords]
                      .sort((a, b) => b.id - a.id)
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((record: ImportHistoryRecord) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.table_name}</TableCell>
                          <TableCell>{record.filename}</TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
                          <TableCell>{record.total_records}</TableCell>
                          <TableCell>{record.success_count}</TableCell>
                          <TableCell>{record.failed_count}</TableCell>
                          <TableCell>{record.skipped_count}</TableCell>
                          <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={() => {
                                // Show detailed error dialog
                                setSelectedErrorDetails(record.error_details);
                                setErrorDetailsOpen(true);
                              }}
                              disabled={!record.error_details || record.error_details.length === 0}
                            >
                              View Errors
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Add TablePagination component */}
            {importRecords.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {Math.min(rowsPerPage, importRecords.length)} of {importRecords.length} records
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={importRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                />
              </Box>
            )}
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
                  onChange={(e) => setFileType(e.target.value as 'csv' | 'excel')}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel (.xlsx, .xls)</MenuItem>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              View Data - {selectedTable && TABLE_CONFIGS[selectedTable].name}
            </Typography>
            <Box>
              <IconButton
                onClick={() => setViewDataModalOpen(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
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

      {/* Field Selection Dialog */}
      <Dialog 
        open={fieldSelectionOpen} 
        onClose={() => {
          setFieldSelectionOpen(false);
          // Reset to mandatory fields when closing
          const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
            .filter(field => field.required)
            .map(field => field.name);
          setSelectedFields(mandatoryFields);
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Select Fields to Export</Typography>
            <IconButton onClick={() => {
              setFieldSelectionOpen(false);
              // Reset to mandatory fields when closing
              const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
                .filter(field => field.required)
                .map(field => field.name);
              setSelectedFields(mandatoryFields);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Template Type</FormLabel>
            <Select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as 'blank_template' | '5_records')}
            >
              <MenuItem value="blank_template">Blank Template (Headers Only)</MenuItem>
              <MenuItem value="5_records">Template with Sample Data (5 Records)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
              Select All Fields
            </Button>
            <Button size="small" onClick={handleUnselectAll} sx={{ mr: 1 }}>
              Clear Selection
            </Button>
            <Button size="small" onClick={handleSelectMandatory}>
              Select Required Fields
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFieldSelectionOpen(false);
            // Reset to mandatory fields when closing
            const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
              .filter(field => field.required)
              .map(field => field.name);
            setSelectedFields(mandatoryFields);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedFields.length === 0) {
                setSnackbar({
                  open: true,
                  message: "Please select at least one field",
                  severity: "warning"
                });
                return;
              }
              
              // Generate template with sample data
              const fields = TABLE_CONFIGS[selectedTable].fields.filter(field => 
                selectedFields.includes(field.name)
              );
              
              const data = [
                fields.map(field => field.label),
                ...(exportType === "5_records" ? Array(5).fill(null).map((_, index) =>
                  fields.map(field => {
                    switch (field.type) {
                      case "email":
                        return `example${index + 1}@domain.com`;
                      case "text":
                        return `Sample ${field.label} ${index + 1}`;
                      case "number":
                        return String(index + 1);
                      case "date":
                        return "2024-01-01";
                      case "select":
                        return field.options ? field.options[0] : "Option1";
                      default:
                        return `Sample Data ${index + 1}`;
                    }
                  })
                ) : [])
              ];
              
              downloadCSV(data, `${selectedTable}_${exportType}_${new Date().getTime()}.csv`);
              setSnackbar({
                open: true,
                message: `${exportType === "blank_template" ? "Blank" : "Sample data"} template downloaded successfully`,
                severity: "success"
              });
              setFieldSelectionOpen(false);
              // Reset to mandatory fields after download
              const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
                .filter(field => field.required)
                .map(field => field.name);
              setSelectedFields(mandatoryFields);
            }}
            variant="outlined"
            disabled={selectedFields.length === 0}
            startIcon={<DownloadIcon />}
          >
            Download Template
          </Button>
          <Button 
            onClick={() => {
              if (selectedFields.length === 0) {
                setSnackbar({
                  open: true,
                  message: "Please select at least one field",
                  severity: "warning"
                });
                return;
              }
              
              // Generate CSV with selected fields data
              const fields = TABLE_CONFIGS[selectedTable].fields.filter(field => 
                selectedFields.includes(field.name)
              );
              
              const headers = fields.map(field => field.label);
              const csvData = [
                headers,
                ...tableData.map(record => 
                  fields.map(field => record[field.name] || '')
                )
              ];
              
              downloadCSV(csvData, `${selectedTable}_data_${new Date().getTime()}.csv`);
              setSnackbar({
                open: true,
                message: "Data exported successfully",
                severity: "success"
              });
              setFieldSelectionOpen(false);
              // Reset to mandatory fields after download
              const mandatoryFields = TABLE_CONFIGS[selectedTable].fields
                .filter(field => field.required)
                .map(field => field.name);
              setSelectedFields(mandatoryFields);
            }}
            variant="contained"
            disabled={selectedFields.length === 0}
            startIcon={<DownloadIcon />}
          >
            Export Selected Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Progress */}
      {loading && importProgress.total > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Import Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(importProgress.processed / importProgress.total) * 100} 
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              Processed: {importProgress.processed} / {importProgress.total}
            </Typography>
            <Typography variant="body2" color="success.main">
              Success: {importProgress.success}
            </Typography>
            <Typography variant="body2" color="error.main">
              Failed: {importProgress.failed}
            </Typography>
            <Typography variant="body2" color="warning.main">
              Skipped: {importProgress.skipped}
            </Typography>
          </Box>
        </Box>
      )}

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

      {/* Error Details Dialog */}
      <Dialog 
        open={errorDetailsOpen} 
        onClose={() => setErrorDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Error Details</Typography>
            <IconButton onClick={() => setErrorDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedErrorDetails && selectedErrorDetails.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                The following errors occurred during import:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Error Message</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedErrorDetails.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                        <TableCell>{error.reason}</TableCell>
                        <TableCell>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography>View Data</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {JSON.stringify(error.data, null, 2)}
                              </pre>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography>No error details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataImportSystem;