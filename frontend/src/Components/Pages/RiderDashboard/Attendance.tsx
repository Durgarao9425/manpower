// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Container,
//   Alert,
//   Snackbar,
//   Modal,
//   CircularProgress,
//   Paper,
//   Chip,
//   IconButton,
//   useTheme,
//   useMediaQuery
// } from '@mui/material';
// import {
//   ArrowForward,
//   LocationOn,
//   Close,
//   AccessTime,
//   CheckCircle
// } from '@mui/icons-material';
// import axios from 'axios';

// // Types
// interface AttendanceRecord {
//   id: number;
//   rider_id: number;
//   attendance_date: string;
//   status: 'present' | 'absent';
//   check_in_time?: string;
//   check_out_time?: string;
//   check_in_latitude?: number;
//   check_in_longitude?: number;
//   check_out_latitude?: number;
//   check_out_longitude?: number;
// }

// interface LocationData {
//   latitude: number;
//   longitude: number;
//   accuracy: number;
// }

// interface RiderData {
//   id: number;
//   name: string;
//   company_id: number;
//   store_id: number;
// }

// const Attendance: React.FC = () => {
//   // States
//   const [dragX, setDragX] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [attendanceState, setAttendanceState] = useState<'punch-in' | 'punch-out' | 'completed'>('punch-in');
//   const [punchInTime, setPunchInTime] = useState<Date | null>(null);
//   const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [workingTime, setWorkingTime] = useState(0);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning'>('success');
//   const [loading, setLoading] = useState(false);
//   const [locationError, setLocationError] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [userLocation, setUserLocation] = useState<LocationData | null>(null);
//   const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

//   // Location bounds for Kukatpally, Hyderabad (approximate area around Nexus Mall)
// const ALLOWED_LOCATION = {
//   latitude: 17.4837225,  // Correct latitude for KS Executive Mens Hostel
//   longitude: 78.3968131, // Correct longitude for KS Executive Mens Hostel
//   radius: 500 // Reduce radius to 500 meters for more accurate checking
// };

//   // Mock rider data - In real app, get from auth context
//   const riderData: RiderData = {
//     id: 86,
//     name: 'Rider Name',
//     company_id: 21,
//     store_id: 29
//   };

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   const buttonRef = useRef<HTMLDivElement>(null);
//   const startXRef = useRef(0);
//   const workingTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const maxDragDistance = isMobile ? 240 : 280;

//   // API Base URL
//   const API_BASE = 'http://localhost:4003/api';

//   // Axios instance
//   const api = axios.create({
//     baseURL: API_BASE,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   // Location utilities
//   const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   };

//   const isWithinAllowedLocation = (userLat: number, userLon: number): boolean => {
//     const distance = calculateDistance(
//       userLat,
//       userLon,
//       ALLOWED_LOCATION.latitude,
//       ALLOWED_LOCATION.longitude
//     );
//     return distance <= ALLOWED_LOCATION.radius;
//   };

