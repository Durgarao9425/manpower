import { Alert, alpha, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Modal, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import durgarao from '../../../Images/durgarao.jpeg';
import {
    SwipeRight as SwipeRightIcon,
    Close as CloseIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import {
    ArrowForward,
    Close,
    Person,
    AccessTime,
    FilterList
} from '@mui/icons-material';


// Types
interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}

interface SliderImage {
    id: number;
    url: string;
    title: string;
}

interface AttendanceRecord {
    date: string;
    status: string;
    hours: number;
    earnings: string;
}

// Dashboard Component
const Dashboard: React.FC = () => {
    const sliderImages: SliderImage[] = [
        {
            id: 1,
            url: 'https://placehold.co/350x150/4CAF50/FFFFFF?text=Important+Notice',
            title: 'Important Notice 1',
        },
        {
            id: 2,
            url: 'https://placehold.co/350x150/2196F3/FFFFFF?text=Safety+Guidelines',
            title: 'Safety Guidelines',
        },
        {
            id: 3,
            url: 'https://placehold.co/350x150/FF9800/FFFFFF?text=New+Updates',
            title: 'New Updates',
        },
    ];


    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ padding: '16px' }}>
            {/* Image Slider */}
            <div style={{
                position: 'relative',
                marginBottom: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                height: '180px'
            }}>
                <img
                    src={sliderImages[currentSlide].url}
                    alt={sliderImages[currentSlide].title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    padding: '16px',
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                        {sliderImages[currentSlide].title}
                    </h3>
                </div>
                {/* Slide indicators */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '16px',
                    display: 'flex',
                    gap: '8px',
                }}>
                    {sliderImages.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Today's Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <StatsCard title="Orders" value="12" color="#4caf50" />
                <StatsCard title="Earnings" value="₹1,250" color="#ff9800" />
            </div>
        </div>
    );
};

// Orders Component
const Orders: React.FC = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const orderCards: CardData[] = [
        { title: 'Total Orders', value: 45, color: '#2196f3' },
        { title: 'Weekly Earnings', value: '₹8,750', color: '#4caf50' },
        { title: 'Advance Request', value: '₹2,000', color: '#ff9800' },
        { title: 'Advance Paid', value: '₹1,500', color: '#9c27b0' },
        { title: 'Advance Pending', value: '₹500', color: '#f44336' },
        { title: 'Due Amount', value: '₹300', color: '#795548' },
    ];

    const handleFilter = () => {
        console.log('Filtering data from', startDate, 'to', endDate);
        // Filter logic here
    };

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Orders Overview
            </h3>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {orderCards.map((card, index) => (
                    <InfoCard key={index} {...card} />
                ))}
            </div>

            {/* Date Filter */}
            <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFilter={handleFilter}
            />
        </div>
    );
};

// Payments Component
const Payments: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const paymentCards: CardData[] = [
        { title: 'Statement Earnings', value: '₹12,500', color: '#4caf50' },
        { title: 'Weekly Gross Earning', value: '₹8,750', color: '#2196f3' },
        { title: 'Advance Request', value: '₹2,000', color: '#ff9800' },
        { title: 'TDS 1.0%', value: '₹125', color: '#f44336' },
        { title: 'Net Paid Amount', value: '₹11,125', color: '#9c27b0' },
        { title: 'Payment Status', value: 'Paid', color: '#4caf50' },
    ];

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Payment Details
            </h3>

            {/* Payment Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {paymentCards.map((card, index) => (
                    <InfoCard key={index} {...card} />
                ))}
            </div>

            {/* Tabs */}
            <TabPanel activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

// Attendance Component
// const Attendance: React.FC = () => {
//     const attendanceData: AttendanceRecord[] = [
//         { date: '2024-05-24', status: 'Present', hours: 8.5, earnings: '₹950' },
//         { date: '2024-05-23', status: 'Present', hours: 9.0, earnings: '₹1,100' },
//         { date: '2024-05-22', status: 'Absent', hours: 0, earnings: '₹0' },
//         { date: '2024-05-21', status: 'Present', hours: 7.5, earnings: '₹850' },
//     ];

