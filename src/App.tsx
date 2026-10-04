import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthGuard, GuestGuard, PermissionGuard, SessionGuard } from "@/guards/auth-guard";
import { AuthLayout } from "@/layouts/auth";
import { DashboardLayout } from "@/layouts/dashboard";
import { Permission } from "@/lib/permissions";
import CreateTenantPage from "@/pages/auth/create-tenant";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import VerifyPage from "@/pages/auth/verify";
import AnalyticsPage from "@/pages/analytics/view";
import BookingsListPage from "@/pages/bookings/list";
import DashboardView from "@/pages/dashboard/view";
import EmployeeCreatePage from "@/pages/employees/create";
import EmployeesListPage from "@/pages/employees/list";
import PlaceholderPage from "@/pages/placeholder";
import TripProgramCreatePage from "@/pages/trip-programs/create";
import TripProgramEditPage from "@/pages/trip-programs/edit";
import TripProgramsListPage from "@/pages/trip-programs/list";
import TripProgramViewPage from "@/pages/trip-programs/view";
import TripCreatePage from "@/pages/trips/create";
import TripEditPage from "@/pages/trips/edit";
import TripsListPage from "@/pages/trips/list";
import TripViewPage from "@/pages/trips/view";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SessionGuard />}>
          <Route element={<GuestGuard />}>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          <Route element={<AuthGuard step="verify" />}>
            <Route element={<AuthLayout />}>
              <Route path="verify" element={<VerifyPage />} />
            </Route>
          </Route>

          <Route element={<AuthGuard step="tenant" />}>
            <Route element={<AuthLayout />}>
              <Route path="create-tenant" element={<CreateTenantPage />} />
            </Route>
          </Route>

          <Route element={<AuthGuard step="ready" />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardView />} />
              <Route path="trip-programs">
                <Route index element={<TripProgramsListPage />} />
                <Route path=":id" element={<TripProgramViewPage />} />
                <Route element={<PermissionGuard permission={Permission.ManageTripPrograms} />}>
                  <Route path="new" element={<TripProgramCreatePage />} />
                  <Route path=":id/edit" element={<TripProgramEditPage />} />
                </Route>
              </Route>
              <Route path="trips">
                <Route index element={<TripsListPage />} />
                <Route path=":id" element={<TripViewPage />} />
                <Route element={<PermissionGuard permission={Permission.ManageTrips} />}>
                  <Route path="new" element={<TripCreatePage />} />
                  <Route path=":id/edit" element={<TripEditPage />} />
                </Route>
              </Route>
              <Route element={<PermissionGuard permission={Permission.ViewBookings} />}>
                <Route path="bookings" element={<BookingsListPage />} />
              </Route>
              <Route element={<PermissionGuard permission={Permission.ViewStatistics} />}>
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
              <Route path="settings/employees" element={<PermissionGuard permission={Permission.ManageEmployees} />}>
                <Route index element={<EmployeesListPage />} />
                <Route path="new" element={<EmployeeCreatePage />} />
              </Route>
              <Route path="settings/tenant" element={<PlaceholderPage />} />
              <Route path="settings/account" element={<PlaceholderPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
