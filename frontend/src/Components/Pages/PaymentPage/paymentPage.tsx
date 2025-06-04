import React, { useState, useEffect } from 'react';

import {
  Visibility as VisibilityIcon,
 Upload as UploadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ReusableTable } from './PaymentReusableCode';
import { Chip } from '@mui/material';

interface PaymentItem {
  id: number;
  rider: string;
  company: string;
  store: string;
  dailyOrdersTotal: string;
  weeklyStatement: string;
  advanceRequested: string;
  tdsDeduction: string;
  finalPayable: string;
  status: string;
}

interface Column {
  field: keyof PaymentItem;
  headerName: string;
  type?: 'status' | 'currency';
  render?: (value: any, item: PaymentItem) => React.ReactNode;
}

interface TabItem {
  label: string;
  value: string;
  count?: number;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface ActionItem {
  icon: React.ReactNode;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  title: string;
  onClick?: (item: PaymentItem) => void;
}

const PaymentListingPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock payment data based on the image
  const mockPaymentData: PaymentItem[] = [
    {
      id: 1,
      rider: 'veerdurgarao Goriparthi',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹0.00',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹0.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'pending'
    },
    {
      id: 2,
      rider: 'Mahendhra',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹6,059.25',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹2,800.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹3,259.25',
      status: 'paid'
    },
    {
      id: 3,
      rider: 'veerdurgarao Goriparthi',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹0.00',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹0.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'pending'
    },
    {
      id: 4,
      rider: 'Rajesh Kumar',
      company: 'ABC Corp',
      store: 'Store A',
      dailyOrdersTotal: '₹3,250.75',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹1,500.00',
      tdsDeduction: '₹325.08',
      finalPayable: '₹1,425.67',
      status: 'processing'
    },
    {
      id: 5,
      rider: 'Priya Sharma',
      company: 'XYZ Ltd',
      store: 'Store B',
      dailyOrdersTotal: '₹4,890.50',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹2,000.00',
      tdsDeduction: '₹489.05',
      finalPayable: '₹2,401.45',
      status: 'paid'
    },
    {
      id: 6,
      rider: 'Amit Singh',
      company: 'Tech Solutions',
      store: 'Store C',
      dailyOrdersTotal: '₹2,156.25',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹800.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹1,356.25',
      status: 'rejected'
    }
  ];

  const columns: Column[] = [
    { field: 'rider', headerName: 'RIDER' },
    { field: 'company', headerName: 'COMPANY' },
    { field: 'store', headerName: 'STORE' },
    { field: 'dailyOrdersTotal', headerName: 'DAILY ORDERS TOTAL', type: 'currency' },
    { 
      field: 'weeklyStatement', 
      headerName: 'WEEKLY STATEMENT',
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'uploaded' ? 'success' : 'warning'}
          size="small"
          sx={{ minWidth: 90 }}
        />
      )
    },
    { field: 'advanceRequested', headerName: 'ADVANCE REQUESTED', type: 'currency' },
    { field: 'tdsDeduction', headerName: 'TDS DEDUCTION (1%)', type: 'currency' },
    { field: 'finalPayable', headerName: 'FINAL PAYABLE', type: 'currency' },
    { field: 'status', headerName: 'STATUS', type: 'status' }
  ];

  const tabs: TabItem[] = [
    { label: 'All Payments', value: 'all', count: mockPaymentData.length, color: 'default' },
    { label: 'Pending', value: 'pending', count: mockPaymentData.filter(p => p.status === 'pending').length, color: 'warning' },
    { label: 'Processing', value: 'processing', count: mockPaymentData.filter(p => p.status === 'processing').length, color: 'info' },
    { label: 'Paid', value: 'paid', count: mockPaymentData.filter(p => p.status === 'paid').length, color: 'success' },
    { label: 'Rejected', value: 'rejected', count: mockPaymentData.filter(p => p.status === 'rejected').length, color: 'error' }
  ];

  const statusColors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    paid: 'success',
    rejected: 'error'
  };

  const actions: ActionItem[] = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      title: 'Details',
      onClick: (item) => console.log('View Details', item)
    },
    {
      icon: <UploadIcon fontSize="small" />,
      color: 'info',
      title: 'Upload Statement',
      onClick: (item) => console.log('Upload Statement', item)
    },
    {
      icon: <EditIcon fontSize="small" />,
      color: 'secondary',
      title: 'Settle',
      onClick: (item) => console.log('Settle Payment', item)
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setPayments(mockPaymentData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <ReusableTable
      title="Payment Listing"
      data={payments}
      columns={columns}
      tabs={tabs}
      loading={loading}
      onDataChange={setPayments}
      searchFields={['rider', 'company', 'store']}
      statusField="status"
      statusColors={statusColors}
      actions={actions}
    />
  );
};

export default PaymentListingPage;