//     return (
//         <div style={{ padding: '16px' }}>
//             <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
//                 Attendance Record
//             </h3>

//             {/* Summary Cards */}
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
//                 <StatsCard title="This Month" value="22 Days" color="#4caf50" />
//                 <StatsCard title="Total Hours" value="180.5" color="#2196f3" />
//             </div>

//             {/* Attendance List */}
//             <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                 overflow: 'hidden'
//             }}>
//                 {attendanceData.map((record, index) => (
//                     <div
//                         key={index}
//                         style={{
//                             padding: '16px',
//                             borderBottom: index < attendanceData.length - 1 ? '1px solid #e0e0e0' : 'none',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                         }}
//                     >
//                         <div>
//                             <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
//                                 {record.date}
//                             </div>
//                             <div style={{
//                                 fontSize: '12px',
//                                 color: record.status === 'Present' ? '#4caf50' : '#f44336'
//                             }}>
//                                 {record.status} • {record.hours}h
//                             </div>
//                         </div>
//                         <div style={{ fontSize: '18px', color: '#1976d2', fontWeight: 'bold' }}>
//                             {record.earnings}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
// const Attendance: React.FC = () => {
//   // Sample attendance data
//   const attendanceData: AttendanceRecord[] = [
//     { date: '2023-05-01', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present' },
//     { date: '2023-05-02', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'present' },
//     { date: '2023-05-03', checkIn: '-', checkOut: '-', status: 'absent' },
//     { date: '2023-05-04', checkIn: '10:00 AM', checkOut: '03:00 PM', status: 'half-day' },
//     { date: '2023-05-05', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'present' },
//   ];

//   const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'present': return 'success.main';
//       case 'absent': return 'error.main';
//       case 'half-day': return 'warning.main';
//       default: return 'text.primary';
//     }
//   };

//   return (
//     <Box sx={{ p: 2, pb: 8 }}>
//       <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
//         Attendance Records
//       </Typography>

//       <TableContainer component={Paper} sx={{ mt: 2 }}>
//         <Table size="small">
//           <TableHead>
//             <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
//               <TableCell>Date</TableCell>
//               <TableCell>Check In</TableCell>
//               <TableCell>Check Out</TableCell>
//               <TableCell>Status</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {attendanceData.map((row, index) => (
//               <TableRow key={index}>
//                 <TableCell>{row.date}</TableCell>
//                 <TableCell>{row.checkIn}</TableCell>
//                 <TableCell>{row.checkOut}</TableCell>
//                 <TableCell sx={{ color: getStatusColor(row.status) }}>
//                   {row.status === 'half-day' ? 'Half Day' : row.status}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//         <Typography variant="subtitle2" gutterBottom>
//           Attendance Summary
//         </Typography>
//         <Box display="flex" justifyContent="space-between">
//           <Typography>Present: 3 days</Typography>
//           <Typography>Absent: 1 day</Typography>
//           <Typography>Half Day: 1 day</Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// };



