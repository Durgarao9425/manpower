import { ArrowForward, Close, FilterList, Person } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Chip, Container, FormControl, IconButton, InputLabel, MenuItem, Modal, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const Attendance = () => {
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

    // Replace with actual authentication/user context
    const riderId = 1; // TODO: Replace with real rider ID from auth context
    const riderName = 'Rider Name'; // TODO: Replace with real rider name from auth context

    // API helpers
    const fetchAttendanceRecords = async (month = null, year = null) => {
        try {
            let url = `http://localhost:4003/api/attendance?rider_id=${riderId}`;
            if (month !== null && year !== null) {
                url += `&month=${month + 1}&year=${year}`;
            } else if (year !== null) {
                url += `&year=${year}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch attendance records');
            return await response.json();
        } catch (err) {
            showToastMessage(err.message);
            return [];
        }
    };

    const punchIn = async () => {
        try {
            const res = await fetch('http://localhost:4003/api/attendance/punch-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Punch In failed');
            return true;
        } catch (err) {
            showToastMessage(err.message);
            return false;
        }
    };

    const punchOut = async () => {
        try {
            const res = await fetch('http://localhost:4003/api/attendance/punch-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Punch Out failed');
            return true;
        } catch (err) {
            showToastMessage(err.message);
            return false;
        }
    };

    const markAbsent = async (reason) => {
        try {
            const res = await fetch('http://localhost:4003/api/attendance/absent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: riderId, marked_by: riderName, remarks: reason })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Mark Absent failed');
            return true;
        } catch (err) {
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

  const handleEnd = async () => {
    if (!isDragging || attendanceState === 'completed' || loading) return;
    setIsDragging(false);

    if (dragX > maxDragDistance * 0.85) {
      setDragX(maxDragDistance);

      try {
        // Get current location (or use mock location)
        const location = await getCurrentLocation();
        const now = new Date();

        if (attendanceState === 'punch-in') {
          const result = await punchIn(location);
          setPunchInTime(now);
          setAttendanceState('punch-out');
          setWorkingTime(0);
          showToastMessage('Punched in successfully!');

          // Update today's record with the response
          if (result) {
            setTodayRecord(result);
          }
        } else if (attendanceState === 'punch-out') {
          const result = await punchOut(location);
          setPunchOutTime(now);
          setAttendanceState('completed');

          if (workingTimerRef.current) {
            clearInterval(workingTimerRef.current);
            workingTimerRef.current = null;
          }

          const totalSeconds = punchInTime ? Math.floor((now.getTime() - punchInTime.getTime()) / 1000) : 0;
          const totalHours = formatDuration(totalSeconds);
          showToastMessage(`Attendance completed! Total hours: ${totalHours}`);

          // Update today's record with the response
          if (result) {
            setTodayRecord(result);
          }
        }

        setDragX(0);
      } catch (error: any) {
        showToastMessage(error.message, 'error');
        setDragX(0);
      }
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
      const handleTouchEnd = () => handleEnd();

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

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const progressPercentage = (dragX / maxDragDistance) * 100;

  const resetAttendance = () => {
    setAttendanceState('punch-in');
    setPunchInTime(null);
    setPunchOutTime(null);
    setWorkingTime(0);
    setDragX(0);
    setTodayRecord(null);
    if (workingTimerRef.current) {
      clearInterval(workingTimerRef.current);
      workingTimerRef.current = null;
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Debug Info */}
      {todayRecord && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
          <Typography variant="caption" display="block">
            Debug - Today's Record:
          </Typography>
          <Typography variant="caption" display="block">
            Check In: {todayRecord.check_in_time ? new Date(todayRecord.check_in_time).toLocaleString() : 'Not set'}
          </Typography>
          <Typography variant="caption" display="block">
            Check Out: {todayRecord.check_out_time ? new Date(todayRecord.check_out_time).toLocaleString() : 'Not set'}
          </Typography>
          <Typography variant="caption" display="block">
            Status: {todayRecord.status}
          </Typography>
        </Paper>
      )}

      {/* Main Attendance Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          mb: 2,
          bgcolor: '#f8f9fa',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          {/* Header */}
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            READY TO START
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Today, {formatDate(currentTime)}
          </Typography>
          <Typography
            variant="h3"
            color="primary.main"
            fontWeight="bold"
            mb={3}
            sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
          >
            {formatTime(currentTime)}
          </Typography>

          {/* Working Timer */}
          {attendanceState === 'punch-out' && (
            <Box mb={3}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  border: '1px solid rgba(25, 118, 210, 0.3)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Working Time
                </Typography>
                <Typography
                  variant="h4"
                  color="primary.main"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
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
                  height: { xs: 56, sm: 64 },
                  bgcolor: attendanceState === 'punch-in' ? '#4caf50' : '#f44336',
                  borderRadius: { xs: 6, sm: 8 },
                  overflow: 'hidden',
                  cursor: loading ? 'default' : 'pointer',
                  userSelect: 'none',
                  opacity: loading ? 0.7 : 1
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
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        color: 'white',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      Swipe to {attendanceState === 'punch-in' ? 'Punch In' : 'Punch Out'}
                    </Typography>
                  )}
                </Box>

                {/* Draggable Slider Circle */}
                <Box
                  ref={buttonRef}
                  sx={{
                    position: 'absolute',
                    left: 4,
                    top: 4,
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'default' : (isDragging ? 'grabbing' : 'grab'),
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
                      fontSize: { xs: 20, sm: 24 }
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}

          {/* Completed State */}
          {attendanceState === 'completed' && (
            <Box>
              <Chip
                icon={<CheckCircle />}
                label="Day Completed"
                color="success"
                size="large"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              />
              <br />
              <Button
                variant="outlined"
                onClick={resetAttendance}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3
                }}
              >
                Start New Day
              </Button>

              {punchInTime && punchOutTime && (
                <Box mt={2}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Total Working Time
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatDuration(Math.floor((punchOutTime.getTime() - punchInTime.getTime()) / 1000))}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

          {/* Location indicator */}
          <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              KS Executive Mens Hostel, KPHB Phase II
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Attendance;