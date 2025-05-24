import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import type { AttendanceRecord } from './types';

const Attendance: React.FC = () => {
  // Sample attendance data
  const attendanceData: AttendanceRecord[] = [
    { date: '2023-05-01', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present' },
    { date: '2023-05-02', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'present' },
    { date: '2023-05-03', checkIn: '-', checkOut: '-', status: 'absent' },
    { date: '2023-05-04', checkIn: '10:00 AM', checkOut: '03:00 PM', status: 'half-day' },
    { date: '2023-05-05', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'present' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'success.main';
      case 'absent': return 'error.main';
      case 'half-day': return 'warning.main';
      default: return 'text.primary';
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Attendance Records
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.checkIn}</TableCell>
                <TableCell>{row.checkOut}</TableCell>
                <TableCell sx={{ color: getStatusColor(row.status) }}>
                  {row.status === 'half-day' ? 'Half Day' : row.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Attendance Summary
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Typography>Present: 3 days</Typography>
          <Typography>Absent: 1 day</Typography>
          <Typography>Half Day: 1 day</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Attendance;