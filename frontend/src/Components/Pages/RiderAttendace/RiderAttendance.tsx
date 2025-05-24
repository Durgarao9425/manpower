import React from 'react';
import {
  Typography,
  Chip,
  Avatar,
  Box,
  useTheme
} from '@mui/material';
import {
  Person
} from '@mui/icons-material';
import ReusableListingPage from './AttendanceListingPage';
import AttendanceCard from './AttendanceCard';

// Sample data
const sampleAttendanceData = [
  {
    id: 1,
    date: '2024-05-24',
    riderName: 'John Smith',
    punchIn: '08:00 AM',
    punchOut: '05:30 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 2,
    date: '2024-05-24',
    riderName: 'Sarah Johnson',
    punchIn: '08:15 AM',
    punchOut: '05:45 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 3,
    date: '2024-05-24',
    riderName: 'Mike Wilson',
    punchIn: '08:30 AM',
    punchOut: '04:00 PM',
    status: 'Early Leave',
    totalHours: '7.5 hrs'
  },
  {
    id: 4,
    date: '2024-05-23',
    riderName: 'Emily Davis',
    punchIn: '-',
    punchOut: '-',
    status: 'Absent',
    totalHours: '0 hrs'
  },
  {
    id: 5,
    date: '2024-05-23',
    riderName: 'John Smith',
    punchIn: '09:00 AM',
    punchOut: '06:00 PM',
    status: 'Late',
    totalHours: '9 hrs'
  },
  {
    id: 6,
    date: '2024-05-22',
    riderName: 'Sarah Johnson',
    punchIn: '07:45 AM',
    punchOut: '05:15 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 7,
    date: '2024-04-22',
    riderName: 'Mike Wilson',
    punchIn: '08:00 AM',
    punchOut: '05:30 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 8,
    date: '2024-03-25',
    riderName: 'Emily Davis',
    punchIn: '08:10 AM',
    punchOut: '05:40 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 9,
    date: '2024-02-15',
    riderName: 'Alex Brown',
    punchIn: '08:05 AM',
    punchOut: '05:35 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 10,
    date: '2023-12-20',
    riderName: 'Lisa Chen',
    punchIn: '08:20 AM',
    punchOut: '05:20 PM',
    status: 'Present',
    totalHours: '9 hrs'
  },
  {
    id: 11,
    date: '2024-01-15',
    riderName: 'David Miller',
    punchIn: '08:00 AM',
    punchOut: '05:30 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  },
  {
    id: 12,
    date: '2024-01-16',
    riderName: 'Jessica Taylor',
    punchIn: '-',
    punchOut: '-',
    status: 'Absent',
    totalHours: '0 hrs'
  },
  {
    id: 13,
    date: '2024-02-10',
    riderName: 'Robert Garcia',
    punchIn: '08:45 AM',
    punchOut: '05:30 PM',
    status: 'Late',
    totalHours: '8.75 hrs'
  },
  {
    id: 14,
    date: '2024-03-05',
    riderName: 'Amanda Lee',
    punchIn: '08:00 AM',
    punchOut: '03:30 PM',
    status: 'Early Leave',
    totalHours: '7.5 hrs'
  },
  {
    id: 15,
    date: '2024-06-01',
    riderName: 'Chris Anderson',
    punchIn: '08:00 AM',
    punchOut: '05:30 PM',
    status: 'Present',
    totalHours: '9.5 hrs'
  }
];

// Main App Component
const RiderAttendanceApp = () => {
  const theme = useTheme();
  
  // Table columns configuration
  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value) => (
        <Typography variant="body2" fontWeight="500">
          {new Date(value).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Typography>
      )
    },
    { 
      key: 'riderName', 
      label: 'Rider Name',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 28, height: 28, backgroundColor: theme.palette.primary.main }}>
            <Person fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight="600">
            {value}
          </Typography>
        </Box>
      )
    },
    { 
      key: 'punchIn', 
      label: 'Punch In',
      render: (value) => (
        <Typography 
          variant="body2" 
          fontWeight="600"
          color={value === '-' ? 'text.secondary' : 'success.main'}
        >
          {value}
        </Typography>
      )
    },
    { 
      key: 'punchOut', 
      label: 'Punch Out',
      render: (value) => (
        <Typography 
          variant="body2" 
          fontWeight="600"
          color={value === '-' ? 'text.secondary' : 'error.main'}
        >
          {value}
        </Typography>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        const getStatusColor = (status) => {
          switch (status.toLowerCase()) {
            case 'present': return 'success';
            case 'absent': return 'error';
            case 'late': return 'warning';
            case 'early leave': return 'info';
            default: return 'default';
          }
        };
        
        return (
          <Chip 
            label={value} 
            color={getStatusColor(value)} 
            size="small"
            sx={{ 
              fontWeight: 'bold',
              borderRadius: 2
            }}
          />
        );
      }
    },
    { 
      key: 'totalHours', 
      label: 'Total Hours',
      render: (value) => (
        <Typography variant="body2" fontWeight="700" color="primary.main">
          {value}
        </Typography>
      )
    }
  ];

  // Generate unique values for filters
  const uniqueRiders = [...new Set(sampleAttendanceData.map(item => item.riderName))].sort();
  const uniqueStatuses = [...new Set(sampleAttendanceData.map(item => item.status))].sort();
  
  // Generate date filter options
  const uniqueMonths = [...new Set(sampleAttendanceData.map(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1;
  }))].sort((a, b) => a - b);

  const uniqueYears = [...new Set(sampleAttendanceData.map(item => {
    const date = new Date(item.date);
    return date.getFullYear();
  }))].sort((a, b) => b - a);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter configurations
  const filters = {
    riderName: {
      label: 'Rider Name',
      options: uniqueRiders.map(name => ({ value: name, label: name }))
    },
    status: {
      label: 'Status',
      options: uniqueStatuses.map(status => ({ value: status, label: status }))
    },
    month: {
      label: 'Month',
      options: uniqueMonths.map(month => ({
        value: month.toString(),
        label: monthNames[month - 1]
      }))
    },
    year: {
      label: 'Year',
      options: uniqueYears.map(year => ({
        value: year.toString(),
        label: year.toString()
      }))
    }
  };

  return (
    <ReusableListingPage
      data={sampleAttendanceData}
      columns={columns}
      CardComponent={AttendanceCard}
      searchFields={['riderName', 'date', 'status']}
      filters={filters}
      title="🚴‍♂️ Rider Attendance Management"
      description="View, search, and filter attendance records for all riders. Use the filters to narrow down by name, status, month, or year."
      emptyMessage="No attendance records found for the selected criteria."
    />
  );
};

export default RiderAttendanceApp;