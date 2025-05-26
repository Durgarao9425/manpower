import React from "react";
import {
  Route,
  Routes as RouterRoutes,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

// Page Components
import Logout from "../Components/Pages/Dashboard/Login/logout";
import Layout from "../Components/Pages/Dashboard/layout";
import TransportDashboard from "../Components/Pages/Dashboard/dashboard";
import RiderListingPage from "../Components/Pages/RidersPage/riderList";
import ThemeSettings from "../Components/Pages/SettingPage/ThemSettingPage";
import RiderDashboardApp from "../Components/Pages/RiderDashboard/RiderDashboard";
import StoreManagement from "../Components/Pages/StorePage/storePage";
import RiderAttendanceApp from "../Components/Pages/RiderAttendace/RiderAttendance";
import UserListing from "../Components/Pages/UserPage/userList";
import DataImportSystem from "../Components/Pages/DataImport/DataImport";
import CompanyPage from "../Components/Pages/Company/companyPage";
import RoleManagementPage from "../Components/Pages/RolePermissions/RolePermissions";
import OrderManagementSystem from "../Components/Pages/OrderPage/OrderPage";
import RiderRegistrationForm from "../Components/Pages/RidersPage/Riderform";
import CompanySettings from "../Components/Pages/SettingPage/Settings";
import LoginPage from "../Components/Pages/Dashboard/Login/login";
import ReusableListingPage from "../Components/Pages/RiderAttendace/AttendanceListingPage";

// ProtectedRoute Component
interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!allowedRoles.includes(userRole || "")) {
      navigate("/unauthorized"); // Optional: create Unauthorized page
    }
  }, [isAuthenticated, userRole, allowedRoles, navigate]);

  if (!isAuthenticated || !allowedRoles.includes(userRole || "")) {
    return null; // or a loading spinner
  }

  return <Outlet />;
};

// NotFound Page
const NotFound = () => {
  return <div style={{ padding: "2rem", textAlign: "center" }}>404 - Not Found</div>;
};

// App Routes
const AppRoutes = () => {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Logout />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<TransportDashboard />} />
          <Route path="/riders" element={<RiderListingPage />} />
          <Route path="/companies" element={<CompanyPage />} />
          <Route path="/them-settings" element={<ThemeSettings />} />
          <Route path="/stores" element={<StoreManagement />} />
          <Route path="/rider-attendace" element={<RiderAttendanceApp />} />
          <Route path="/user-page" element={<UserListing />} />
          <Route path="/data-import" element={<DataImportSystem />} />
          <Route path="/role-permissions" element={<RoleManagementPage />} />
          <Route path="/orders" element={<OrderManagementSystem />} />
          <Route path="/rider-form" element={<RiderRegistrationForm />} />
          <Route path="/settings" element={<CompanySettings />} />
          <Route path="/rider-attendance" element={<RiderAttendanceApp />} />

        </Route>
      </Route>

      {/* Rider Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["rider"]} />}>
        <Route path="/rider-dashboard" element={<RiderDashboardApp />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default AppRoutes;