const Attendance = () => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [attendanceState, setAttendanceState] = useState('punch-in');
    const [punchInTime, setPunchInTime] = useState(null);
    const [punchOutTime, setPunchOutTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workingTime, setWorkingTime] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    // Modal states
    const [showAbsentModal, setShowAbsentModal] = useState(false);
    const [absentReason, setAbsentReason] = useState('');

    // Filter states
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const buttonRef = useRef(null);
    const startXRef = useRef(0);
    const workingTimerRef = useRef(null);
    const maxDragDistance = 280;

    const absentReasons = [
        'Sick Leave',
        'Personal Leave',
        'Emergency',
        'Medical Appointment',
        'Family Emergency',
        'Other'
    ];

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Working time timer
    useEffect(() => {
        if (attendanceState === 'punch-out' && punchInTime) {
            workingTimerRef.current = setInterval(() => {
                setWorkingTime(Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000));
            }, 1000);
        } else {
            if (workingTimerRef.current) {
                clearInterval(workingTimerRef.current);
                workingTimerRef.current = null;
            }
        }

        return () => {
            if (workingTimerRef.current) {
                clearInterval(workingTimerRef.current);
            }
        };
    }, [attendanceState, punchInTime]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const calculateWorkHours = (startTime, endTime) => {
        if (startTime && endTime) {
            const diff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            return formatDuration(diff);
        }
        return '0h 0m';
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const handleStart = (clientX) => {
        if (attendanceState === 'completed') return;
        setIsDragging(true);
        startXRef.current = clientX - dragX;
    };

    const handleMove = (clientX) => {
        if (!isDragging || attendanceState === 'completed') return;

        const newX = clientX - startXRef.current;
        const clampedX = Math.max(0, Math.min(newX, maxDragDistance));
        setDragX(clampedX);
    };

    const handleEnd = () => {
        if (!isDragging || attendanceState === 'completed') return;
        setIsDragging(false);

        if (dragX > maxDragDistance * 0.85) {
            setDragX(maxDragDistance);

            setTimeout(() => {
                const now = new Date();
                if (attendanceState === 'punch-in') {
                    setPunchInTime(now);
                    setAttendanceState('punch-out');
                    setWorkingTime(0);
                    showToastMessage('Punched in successfully!');
                } else if (attendanceState === 'punch-out') {
                    setPunchOutTime(now);
                    setAttendanceState('completed');

                    if (workingTimerRef.current) {
                        clearInterval(workingTimerRef.current);
                        workingTimerRef.current = null;
                    }

                    const totalHours = calculateWorkHours(punchInTime, now);

                    const newRecord = {
                        id: Date.now(),
                        date: now,
                        punchIn: punchInTime,
                        punchOut: now,
                        totalHours,
                        status: 'Present',
                        reason: null
                    };
                    setAttendanceRecords(prev => [newRecord, ...prev]);

                    showToastMessage(`Attendance completed! Total hours: ${totalHours}`);
                }
                setDragX(0);
            }, 300);
        } else {
            setDragX(0);
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    const handleTouchStart = (e) => {
        handleStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragX]);

    const progressPercentage = (dragX / maxDragDistance) * 100;

    const resetAttendance = () => {
        setAttendanceState('punch-in');
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingTime(0);
        setDragX(0);
        if (workingTimerRef.current) {
            clearInterval(workingTimerRef.current);
            workingTimerRef.current = null;
        }
    };

    const handleMarkAsAbsent = () => {
        if (!absentReason) return;

        const now = new Date();
        const newRecord = {
            id: Date.now(),
            date: now,
            punchIn: null,
            punchOut: null,
            totalHours: '0h 0m',
            status: 'Absent',
            reason: absentReason
        };

        setAttendanceRecords(prev => [newRecord, ...prev]);
        setShowAbsentModal(false);
        setAbsentReason('');
        showToastMessage('Marked as absent successfully!');
    };

    const filteredRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === filterMonth && recordDate.getFullYear() === filterYear;
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Toast Notification */}
            <Snackbar
                open={showToast}
                autoHideDuration={4000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowToast(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>

            {/* Main Attendance Card */}
            <Card elevation={0} sx={{ borderRadius: 3, mb: 4, bgcolor: '#f8f9fa' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* Header */}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        READY TO START
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Today, {formatDate(currentTime)}
                    </Typography>
                    <Typography variant="h3" color="primary.main" fontWeight="bold" mb={4}>
                        {formatTime(currentTime)}
                    </Typography>

                    {/* Working Timer */}
                    {attendanceState === 'punch-out' && (
                        <Box mb={3}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                                    border: '1px solid rgba(25, 118, 210, 0.3)',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Working Time
                                </Typography>
                                <Typography variant="h4" color="primary.main" fontWeight="bold">
                                    {formatDuration(workingTime)}
                                </Typography>
                            </Paper>
                        </Box>
                    )}

                    {/* Swipe Button */}
                    {attendanceState !== 'completed' && (
                        <Box mb={3}>
                            <Paper
                                elevation={0}
                                sx={{
                                    position: 'relative',
                                    height: 64,
                                    bgcolor: attendanceState === 'punch-in' ? '#4caf50' : '#f44336',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: attendanceState === 'completed' ? 'default' : 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                {/* Progress Background */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${progressPercentage}%`,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        transition: isDragging ? 'none' : 'width 0.3s ease-out'
                                    }}
                                />

                                {/* Center Text */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    height="100%"
                                    position="relative"
                                    zIndex={1}
                                >
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        sx={{ color: 'white' }}
                                    >
                                        Swipe to {attendanceState === 'punch-in' ? 'Punch In' : 'Punch Out'}
                                    </Typography>
                                </Box>

                                {/* Draggable Slider Circle */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 4,
                                        top: 4,
                                        width: 56,
                                        height: 56,
                                        bgcolor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isDragging ? 'grabbing' : 'grab',
                                        transform: `translateX(${dragX}px) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
                                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        zIndex: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        '&:hover': {
                                            transform: `translateX(${dragX}px) scale(1.05)`
                                        }
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onTouchStart={handleTouchStart}
                                >
                                    <ArrowForward
                                        sx={{
                                            color: attendanceState === 'punch-in' ? '#4caf50' : '#f44336',
                                            fontSize: 24
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    {/* Mark as Absent Button */}
                    {attendanceState === 'punch-in' && (
                        <Button
                            variant="outlined"
                            startIcon={<Person />}
                            onClick={() => setShowAbsentModal(true)}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            MARK AS ABSENT
                        </Button>
                    )}

                    {/* Completed State */}
                    {attendanceState === 'completed' && (
                        <Box>
                            <Chip
                                label="Day Completed"
                                color="success"
                                size="large"
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            />
                            <br />
                            <Button
                                variant="outlined"
                                onClick={resetAttendance}
                                sx={{ textTransform: 'none' }}
                            >
                                Start New Day
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Monthly Log Section */}
            <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#f8f9fa' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Monthly Log
                    </Typography>

                    {/* Filters */}
                    <Box display="flex" gap={2} mb={3} alignItems="center">
                        <FilterList color="action" />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={filterMonth}
                                label="Month"
                                onChange={(e) => setFilterMonth(e.target.value)}
                            >
                                {months.map((month, index) => (
                                    <MenuItem key={index} value={index}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={filterYear}
                                label="Year"
                                onChange={(e) => setFilterYear(e.target.value)}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Records Table */}
                    {filteredRecords.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <Typography variant="body1" color="text.secondary">
                                No attendance records found for {months[filterMonth]} {filterYear}.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Punch In</strong></TableCell>
                                        <TableCell><strong>Punch Out</strong></TableCell>
                                        <TableCell><strong>Total Hours</strong></TableCell>
                                        <TableCell><strong>Reason</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{formatDate(record.date)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={record.status}
                                                    color={record.status === 'Present' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {record.punchIn ? formatTime(record.punchIn) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {record.punchOut ? formatTime(record.punchOut) : '-'}
                                            </TableCell>
                                            <TableCell>{record.totalHours}</TableCell>
                                            <TableCell>{record.reason || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Absent Modal */}
            <Modal
                open={showAbsentModal}
                onClose={() => setShowAbsentModal(false)}
                aria-labelledby="absent-modal-title"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight="bold">
                            Mark as Absent
                        </Typography>
                        <IconButton onClick={() => setShowAbsentModal(false)}>
                            <Close />
                        </IconButton>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Reason for Absence</InputLabel>
                        <Select
                            value={absentReason}
                            label="Reason for Absence"
                            onChange={(e) => setAbsentReason(e.target.value)}
                        >
                            {absentReasons.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                    {reason}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={() => setShowAbsentModal(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleMarkAsAbsent}
                            disabled={!absentReason}
                            sx={{ textTransform: 'none' }}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
};





const Settings: React.FC = () => {
    const [notifications, setNotifications] = useState({
        orderAlerts: true,
        paymentUpdates: true,
        promotionalOffers: false,
        systemUpdates: true
    });

    const [language, setLanguage] = useState('english');
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleNotificationToggle = (key: string) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        console.log('Password change requested');
        // Add your password change logic here
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
    };

    const settingSections = [
        {
            title: 'Account Settings',
            items: [
                {
                    icon: '🔒',
                    title: 'Change Password',
                    subtitle: 'Update your account password',
                    action: () => setShowChangePasswordModal(true)
                },
                {
                    icon: '📱',
                    title: 'Phone Number',
                    subtitle: '+91 6303359425',
                    action: () => console.log('Change phone number')
                },
                {
                    icon: '📧',
                    title: 'Email Address',
                    subtitle: 'durgarao9425@gmail.com',
                    action: () => console.log('Change email')
                }
            ]
        },
        {
            title: 'App Preferences',
            items: [
                {
                    icon: '🌐',
                    title: 'Language',
                    subtitle: 'English',
                    action: () => console.log('Change language'),
                    hasDropdown: true
                },
                {
                    icon: '🎨',
                    title: 'Theme',
                    subtitle: 'Light Mode',
                    action: () => console.log('Change theme')
                },
                {
                    icon: '🔊',
                    title: 'Sound Effects',
                    subtitle: 'Enabled',
                    action: () => console.log('Toggle sound')
                }
            ]
        },
        {
            title: 'Privacy & Security',
            items: [
                {
                    icon: '🛡️',
                    title: 'Privacy Policy',
                    subtitle: 'View our privacy policy',
                    action: () => console.log('Privacy policy')
                },
                {
                    icon: '🔐',
                    title: 'Data Security',
                    subtitle: 'Manage your data preferences',
                    action: () => console.log('Data security')
                },
                {
                    icon: '📍',
                    title: 'Location Access',
                    subtitle: 'Always allowed',
                    action: () => console.log('Location settings')
                }
            ]
        },
        {
            title: 'Support & Help',
            items: [
                {
                    icon: '💬',
                    title: 'Contact Support',
                    subtitle: 'Get help from our team',
                    action: () => console.log('Contact support')
                },
                {
                    icon: '❓',
                    title: 'FAQ',
                    subtitle: 'Frequently asked questions',
                    action: () => console.log('FAQ')
                },
                {
                    icon: '📖',
                    title: 'Terms of Service',
                    subtitle: 'View terms and conditions',
                    action: () => console.log('Terms of service')
                }
            ]
        }
    ];

    return (
        <div style={{ padding: '16px', paddingBottom: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 'bold', color: '#333' }}>
                Settings
            </h3>

            {/* Notification Settings */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    🔔 Notifications
                </h4>

                {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div>
                            <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                        </div>
                        <div
                            onClick={() => handleNotificationToggle(key)}
                            style={{
                                width: '32px',
                                height: '16px',
                                borderRadius: '10px',
                                backgroundColor: value ? '#4CAF50' : '#ccc',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                display: 'inline-block'
                            }}
                        >
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '2px',
                                left: value ? '18px' : '2px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }} />
                        </div>

                    </div>
                ))}
            </div>

            {/* Settings Sections */}
            {settingSections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        padding: '16px 20px 12px 20px',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                            {section.title}
                        </h4>
                    </div>

                    {section.items.map((item, itemIndex) => (
                        <div
                            key={itemIndex}
                            onClick={item.action}
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer',
                                borderBottom: itemIndex < section.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                    {item.subtitle}
                                </div>
                            </div>
                            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
                        </div>
                    ))}
                </div>
            ))}

            {/* App Info */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                    Rider Dashboard App
                </div>
                <div style={{ color: '#999', fontSize: '11px' }}>
                    Version 1.0.0 • Build 2024.05.24
                </div>
            </div>

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '400px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>
                                Change Password
                            </h4>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowChangePasswordModal(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePasswordChange}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Logout Component
const Logout: React.FC<{ onNavigate: (pageIndex: number) => void }> = ({ onNavigate }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate()
    const [openSnackbar, setOpenSnackbar] = useState(false);


    const handleLogout = () => {
        console.log('User logged out');
        setShowConfirmModal(false);
        setOpenSnackbar(true); // Show the toast
        navigate('/login');
    };


    return (
        <div style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '300px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                }}>
                    👋
                </div>

                <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#333',
                    fontSize: '20px'
                }}>
                    Ready to Logout?
                </h3>

                <p style={{
                    margin: '0 0 24px 0',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.4'
                }}>
                    You will be signed out of your account and redirected to the login page.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
                    >
                        Yes, Logout
                    </button>

                    <button
                        onClick={() => onNavigate(0)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
                    Logout successfully!
                </Alert>
            </Snackbar>


            {/* Quick Actions */}
            <div style={{
                marginTop: '32px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '300px'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    Before you go...
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                        onClick={() => onNavigate(5)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '18px' }}>👤</span>
                        <span style={{ fontSize: '14px', color: '#333' }}>Update Profile</span>
                    </div>

                    <div
                        onClick={() => onNavigate(6)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '18px' }}>⚙️</span>
                        <span style={{ fontSize: '14px', color: '#333' }}>Check Settings</span>
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '300px',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>

                            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                                Confirm Logout
                            </h4>

                            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
                                Are you sure you want to logout?
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Certificate Component
const Certificate: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedPerformance, setSelectedPerformance] = useState('all');
    const [filteredCertificates, setFilteredCertificates] = useState([]);

    // Sample certificate data
    const certificates = [
        {
            id: 1,
            title: 'Excellence in Service',
            description: 'Outstanding performance for 3 consecutive months',
            month: 'march',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-03-31',
            certificateUrl: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Excellence+Certificate',
            badge: '🏆'
        },
        {
            id: 2,
            title: 'Safe Driving Award',
            description: 'Zero incidents record for Q1 2024',
            month: 'march',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-03-15',
            certificateUrl: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Safe+Driving+Award',
            badge: '🛡️'
        },
        {
            id: 3,
            title: 'Customer Satisfaction',
            description: '4.8+ rating achievement',
            month: 'february',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-02-28',
            certificateUrl: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Customer+Satisfaction',
            badge: '⭐'
        },
        {
            id: 4,
            title: 'Monthly Achiever',
            description: 'Top performer for January 2024',
            month: 'january',
            year: '2024',
            performance: 'medium',
            achievedDate: '2024-01-31',
            certificateUrl: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Monthly+Achiever',
            badge: '🎯'
        },
        {
            id: 5,
            title: 'Punctuality Award',
            description: 'Perfect attendance record',
            month: 'december',
            year: '2023',
            performance: 'medium',
            achievedDate: '2023-12-31',
            certificateUrl: 'https://via.placeholder.com/400x300/607D8B/FFFFFF?text=Punctuality+Award',
            badge: '⏰'
        }
    ];

    const months = [
        { value: 'all', label: 'All Months' },
        { value: 'january', label: 'January' },
        { value: 'february', label: 'February' },
        { value: 'march', label: 'March' },
        { value: 'april', label: 'April' },
        { value: 'may', label: 'May' },
        { value: 'june', label: 'June' },
        { value: 'july', label: 'July' },
        { value: 'august', label: 'August' },
        { value: 'september', label: 'September' },
        { value: 'october', label: 'October' },
        { value: 'november', label: 'November' },
        { value: 'december', label: 'December' }
    ];

    const years = ['2024', '2023', '2022'];
    const performanceLevels = [
        { value: 'all', label: 'All Levels' },
        { value: 'high', label: 'High Performance' },
        { value: 'medium', label: 'Medium Performance' },
        { value: 'low', label: 'Low Performance' }
    ];

    useEffect(() => {
        applyFilters();
    }, [selectedMonth, selectedYear, selectedPerformance]);

    const applyFilters = () => {
        let filtered = certificates.filter(cert => {
            const monthMatch = selectedMonth === 'all' || cert.month === selectedMonth;
            const yearMatch = cert.year === selectedYear;
            const performanceMatch = selectedPerformance === 'all' || cert.performance === selectedPerformance;

            return monthMatch && yearMatch && performanceMatch;
        });

        setFilteredCertificates(filtered);
    };

    const handleDownloadCertificate = (certificate) => {
        console.log('Downloading certificate:', certificate.title);
        // In a real app, you would trigger download here
        window.open(certificate.certificateUrl, '_blank');
    };

    const handleViewCertificate = (certificate) => {
        console.log('Viewing certificate:', certificate.title);
        window.open(certificate.certificateUrl, '_blank');
    };

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
                My Certificates
            </h3>

            {/* Filter Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    🔍 Filter Certificates
                </h4>

                <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                    {/* Month Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Performance Level Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Performance Level
                        </label>
                        <select
                            value={selectedPerformance}
                            onChange={(e) => setSelectedPerformance(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {performanceLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={applyFilters}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                >
                    Apply Filters ({filteredCertificates.length} results)
                </button>
            </div>

            {/* Results Summary */}
            <div style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <span style={{ fontSize: '14px', color: '#1976d2' }}>
                    Showing {filteredCertificates.length} certificate(s) for {selectedYear}
                    {selectedMonth !== 'all' && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
                    {selectedPerformance !== 'all' && ` - ${performanceLevels.find(p => p.value === selectedPerformance)?.label}`}
                </span>
            </div>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredCertificates.map((certificate) => (
                        <div
                            key={certificate.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '1px solid #f0f0f0'
                            }}
                        >
                            {/* Certificate Image */}
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={certificate.certificateUrl}
                                    alt={certificate.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    borderRadius: '20px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: certificate.performance === 'high' ? '#4caf50' :
                                        certificate.performance === 'medium' ? '#ff9800' : '#f44336'
                                }}>
                                    {certificate.performance.toUpperCase()}
                                </div>
                            </div>

                            {/* Certificate Details */}
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>{certificate.badge}</span>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '16px' }}>
                                            {certificate.title}
                                        </h4>
                                        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                                            {certificate.description}
                                        </p>
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            Achieved on: {certificate.achievedDate}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleViewCertificate(certificate)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={() => handleDownloadCertificate(certificate)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📥 Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>No certificates found</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Try adjusting your filters or check back later for new achievements.
                    </p>
                </div>
            )}
        </div>
    );
};


const More: React.FC<{ onNavigate: (pageIndex: number) => void }> = ({ onNavigate }) => {
    const moreMenuItems = [
        {
            icon: '📊',
            text: 'Dashboard',
            action: () => onNavigate(0)
        },
        {
            icon: '👤',
            text: 'Profile',
            action: () => onNavigate(5)
        },
        {
            icon: '💳',
            text: 'Payments',
            action: () => onNavigate(2)
        },
        {
            icon: '📜',
            text: 'Certificate',
            action: () => onNavigate(7)  // Navigate to Certificate page
        },

        {
            icon: '⚙️',  // Added Settings
            text: 'Settings',
            action: () => onNavigate(6)  // Navigate to Settings page
        },
        {
            icon: '🚪',
            text: 'Logout',
            action: () => onNavigate(8)  // Navigate to Logout page
        }
    ];

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 'bold', color: '#333' }}>
                More Options
            </h3>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {moreMenuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={item.action}
                        style={{
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            borderBottom: index < moreMenuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '24px' }}>{item.icon}</span>
                        <span style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{item.text}</span>
                        <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: '18px' }}>›</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Settings Component


// Reusable Components
const StatsCard: React.FC<{ title: string; value: string; color: string }> = ({
    title,
    value,
    color,
}) => (
    <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            {title}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>
            {value}
        </div>
    </div>
);

const InfoCard: React.FC<CardData> = ({ title, value, color = '#1976d2' }) => (
    <div style={{
        padding: '16px',
        borderRadius: '12px',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {title}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>
            {value}
        </div>
    </div>
);

const DateFilter: React.FC<{
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onFilter: () => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
            Filter by Date Range
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Start Date
                </div>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    End Date
                </div>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
        <button
            onClick={onFilter}
            style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        >
            Apply Filter
        </button>
    </div>
);

const TabPanel: React.FC<{ activeTab: number; onTabChange: (tab: number) => void }> = ({
    activeTab,
    onTabChange,
}) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
            {['Statement Summary', 'Final Payment'].map((tab, index) => (
                <div
                    key={index}
                    onClick={() => onTabChange(index)}
                    style={{
                        flex: 1,
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: activeTab === index ? '#1976d2' : 'transparent',
                        color: activeTab === index ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 'bold',
                        fontSize: '10px'
                    }}
                >
                    {tab}
                </div>
            ))}
        </div>
        <div style={{ padding: '24px' }}>
            {activeTab === 0 ? (
                <div>
                    <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Statement Summary</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Total Rides</span>
                            <span style={{ fontWeight: 'bold' }}>156</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Base Fare</span>
                            <span style={{ fontWeight: 'bold' }}>₹8,750</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Incentives</span>
                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>₹1,250</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>Total Earnings</span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1976d2' }}>₹10,000</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Final Payment Details</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Gross Amount</span>
                            <span style={{ fontWeight: 'bold' }}>₹10,000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>TDS (1%)</span>
                            <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₹100</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Fuel Allowance</span>
                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>₹500</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>Net Payable</span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#4caf50' }}>₹10,400</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// Profile Component
const Profile: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            marginBottom: '24px'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 16px'
            }}>
                <img
                    src={durgarao}
                    alt="Rider"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Durgarao Goriparthi</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ID: RD001234</p>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>+91 6303359425</p>
        </div>

        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            {[
                { icon: '📄', label: 'Documents', value: 'All Verified' },
                { icon: '🏆', label: 'Rating', value: '4.8/5' },
                { icon: '🚗', label: 'Vehicle', value: 'Honda City' },
                { icon: '📅', label: 'Joined', value: 'Jan 2024' },
            ].map((item, index) => (
                <div
                    key={index}
                    style={{
                        padding: '16px',
                        borderBottom: index < 3 ? '1px solid #e0e0e0' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{item.value}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Main App Component
const RiderDashboardApp: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: '🏠' },
        { label: 'Orders', icon: '📦' },
        { label: 'Payments', icon: '💳' },
        { label: 'Attendance', icon: '📅' },
        { label: 'More', icon: '⋯' },
    ];

    const moreMenuItems = [
        { icon: '👤', text: 'Profile', action: () => setCurrentPage(5) },
        { icon: '🏆', text: 'Certificates', action: () => console.log('Certificates') },
        { icon: '⚙️', text: 'Settings', action: () => console.log('Settings') },
        { icon: '🚪', text: 'Logout', action: () => console.log('Logout') },
    ];

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 0:
                return <Dashboard />;
            case 1:
                return <Orders />;
            case 2:
                return <Payments />;
            case 3:
                return <Attendance />;
            case 4:
                return <More onNavigate={setCurrentPage} />;
            case 5:
                return <Profile />;
            case 6:
                return <Settings />;
            case 7:  // Certificate page
                return <Certificate />;
            case 8:  // Logout page
                return <Logout onNavigate={setCurrentPage} />;
            default:
                return <Dashboard />;
        }
    };

    const handleNavClick = (index: number) => {
        setCurrentPage(index);
        setShowMoreMenu(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            backgroundColor: '#f5f5f5',
            paddingBottom: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Top AppBar */}
            <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                    Rider Dashboard
                </h2>

                {/* Profile Picture with Dropdown */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={durgarao}
                        alt="Rider"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }}
                    />
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '45px',
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            minWidth: '150px',
                            zIndex: 1001
                        }}>
                            {[
                                { icon: '👤', text: 'Profile', page: 5 },
                                { icon: '⚙️', text: 'Settings', page: 6 },
                                { icon: '🚪', text: 'Logout', page: 8 },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        setCurrentPage(item.page);
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        color: '#333',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span>{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ minHeight: 'calc(100vh - 140px)' }}>
                {renderCurrentPage()}
            </div>

            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <div style={{
                    display: 'flex',
                    height: '70px'
                }}>
                    {navItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleNavClick(index)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: currentPage === index ? '#1976d2' : '#666',
                                backgroundColor: currentPage === index ? '#e3f2fd' : 'transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                                {item.icon}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: currentPage === index ? 'bold' : 'normal'
                            }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default RiderDashboardApp;