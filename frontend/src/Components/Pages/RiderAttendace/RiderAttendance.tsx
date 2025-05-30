import { useEffect, useState } from 'react';
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
import apiService from '../../../services/apiService';

// Define AttendanceRecord type for attendance data
interface AttendanceRecord {
  id: number;
  date: string;
  riderName: string;
  punchIn: string;
  punchOut: string;
  status: string;
  totalHours: string;
}

// Main App Component
const RiderAttendanceApp = () => {
  const theme = useTheme();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all attendance records from backend using apiService
        const data = await apiService.get('/attendance/all');
        // Map backend fields to frontend fields if needed
        const mapped: AttendanceRecord[] = data.map((item: any) => ({
          id: item.id,
          date: item.attendance_date,
          riderName: item.rider_name ? item.rider_name : '-',
          punchIn: item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          punchOut: item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '-',
          totalHours: item.check_in_time && item.check_out_time ?
            (() => {
              const inTime = new Date(item.check_in_time);
              const outTime = new Date(item.check_out_time);
              const diffMs = outTime.getTime() - inTime.getTime();
              const hours = Math.floor(diffMs / 3600000);
              const mins = Math.floor((diffMs % 3600000) / 60000);
              return `${hours + (mins/60)} hrs`;
            })() : '-',
        }));
        setAttendanceData(mapped);
      } catch (err: any) {
        setError(err.message || 'Error loading attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Table columns configuration
  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value: string) => (
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
      render: (value: string) => (
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
      render: (value: string) => (
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
      render: (value: string) => (
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
      render: (value: string) => {
        const getStatusColor = (status: string) => {
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
            color={getStatusColor(value) as any} 
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
      render: (value: string) => (
        <Typography variant="body2" fontWeight="700" color="primary.main">
          {value}
        </Typography>
      )
    }
  ];

  // Generate unique values for filters
  const uniqueRiders = [...new Set(attendanceData.map(item => item.riderName))].sort();
  const uniqueStatuses = [...new Set(attendanceData.map(item => item.status))].sort();
  const uniqueMonths = [...new Set(attendanceData.map(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1;
  }))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(attendanceData.map(item => {
    const date = new Date(item.date);
    return date.getFullYear();
  }))].sort((a, b) => b - a);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
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
      data={attendanceData}
      columns={columns}
      CardComponent={AttendanceCard}
      searchFields={['riderName', 'date', 'status']}
      filters={filters}
      title="🚴‍♂️ Rider Attendance Management"
      description="View, search, and filter attendance records for all riders. Use the filters to narrow down by name, status, month, or year."
      emptyMessage={loading ? 'Loading attendance records...' : (error || 'No attendance records found for the selected criteria.')}
    />
  );
};

export default RiderAttendanceApp;