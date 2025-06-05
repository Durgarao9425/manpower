import React from "react";
import { Route, Routes as RouterRoutes, Navigate } from "react-router-dom";

// Import the new ProtectedRoute component
import ProtectedRoute from "../Components/Common/ProtectedRoute";
import PermissionGuard from "../Components/Common/PermissionGuard";
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
// import OrdersListingPage from "../Components/Pages/UploadOrderPage/UploadOrderpage";
import PaymentListingPage from "../Components/Pages/PaymentPage/paymentPage";
import SliderManagementPage from "../Components/Pages/SliderPage/SliderPage";
import RiderEarningPage from "../Components/Pages/RiderEarnings/MainPage";
import EnhancedLoginPage from "../Components/Pages/Dashboard/Login/loginNew";
import RiderDeliveryReport from "../Components/Reports/reports";
import CustomFieldsManager from "../Components/Pages/CustomeFields/Customfields";
import OrdersList from "../Components/Pages/UploadOrderPage/UploadOrderList";
import ExcelFieldMapper from "../Components/Pages/UploadOrderPage/OrderView";
import InvoiceListPage from "../Components/Pages/Invoice/InvoiceListPage";
import DataMappingView from "../Components/Pages/UploadOrderPage/uploadOrderViewPage";
import DashboardNew from "../Components/Pages/Dashboard/dashboard";
import PaymentManagement from "../Components/Pages/PaymentPage/mainPage";
import RiderView from "../Components/Pages/RidersPage/riderView";

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
      <Route path="/login" element={<EnhancedLoginPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/test-auth" element={<TestAuth />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PermissionGuard moduleId="dashboard" requiredPermission="view">
              <DashboardNew />
            </PermissionGuard>
          } />
          
          {/* Riders */}
          <Route path="/riders" element={
            <PermissionGuard moduleId="riders" requiredPermission="view">
              <RiderListingPage />
            </PermissionGuard>
          } />
          <Route path="/riders/view/:id" element={
            <PermissionGuard moduleId="riders" requiredPermission="view">
              <RiderView />
            </PermissionGuard>
          } />
          <Route path="/riders/edit/:id" element={
            <PermissionGuard moduleId="riders" requiredPermission="edit">
              <RiderRegistrationForm />
            </PermissionGuard>
          } />
          <Route path="/rider-form" element={
            <PermissionGuard moduleId="riders" requiredPermission="edit">
              <RiderRegistrationForm />
            </PermissionGuard>
          } />
          
          {/* Companies */}
          <Route path="/companies" element={
            <PermissionGuard moduleId="companies" requiredPermission="view">
              <CompanyPage />
            </PermissionGuard>
          } />
          
          {/* Stores */}
          <Route path="/stores" element={
            <PermissionGuard moduleId="stores" requiredPermission="view">
              <StoreManagement />
            </PermissionGuard>
          } />
          
          {/* Attendance */}
          <Route path="/rider-attendance" element={
            <PermissionGuard moduleId="attendance" requiredPermission="view">
              <RiderAttendanceApp />
            </PermissionGuard>
          } />
          <Route path="/rider-attendace" element={
            <Navigate to="/rider-attendance" replace />
          } />
          
          {/* User Management */}
          <Route path="/user-page" element={
            <PermissionGuard moduleId="user" requiredPermission="view">
              <UserListing />
            </PermissionGuard>
          } />
          
          {/* Data Import */}
          <Route path="/data-import" element={
            <PermissionGuard moduleId="settings" requiredPermission="view">
              <DataImportSystem />
            </PermissionGuard>
          } />
          
          {/* Role Permissions */}
          <Route path="/role-permissions" element={
            <PermissionGuard moduleId="user" requiredPermission="edit">
              <RoleManagementPage />
            </PermissionGuard>
          } />
          
          {/* Orders */}
          <Route path="/orders" element={
            <PermissionGuard moduleId="orders" requiredPermission="view">
              <OrderManagementSystem />
            </PermissionGuard>
          } />
          
          {/* Settings */}
          <Route path="/settings" element={
            <PermissionGuard moduleId="settings" requiredPermission="view">
              <CompanySettings />
            </PermissionGuard>
          } />
          <Route path="/them-settings" element={
            <PermissionGuard moduleId="settings" requiredPermission="view">
              <ThemeSettings />
            </PermissionGuard>
          } />
          
          {/* Dashboard */}
          <Route path="/dynami-dashboard" element={
            <PermissionGuard moduleId="dashboard" requiredPermission="view">
              <RiderDashboard />
            </PermissionGuard>
          } />
          
          {/* Payments */}
          <Route path="/payments" element={
            <PermissionGuard moduleId="payments" requiredPermission="view">
              <PaymentManagement />
            </PermissionGuard>
          } />
          
          {/* Slider */}
          <Route path="/slider-page" element={
            <PermissionGuard moduleId="settings" requiredPermission="view">
              <SliderManagementPage />
            </PermissionGuard>
          } />
          
          {/* Earnings */}
          <Route path="/earnings" element={
            <PermissionGuard moduleId="earnings" requiredPermission="view">
              <RiderEarningPage />
            </PermissionGuard>
          } />
          
          {/* Reports */}
          <Route path="/reports" element={
            <PermissionGuard moduleId="dashboard" requiredPermission="view">
              <RiderDeliveryReport />
            </PermissionGuard>
          } />
          
          {/* Custom Fields */}
          <Route path="/custom-fields" element={
            <PermissionGuard moduleId="settings" requiredPermission="view">
              <CustomFieldsManager />
            </PermissionGuard>
          } />
          
          {/* Orders Upload */}
          <Route path="/upload-orders" element={
            <PermissionGuard moduleId="orders" requiredPermission="view">
              <OrdersList />
            </PermissionGuard>
          } />
          <Route path="/weekly-order-view" element={
            <PermissionGuard moduleId="orders" requiredPermission="view">
              <ExcelFieldMapper />
            </PermissionGuard>
          } />
          <Route path="/view-upload-orders" element={
            <PermissionGuard moduleId="orders" requiredPermission="view">
              <DataMappingView />
            </PermissionGuard>
          } />
          
          {/* Invoice */}
          <Route path="/invoice" element={
            <PermissionGuard moduleId="invoice" requiredPermission="view">
              <InvoiceListPage />
            </PermissionGuard>
          } />
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
