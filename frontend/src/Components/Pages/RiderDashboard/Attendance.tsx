import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Chip,
  // IconButton, // No longer used directly, can be removed if not needed for other icons
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowForward,
  LocationOn,
  // Close, // No longer used directly for IconButton
  // AccessTime, // No longer used directly for IconButton
  CheckCircle
} from '@mui/icons-material';
import useUserData from '../../Common/loginInformation'; // Assuming this path is correct
import axios from 'axios';

// Types
interface AttendanceRecord {
  id: number;
  rider_id: number;
  company_id: number;
  store_id: number | null;
  attendance_date: string;
  status: 'present' | 'absent';
  marked_by: number;
  remarks: string;
  created_at: string;
  updated_at: string;
  check_in_time?: string;
  check_out_time?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_in_accuracy?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  check_out_accuracy?: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface RiderData {
  id: number; // This will be riders.id (PK of riders table, used as rider_id)
  name: string;
  company_id: number; // This will be rider_assignments.company_id
  store_id: number;   // This will be rider_assignments.store_id
}

const Attendance: React.FC = () => {
  // States
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [attendanceState, setAttendanceState] = useState<'punch-in' | 'punch-out' | 'completed'>('punch-in');
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [loading, setLoading] = useState(false); // Used for punch-in/out and initial data load
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [riderAssignments, setRiderAssignments] = useState<any[]>([]); // Store rider assignments

  // API Base URL - ensure this is correct and accessible
  const API_BASE = 'http://localhost:4003/api';

  // Rider data state - this will hold id, name, company_id, and store_id
  const [riderData, setRiderData] = useState<RiderData>({
    id: 0, // Will be updated after API call (0 indicates not loaded or invalid)
    name: 'Rider Name', // Default name
    company_id: 0, // Default company_id
    store_id: 0    // Default store_id
  });

  const { userData } = useUserData(); // Custom hook to get user data

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buttonRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const workingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDragDistance = isMobile ? 240 : 280;


  // Effect to fetch rider's details (id, name) and their assignment (company_id, store_id)
useEffect(() => {
  const fetchRiderDataAndAssignments = async () => {
    if (!userData?.user?.id) {
      setRiderData({ id: 0, name: 'Rider Name', company_id: 0, store_id: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Fetch rider by user_id
      const riderResponse = await axios.get<{ id: number; name?: string }[]>(`${API_BASE}/riders?user_id=${userData.user.id}`);
      console.log('Rider Data Response::::::::::::::::::::::::::', riderResponse.data);

      if (Array.isArray(riderResponse.data) && riderResponse.data.length > 0) {
        const fetchedRiderId = riderResponse.data[0].id;
        const riderName = riderResponse.data[0].name || 'Rider Name';

        let finalRiderData: RiderData = {
          id: fetchedRiderId,
          name: riderName,
          company_id: 0,
          store_id: 0
        };
console.log(fetchedRiderId,"fetchedRiderId@@@@@@@@@@@@@@@@@@@@@@@")
        try {
          // Step 2: Fetch rider assignments by rider_id using the by-rider endpoint
          const assignmentResponse = 
          await axios.get<{ company_id: number; store_id: number }>
          (`${API_BASE}/rider-assignments/by-rider/${fetchedRiderId}`);
          console.log('Rider Assignments Response:**********************************', assignmentResponse.data);

          // The by-rider endpoint returns a single object
          if (assignmentResponse.data && typeof assignmentResponse.data === 'object') {
            const activeAssignment = assignmentResponse.data;
            console.log('Active Assignment:', activeAssignment);
            
            // Check if company_id and store_id exist and are not null/undefined
            if (activeAssignment.company_id !== undefined && activeAssignment.store_id !== undefined) {
              finalRiderData.company_id = activeAssignment.company_id;
              finalRiderData.store_id = activeAssignment.store_id;
              console.log('Updated rider data with assignment:', finalRiderData);
            } else {
              console.warn('Assignment found but company_id or store_id is missing:', activeAssignment);
            }
          } else {
            console.warn(`No rider assignment found for rider_id: ${fetchedRiderId}`);
          }
        } catch (assignmentError) {
          console.error('Error fetching rider assignments:', assignmentError);
        }

        setRiderData(finalRiderData);
      } else {
        console.warn(`No rider data found for user_id: ${userData.user.id}`);
        setRiderData({ id: 0, name: 'Rider Name', company_id: 0, store_id: 0 });
      }
    } catch (error) {
      console.error('Error fetching rider data:', error);
      setRiderData({ id: 0, name: 'Rider Name', company_id: 0, store_id: 0 });
    } finally {
      setLoading(false);
    }
  };

  fetchRiderDataAndAssignments();
}, [userData?.user?.id]);
 // Dependencies: userData.user.id and API_BASE (as it's used in effect)

  // Fetch today's attendance record if riderData.id is valid (non-zero)
  useEffect(() => {
    if (riderData.id && riderData.id !== 0) { // Ensure riderData.id is valid before fetching
      fetchTodayAttendance();
      fetchRiderAssignments(); // Fetch rider assignments
    } else {
      // If riderData.id is 0 or invalid, reset attendance related states
      setTodayRecord(null);
      setAttendanceState('punch-in');
      setPunchInTime(null);
      setPunchOutTime(null);
      setRiderAssignments([]); // Reset rider assignments
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [riderData.id]); // Depends on riderData.id (which includes rider_id)
  
  // Function to fetch rider assignments with company and store names
  const fetchRiderAssignments = async () => {
    if (!riderData.id || riderData.id === 0) return;
    
    try {
      // Fetch rider assignments
      const assignmentsResponse = await axios.get(`${API_BASE}/rider-assignments?rider_id=${riderData.id}`);
      const assignments = assignmentsResponse.data;
      console.log('Rider Assignments History:', assignments);
      
      // Fetch companies for name lookup
      const companiesResponse = await axios.get(`${API_BASE}/orders/companies`);
      const companies = companiesResponse.data;
      
      // Create a map of company IDs to names for quick lookup
      const companyMap = companies.reduce((map: {[key: number]: string}, company: {id: number, company_name: string}) => {
        map[company.id] = company.company_name;
        return map;
      }, {});
      
      // Fetch stores for each company in the assignments
      const storePromises = assignments.map(async (assignment: any) => {
        try {
          const storesResponse = await axios.get(`${API_BASE}/stores?company_id=${assignment.company_id}`);
          return storesResponse.data;
        } catch (error) {
          console.error(`Error fetching stores for company ${assignment.company_id}:`, error);
          return [];
        }
      });
      
      const storesResults = await Promise.all(storePromises);
      
      // Create a map of store IDs to names for quick lookup
      const storeMap: {[key: number]: string} = {};
      storesResults.forEach((stores: any[]) => {
        stores.forEach((store: {id: number, store_name: string}) => {
          storeMap[store.id] = store.store_name;
        });
      });
      
      // Enhance assignments with company and store names
      const enhancedAssignments = assignments.map((assignment: any) => ({
        ...assignment,
        company_name: companyMap[assignment.company_id] || `Company ${assignment.company_id}`,
        store_name: storeMap[assignment.store_id] || `Store ${assignment.store_id}`
      }));
      
      setRiderAssignments(enhancedAssignments);
    } catch (error) {
      console.error('Error fetching rider assignments:', error);
      showToastMessage('Failed to load rider assignments.', 'error');
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve) => { // Removed reject to always resolve with mock on failure/no support
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported. Using mock location.');
        resolve({ latitude: 17.4837225, longitude: 78.3968131, accuracy: 10 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error, '. Using mock location.');
          resolve({ latitude: 17.4837225, longitude: 78.3968131, accuracy: 10 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const formatDateForAPI = (date: Date): string => date.toISOString();
  const getTodayDateForAPI = (): string => {
    const today = new Date();
    // This sets the time to 00:00:00.000 UTC for the current date.
    // If you need a specific time like 18:30 local, adjust accordingly before toISOString().
    // For just the date part for an API that expects YYYY-MM-DD, consider:
    // return new Date().toISOString().split('T')[0];
    // However, your current usage seems to be sending the full ISO string.
    // The sample data had 18:30, if that's a fixed daily marker, it's complex.
    // For now, using the current date-time as ISO string.
    return today.toISOString();
  };

  const fetchTodayAttendance = async () => {
    // This function relies on riderData.id being set from the other useEffect.
    if (!riderData.id || riderData.id === 0) {
        console.log("fetchTodayAttendance skipped: riderData.id is not set or is 0.");
        return;
    }
    setLoading(true);
    try {
      const todayDateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for query
      const response = await fetch(`${API_BASE}/attendance?rider_id=${riderData.id}&date=${todayDateString}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
        throw new Error(errorData.error || `Failed to fetch attendance (status: ${response.status})`);
      }
      
      const records: AttendanceRecord[] = await response.json();
      
      if (records.length > 0) {
        const record = records[0];
        setTodayRecord(record);
        
        if (record.check_in_time && !record.check_out_time) {
          setAttendanceState('punch-out');
          setPunchInTime(new Date(record.check_in_time));
          // Calculate working time based on fetched record
          setWorkingTime(Math.floor((new Date().getTime() - new Date(record.check_in_time).getTime()) / 1000));
        } else if (record.check_in_time && record.check_out_time) {
          setAttendanceState('completed');
          setPunchInTime(new Date(record.check_in_time));
          setPunchOutTime(new Date(record.check_out_time));
           // Calculate final working time
          setWorkingTime(Math.floor((new Date(record.check_out_time).getTime() - new Date(record.check_in_time).getTime()) / 1000));
        } else {
            // No check-in yet for today, or incomplete record
            setAttendanceState('punch-in');
        }
      } else {
        // No record for today, ready for punch-in
        setTodayRecord(null);
        setAttendanceState('punch-in');
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingTime(0);
      }
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
      showToastMessage(error.message || 'Could not load today\'s attendance.', 'error');
      // Reset to default state on error
      setTodayRecord(null);
      setAttendanceState('punch-in');
    } finally {
        setLoading(false);
    }
  };

  const punchIn = async (location: LocationData) => {
    console.log("Rider data for punch in:", riderData);
    
    // Check if rider ID is valid
    if (!riderData.id || riderData.id === 0) {
        showToastMessage('Rider ID is missing. Cannot punch in.', 'error');
        throw new Error('Rider ID is missing.');
    }
    
    // Check if company_id and store_id are available
    if (riderData.company_id === 0 || riderData.store_id === 0) {
        console.warn('Company ID or Store ID is 0. This might indicate missing assignment data.');
        showToastMessage('Company or Store assignment is missing. Cannot punch in.', 'error');
        throw new Error('Company or Store assignment is missing.');
    }
    setLoading(true);
    try {
      const now = new Date();
      const payload = {
        rider_id: riderData.id,
        company_id: riderData.company_id,
        store_id: riderData.store_id,
        attendance_date: getTodayDateForAPI(), // Or a more specific date logic if needed
        status: 'present' as 'present', // Explicitly type
        marked_by: userData?.user?.id || 0, // Use the logged-in user's ID
        remarks: 'Punched In',
        check_in_time: formatDateForAPI(now),
        check_in_latitude: location.latitude,
        check_in_longitude: location.longitude,
        check_in_accuracy: location.accuracy
      };

      console.log('Punch In Payload:', payload);
      const response = await fetch(`${API_BASE}/attendance/punch-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Punch In failed');
      }
      const result: AttendanceRecord = await response.json(); // Assuming API returns the created/updated record
      return result;
    } finally {
      setLoading(false);
    }
  };

  const punchOut = async (location: LocationData) => {
     if (!riderData.id || riderData.id === 0 || !todayRecord) { // todayRecord should exist for punch-out
        showToastMessage('Cannot punch out. No active punch-in record found or rider info missing.', 'error');
        throw new Error('Punch out prerequisites not met.');
    }
    setLoading(true);
    try {
      const now = new Date();
      const payload = {
        // For punch-out, you typically update an existing record.
        // The backend might expect the ID of the attendance record to update, or use rider_id + date.
        // This payload assumes the backend identifies the record by rider_id and date,
        // and updates it with check_out details.
        rider_id: riderData.id,
        // company_id and store_id might not be needed if updating, depends on API design
        // company_id: riderData.company_id, 
        // store_id: riderData.store_id,
        attendance_date: todayRecord.attendance_date, // Use date from existing record
        marked_by: userData?.user?.id || 0, // Use the logged-in user's ID
        remarks: 'Punched Out',
        check_out_time: formatDateForAPI(now),
        check_out_latitude: location.latitude,
        check_out_longitude: location.longitude,
        check_out_accuracy: location.accuracy
      };

      console.log('Punch Out Payload:', payload);
      // Ensure the endpoint is correct for punch-out (e.g., might be a PUT to /attendance/{id} or similar)
      const response = await fetch(`${API_BASE}/attendance/punch-out`, { // Or specific update endpoint
        method: 'POST', // Or 'PUT' if updating an existing record by ID
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Punch Out failed');
      }
      const result: AttendanceRecord = await response.json();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const showToastMessage = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  const handleStart = (clientX: number) => {
    if (attendanceState === 'completed' || loading || (riderData.id === 0 && attendanceState === 'punch-in') ) return; // Prevent drag if not ready
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || attendanceState === 'completed' || loading) return;
    const newX = clientX - startXRef.current;
    const clampedX = Math.max(0, Math.min(newX, maxDragDistance));
    setDragX(clampedX);
  };

  const handleEnd = async () => {
    if (!isDragging || attendanceState === 'completed' || loading) return;
    setIsDragging(false);

    if (dragX > maxDragDistance * 0.85) {
      setDragX(maxDragDistance); // Complete the swipe visually
      
      // Prevent action if rider ID is not loaded (relevant for initial punch-in)
      if (riderData.id === 0 && attendanceState === 'punch-in') {
        showToastMessage('Rider data not loaded. Cannot punch in.', 'error');
        setDragX(0); // Reset swipe
        return;
      }

      try {
        const location = await getCurrentLocation();
        const now = new Date();
        
        if (attendanceState === 'punch-in') {
          const result = await punchIn(location);
          setPunchInTime(now);
          setAttendanceState('punch-out');
          setWorkingTime(0); // Reset working time, will start ticking
          showToastMessage('Punched in successfully!');
          setTodayRecord(result); // Update with the record from API
        } else if (attendanceState === 'punch-out') {
          const result = await punchOut(location);
          setPunchOutTime(now);
          setAttendanceState('completed');
          if (workingTimerRef.current) clearInterval(workingTimerRef.current);
          
          const totalSeconds = punchInTime ? Math.floor((now.getTime() - punchInTime.getTime()) / 1000) : 0;
          setWorkingTime(totalSeconds); // Set final working time
          showToastMessage(`Attendance completed! Total hours: ${formatDuration(totalSeconds)}`);
          setTodayRecord(result); // Update with the record from API
        }
        setDragX(0); // Reset swipe for next potential action (though usually disabled in 'completed')
      } catch (error: any) {
        showToastMessage(error.message || 'Operation failed.', 'error');
        setDragX(0); // Reset swipe on error
      }
    } else {
      setDragX(0); // Reset if not swiped far enough
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); handleStart(e.clientX); };
  const handleTouchStart = (e: React.TouchEvent) => { handleStart(e.touches[0].clientX); };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (attendanceState === 'punch-out' && punchInTime) {
      // Ensure workingTimerRef is cleared before setting a new interval
      if (workingTimerRef.current) clearInterval(workingTimerRef.current);
      
      workingTimerRef.current = setInterval(() => {
        setWorkingTime(Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (workingTimerRef.current) {
        clearInterval(workingTimerRef.current);
        workingTimerRef.current = null;
      }
      // If completed and times are set, calculate final duration once
      if (attendanceState === 'completed' && punchInTime && punchOutTime) {
        setWorkingTime(Math.floor((punchOutTime.getTime() - punchInTime.getTime()) / 1000));
      }
    }
    return () => { if (workingTimerRef.current) clearInterval(workingTimerRef.current); };
  }, [attendanceState, punchInTime, punchOutTime]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveGlobal = (e: MouseEvent) => handleMove(e.clientX);
      const handleMouseUpGlobal = () => handleEnd();
      const handleTouchMoveGlobal = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); handleMove(e.touches[0].clientX); };
      const handleTouchEndGlobal = () => handleEnd();

      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
      document.addEventListener('touchend', handleTouchEndGlobal);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUpGlobal);
        document.removeEventListener('touchmove', handleTouchMoveGlobal);
        document.removeEventListener('touchend', handleTouchEndGlobal);
      };
    }
  }, [isDragging, dragX, maxDragDistance, attendanceState, loading, punchInTime, riderData.id]); // Added more dependencies to handleMove/handleEnd closure

  const progressPercentage = (dragX / maxDragDistance) * 100;

  const resetAttendance = () => {
    setAttendanceState('punch-in');
    setPunchInTime(null);
    setPunchOutTime(null);
    setWorkingTime(0);
    setDragX(0);
    setTodayRecord(null);
    if (workingTimerRef.current) clearInterval(workingTimerRef.current);
    // Re-fetch today's attendance status or rider data if needed, or rely on existing useEffects
    if (riderData.id && riderData.id !== 0) {
        fetchTodayAttendance(); // Refresh status for the current rider
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 }, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}
    >
      <Snackbar open={showToast} autoHideDuration={4000} onClose={() => setShowToast(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowToast(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Debug Info (Optional) */}
      {/* <Paper sx={{ p: 1, mb: 1, bgcolor: 'grey.100', fontSize: '0.7rem', overflow: 'auto', maxHeight: 100 }}>
        <Typography variant="caption">Debug: RiderID: {riderData.id}, CoID: {riderData.company_id}, StID: {riderData.store_id}</Typography>
        {todayRecord && (<>
          <Typography variant="caption" display="block">CheckIn: {todayRecord.check_in_time ? new Date(todayRecord.check_in_time).toLocaleString() : 'N/A'}</Typography>
          <Typography variant="caption" display="block">CheckOut: {todayRecord.check_out_time ? new Date(todayRecord.check_out_time).toLocaleString() : 'N/A'}</Typography>
        </>)}
      </Paper> */}

      <Card elevation={0} sx={{ borderRadius: { xs: 2, sm: 3 }, mb: 2, bgcolor: '#f8f9fa', overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {riderData.name} - READY TO START {/* Display rider name */}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Today, {formatDate(currentTime)}
          </Typography>
          <Typography variant="h3" color="primary.main" fontWeight="bold" mb={3} sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
            {formatTime(currentTime)}
          </Typography>

          {attendanceState === 'punch-out' && (
            <Box mb={3}>
              <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(25, 118, 210, 0.1)', border: '1px solid rgba(25, 118, 210, 0.3)', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Working Time</Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                  {formatDuration(workingTime)}
                </Typography>
              </Paper>
            </Box>
          )}

          {attendanceState !== 'completed' && (
            <Box mb={3}>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative', height: { xs: 56, sm: 64 },
                  bgcolor: loading ? 'grey.500' : (attendanceState === 'punch-in' ? '#4caf50' : '#f44336'),
                  borderRadius: { xs: 6, sm: 8 }, overflow: 'hidden',
                  cursor: loading || (riderData.id === 0 && attendanceState === 'punch-in') ? 'not-allowed' : 'pointer', userSelect: 'none',
                  opacity: loading || (riderData.id === 0 && attendanceState === 'punch-in') ? 0.7 : 1
                }}
              >
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progressPercentage}%`, bgcolor: 'rgba(255, 255, 255, 0.2)', transition: isDragging ? 'none' : 'width 0.3s ease-out' }} />
                <Box display="flex" alignItems="center" justifyContent="center" height="100%" position="relative" zIndex={1}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <Typography variant="body1" fontWeight="bold" sx={{ color: 'white', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {riderData.id === 0 && attendanceState === 'punch-in' ? 'Loading Rider...' : `Swipe to ${attendanceState === 'punch-in' ? 'Punch In' : 'Punch Out'}`}
                    </Typography>
                  )}
                </Box>
                <Box
                  ref={buttonRef}
                  sx={{
                    position: 'absolute', left: 4, top: 4,
                    width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 },
                    bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: loading || (riderData.id === 0 && attendanceState === 'punch-in') ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
                    transform: `translateX(${dragX}px) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': { transform: (loading || (riderData.id === 0 && attendanceState === 'punch-in')) ? `translateX(${dragX}px) scale(1)` : `translateX(${dragX}px) scale(1.05)` }
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <ArrowForward sx={{ color: attendanceState === 'punch-in' ? '#4caf50' : '#f44336', fontSize: { xs: 20, sm: 24 } }} />
                </Box>
              </Paper>
            </Box>
          )}

          {attendanceState === 'completed' && (
            <Box>
              <Chip icon={<CheckCircle />} label="Day Completed" color="success" size="large" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
              <br />
              <Button variant="outlined" onClick={resetAttendance} sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
                Start New Day
              </Button>
              {punchInTime && punchOutTime && (
                <Box mt={2}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Working Time</Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatDuration(workingTime)} {/* Use state variable workingTime */}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

          <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              KS Executive Mens Hostel, KPHB Phase II {/* This should be dynamic or a placeholder */}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Rider Assignments Section */}
      <Card sx={{ mt: 3, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rider Assignments
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress size={30} />
            </Box>
          ) : riderAssignments.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: isMobile ? '8px 4px' : '10px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Company</th>
                    <th style={{ padding: isMobile ? '8px 4px' : '10px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Store</th>
                    <th style={{ padding: isMobile ? '8px 4px' : '10px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Rider ID</th>
                    <th style={{ padding: isMobile ? '8px 4px' : '10px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Start Date</th>
                    <th style={{ padding: isMobile ? '8px 4px' : '10px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riderAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td style={{ padding: isMobile ? '8px 4px' : '10px 8px', borderBottom: '1px solid #ddd' }}>
                        {assignment.company_name || `Company ${assignment.company_id}`}
                      </td>
                      <td style={{ padding: isMobile ? '8px 4px' : '10px 8px', borderBottom: '1px solid #ddd' }}>
                        {assignment.store_name || `Store ${assignment.store_id}`}
                      </td>
                      <td style={{ padding: isMobile ? '8px 4px' : '10px 8px', borderBottom: '1px solid #ddd' }}>{assignment.company_rider_id}</td>
                      <td style={{ padding: isMobile ? '8px 4px' : '10px 8px', borderBottom: '1px solid #ddd' }}>
                        {new Date(assignment.start_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: isMobile ? '8px 4px' : '10px 8px', borderBottom: '1px solid #ddd' }}>
                        <Chip 
                          label={assignment.status} 
                          size="small"
                          color={assignment.status === 'active' ? 'success' : 'default'}
                          sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 3 }}>
              No assignments found for this rider.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Attendance;
