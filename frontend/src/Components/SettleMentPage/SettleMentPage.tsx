import React, { useState, useEffect } from 'react';
import {
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { ReusableTable } from '../Pages/PaymentPage/PaymentReusableCode';

interface SettlementItem {
  id: number;
  riderId: string;
  companyId: string;
  orderId: string;
  paymentRequestId: string;
  amount: string;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  remarks: string;
  paymentReference: string;
  updatedAt: string;
}

interface Column {
  field: keyof SettlementItem;
  headerName: string;
  type?: 'status' | 'currency' | 'date';
  render?: (value: any, item: SettlementItem) => React.ReactNode;
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
  onClick?: (item: SettlementItem) => void;
}

const SettlementListingPage: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock settlement data based on the SQL structure
  const mockSettlementData: SettlementItem[] = [
    {
      id: 1,
      riderId: 'RD001',
      companyId: 'ABC Corp',
      orderId: 'ORD-2024-001',
      paymentRequestId: 'PR-001',
      amount: '₹3,259.25',
      paymentDate: '2024-12-15',
      status: 'completed',
      paymentMethod: 'UPI',
      transactionId: 'TXN123456789',
      remarks: 'Weekly settlement processed',
      paymentReference: 'REF-001',
      updatedAt: '2024-12-15 14:30:00'
    },
    {
      id: 2,
      riderId: 'RD002',
      companyId: 'XYZ Ltd',
      orderId: 'ORD-2024-002',
      paymentRequestId: 'PR-002',
      amount: '₹2,401.45',
      paymentDate: '2024-12-14',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654321',
      remarks: 'Settlement for weekly orders',
      paymentReference: 'REF-002',
      updatedAt: '2024-12-14 16:45:00'
    },
    {
      id: 3,
      riderId: 'RD003',
      companyId: 'Tech Solutions',
      orderId: 'ORD-2024-003',
      paymentRequestId: 'PR-003',
      amount: '₹1,856.75',
      paymentDate: '2024-12-13',
      status: 'pending',
      paymentMethod: 'UPI',
      transactionId: '',
      remarks: 'Awaiting bank confirmation',
      paymentReference: 'REF-003',
      updatedAt: '2024-12-13 10:20:00'
    },
    {
      id: 4,
      riderId: 'RD004',
      companyId: 'Global Delivery',
      orderId: 'ORD-2024-004',
      paymentRequestId: 'PR-004',
      amount: '₹4,250.80',
      paymentDate: '2024-12-12',
      status: 'failed',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN555666777',
      remarks: 'Payment failed - insufficient funds',
      paymentReference: 'REF-004',
      updatedAt: '2024-12-12 18:15:00'
    },
    {
      id: 5,
      riderId: 'RD005',
      companyId: 'Quick Serve',
      orderId: 'ORD-2024-005',
      paymentRequestId: 'PR-005',
      amount: '₹3,675.90',
      paymentDate: '2024-12-11',
      status: 'processing',
      paymentMethod: 'Digital Wallet',
      transactionId: 'TXN111222333',
      remarks: 'Processing payment request',
      paymentReference: 'REF-005',
      updatedAt: '2024-12-11 12:00:00'
    },
    {
      id: 6,
      riderId: 'RD006',
      companyId: 'Fast Foods',
      orderId: 'ORD-2024-006',
      paymentRequestId: 'PR-006',
      amount: '₹2,890.65',
      paymentDate: '2024-12-10',
      status: 'completed',
      paymentMethod: 'UPI',
      transactionId: 'TXN444555666',
      remarks: 'Weekly settlement completed',
      paymentReference: 'REF-006',
      updatedAt: '2024-12-10 15:30:00'
    }
  ];

  const columns: Column[] = [
    { field: 'riderId', headerName: 'RIDER ID' },
    { field: 'companyId', headerName: 'COMPANY' },
    { field: 'orderId', headerName: 'ORDER ID' },
    { field: 'paymentRequestId', headerName: 'PAYMENT REQUEST ID' },
    { field: 'amount', headerName: 'AMOUNT', type: 'currency' },
    { field: 'paymentDate', headerName: 'PAYMENT DATE', type: 'date' },
    { field: 'paymentMethod', headerName: 'PAYMENT METHOD' },
    { field: 'transactionId', headerName: 'TRANSACTION ID' },
    { field: 'paymentReference', headerName: 'PAYMENT REFERENCE' },
    { field: 'remarks', headerName: 'REMARKS' },
    { field: 'status', headerName: 'STATUS', type: 'status' }
  ];

  const tabs: TabItem[] = [
    { label: 'All Settlements', value: 'all', count: mockSettlementData.length, color: 'default' },
    { label: 'Completed', value: 'completed', count: mockSettlementData.filter(s => s.status === 'completed').length, color: 'success' },
    { label: 'Processing', value: 'processing', count: mockSettlementData.filter(s => s.status === 'processing').length, color: 'info' },
    { label: 'Pending', value: 'pending', count: mockSettlementData.filter(s => s.status === 'pending').length, color: 'warning' },
    { label: 'Failed', value: 'failed', count: mockSettlementData.filter(s => s.status === 'failed').length, color: 'error' }
  ];

  const statusColors: Record<string, string> = {
    completed: 'success',
    processing: 'info',
    pending: 'warning',
    failed: 'error'
  };

  const actions: ActionItem[] = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      title: 'View Details',
      onClick: (item) => console.log('View Settlement Details', item)
    },
    {
      icon: <ReceiptIcon fontSize="small" />,
      color: 'info',
      title: 'Download Receipt',
      onClick: (item) => console.log('Download Receipt', item)
    },
    {
      icon: <PaymentIcon fontSize="small" />,
      color: 'secondary',
      title: 'Retry Payment',
      onClick: (item) => console.log('Retry Payment', item)
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchSettlements = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setSettlements(mockSettlementData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching settlements:', error);
        setLoading(false);
      }
    };

    fetchSettlements();
  }, []);

  return (
    <ReusableTable
      title="Settlement Listing"
      data={settlements}
      columns={columns}
      tabs={tabs}
      loading={loading}
      onDataChange={setSettlements}
      searchFields={['riderId', 'companyId', 'orderId', 'transactionId', 'paymentReference']}
      statusField="status"
      statusColors={statusColors}
      actions={actions}
    />
  );
};

export default SettlementListingPage;