//   const getCurrentLocation = (): Promise<LocationData> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error('Geolocation is not supported'));
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           resolve({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             accuracy: position.coords.accuracy
//           });
//         },
//         (error) => {
//           reject(error);
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000
//         }
//       );
//     });
//   };

//   // API calls
//   const fetchTodayAttendance = async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0];
//       const response = await api.get(`/attendance?rider_id=${riderData.id}&date=${today}`);
//       const records = response.data;
      
//       if (records.length > 0) {
//         const record = records[0];
//         setTodayRecord(record);
        
//         if (record.check_in_time && !record.check_out_time) {
//           setAttendanceState('punch-out');
//           setPunchInTime(new Date(record.check_in_time));
//         } else if (record.check_in_time && record.check_out_time) {
//           setAttendanceState('completed');
//           setPunchInTime(new Date(record.check_in_time));
//           setPunchOutTime(new Date(record.check_out_time));
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching today attendance:', error);
//     }
//   };

//   const punchIn = async (location: LocationData) => {
//     try {
//       setLoading(true);
//       const response = await api.post('/attendance/punch-in', {
//         rider_id: riderData.id,
//         marked_by: riderData.id,
//         check_in_latitude: location.latitude,
//         check_in_longitude: location.longitude,
//         check_in_accuracy: location.accuracy
//       });
      
//       return response.data;
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.error || 'Punch In failed';
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const punchOut = async (location: LocationData) => {
//     try {
//       setLoading(true);
//       const response = await api.post('/attendance/punch-out', {
//         rider_id: riderData.id,
//         marked_by: riderData.id,
//         check_out_latitude: location.latitude,
//         check_out_longitude: location.longitude,
//         check_out_accuracy: location.accuracy
//       });
      
//       return response.data;
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.error || 'Punch Out failed';
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Time formatting utilities
//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDuration = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${minutes}m`;
//   };

//   const showToastMessage = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
//     setToastMessage(message);
//     setToastSeverity(severity);
//     setShowToast(true);
//   };

//   // Drag handlers
//   const handleStart = (clientX: number) => {
//     if (attendanceState === 'completed' || loading) return;
//     setIsDragging(true);
//     startXRef.current = clientX - dragX;
//   };

//   const handleMove = (clientX: number) => {
//     if (!isDragging || attendanceState === 'completed' || loading) return;
//     const newX = clientX - startXRef.current;
//     const clampedX = Math.max(0, Math.min(newX, maxDragDistance));
//     setDragX(clampedX);
//   };

//   const handleEnd = async () => {
//     if (!isDragging || attendanceState === 'completed' || loading) return;
//     setIsDragging(false);

//     if (dragX > maxDragDistance * 0.85) {
//       setDragX(maxDragDistance);
      
//       try {
//         // Get current location
//         const location = await getCurrentLocation();
//         setUserLocation(location);

//         // Check if within allowed location
//         if (!isWithinAllowedLocation(location.latitude, location.longitude)) {
//           setLocationError(true);
//           setShowLocationModal(true);
//           setDragX(0);
//           return;
//         }

//         const now = new Date();
        
//         if (attendanceState === 'punch-in') {
//           await punchIn(location);
//           setPunchInTime(now);
//           setAttendanceState('punch-out');
//           setWorkingTime(0);
//           showToastMessage('Punched in successfully!');
//         } else if (attendanceState === 'punch-out') {
//           await punchOut(location);
//           setPunchOutTime(now);
//           setAttendanceState('completed');
          
//           if (workingTimerRef.current) {
//             clearInterval(workingTimerRef.current);
//             workingTimerRef.current = null;
//           }
          
//           const totalSeconds = punchInTime ? Math.floor((now.getTime() - punchInTime.getTime()) / 1000) : 0;
//           const totalHours = formatDuration(totalSeconds);
//           showToastMessage(`Attendance completed! Total hours: ${totalHours}`);
//         }
        
//         setDragX(0);
//       } catch (error: any) {
//         showToastMessage(error.message, 'error');
//         setDragX(0);
//       }
//     } else {
//       setDragX(0);
//     }
//   };

//   // Mouse and touch event handlers
//   const handleMouseDown = (e: React.MouseEvent) => {
//     e.preventDefault();
//     handleStart(e.clientX);
//   };

//   const handleTouchStart = (e: React.TouchEvent) => {
//     handleStart(e.touches[0].clientX);
//   };

//   // Effects
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (attendanceState === 'punch-out' && punchInTime) {
//       workingTimerRef.current = setInterval(() => {
//         setWorkingTime(Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000));
//       }, 1000);
//     } else {
//       if (workingTimerRef.current) {
//         clearInterval(workingTimerRef.current);
//         workingTimerRef.current = null;
//       }
//     }

//     return () => {
//       if (workingTimerRef.current) {
//         clearInterval(workingTimerRef.current);
//       }
//     };
//   }, [attendanceState, punchInTime]);

//   useEffect(() => {
//     if (isDragging) {
//       const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
//       const handleMouseUp = () => handleEnd();
//       const handleTouchMove = (e: TouchEvent) => {
//         e.preventDefault();
//         handleMove(e.touches[0].clientX);
//       };
//       const handleTouchEnd = () => handleEnd();

//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//       document.addEventListener('touchmove', handleTouchMove, { passive: false });
//       document.addEventListener('touchend', handleTouchEnd);

//       return () => {
//         document.removeEventListener('mousemove', handleMouseMove);
//         document.removeEventListener('mouseup', handleMouseUp);
//         document.removeEventListener('touchmove', handleTouchMove);
//         document.removeEventListener('touchend', handleTouchEnd);
//       };
//     }
//   }, [isDragging, dragX]);

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const progressPercentage = (dragX / maxDragDistance) * 100;

//   const resetAttendance = () => {
//     setAttendanceState('punch-in');
//     setPunchInTime(null);
//     setPunchOutTime(null);
//     setWorkingTime(0);
//     setDragX(0);
//     setTodayRecord(null);
//     if (workingTimerRef.current) {
//       clearInterval(workingTimerRef.current);
//       workingTimerRef.current = null;
//     }
//   };

//   return (
//     <Container 
//       maxWidth="sm" 
//       sx={{ 
//         py: { xs: 2, sm: 4 },
//         px: { xs: 1, sm: 2 },
//         minHeight: '100vh',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center'
//       }}
//     >
//       {/* Toast Notification */}
//       <Snackbar
//         open={showToast}
//         autoHideDuration={4000}
//         onClose={() => setShowToast(false)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setShowToast(false)}
//           severity={toastSeverity}
//           sx={{ width: '100%' }}
//         >
//           {toastMessage}
//         </Alert>
//       </Snackbar>

//       {/* Main Attendance Card */}
//       <Card 
//         elevation={0} 
//         sx={{ 
//           borderRadius: { xs: 2, sm: 3 }, 
//           mb: 2, 
//           bgcolor: '#f8f9fa',
//           overflow: 'visible'
//         }}
//       >
//         <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
//           {/* Header */}
//           <Typography 
//             variant="body2" 
//             color="text.secondary" 
//             gutterBottom
//             sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
//           >
//             READY TO START
//           </Typography>
//           <Typography 
//             variant="h6" 
//             gutterBottom
//             sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
//           >
//             Today, {formatDate(currentTime)}
//           </Typography>
//           <Typography 
//             variant="h3" 
//             color="primary.main" 
//             fontWeight="bold" 
//             mb={3}
//             sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
//           >
//             {formatTime(currentTime)}
//           </Typography>

//           {/* Working Timer */}
//           {attendanceState === 'punch-out' && (
//             <Box mb={3}>
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: { xs: 1.5, sm: 2 },
//                   bgcolor: 'rgba(25, 118, 210, 0.1)',
//                   border: '1px solid rgba(25, 118, 210, 0.3)',
//                   borderRadius: 2
//                 }}
//               >
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Working Time
//                 </Typography>
//                 <Typography 
//                   variant="h4" 
//                   color="primary.main" 
//                   fontWeight="bold"
//                   sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
//                 >
//                   {formatDuration(workingTime)}
//                 </Typography>
//               </Paper>
//             </Box>
//           )}

//           {/* Swipe Button */}
//           {attendanceState !== 'completed' && (
//             <Box mb={3}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   position: 'relative',
//                   height: { xs: 56, sm: 64 },
//                   bgcolor: attendanceState === 'punch-in' ? '#4caf50' : '#f44336',
//                   borderRadius: { xs: 6, sm: 8 },
//                   overflow: 'hidden',
//                   cursor: loading ? 'default' : 'pointer',
//                   userSelect: 'none',
//                   opacity: loading ? 0.7 : 1
//                 }}
//               >
//                 {/* Progress Background */}
//                 <Box
//                   sx={{
//                     position: 'absolute',
//                     left: 0,
//                     top: 0,
//                     height: '100%',
//                     width: `${progressPercentage}%`,
//                     bgcolor: 'rgba(255, 255, 255, 0.2)',
//                     transition: isDragging ? 'none' : 'width 0.3s ease-out'
//                   }}
//                 />

//                 {/* Center Text */}
//                 <Box
//                   display="flex"
//                   alignItems="center"
//                   justifyContent="center"
//                   height="100%"
//                   position="relative"
//                   zIndex={1}
//                 >
//                   {loading ? (
//                     <CircularProgress size={24} sx={{ color: 'white' }} />
//                   ) : (
//                     <Typography
//                       variant="body1"
//                       fontWeight="bold"
//                       sx={{ 
//                         color: 'white',
//                         fontSize: { xs: '0.875rem', sm: '1rem' }
//                       }}
//                     >
//                       Swipe to {attendanceState === 'punch-in' ? 'Punch In' : 'Punch Out'}
//                     </Typography>
//                   )}
//                 </Box>

//                 {/* Draggable Slider Circle */}
//                 <Box
//                   ref={buttonRef}
//                   sx={{
//                     position: 'absolute',
//                     left: 4,
//                     top: 4,
//                     width: { xs: 48, sm: 56 },
//                     height: { xs: 48, sm: 56 },
//                     bgcolor: 'white',
//                     borderRadius: '50%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     cursor: loading ? 'default' : (isDragging ? 'grabbing' : 'grab'),
//                     transform: `translateX(${dragX}px) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
//                     transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                     zIndex: 2,
//                     boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                     '&:hover': {
//                       transform: `translateX(${dragX}px) scale(1.05)`
//                     }
//                   }}
//                   onMouseDown={handleMouseDown}
//                   onTouchStart={handleTouchStart}
//                 >
//                   <ArrowForward
//                     sx={{
//                       color: attendanceState === 'punch-in' ? '#4caf50' : '#f44336',
//                       fontSize: { xs: 20, sm: 24 }
//                     }}
//                   />
//                 </Box>
//               </Paper>
//             </Box>
//           )}

//           {/* Completed State */}
//           {attendanceState === 'completed' && (
//             <Box>
//               <Chip
//                 icon={<CheckCircle />}
//                 label="Day Completed"
//                 color="success"
//                 size="large"
//                 sx={{ 
//                   fontWeight: 'bold', 
//                   mb: 2,
//                   fontSize: { xs: '0.875rem', sm: '1rem' }
//                 }}
//               />
//               <br />
//               <Button
//                 variant="outlined"
//                 onClick={resetAttendance}
//                 sx={{ 
//                   textTransform: 'none',
//                   borderRadius: 2,
//                   px: 3
//                 }}
//               >
//                 Start New Day
//               </Button>
              
//               {punchInTime && punchOutTime && (
//                 <Box mt={2}>
//                   <Paper
//                     elevation={1}
//                     sx={{
//                       p: 2,
//                       bgcolor: 'rgba(76, 175, 80, 0.1)',
//                       border: '1px solid rgba(76, 175, 80, 0.3)',
//                       borderRadius: 2
//                     }}
//                   >
//                     <Typography variant="body2" color="text.secondary">
//                       Total Working Time
//                     </Typography>
//                     <Typography variant="h5" color="success.main" fontWeight="bold">
//                       {formatDuration(Math.floor((punchOutTime.getTime() - punchInTime.getTime()) / 1000))}
//                     </Typography>
//                   </Paper>
//                 </Box>
//               )}
//             </Box>
//           )}

//           {/* Location indicator */}
//           <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
//             <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
//             <Typography variant="caption" color="text.secondary">
//               Kukatpally, Hyderabad
//             </Typography>
//           </Box>
//         </CardContent>
//       </Card>

//       {/* Location Error Modal */}
//       <Modal
//         open={showLocationModal}
//         onClose={() => setShowLocationModal(false)}
//         aria-labelledby="location-error-modal"
//       >
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: { xs: '90%', sm: 400 },
//             bgcolor: 'background.paper',
//             borderRadius: 3,
//             boxShadow: 24,
//             p: { xs: 2, sm: 3 },
//           }}
//         >
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//             <Typography variant="h6" fontWeight="bold" color="error">
//               Location Error
//             </Typography>
//             <IconButton onClick={() => setShowLocationModal(false)}>
//               <Close />
//             </IconButton>
//           </Box>

//           <Box textAlign="center" mb={3}>
//             <LocationOn sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
//             <Typography variant="body1" mb={2}>
//               You are outside the allowed work area.
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Please move to Kukatpally area near Nexus Mall to mark attendance.
//             </Typography>
//           </Box>

//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => setShowLocationModal(false)}
//             sx={{ borderRadius: 2 }}
//           >
//             OK
//           </Button>
//         </Box>
//       </Modal>
//     </Container>
//   );
// };

// export default Attendance;

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
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowForward,
  LocationOn,
  Close,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';

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
  id: number;
  name: string;
  company_id: number;
  store_id: number;
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
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  // Mock rider data - In real app, get from auth context
  const riderData: RiderData = {
    id: 65,
    name: 'durgarao_9425',
    company_id: 21,
    store_id: 28
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const workingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDragDistance = isMobile ? 240 : 280;

  // API Base URL
  const API_BASE = 'http://localhost:4003/api';

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // If geolocation is not supported, return mock location
        resolve({
          latitude: 17.4837225,
          longitude: 78.3968131,
          accuracy: 10
        });
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
          // If location fails, return mock location
          resolve({
            latitude: 17.4837225,
            longitude: 78.3968131,
            accuracy: 10
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Helper function to format date for API
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString();
  };

  // Helper function to get today's date for attendance_date
  const getTodayDateForAPI = (): string => {
    const today = new Date();
    // Set to 18:30 (6:30 PM) as per your sample data
    today.setHours(18, 30, 0, 0);
    return today.toISOString();
  };

  // API calls with correct payload structure
  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/attendance?rider_id=${riderData.id}&date=${today}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }
      
      const records = await response.json();
      
      if (records.length > 0) {
        const record = records[0];
        setTodayRecord(record);
        
        if (record.check_in_time && !record.check_out_time) {
          setAttendanceState('punch-out');
          setPunchInTime(new Date(record.check_in_time));
        } else if (record.check_in_time && record.check_out_time) {
          setAttendanceState('completed');
          setPunchInTime(new Date(record.check_in_time));
          setPunchOutTime(new Date(record.check_out_time));
        }
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const punchIn = async (location: LocationData) => {
    try {
      setLoading(true);
      const now = new Date();
      
      const payload = {
        rider_id: riderData.id,
        company_id: 21,
        store_id: riderData.store_id,
        attendance_date: getTodayDateForAPI(),
        status: 'present',
        marked_by: riderData.id,
        remarks: '',
        check_in_time: formatDateForAPI(now),
        check_in_latitude: location.latitude,
        check_in_longitude: location.longitude,
        check_in_accuracy: location.accuracy
      };

      console.log('Punch In Payload:', payload);

      const response = await fetch(`${API_BASE}/attendance/punch-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Punch In failed');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Punch In failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const punchOut = async (location: LocationData) => {
    try {
      setLoading(true);
      const now = new Date();
      
      const payload = {
        rider_id: riderData.id,
        marked_by: riderData.id,
        check_out_time: formatDateForAPI(now),
        check_out_latitude: location.latitude,
        check_out_longitude: location.longitude,
        check_out_accuracy: location.accuracy
      };

      console.log('Punch Out Payload:', payload);

      const response = await fetch(`${API_BASE}/attendance/punch-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Punch Out failed');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Punch Out failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Time formatting utilities
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

  const showToastMessage = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  // Drag handlers
  const handleStart = (clientX: number) => {
    if (attendanceState === 'completed' || loading) return;
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

  // Mouse and touch event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const handleMouseUp = () => handleEnd();
      const handleTouchMove = (e: TouchEvent) => {
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