import apiService, { api } from './apiService';

// Define types
export interface FieldMapping {
  companyColumn: string;
  systemField: string;
  fieldType: string;
  showToRiders: boolean;
  showInInvoice: boolean;
  useForCommission: boolean;
  isSelected: boolean;
}

export interface OrderStatementPreview {
  uploadId: number;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  totalRows: number;
  headers: string[];
  previewRows: any[][];
}

export interface SystemField {
  field_key: string;
  field_label: string;
  field_type: string;
}

export interface WeeklySettlement {
  id: number;
  rider_id: number;
  rider_name: string;
  rider_phone: string;
  settlement_date: string;
  start_date: string;
  end_date: string;
  weekly_earnings: number;
  daily_earnings: number;
  advance_amounts: number;
  settlement_amount: number;
  status: string;
  company_name: string;
  orderDetails: any[];
}

export interface WeeklySummary {
  upload: {
    id: number;
    company_id: number;
    payment_date: string;
    start_date: string;
    end_date: string;
    amount: number;
    status: string;
    file_path: string;
    mapping_status: string;
  };
  company: {
    id: number;
    company_name: string;
    company_email: string;
    company_phone: string;
  };
  riderSummaries: {
    rider_id: number;
    rider_name: string;
    rider_phone: string;
    total_days: number;
    total_orders: number;
    total_earnings: number;
  }[];
  totals: {
    totalRiders: number;
    totalOrders: number;
    totalEarnings: number;
  };
}

/**
 * Upload an order statement file
 */
export const uploadOrderStatement = async (file: File, companyId?: number): Promise<OrderStatementPreview> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (companyId) {
    formData.append('company_id', companyId.toString());
  }
  
  const response = await api.post('/orders/upload-order-statement', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

/**
 * Get preview data for an uploaded order statement
 */
export const getOrderStatementPreview = async (uploadId: number): Promise<{
  uploadId: number;
  fileName: string;
  uploadDate: string;
  totalRows: number;
  headers: string[];
  previewRows: any[][];
  systemFields: SystemField[];
}> => {
  const response = await apiService.get(`/orders/order-statement-preview`, { uploadId });
  return response.data;
};

/**
 * Map and save order statement field mappings
 */
export const mapOrderStatement = async (uploadId: number, mappings: FieldMapping[]): Promise<{
  uploadId: number;
  processedRows: number;
  totalAmount: number;
}> => {
  const response = await apiService.post('/orders/map-order-statement', { uploadId, mappings });
  return response.data;
};

/**
 * Get weekly settlement data
 */
export const getWeeklySettlement = async (id: number): Promise<WeeklySettlement> => {
  const response = await apiService.get(`/orders/weekly-settlement/${id}`);
  return response.data.data;
};

/**
 * Get weekly summary report
 */
export const getWeeklySummary = async (id: number): Promise<WeeklySummary> => {
  const response = await apiService.get(`/orders/weekly-summary/${id}`);
  return response.data.data;
};

/**
 * Export mapped data as Excel
 */
export const exportMappedData = async (uploadId: number): Promise<Blob> => {
  const response = await api.get(`/orders/export-mapped-data/${uploadId}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

export default {
  uploadOrderStatement,
  getOrderStatementPreview,
  mapOrderStatement,
  getWeeklySettlement,
  getWeeklySummary,
  exportMappedData,
};