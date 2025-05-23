import { Route, Routes as RouterRoutes, Navigate } from "react-router-dom";
import TransportManagementLogin from "../Components/Pages/Dashboard/Login/login";
import TransportDashboard from "../Components/Pages/Dashboard/dashboard";
import Layout from "../Components/Pages/Dashboard/layout";
import Logout from "../Components/Pages/Dashboard/Login/logout";
import LoginPage from "../Components/Pages/Dashboard/Login/login";
import RiderListingPage from "../Components/Pages/RidersPage/riderList";
import CompanyListPage from "../Components/Pages/Company/caompanyPage";

const NotFound = () => {
  return <div>Not Found</div>;
};

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Logout />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<TransportDashboard />} />
        <Route path="/riders" element={<RiderListingPage />} />
        <Route path="/companies" element={<CompanyListPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
