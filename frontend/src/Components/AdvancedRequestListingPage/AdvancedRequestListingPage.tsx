import React, { useEffect, useState } from 'react';
import {
  Visibility as VisibilityIcon,
  Replay as ReplayIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { ReusableTable } from '../Pages/PaymentPage/PaymentReusableCode';

interface RequestItem {
  id: number;
  rider: string;
  requestDateTime: string;
  orderDate: string;
  orderCount: number;
  totalEarning: string;
  requestedAmount: string;
  status: string;
  processedBy: string;
}

interface Column {
  field: keyof RequestItem;
  headerName: string;
  type?: 'status' | 'currency' | 'date';
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
  onClick?: (item: RequestItem) => void;
}

const AdvancedRequestListingPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const mockData: RequestItem[] = [
    {
      id: 101,
      rider: 'Ramesh',
      requestDateTime: '2025-06-03 10:00 AM',
      orderDate: '2025-06-02',
      orderCount: 7,
      totalEarning: '₹2,000.00',
      requestedAmount: '₹1,800.00',
      status: 'processing',
      processedBy: 'Admin',
    },
    {
      id: 102,
      rider: 'Suresh',
      requestDateTime: '2025-06-03 09:30 AM',
      orderDate: '2025-06-01',
      orderCount: 10,
      totalEarning: '₹3,500.00',
      requestedAmount: '₹3,200.00',
      status: 'completed',
      processedBy: 'Manager',
    },
    {
      id: 103,
      rider: 'Naresh',
      requestDateTime: '2025-06-02 05:45 PM',
      orderDate: '2025-05-31',
      orderCount: 4,
      totalEarning: '₹1,250.00',
      requestedAmount: '₹1,100.00',
      status: 'pending',
      processedBy: '',
    },
  ];

  const columns: Column[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'rider', headerName: 'RIDER' },
    { field: 'requestDateTime', headerName: 'REQUEST DATE/TIME', type: 'date' },
    { field: 'orderDate', headerName: 'ORDER DATE', type: 'date' },
    { field: 'orderCount', headerName: 'ORDER COUNT' },
    { field: 'totalEarning', headerName: 'TOTAL EARNING', type: 'currency' },
    { field: 'requestedAmount', headerName: 'REQUESTED AMOUNT', type: 'currency' },
    { field: 'status', headerName: 'STATUS', type: 'status' },
    { field: 'processedBy', headerName: 'PROCESSED BY' },
  ];

  const tabs: TabItem[] = [
    { label: 'All', value: 'all', count: mockData.length },
    { label: 'Completed', value: 'completed', count: mockData.filter(i => i.status === 'completed').length, color: 'success' },
    { label: 'Processing', value: 'processing', count: mockData.filter(i => i.status === 'processing').length, color: 'info' },
    { label: 'Pending', value: 'pending', count: mockData.filter(i => i.status === 'pending').length, color: 'warning' },
  ];

  const statusColors: Record<string, string> = {
    completed: 'success',
    processing: 'info',
    pending: 'warning',
    failed: 'error',
  };

  const actions: ActionItem[] = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      title: 'View',
      color: 'primary',
      onClick: (item) => console.log('View clicked:', item),
    },
    {
      icon: <FileDownloadIcon fontSize="small" />,
      title: 'Download',
      color: 'success',
      onClick: (item) => console.log('Download clicked:', item),
    },
    {
      icon: <ReplayIcon fontSize="small" />,
      title: 'Retry',
      color: 'warning',
      onClick: (item) => console.log('Retry clicked:', item),
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRequests(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <ReusableTable
      title="Advanced Request Listing"
      data={requests}
      columns={columns}
      tabs={tabs}
      loading={loading}
      onDataChange={setRequests}
      searchFields={['rider', 'processedBy']}
      statusField="status"
      statusColors={statusColors}
      actions={actions}
    />
  );
};

export default AdvancedRequestListingPage;
