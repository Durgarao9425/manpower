import { ArrowForward, Close, FilterList, Person } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Chip, Container, FormControl, IconButton, InputLabel, MenuItem, Modal, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

// Attendance record type
interface AttendanceRecord {
    id: number;
    date: Date;
    punchIn: Date | null;
    punchOut: Date | null;
    totalHours: string;
    status: string;
    reason: string | null;
}

export const Attendance = () => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [attendanceState, setAttendanceState] = useState('punch-in');
    const [punchInTime, setPunchInTime] = useState<Date | null>(null);
    const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workingTime, setWorkingTime] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    // Modal states
    const [showAbsentModal, setShowAbsentModal] = useState(false);
    const [absentReason, setAbsentReason] = useState('');

    // Filter states
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const buttonRef = useRef(null);
    const startXRef = useRef(0);
    const workingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const maxDragDistance = 280;

    const absentReasons = [
        'Sick Leave',
        'Personal Leave',
        'Emergency',
        'Medical Appointment',
        'Family Emergency',
        'Other'
    ];

    // Replace with actual authentication/user context
    const riderId = 1; // TODO: Replace with real rider ID from auth context
    const riderName = 'Rider Name'; // TODO: Replace with real rider name from auth context

    // API helpers
    const fetchAttendanceRecords = async (month: number | null = null, year: number | null = null): Promise<AttendanceRecord[]> => {
        try {
            let url = `http://localhost:4003/api/attendance?rider_id=${riderId}`;
            if (month !== null && year !== null) {
                url += `&month=${month + 1}&year=${year}`;
            } else if (year !== null) {
                url += `&year=${year}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch attendance records');
            return (await response.json()).map((record: any) => ({
                id: record.id,
                date: new Date(record.attendance_date),
                punchIn: record.check_in_time ? new Date(record.check_in_time) : null,
                punchOut: record.check_out_time ? new Date(record.check_out_time) : null,
                totalHours: record.status === 'present' && record.check_in_time && record.check_out_time
                    ? calculateWorkHours(new Date(record.check_in_time), new Date(record.check_out_time))
                    : '0h 0m',
                status: record.status === 'present' ? 'Present' : 'Absent',
                reason: record.remarks
            }));
        } catch (err: any) {
            showToastMessage(err.message);
            return [];
        }
    };

    const punchIn = async (): Promise<boolean> => {
        try {
            if (!riderId || !riderName) throw new Error('Missing rider ID or name');
            const res = await fetch('http://localhost:4003/api/attendance/punch-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Punch In failed');
            return true;
        } catch (err: any) {
            showToastMessage(err.message);
            return false;
        }
    };

    const punchOut = async (): Promise<boolean> => {
        try {
            if (!riderId || !riderName) throw new Error('Missing rider ID or name');
            const res = await fetch('http://localhost:4003/api/attendance/punch-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Punch Out failed');
            return true;
        } catch (err: any) {
            showToastMessage(err.message);
            return false;
        }
    };

    const markAbsent = async (reason: string): Promise<boolean> => {
        try {
            if (!riderId || !riderName) throw new Error('Missing rider ID or name');
            const res = await fetch('http://localhost:4003/api/attendance/absent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName, remarks: reason })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Mark Absent failed');
            return true;
        } catch (err: any) {
            showToastMessage(err.message);
            return false;
        }
    };

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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const calculateWorkHours = (startTime: Date | null, endTime: Date | null) => {
        if (startTime && endTime) {
            const diff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            return formatDuration(diff);
        }
        return '0h 0m';
    };

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const handleStart = (clientX: number) => {
        if (attendanceState === 'completed') return;
        setIsDragging(true);
        startXRef.current = clientX - dragX;
    };

    const handleMove = (clientX: number) => {
        if (!isDragging || attendanceState === 'completed') return;

        const newX = clientX - startXRef.current;
        const clampedX = Math.max(0, Math.min(newX, maxDragDistance));
        setDragX(clampedX);
    };

    const handleEnd = async () => {
        if (!isDragging || attendanceState === 'completed') return;
        setIsDragging(false);

        if (dragX > maxDragDistance * 0.85) {
            setDragX(maxDragDistance);

            setTimeout(async () => {
                const now = new Date();
                if (attendanceState === 'punch-in') {
                    const success = await punchIn();
                    if (!success) { setDragX(0); return; }
                    setPunchInTime(now);
                    setAttendanceState('punch-out');
                    setWorkingTime(0);
                    showToastMessage('Punched in successfully!');
                } else if (attendanceState === 'punch-out') {
                    const success = await punchOut();
                    if (!success) { setDragX(0); return; }
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
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

    const handleMarkAsAbsent = async () => {
        if (!absentReason) return;
        const success = await markAbsent(absentReason);
        if (!success) return;
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

    // Fetch attendance records on mount and when filters change
    useEffect(() => {
        const loadRecords = async () => {
            const records = await fetchAttendanceRecords(filterMonth, filterYear);
            setAttendanceRecords(records.map(record => ({
                ...record,
                date: new Date(record.attendance_date),
                punchIn: record.check_in_time ? new Date(record.check_in_time) : null,
                punchOut: record.check_out_time ? new Date(record.check_out_time) : null,
                totalHours: record.status === 'present' && record.check_in_time && record.check_out_time
                    ? calculateWorkHours(new Date(record.check_in_time), new Date(record.check_out_time))
                    : '0h 0m',
                status: record.status === 'present' ? 'Present' : 'Absent',
                reason: record.remarks
            })));
        };
        loadRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterMonth, filterYear]);

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