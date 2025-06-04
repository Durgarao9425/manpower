import React, { useState, useEffect, useRef, useCallback } from "react";
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
  useTheme as useMuiTheme,
  useMediaQuery,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  keyframes,
} from "@mui/material";
import { useTheme } from "../../../context/ThemeContext";
import { ArrowForward, LocationOn, CheckCircle, DirectionsBike } from "@mui/icons-material";
import useUserData from "../../Common/loginInformation"; // Assuming this path is correct
import axios from "axios";
import apiService from "../../../services/apiService"; // Assuming this is configured for POST or not used for POSTs
import authService from "../../../services/authService"; // Import authService for token management

// Types
interface AttendanceRecord {
  id: number;
  rider_id: number;
  company_id: number;
  store_id: number | null;
  attendance_date: string;
  status: "present" | "absent";
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
  id: number; // This will be riders.id (PK of riders table, used as rider_id FK in other tables)
  name: string;
  company_id: number; // This will be rider_assignments.company_id
  store_id: number; // This will be rider_assignments.store_id
}

interface UserData {
  user: {
    id: number;
  };
  token: string;
}

// Props for internal punch functions
interface PunchInData extends RiderData {
  // RiderData already contains id, company_id, store_id, name
}

// Add these constants at the top of the file after imports
const ALLOWED_LOCATION = {
  latitude: 17.4838949,
  longitude: 78.396821,
  radius: 2000 // Increased radius to 2km for testing
};

// Add keyframes for the rider animation
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Add new RiderLoader component at the top of the file
const RiderLoader: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        zIndex: 9999,
      }}
    >
      <Fade in={true} timeout={1000}>
        <Box 
          sx={{ 
            textAlign: 'center',
            position: 'relative',
            width: '120px',
            height: '120px',
          }}
        >
          {/* Outer spinning circle */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: `${spin} 1s linear infinite`,
            }}
          />
          
          {/* Rider icon with bounce animation */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `${bounce} 1s ease-in-out infinite`,
            }}
          >
            <DirectionsBike 
              sx={{ 
                fontSize: 40,
                color: 'primary.main',
              }} 
            />
          </Box>
        </Box>
      </Fade>
      
      <Typography 
        variant="h6" 
        sx={{ 
          mt: 4, 
          color: 'text.primary',
          fontWeight: 500,
        }}
      >
        Loading Rider Data...
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 1, 
          color: 'text.secondary',
          maxWidth: '300px',
          textAlign: 'center',
        }}
      >
        Please wait while we fetch your attendance information
      </Typography>
    </Box>
  );
};

