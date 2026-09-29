import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthGuard, GuestGuard, SessionGuard } from "@/guards/auth-guard";
import { AuthLayout } from "@/layouts/auth";
import { DashboardLayout } from "@/layouts/dashboard";
import CreateTenantPage from "@/pages/auth/create-tenant";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import VerifyPage from "@/pages/auth/verify";
import DashboardView from "@/pages/dashboard/view";
import PlaceholderPage from "@/pages/placeholder";
import TripProgramsListPage from "@/pages/trip-programs/list";
import TripProgramViewPage from "@/pages/trip-programs/view";

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
                <Route path="new" element={<PlaceholderPage />} />
                <Route path=":id" element={<TripProgramViewPage />} />
                <Route path=":id/edit" element={<PlaceholderPage />} />
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
