import { Navigate, Route, Routes } from 'react-router';

import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ForgotPasswordView } from '@/pages/auth/forgot-password/view';
import { LoginView } from '@/pages/auth/login/view';
import { RegisterView } from '@/pages/auth/register/view';
import { VerifyPhoneView } from '@/pages/auth/verify-phone/view';
import { DashboardView } from '@/pages/dashboard/view';
import { CreateTenantView } from '@/pages/tenant/create/view';
import {
  RequireAuth,
  RequireConfirmedPhone,
  RequireGuest,
  RequireTenant,
} from '@/routes/guards';

function App() {
  return (
    <Routes>
      {/* Signed out only */}
      <Route element={<RequireGuest />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginView />} />
          <Route path="register" element={<RegisterView />} />
          <Route path="forgot-password" element={<ForgotPasswordView />} />
        </Route>
      </Route>

      {/* Signed in only */}
      <Route element={<RequireAuth />}>
        {/* Reachable before the phone is confirmed — it is what confirms it */}
        <Route element={<AuthLayout />}>
          <Route path="verify-phone" element={<VerifyPhoneView />} />
        </Route>

        <Route element={<RequireConfirmedPhone />}>
          {/* Onboarding step for an account that has no tenant yet */}
          <Route element={<AuthLayout />}>
            <Route path="create-tenant" element={<CreateTenantView />} />
          </Route>

          <Route element={<RequireTenant />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardView />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