const Attendance: React.FC = () => {
  // Add a ref to track mounted state
  const isMounted = useRef(true);
  
  // States
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [attendanceState, setAttendanceState] = useState<
    "punch-in" | "punch-out" | "completed"
  >("punch-in");
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "warning"
  >("success");
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [riderAssignments, setRiderAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentReason, setAbsentReason] = useState("");
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [completedDayData, setCompletedDayData] = useState<{
    punchIn: string;
    punchOut: string;
    workingHours: string;
  } | null>(null);

  // Add state for initial data
  const [initialData, setInitialData] = useState<{
    riderData: RiderData;
    attendanceData: AttendanceRecord[];
    assignmentsData: any[];
  } | null>(null);

  // Make sure this URL matches your backend API endpoint
  const API_BASE = "http://localhost:4003/api";

  const [riderData, setRiderData] = useState<RiderData>({
    id: 0,
    name: "Rider Name",
    company_id: 0,
    store_id: 0,
  });

  const { userData } = useUserData() as unknown as { userData: UserData };

  const muiTheme = useMuiTheme();
  const { themeColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const buttonRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const workingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDragDistance = isMobile ? 240 : 280;

  // Add new state for rider data loading
  const [isRiderDataLoading, setIsRiderDataLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  const showToastMessage = (
    message: string,
    severity: "success" | "error" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  // Add this helper function after the interfaces
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log('Distance Calculation:', {
      from: { lat: lat1, lon: lon1 },
      to: { lat: lat2, lon: lon2 },
      distanceInMeters: distance,
      distanceInKm: distance / 1000
    });

    return distance; // Returns distance in meters
  };

  const isWithinAllowedRadius = (location: LocationData): boolean => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      ALLOWED_LOCATION.latitude,
      ALLOWED_LOCATION.longitude
    );
    
    console.log('Location Validation:', {
      userLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      },
      allowedLocation: ALLOWED_LOCATION,
      distanceInMeters: distance,
      isWithinRadius: distance <= ALLOWED_LOCATION.radius,
      accuracyInMeters: location.accuracy
    });

    // Add a small buffer to account for GPS accuracy
    const buffer = location.accuracy || 50; // Use location accuracy or default to 50m
    return distance <= (ALLOWED_LOCATION.radius + buffer);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Modify fetchRiderDataAndActiveAssignment to return data instead of setting state
  const fetchRiderDataAndActiveAssignment = async (): Promise<RiderData | null> => {
    if (!userData?.user?.id) {
      return null;
    }

    try {
      const token = await authService.getAccessToken();
      if (!token) {
        showToastMessage("Authorization token is missing", "error");
        return null;
      }

      const response = await fetch(
        `${API_BASE}/riders?user_id=${userData.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch rider data");
      
      const riderResponse = await response.json();
      if (Array.isArray(riderResponse) && riderResponse.length > 0) {
        const fetchedRiderId = riderResponse[0].id;
        const riderName = riderResponse[0].name || "Rider Name";

        const assignmentResponse = await fetch(
          `${API_BASE}/rider-assignments?rider_id=${fetchedRiderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!assignmentResponse.ok) throw new Error("Failed to fetch assignments");
        
        const assignments = await assignmentResponse.json();
        let companyId = 0;
        let storeId = 0;

        if (Array.isArray(assignments) && assignments.length > 0) {
          const activeAssignment = assignments.find((a: any) => a.status === "active") || assignments[0];
          companyId = activeAssignment.company_id;
          storeId = activeAssignment.store_id;
        }

        return {
          id: fetchedRiderId,
          name: riderName,
          company_id: companyId,
          store_id: storeId,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching rider data:", error);
      showToastMessage("Failed to load rider data", "error");
      return null;
    }
  };

  // Modify fetchAllData to return data instead of setting state
  const fetchAllData = async (riderId: number) => {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        showToastMessage("Authorization token is missing", "error");
        return null;
      }

      const [attendanceResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_BASE}/attendance?rider_id=${riderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE}/rider-assignments?rider_id=${riderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      if (!attendanceResponse.ok || !assignmentsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [attendanceData, assignmentsData] = await Promise.all([
        attendanceResponse.json(),
        assignmentsResponse.json()
      ]);

      return { attendanceData, assignmentsData };
    } catch (error) {
      console.error("Error fetching data:", error);
      showToastMessage("Failed to load data", "error");
      return null;
    }
  };

  // New function to process and set all states at once
  const processAndSetStates = (data: {
    riderData: RiderData;
    attendanceData: AttendanceRecord[];
    assignmentsData: any[];
  }) => {
    if (!isMounted.current) return;

    // Batch all state updates together
    const updates = () => {
      setRiderData(data.riderData);
      setRiderAssignments(data.assignmentsData);
      setAttendanceHistory(data.attendanceData);

      const today = new Date().toISOString().slice(0, 10);
      const todayRecord = data.attendanceData.find(
        (record) => record.attendance_date === today && record.status === "present"
      );

      if (todayRecord) {
        setTodayRecord(todayRecord);
        
        if (todayRecord.check_in_time && todayRecord.check_out_time) {
          setIsDayCompleted(true);
          setAttendanceState("completed");
          // Add null checks for date strings
          const checkInTime = todayRecord.check_in_time ? new Date(todayRecord.check_in_time) : null;
          const checkOutTime = todayRecord.check_out_time ? new Date(todayRecord.check_out_time) : null;
          
          setPunchInTime(checkInTime);
          setPunchOutTime(checkOutTime);
          
          if (checkInTime && checkOutTime) {
            const workingSeconds = Math.floor(
              (checkOutTime.getTime() - checkInTime.getTime()) / 1000
            );
            
            setCompletedDayData({
              punchIn: checkInTime.toLocaleTimeString(),
              punchOut: checkOutTime.toLocaleTimeString(),
              workingHours: formatDuration(workingSeconds)
            });
          }
        } else if (todayRecord.check_in_time) {
          setAttendanceState("punch-out");
          const checkInTime = new Date(todayRecord.check_in_time);
          setPunchInTime(checkInTime);
        }
      } else {
        setAttendanceState("punch-in");
        setIsDayCompleted(false);
        setCompletedDayData(null);
      }
    };

    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(updates);
  };

  // Modify the initial data loading useEffect
  useEffect(() => {
    let isInitialLoad = true;
    const initializeData = async () => {
      if (!isInitialLoad) return;
      setIsRiderDataLoading(true);
      try {
        const riderData = await fetchRiderDataAndActiveAssignment();
        if (riderData) {
          const allData = await fetchAllData(riderData.id);
          if (allData) {
            const completeData = {
              riderData,
              ...allData
            };
            setInitialData(completeData);
            processAndSetStates(completeData);
            // Add a small delay before showing the content
            setTimeout(() => {
              setIsDataReady(true);
              setIsRiderDataLoading(false);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        showToastMessage("Failed to load initial data", "error");
        setIsRiderDataLoading(false);
      } finally {
        isInitialLoad = false;
      }
    };

    initializeData();
  }, [userData?.user?.id]);

  // Modify executePunchIn to use the new data fetching approach
  const executePunchIn = async (location: LocationData, currentRiderData: PunchInData) => {
    const now = new Date();
    console.log(currentRiderData, "currentRiderData-----------------------------------------");

    if (!isWithinAllowedRadius(location)) {
      showToastMessage(
        `You are outside the allowed area. Please come within ${ALLOWED_LOCATION.radius}m of the office.`,
        "error"
      );
      throw new Error("Location outside allowed area");
    }

    const token = await authService.getAccessToken();
    if (!token) {
      showToastMessage("Authorization token is missing. Cannot punch in.", "error");
      throw new Error("Authorization token is missing for punch-in.");
    }

    const payload = {
      rider_id: currentRiderData.id,
      company_id: currentRiderData.company_id,
      store_id: currentRiderData.store_id,
      attendance_date: getTodayDateForAPI(),
      status: "present" as "present",
      marked_by: userData?.user?.id || 0,
      remarks: "Punched In",
      check_in_time: formatDateForAPI(now),
      check_in_latitude: location.latitude,
      check_in_longitude: location.longitude,
      check_in_accuracy: location.accuracy,
    };

    try {
      const result = await fetch(`${API_BASE}/attendance/punch-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        throw new Error("Failed to punch in");
      }

      const data = await result.json();
      
      // Refresh data using the new approach
      const allData = await fetchAllData(currentRiderData.id);
      if (allData) {
        const completeData = {
          riderData: currentRiderData,
          ...allData
        };
        setInitialData(completeData);
        processAndSetStates(completeData);
      }
      
      return data;
    } catch (error) {
      console.error("Error in punch-in:", error);
      throw error;
    }
  };

  // Modify executePunchOut to use the new data fetching approach
  const executePunchOut = async (location: LocationData) => {
    if (!riderData.id || riderData.id === 0 || !todayRecord) {
      showToastMessage(
        "Cannot punch out. No active punch-in record found or rider info missing.",
        "error"
      );
      throw new Error("Punch out prerequisites not met.");
    }

    if (!isWithinAllowedRadius(location)) {
      showToastMessage(
        `You are outside the allowed area. Please come within ${ALLOWED_LOCATION.radius}m of the office.`,
        "error"
      );
      throw new Error("Location outside allowed area");
    }

    const now = new Date();
    const token = await authService.getAccessToken();
    if (!token) {
      showToastMessage(
        "Authorization token is missing. Cannot punch out.",
        "error"
      );
      throw new Error("Authorization token is missing for punch-out.");
    }

    const payload = {
      rider_id: riderData.id,
      attendance_date: todayRecord.attendance_date,
      marked_by: userData?.user?.id || 0,
      remarks: "Punched Out",
      check_out_time: formatDateForAPI(now),
      check_out_latitude: location.latitude,
      check_out_longitude: location.longitude,
      check_out_accuracy: location.accuracy,
    };

    try {
      const result = await fetch(`${API_BASE}/attendance/punch-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        throw new Error("Failed to punch out");
      }

      const data = await result.json();
      
      // Refresh data using the new approach
      const allData = await fetchAllData(riderData.id);
      if (allData) {
        const completeData = {
          riderData,
          ...allData
        };
        setInitialData(completeData);
        processAndSetStates(completeData);
      }
      
      return data;
    } catch (error) {
      console.error("Error in punch-out:", error);
      throw error;
    }
  };

  const handleStart = (clientX: number) => {
    if (
      attendanceState === "completed" ||
      loading ||
      (riderData.id === 0 && attendanceState === "punch-in")
    )
      return;
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || attendanceState === "completed" || loading) return;
      const newX = clientX - startXRef.current;
      const clampedX = Math.max(0, Math.min(newX, maxDragDistance));
      setDragX(clampedX);
    },
    [isDragging, loading, attendanceState, maxDragDistance]
  );

  const handleEnd = async () => {
    if (!isDragging || attendanceState === "completed" || loading) {
      if (isDragging) setIsDragging(false);
      return;
    }
    setIsDragging(false);

    if (dragX > maxDragDistance * 0.85) {
      setDragX(maxDragDistance);
      setLoading(true);

      try {
        const location = await getCurrentLocation();
        
        if (attendanceState === "punch-in") {
          await executePunchIn(location, riderData);
        } else if (attendanceState === "punch-out") {
          await executePunchOut(location);
        }
        
        setDragX(0);
      } catch (error: any) {
        console.error("Error during punch operation:", error);
        showToastMessage(error.message || "Operation failed", "error");
        setDragX(0);
      } finally {
        setLoading(false);
      }
    } else {
      setDragX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (attendanceState === "punch-out" && punchInTime) {
      if (workingTimerRef.current) clearInterval(workingTimerRef.current);
      workingTimerRef.current = setInterval(() => {
        setWorkingTime(
          Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000)
        );
      }, 1000);
    } else {
      if (workingTimerRef.current) {
        clearInterval(workingTimerRef.current);
        workingTimerRef.current = null;
      }
      if (attendanceState === "completed" && punchInTime && punchOutTime) {
        setWorkingTime(
          Math.floor((punchOutTime.getTime() - punchInTime.getTime()) / 1000)
        );
      }
    }
    return () => {
      if (workingTimerRef.current) clearInterval(workingTimerRef.current);
    };
  }, [attendanceState, punchInTime, punchOutTime]);

  // Effect for global mouse/touch move/end listeners during drag
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUpGlobal = () => handleEnd(); // handleEnd is async but listeners are sync
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      // if (e.cancelable) e.preventDefault(); // Passive false not supported by some browsers, check usage
      handleMove(e.touches[0].clientX);
    };
    const handleTouchEndGlobal = () => handleEnd();

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMoveGlobal);
      document.addEventListener("mouseup", handleMouseUpGlobal);
      document.addEventListener(
        "touchmove",
        handleTouchMoveGlobal /*, { passive: false } */
      ); // Consider passive based on needs
      document.addEventListener("touchend", handleTouchEndGlobal);
      return () => {
        document.removeEventListener("mousemove", handleMouseMoveGlobal);
        document.removeEventListener("mouseup", handleMouseUpGlobal);
        document.removeEventListener("touchmove", handleTouchMoveGlobal);
        document.removeEventListener("touchend", handleTouchEndGlobal);
      };
    }
  }, [isDragging, handleMove, handleEnd]); // handleEnd and handleMove are now dependencies (handleMove is memoized)

  const progressPercentage = (dragX / maxDragDistance) * 100;
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const resetAttendance = () => {
    setAttendanceState("punch-in");
    setPunchInTime(null);
    setPunchOutTime(null);
    setWorkingTime(0);
    setDragX(0);
    setTodayRecord(null); // Clears today's record
    if (workingTimerRef.current) clearInterval(workingTimerRef.current);
    // Re-fetch today's attendance status for the current rider
    // if (riderData.id && riderData.id !== 0) {
    //   fetchTodayAttendance();
    // }
  };

  // Add this function to fetch attendance history
  const fetchAttendanceHistory = async () => {
    if (!riderData.id) return;
    
    try {
      const token = await authService.getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/attendance?rider_id=${riderData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch attendance history");
      
      const data = await response.json();
      setAttendanceHistory(data);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      showToastMessage("Failed to load attendance history", "error");
    }
  };

  // Add function to handle absent marking
  const handleMarkAbsent = async () => {
    if (!absentReason.trim()) {
      showToastMessage("Please provide a reason for absence", "error");
      return;
    }

    try {
      const token = await authService.getAccessToken();
      if (!token) {
        showToastMessage("Authorization token is missing", "error");
        return;
      }

      const response = await fetch(`${API_BASE}/attendance/absent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rider_id: riderData.id,
          remarks: absentReason,
        }),
      });

      if (!response.ok) throw new Error("Failed to mark absent");

      showToastMessage("Marked as absent successfully", "success");
      setShowAbsentModal(false);
      setAbsentReason("");
      await fetchAttendanceHistory();
    } catch (error) {
      console.error("Error marking absent:", error);
      showToastMessage("Failed to mark as absent", "error");
    }
  };

  // Add the Absent Modal component
  const AbsentModal = () => (
    <Dialog open={showAbsentModal} onClose={() => setShowAbsentModal(false)}>
      <DialogTitle>Mark as Absent</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Reason for Absence"
          fullWidth
          multiline
          rows={4}
          value={absentReason}
          onChange={(e) => setAbsentReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAbsentModal(false)}>Cancel</Button>
        <Button onClick={handleMarkAbsent} color="error">
          Mark Absent
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add back the utility functions
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        showToastMessage("Geolocation is not supported by your browser.", "error");
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          if (!isWithinAllowedRadius(location)) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              ALLOWED_LOCATION.latitude,
              ALLOWED_LOCATION.longitude
            );
            
            showToastMessage(
              `You are ${Math.round(distance)}m away from the office. Please come within ${ALLOWED_LOCATION.radius}m.`,
              "error"
            );
            reject(new Error("Location outside allowed area"));
            return;
          }

          resolve(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          showToastMessage(
            "Failed to get your location. Please enable location services.",
            "error"
          );
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0
        }
      );
    });
  };

  const formatDateForAPI = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid date provided to formatDateForAPI, using current date instead");
      date = new Date();
    }
    return date.toISOString();
  };

  const getTodayDateForAPI = (): string => {
    const now = new Date();
    return now.toISOString();
  };

  // Modify the loading check in the render
  if (isRiderDataLoading) {
    return <RiderLoader />;
  }

  // Add a fade transition for the main content
  return (
    <Fade in={isDataReady} timeout={500}>
      <Container
        maxWidth="sm"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Snackbar
          open={showToast}
          autoHideDuration={4000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowToast(false)}
            severity={toastSeverity}
            sx={{ width: "100%" }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>

        <AbsentModal />

        {/* Rider Name Card */}
        <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.primary">
              {riderData.name || "Loading Rider..."}
            </Typography>
          </CardContent>
        </Card>

        {/* Time Card */}
        <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Today, {formatDate(currentTime)}
            </Typography>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {formatTime(currentTime)}
            </Typography>
          </CardContent>
        </Card>

        {/* Day Completed Card */}
        {isDayCompleted && completedDayData && (
          <Card elevation={0} sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
            <CardContent sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Day Completed ✅
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Punch In
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {completedDayData.punchIn}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Punch Out
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {completedDayData.punchOut}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Working Hours
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {completedDayData.workingHours}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Punch In/Out Card - Only show if day is not completed */}
        {!isDayCompleted && attendanceState !== "completed" && (
          <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  height: { xs: 56, sm: 64 },
                  bgcolor: loading
                    ? "grey.500"
                    : attendanceState === "punch-in"
                    ? themeColor
                    : "#f44336",
                  borderRadius: { xs: 6, sm: 8 },
                  overflow: "hidden",
                  cursor: loading ? "not-allowed" : "pointer",
                  userSelect: "none",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${progressPercentage}%`,
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transition: isDragging ? "none" : "width 0.3s ease-out",
                  }}
                />
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  position="relative"
                  zIndex={1}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        color: "white",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {riderData.id === 0 && attendanceState === "punch-in"
                        ? "Loading Rider Data..."
                        : `Swipe to ${
                            attendanceState === "punch-in"
                              ? "Punch In"
                              : "Punch Out"
                          }`}
                    </Typography>
                  )}
                </Box>
                <Box
                  ref={buttonRef}
                  sx={{
                    position: "absolute",
                    left: 4,
                    top: 4,
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor:
                      loading ||
                      (riderData.id === 0 && attendanceState === "punch-in")
                        ? "not-allowed"
                        : isDragging
                        ? "grabbing"
                        : "grab",
                    transform: `translateX(${dragX}px) ${
                      isDragging ? "scale(1.1)" : "scale(1)"
                    }`,
                    transition: isDragging
                      ? "none"
                      : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": {
                      transform:
                        loading ||
                        (riderData.id === 0 && attendanceState === "punch-in")
                          ? `translateX(${dragX}px) scale(1)`
                          : `translateX(${dragX}px) scale(1.05)`,
                    },
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <ArrowForward
                    sx={{
                      color:
                        attendanceState === "punch-in" ? themeColor : "#f44336",
                      fontSize: { xs: 20, sm: 24 },
                    }}
                  />
                </Box>
              </Paper>

              {/* Mark Absent Button */}
              {attendanceState === "punch-in" && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setShowAbsentModal(true)}
                >
                  Mark as Absent
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Working Time Card - Only show if day is not completed */}
        {!isDayCompleted && attendanceState === "punch-out" && (
          <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <CardContent sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Working Time
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {formatDuration(workingTime)}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Attendance History Card */}
        <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance History
            </Typography>

            {attendanceHistory.length > 0 ? (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Status</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Punch In</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Punch Out</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Working Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          {new Date(record.attendance_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          <Chip
                            label={record.status}
                            size="small"
                            color={record.status === "present" ? "success" : "error"}
                          />
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          {record.check_in_time
                            ? new Date(record.check_in_time).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          {record.check_out_time
                            ? new Date(record.check_out_time).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          {record.check_in_time && record.check_out_time
                            ? formatDuration(
                                Math.floor(
                                  (new Date(record.check_out_time).getTime() -
                                    new Date(record.check_in_time).getTime()) /
                                    1000
                                )
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No attendance records available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default Attendance;
