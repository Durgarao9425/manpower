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
import { ArrowForward, LocationOn, CheckCircle, DirectionsBike, Refresh } from "@mui/icons-material";
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

// Add these utility functions after the interfaces
const STORAGE_KEYS = {
  RIDER_ASSIGNMENTS: 'rider_assignments',
  TODAY_ATTENDANCE: 'today_attendance',
  LAST_ATTENDANCE_DATE: 'last_attendance_date',
  RIDER_DATA: 'rider_data'
};

const getStoredRiderData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.RIDER_DATA);
  return stored ? JSON.parse(stored) : null;
};

const setStoredRiderData = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.RIDER_DATA, JSON.stringify(data));
};

const getStoredRiderAssignments = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.RIDER_ASSIGNMENTS);
  return stored ? JSON.parse(stored) : null;
};

const setStoredRiderAssignments = (assignments: any[]) => {
  localStorage.setItem(STORAGE_KEYS.RIDER_ASSIGNMENTS, JSON.stringify(assignments));
};

const getStoredTodayAttendance = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TODAY_ATTENDANCE);
    if (!stored) return null;

    const parsedData = JSON.parse(stored);
    // Ensure we're returning an array
    return Array.isArray(parsedData) ? parsedData : [parsedData];
  } catch (error) {
    console.error("Error parsing stored attendance:", error);
    return null;
  }
};

const setStoredTodayAttendance = (attendance: any) => {
  try {
    // Ensure we're storing an array
    const dataToStore = Array.isArray(attendance) ? attendance : [attendance];
    localStorage.setItem(STORAGE_KEYS.TODAY_ATTENDANCE, JSON.stringify(dataToStore));
    console.log("Attendance data stored in localStorage");
  } catch (error) {
    console.error("Error storing attendance data:", error);
  }
};

const getLastAttendanceDate = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_ATTENDANCE_DATE);
};

const setLastAttendanceDate = (date: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_ATTENDANCE_DATE, date);
};

