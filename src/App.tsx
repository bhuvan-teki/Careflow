import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { PortalSelector } from "./pages/auth/PortalSelector";
import { PatientLogin } from "./pages/auth/PatientLogin";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { PatientDashboard } from "./pages/patient/PatientDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout><PortalSelector /></AuthLayout>} />
      <Route path="/patient/login" element={<AuthLayout><PatientLogin /></AuthLayout>} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/reset-password/:token" element={<AuthLayout><ResetPassword /></AuthLayout>} />
      
      {/* Disabled clinic and staff routes - redirect to patient dashboard */}
      <Route path="/clinic/*" element={<Navigate to="/patient/dashboard" replace />} />
      <Route path="/staff/*" element={<Navigate to="/patient/dashboard" replace />} />
    </Routes>
  );
}

export default App;
