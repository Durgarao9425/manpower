import React from "react";
import {
  Route,
  Routes as RouterRoutes,
  Navigate,
} from "react-router-dom";

// Import the new ProtectedRoute component
import ProtectedRoute from "../Components/Common/ProtectedRoute";
import TestAuth from "../Components/Common/TestAuth";

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
import RiderDashboard from "../Components/Pages/Dashboard/DynamicDashboard";
import OrdersListingPage from "../Components/Pages/UploadOrderPage/UploadOrderpage";
import PaymentListingPage from "../Components/Pages/PaymentPage/paymentPage";
import SliderManagementPage from "../Components/Pages/SliderPage/SliderPage";
import RiderEarningPage from "../Components/Pages/RiderEarnings/MainPage";
import EnhancedLoginPage from "../Components/Pages/Dashboard/Login/loginNew";
import RiderDeliveryReport from "../Components/Reports/reports";
import CustomFieldsManager from "../Components/Pages/CustomFields/Customefields";

// NotFound and Unauthorized Pages
const NotFound = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

const Unauthorized = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  );
};

// App Routes
const AppRoutes = () => {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="/login" element={<EnhancedLoginPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/test-auth" element={<TestAuth />} />

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
          <Route path="/dynami-dashboard" element={<RiderDashboard />} />
          <Route path="/upload-orders" element={<OrdersListingPage />} />
          <Route path="/payments" element={<PaymentListingPage />} />
          <Route path="/slider-page" element={<SliderManagementPage />} />
          <Route path="/earnings" element={<RiderEarningPage />} />
          <Route path="/reports" element={<RiderDeliveryReport />} />
          <Route path="/custom-fields" element={<CustomFieldsManager />} />
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