const Attendance: React.FC = () => {
  // Add refs at the top level of the component
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false); // Add this ref at the top level
  const buttonRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const workingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    "success" | "error" | "warning" | "info"
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
  const maxDragDistance = isMobile ? 200 : 280; // Reduced for mobile

  // Add new state for rider data loading
  const [isRiderDataLoading, setIsRiderDataLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  const showToastMessage = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
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

  // Modify fetchRiderDataAndActiveAssignment to use localStorage
  const fetchRiderDataAndActiveAssignment = async (): Promise<RiderData | null> => {
    if (!userData?.user?.id) {
      return null;
    }

    try {
      // Check if we have stored rider data
      const storedRiderData = getStoredRiderData();
      if (storedRiderData) {
        return storedRiderData;
      }

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
        setStoredRiderAssignments(assignments);

        let companyId = 0;
        let storeId = 0;

        if (Array.isArray(assignments) && assignments.length > 0) {
          const activeAssignment = assignments.find((a: any) => a.status === "active") || assignments[0];
          companyId = activeAssignment.company_id;
          storeId = activeAssignment.store_id;
        }

        const riderData = {
          id: fetchedRiderId,
          name: riderName,
          company_id: companyId,
          store_id: storeId,
        };

        // Store rider data
        setStoredRiderData(riderData);
        return riderData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching rider data:", error);
      showToastMessage("Failed to load rider data", "error");
      return null;
    }
  };

  // Completely revised initial data loading useEffect - ALWAYS fetch from server
  useEffect(() => {
    const initializeData = async () => {
      if (isLoadingRef.current || !userData?.user?.id) return;

      isLoadingRef.current = true;
      setIsRiderDataLoading(true);

      try {
        console.log("Initializing attendance data - ALWAYS fetching from server...");
        
        // Always fetch fresh rider data
        const riderData = await fetchRiderDataAndActiveAssignment();
        if (!riderData) {
          throw new Error("Failed to fetch rider data");
        }
        
        // Get token for API calls
        const token = await authService.getAccessToken();
        if (!token) {
          throw new Error("Authorization token is missing");
        }
        
        // ALWAYS fetch fresh attendance data from the server
        console.log("Fetching fresh attendance data from server for rider:", riderData.id);
        const attendanceResponse = await fetch(
          `${API_BASE}/attendance?rider_id=${riderData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            // Ensure we get fresh data
            cache: 'no-store'
          }
        );
        
        if (!attendanceResponse.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        
        const attendanceData = await attendanceResponse.json();
        console.log("Received attendance data from server:", attendanceData);
        
        // Fetch assignments
        const assignmentsResponse = await fetch(
          `${API_BASE}/rider-assignments?rider_id=${riderData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );
        
        if (!assignmentsResponse.ok) {
          throw new Error("Failed to fetch assignments");
        }
        
        const assignmentsData = await assignmentsResponse.json();
        
        // Update local storage with fresh data
        setStoredRiderData(riderData);
        setStoredRiderAssignments(assignmentsData);
        setStoredTodayAttendance(attendanceData);
        setLastAttendanceDate(new Date().toISOString().split('T')[0]);
        
        // Create complete data object
        const completeData = {
          riderData,
          attendanceData,
          assignmentsData
        };
        
        // Find today's record
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceData.find(
          (record: AttendanceRecord) =>
            record.attendance_date.split('T')[0] === today &&
            record.status === "present"
        );
        
        console.log("Today's attendance record from server:", todayRecord);
        
        // Set states based on today's record
        if (todayRecord) {
          setTodayRecord(todayRecord);
          
          if (todayRecord.check_in_time && todayRecord.check_out_time) {
            // Day is completed
            console.log("Setting state to COMPLETED based on server data");
            setAttendanceState("completed");
            setIsDayCompleted(true);
            setPunchInTime(new Date(todayRecord.check_in_time));
            setPunchOutTime(new Date(todayRecord.check_out_time));
            setCompletedDayData({
              punchIn: new Date(todayRecord.check_in_time).toLocaleTimeString(),
              punchOut: new Date(todayRecord.check_out_time).toLocaleTimeString(),
              workingHours: formatDuration(
                Math.floor(
                  (new Date(todayRecord.check_out_time).getTime() -
                    new Date(todayRecord.check_in_time).getTime()) /
                  1000
                )
              )
            });
          } else if (todayRecord.check_in_time) {
            // Only punched in
            console.log("Setting state to PUNCH-OUT based on server data");
            setAttendanceState("punch-out");
            setPunchInTime(new Date(todayRecord.check_in_time));
            setIsDayCompleted(false);
            setPunchOutTime(null);
            setCompletedDayData(null);
          }
        } else {
          // No attendance for today
          console.log("Setting state to PUNCH-IN based on server data (no record found)");
          setAttendanceState("punch-in");
          setTodayRecord(null);
          setPunchInTime(null);
          setPunchOutTime(null);
          setIsDayCompleted(false);
          setCompletedDayData(null);
        }
        
        // Update all state
        setInitialData(completeData);
        setRiderData(riderData);
        setRiderAssignments(assignmentsData);
        setAttendanceHistory(attendanceData);
        
        // Finish loading
        setTimeout(() => {
          setIsDataReady(true);
          setIsRiderDataLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error initializing data:", error);
        showToastMessage("Failed to load initial data", "error");
        setIsRiderDataLoading(false);
      } finally {
        isLoadingRef.current = false;
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      isLoadingRef.current = false;
    };
  }, [userData?.user?.id, API_BASE]);

  // Update the updateTodayAttendanceStatus function to handle the attendance data properly
  const updateTodayAttendanceStatus = useCallback((attendanceData: AttendanceRecord[]) => {
    if (!attendanceData || !Array.isArray(attendanceData)) {
      console.error("Invalid attendance data:", attendanceData);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Find today's record in the attendance data
    const todayRecord = attendanceData.find(
      (record: AttendanceRecord) =>
        record.attendance_date.split('T')[0] === today &&
        record.status === "present"
    );

    console.log("Updating today's attendance status:", todayRecord);

    // Update local storage with the latest attendance data
    setStoredTodayAttendance(attendanceData);
    setLastAttendanceDate(today);

    // Update the state based on the latest data
    if (todayRecord) {
      setTodayRecord(todayRecord);

      if (todayRecord.check_in_time && todayRecord.check_out_time) {
        // Day is completed
        console.log("Day is completed based on latest data");
        setAttendanceState("completed");
        setIsDayCompleted(true);
        setPunchInTime(todayRecord.check_in_time ? new Date(todayRecord.check_in_time) : null);
        setPunchOutTime(todayRecord.check_out_time ? new Date(todayRecord.check_out_time) : null);
        setCompletedDayData({
          punchIn: todayRecord.check_in_time ? new Date(todayRecord.check_in_time).toLocaleTimeString() : "",
          punchOut: todayRecord.check_out_time ? new Date(todayRecord.check_out_time).toLocaleTimeString() : "",
          workingHours: formatDuration(
            Math.floor(
              (new Date(todayRecord.check_out_time).getTime() -
                new Date(todayRecord.check_in_time).getTime()) /
              1000
            )
          )
        });
      } else if (todayRecord.check_in_time) {
        // Only punched in
        console.log("Only punched in based on latest data");
        setAttendanceState("punch-out");
        setPunchInTime(new Date(todayRecord.check_in_time));
        setIsDayCompleted(false);
        setPunchOutTime(null);
        setCompletedDayData(null);
      }
    } else {
      // No attendance for today
      console.log("No attendance for today based on latest data");
      setAttendanceState("punch-in");
      setTodayRecord(null);
      setPunchInTime(null);
      setPunchOutTime(null);
      setIsDayCompleted(false);
      setCompletedDayData(null);
    }
  }, []);

  // Update the fetchAttendanceHistory function to properly handle the attendance status
  const fetchAttendanceHistory = useCallback(async () => {
    if (!riderData.id || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      console.log("Fetching latest attendance data from server for rider:", riderData.id);
      const token = await authService.getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/attendance?rider_id=${riderData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) throw new Error("Failed to fetch attendance history");

      const data = await response.json();
      
      // Update attendance history
      setAttendanceHistory(data);

      // Find today's record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = data.find(
        (record: AttendanceRecord) =>
          record.attendance_date.split('T')[0] === today &&
          record.status === "present"
      );

      // Update state based on today's record
      if (todayRecord) {
        setTodayRecord(todayRecord);
        
        if (todayRecord.check_in_time && todayRecord.check_out_time) {
          setAttendanceState("completed");
          setIsDayCompleted(true);
          setPunchInTime(new Date(todayRecord.check_in_time));
          setPunchOutTime(new Date(todayRecord.check_out_time));
          setCompletedDayData({
            punchIn: new Date(todayRecord.check_in_time).toLocaleTimeString(),
            punchOut: new Date(todayRecord.check_out_time).toLocaleTimeString(),
            workingHours: formatDuration(
              Math.floor(
                (new Date(todayRecord.check_out_time).getTime() -
                  new Date(todayRecord.check_in_time).getTime()) /
                1000
              )
            )
          });
        } else if (todayRecord.check_in_time) {
          setAttendanceState("punch-out");
          setPunchInTime(new Date(todayRecord.check_in_time));
          setIsDayCompleted(false);
          setPunchOutTime(null);
          setCompletedDayData(null);
        }
      } else {
        setAttendanceState("punch-in");
        setTodayRecord(null);
        setPunchInTime(null);
        setPunchOutTime(null);
        setIsDayCompleted(false);
        setCompletedDayData(null);
      }

      return data;
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      showToastMessage("Failed to load attendance history", "error");
      return null;
    } finally {
      isLoadingRef.current = false;
    }
  }, [riderData.id]);

  // Add a manual refresh function that forces a complete reload of data
  const handleRefresh = useCallback(async () => {
    if (!riderData.id) return;
    
    setLoading(true);
    try {
      console.log("Manually refreshing attendance data...");
      
      // Get token for API calls
      const token = await authService.getAccessToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }
      
      // ALWAYS fetch fresh attendance data from the server
      console.log("Fetching fresh attendance data from server for rider:", riderData.id);
      const attendanceResponse = await fetch(
        `${API_BASE}/attendance?rider_id=${riderData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Ensure we get fresh data
          cache: 'no-store'
        }
      );
      
      if (!attendanceResponse.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      
      const attendanceData = await attendanceResponse.json();
      console.log("Received attendance data from server:", attendanceData);
      
      // Update local storage with fresh data
      setStoredTodayAttendance(attendanceData);
      setLastAttendanceDate(new Date().toISOString().split('T')[0]);
      
      // Update state with fresh data
      setAttendanceHistory(attendanceData);
      
      // Find today's record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceData.find(
        (record: AttendanceRecord) =>
          record.attendance_date.split('T')[0] === today &&
          record.status === "present"
      );
      
      console.log("Today's attendance record from server:", todayRecord);
      
      // Set states based on today's record
      if (todayRecord) {
        setTodayRecord(todayRecord);
        
        if (todayRecord.check_in_time && todayRecord.check_out_time) {
          // Day is completed
          console.log("Setting state to COMPLETED based on server data");
          setAttendanceState("completed");
          setIsDayCompleted(true);
          setPunchInTime(new Date(todayRecord.check_in_time));
          setPunchOutTime(new Date(todayRecord.check_out_time));
          setCompletedDayData({
            punchIn: new Date(todayRecord.check_in_time).toLocaleTimeString(),
            punchOut: new Date(todayRecord.check_out_time).toLocaleTimeString(),
            workingHours: formatDuration(
              Math.floor(
                (new Date(todayRecord.check_out_time).getTime() -
                  new Date(todayRecord.check_in_time).getTime()) /
                1000
              )
            )
          });
        } else if (todayRecord.check_in_time) {
          // Only punched in
          console.log("Setting state to PUNCH-OUT based on server data");
          setAttendanceState("punch-out");
          setPunchInTime(new Date(todayRecord.check_in_time));
          setIsDayCompleted(false);
          setPunchOutTime(null);
          setCompletedDayData(null);
        }
      } else {
        // No attendance for today
        console.log("Setting state to PUNCH-IN based on server data (no record found)");
        setAttendanceState("punch-in");
        setTodayRecord(null);
        setPunchInTime(null);
        setPunchOutTime(null);
        setIsDayCompleted(false);
        setCompletedDayData(null);
      }
      
      showToastMessage("Attendance data refreshed", "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showToastMessage("Failed to refresh data", "error");
    } finally {
      setLoading(false);
    }
  }, [riderData.id, API_BASE]);

  // Add an effect to check for attendance status changes on visibility/route changes
  useEffect(() => {
    // Only run if we have rider data
    if (!riderData.id) return;

    console.log("Setting up visibility and route change handlers");

    // Force a complete refresh of attendance data
    const forceRefresh = async () => {
      console.log("Forcing complete refresh of attendance data...");
      await handleRefresh();
    };

    // Handle visibility changes (when user switches tabs or returns to the app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("App became visible, forcing refresh...");
        forceRefresh();
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add route change listener for React Router
    const handleRouteChange = () => {
      console.log("Route changed, forcing refresh...");
      forceRefresh();
    };

    // Listen for route changes (this is a simplified approach - you may need to adapt based on your router)
    window.addEventListener('popstate', handleRouteChange);
    
    // Also listen for hashchange events
    window.addEventListener('hashchange', handleRouteChange);

    // Initial check
    forceRefresh();

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [riderData.id, handleRefresh]);

  // Update the executePunchIn function to handle the 409 Conflict error
  const executePunchIn = async (location: LocationData, currentRiderData: PunchInData) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    try {
      // First, fetch the latest attendance data to ensure we have the most up-to-date information
      console.log("Fetching latest attendance data before punch-in");
      const latestData = await fetchAttendanceHistory();
      
      // Re-check the todayRecord after fetching the latest data
      const existingRecord = latestData?.find(
        (record: AttendanceRecord) =>
          record.attendance_date.split('T')[0] === today &&
          record.status === "present"
      );
      
      // Check if already punched in today using the latest data
      if (existingRecord) {
        console.log("Found latest attendance record for today:", existingRecord);
        
        // If already punched out, show completed state
        if (existingRecord.check_out_time) {
          console.log("User has already punched out, showing completed state");
          setAttendanceState("completed");
          setIsDayCompleted(true);
          setPunchInTime(existingRecord.check_in_time ? new Date(existingRecord.check_in_time) : null);
          setPunchOutTime(existingRecord.check_out_time ? new Date(existingRecord.check_out_time) : null);
          setCompletedDayData({
            punchIn: existingRecord.check_in_time ? new Date(existingRecord.check_in_time).toLocaleTimeString() : "",
            punchOut: existingRecord.check_out_time ? new Date(existingRecord.check_out_time).toLocaleTimeString() : "",
            workingHours: formatDuration(
              Math.floor(
                (new Date(existingRecord.check_out_time).getTime() -
                  new Date(existingRecord.check_in_time).getTime()) /
                1000
              )
            )
          });
          showToastMessage("You've already completed your attendance for today", "warning");
          return null;
        } else if (existingRecord.check_in_time) {
          // If only punched in, show punch out state
          console.log("User has already punched in, showing punch out state");
          setAttendanceState("punch-out");
          setTodayRecord(existingRecord);
          setPunchInTime(new Date(existingRecord.check_in_time));
          showToastMessage("You've already punched in today. Please punch out when your shift ends.", "warning");
          return null;
        }
      }

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
        console.log("Executing punch in...");
        const result = await fetch(`${API_BASE}/attendance/punch-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!result.ok) {
          if (result.status === 409) {
            // Handle conflict - already punched in
            showToastMessage("You have already punched in today", "warning");
            // Refresh attendance data to update UI
            await fetchAttendanceHistory();
            return null;
          }
          const errorData = await result.json();
          throw new Error(errorData.error || "Failed to punch in");
        }

        const data = await result.json();

        // Create a complete record with all necessary fields
        const newRecord = {
          ...data,
          check_in_time: formatDateForAPI(now),
          check_in_latitude: location.latitude,
          check_in_longitude: location.longitude,
          check_in_accuracy: location.accuracy,
          attendance_date: today,
          status: "present" as "present"
        };

        // Update local state immediately after successful punch-in
        setAttendanceState("punch-out");
        setPunchInTime(now);
        setTodayRecord(newRecord);

        // Update stored attendance properly
        const currentAttendance = getStoredTodayAttendance() || [];
        const filteredAttendance = currentAttendance.filter((record: AttendanceRecord) =>
          !(record.attendance_date.split('T')[0] === today &&
            record.rider_id === currentRiderData.id &&
            record.status === "present")
        );
        const updatedAttendance = [...filteredAttendance, newRecord];
        setStoredTodayAttendance(updatedAttendance);
        setLastAttendanceDate(today);
        setAttendanceHistory(updatedAttendance);

        console.log("Punch in successful, localStorage updated");
        return data;
      } catch (error) {
        console.error("Error in punch-in:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in punch-in:", error);
      throw error;
    }
  };

  // Improved executePunchOut with better localStorage management
  const executePunchOut = async (location: LocationData) => {
    if (!todayRecord) {
      showToastMessage(
        "Cannot punch out. No active punch-in record found.",
        "error"
      );
      throw new Error("No active punch-in record found");
    }

    if (!isWithinAllowedRadius(location)) {
      showToastMessage(
        `You are outside the allowed area. Please come within ${ALLOWED_LOCATION.radius}m of the office.`,
        "error"
      );
      throw new Error("Location outside allowed area");
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const token = await authService.getAccessToken();
    if (!token) {
      showToastMessage(
        "Authorization token is missing. Cannot punch out.",
        "error"
      );
      throw new Error("Authorization token is missing for punch-out.");
    }

    const payload = {
      rider_id: todayRecord.rider_id,
      attendance_date: todayRecord.attendance_date,
      marked_by: userData?.user?.id || 0,
      remarks: "Punched Out",
      check_out_time: formatDateForAPI(now),
      check_out_latitude: location.latitude,
      check_out_longitude: location.longitude,
      check_out_accuracy: location.accuracy,
    };

    try {
      console.log("Executing punch out...");
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

      // Calculate working time
      const workingTimeSeconds = punchInTime ?
        Math.floor((now.getTime() - punchInTime.getTime()) / 1000) :
        workingTime;

      // Update local state immediately after successful punch-out
      setAttendanceState("completed");
      setPunchOutTime(now);
      setIsDayCompleted(true);
      setCompletedDayData({
        punchIn: punchInTime ? punchInTime.toLocaleTimeString() : "",
        punchOut: now.toLocaleTimeString(),
        workingHours: formatDuration(workingTimeSeconds)
      });

      // Create updated record with all necessary fields
      const updatedRecord = {
        ...todayRecord,
        ...data,
        check_out_time: formatDateForAPI(now),
        check_out_latitude: location.latitude,
        check_out_longitude: location.longitude,
        check_out_accuracy: location.accuracy
      };

      // Update stored attendance
      const currentAttendance = getStoredTodayAttendance() || [];

      // Replace the existing record with the updated one
      const updatedAttendance = currentAttendance.map((record: AttendanceRecord) =>
        record.id === todayRecord.id ? updatedRecord : record
      );

      // If for some reason the record wasn't found, add it
      if (!updatedAttendance.some((record: AttendanceRecord) => record.id === todayRecord.id)) {
        updatedAttendance.push(updatedRecord);
      }

      // Store the updated attendance
      setStoredTodayAttendance(updatedAttendance);

      // Update the last attendance date
      setLastAttendanceDate(today);

      // Also update the attendance history and today's record
      setAttendanceHistory(updatedAttendance);
      setTodayRecord(updatedRecord);

      console.log("Punch out successful, localStorage updated");
      return data;
    } catch (error) {
      console.error("Error in punch-out:", error);
      throw error;
    }
  };

  const handleStart = (clientX: number) => {
    if (attendanceState === "completed" || loading) return;
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
    // Don't proceed if not dragging, already completed, or loading
    if (!isDragging || attendanceState === "completed" || loading) {
      if (isDragging) setIsDragging(false);
      return;
    }
    setIsDragging(false);

    // Check if dragged far enough
    if (dragX > maxDragDistance * 0.85) {
      setDragX(maxDragDistance);
      setLoading(true);

      try {
        // Get current location
        const location = await getCurrentLocation();

        // Process based on current state
        if (attendanceState === "punch-in") {
          const result = await executePunchIn(location, riderData);
          if (result !== null) {
            showToastMessage("Successfully punched in!", "success");
          }
        } else if (attendanceState === "punch-out") {
          await executePunchOut(location);
          showToastMessage("Successfully punched out!", "success");
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

  // Update current time every second
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

  // Add a function to handle absent marking
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
          py: { xs: 1, sm: 4 },
          px: { xs: 1, sm: 2 },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 2 },
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

        {/* Time Card with Refresh Button */}
        <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center", position: "relative" }}>
            {/* Refresh Button */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)"
                }
              }}
              onClick={() => {
                showToastMessage("Refreshing attendance status...", "info");
                fetchAttendanceHistory();
              }}
            >
              <Refresh color="primary" />
            </Box>

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

        {/* Punch In/Out Card - Only show if day is not completed and we're not in completed state */}
        {!isDayCompleted && attendanceState !== "completed" && !completedDayData && (
          <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  height: { xs: 48, sm: 64 },
                  bgcolor: loading
                    ? "grey.500"
                    : todayRecord?.check_in_time && !todayRecord?.check_out_time
                      ? "#f44336"
                      : themeColor,
                  borderRadius: { xs: 24, sm: 32 },
                  overflow: "hidden",
                  cursor: loading ? "not-allowed" : "pointer",
                  userSelect: "none",
                  opacity: loading ? 0.7 : 1,
                  maxWidth: "100%",
                  margin: "0 auto",
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
                    <CircularProgress size={20} sx={{ color: "white" }} />
                  ) : (
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        color: "white",
                        fontSize: { xs: "0.75rem", sm: "1rem" },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        px: 1,
                      }}
                    >
                      {todayRecord?.check_in_time && !todayRecord?.check_out_time
                        ? "Swipe to Punch Out"
                        : "Swipe to Punch In"}
                    </Typography>
                  )}
                </Box>
                <Box
                  ref={buttonRef}
                  sx={{
                    position: "absolute",
                    left: 2,
                    top: 2,
                    width: { xs: 44, sm: 56 },
                    height: { xs: 44, sm: 56 },
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
                    transform: `translateX(${dragX}px) ${isDragging ? "scale(1.1)" : "scale(1)"}`,
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
                      fontSize: { xs: 18, sm: 24 },
                    }}
                  />
                </Box>
              </Paper>
            </CardContent>
          </Card>
        )}

        {/* Working Time Card - Only show if day is not completed */}
        {!isDayCompleted && attendanceState === "punch-out" && (
          <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Working Time
              </Typography>
              <Typography
                variant="h4"
                color="primary.main"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
              >
                {formatDuration(workingTime)}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Attendance History Card */}
        <Card elevation={0} sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Attendance History
            </Typography>

            {attendanceHistory.length > 0 ? (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "8px", textAlign: "left", fontSize: "0.875rem" }}>Date</th>
                      <th style={{ padding: "8px", textAlign: "left", fontSize: "0.875rem" }}>Status</th>
                      <th style={{ padding: "8px", textAlign: "left", fontSize: "0.875rem" }}>Punch In</th>
                      <th style={{ padding: "8px", textAlign: "left", fontSize: "0.875rem" }}>Punch Out</th>
                      <th style={{ padding: "8px", textAlign: "left", fontSize: "0.875rem" }}>Working Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontSize: "0.875rem" }}>
                          {new Date(record.attendance_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                          <Chip
                            label={record.status}
                            size="small"
                            color={record.status === "present" ? "success" : "error"}
                            sx={{ fontSize: "0.75rem" }}
                          />
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontSize: "0.875rem" }}>
                          {record.check_in_time
                            ? new Date(record.check_in_time).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontSize: "0.875rem" }}>
                          {record.check_out_time
                            ? new Date(record.check_out_time).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontSize: "0.875rem" }}>
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
