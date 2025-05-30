import React, { useState, useEffect } from 'react';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ReusableTable from './TableComponent';
import AddEarningModal from './EarningPage';
import EarningViewPage from './EarningViewPage';

const RiderEarningPage = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showViewPage, setShowViewPage] = useState(false);
  const [viewData, setViewData] = useState(null);

  // Mock data
  const mockEarningData = [
    {
      id: 1,
      rider: 'Rajesh Kumar',
      company: 'Zomato',
      earningDate: '2024-01-15',
      orderCount: 25,
      amount: '₹2,500.00',
      status: 'pending',
      createdDate: '2024-01-15',
      riderContact: '+91 9876543210',
      riderId: 'RID001'
    },
    {
      id: 2,
      rider: 'Priya Sharma',
      company: 'Swiggy',
      earningDate: '2024-01-14',
      orderCount: 30,
      amount: '₹3,200.00',
      status: 'approved',
      createdDate: '2024-01-14',
      approvedDate: '2024-01-15',
      riderContact: '+91 9876543211',
      riderId: 'RID002'
    },
    {
      id: 3,
      rider: 'Amit Singh',
      company: 'Uber Eats',
      earningDate: '2024-01-13',
      orderCount: 20,
      amount: '₹1,800.00',
      status: 'settled',
      createdDate: '2024-01-13',
      approvedDate: '2024-01-14',
      settledDate: '2024-01-16',
      riderContact: '+91 9876543212',
      riderId: 'RID003'
    },
    {
      id: 4,
      rider: 'Sunita Verma',
      company: 'Zomato',
      earningDate: '2024-01-12',
      orderCount: 15,
      amount: '₹1,200.00',
      status: 'rejected',
      createdDate: '2024-01-12',
      riderContact: '+91 9876543213',
      riderId: 'RID004'
    },
    {
      id: 5,
      rider: 'Vikram Patel',
      company: 'Swiggy',
      earningDate: '2024-01-11',
      orderCount: 35,
      amount: '₹4,100.00',
      status: 'approved',
      createdDate: '2024-01-11',
      approvedDate: '2024-01-12',
      riderContact: '+91 9876543214',
      riderId: 'RID005'
    }
  ];

  const riderOptions = [
    { value: 'Rajesh Kumar', label: 'Rajesh Kumar' },
    { value: 'Priya Sharma', label: 'Priya Sharma' },
    { value: 'Amit Singh', label: 'Amit Singh' },
    { value: 'Sunita Verma', label: 'Sunita Verma' },
    { value: 'Vikram Patel', label: 'Vikram Patel' },
    { value: 'Mahendra Reddy', label: 'Mahendra Reddy' },
    { value: 'Kavitha Rao', label: 'Kavitha Rao' }
  ];

  const companyOptions = [
    { value: 'Zomato', label: 'Zomato' },
    { value: 'Swiggy', label: 'Swiggy' },
    { value: 'Uber Eats', label: 'Uber Eats' },
    { value: 'Dunzo', label: 'Dunzo' },
    { value: 'BigBasket', label: 'BigBasket' }
  ];

  const columns = [
    { field: 'rider', headerName: 'RIDER' },
    { field: 'company', headerName: 'COMPANY' },
    { 
      field: 'earningDate', 
      headerName: 'EARNING DATE',
      render: (value) => new Date(value).toLocaleDateString('en-IN')
    },
    { field: 'orderCount', headerName: 'ORDER COUNT' },
    { field: 'amount', headerName: 'AMOUNT', type: 'currency' },
    { field: 'status', headerName: 'STATUS', type: 'status' }
  ];

  const tabs = [
    { 
      label: 'All Earnings', 
      value: 'all', 
      count: mockEarningData.length, 
      color: 'default' 
    },
    { 
      label: 'Pending', 
      value: 'pending', 
      count: mockEarningData.filter(e => e.status === 'pending').length, 
      color: 'warning' 
    },
    { 
      label: 'Approved', 
      value: 'approved', 
      count: mockEarningData.filter(e => e.status === 'approved').length, 
      color: 'info' 
    },
    { 
      label: 'Rejected', 
      value: 'rejected', 
      count: mockEarningData.filter(e => e.status === 'rejected').length, 
      color: 'error' 
    },
    { 
      label: 'Settled', 
      value: 'settled', 
      count: mockEarningData.filter(e => e.status === 'settled').length, 
      color: 'success' 
    }
  ];

  const statusColors = {
    pending: 'warning',
    approved: 'info',
    rejected: 'error',
    settled: 'success'
  };

  const filters = [
    {
      field: 'rider',
      label: 'Filter by Rider',
      options: riderOptions
    },
    {
      field: 'company',
      label: 'Filter by Company',
      options: companyOptions
    }
  ];

  const actions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      title: 'View Details',
      onClick: (item) => handleView(item)
    },
    {
      icon: <EditIcon fontSize="small" />,
      color: 'secondary',
      title: 'Edit',
      onClick: (item) => handleEdit(item)
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      color: 'error',
      title: 'Delete',
      onClick: (item) => handleDelete(item)
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setEarnings(mockEarningData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowAddModal(true);
  };

  const handleView = (item) => {
    setViewData(item);
    setShowViewPage(true);
  };

  const handleDelete = (item) => {
    if (window.confirm('Are you sure you want to delete this earning record?')) {
      const updatedEarnings = earnings.filter(earning => earning.id !== item.id);
      setEarnings(updatedEarnings);
    }
  };

  const handleSave = (formData) => {
    if (editData) {
      // Update existing earning
      const updatedEarnings = earnings.map(earning =>
        earning.id === editData.id ? { ...earning, ...formData } : earning
      );
      setEarnings(updatedEarnings);
    } else {
      // Add new earning
      const newEarning = {
        ...formData,
        id: Date.now(),
        createdDate: new Date().toISOString().split('T')[0],
        riderContact: '+91 9876543210', // Default contact
        riderId: `RID${String(earnings.length + 1).padStart(3, '0')}`
      };
      setEarnings([...earnings, newEarning]);
    }
    setShowAddModal(false);
    setEditData(null);
  };

  const handleBackFromView = () => {
    setShowViewPage(false);
    setViewData(null);
  };

  const handleEditFromView = (item) => {
    setShowViewPage(false);
    setEditData(item);
    setShowAddModal(true);
  };

  // Show view page if viewing an earning
  if (showViewPage && viewData) {
    return (
      <EarningViewPage
        earningData={viewData}
        onBack={handleBackFromView}
        onEdit={handleEditFromView}
      />
    );
  }

  return (
    <>
      <ReusableTable
        title="Rider Earnings"
        data={earnings}
        columns={columns}
        tabs={tabs}
        loading={loading}
        onDataChange={setEarnings}
        searchFields={['rider', 'company']}
        statusField="status"
        statusColors={statusColors}
        actions={actions}
        onAdd={handleAdd}
        addButtonText="Add Earning"
        filters={filters}
        showAddButton={true}
      />

      <AddEarningModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        riders={riderOptions}
        companies={companyOptions}
      />
    </>
  );
};

export default RiderEarningPage;