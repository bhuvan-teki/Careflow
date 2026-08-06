import { Routes, Route } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { PortalSelector } from "./pages/auth/PortalSelector";
import { PatientLogin } from "./pages/auth/PatientLogin";
import { ClinicRegister } from "./pages/auth/ClinicRegister";
import { ClinicLogin } from "./pages/auth/ClinicLogin";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { PatientDashboard } from "./pages/patient/PatientDashboard";
import { ClinicDashboard } from "./pages/clinic/ClinicDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout><PortalSelector /></AuthLayout>} />
      <Route path="/patient/login" element={<AuthLayout><PatientLogin /></AuthLayout>} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/clinic/register" element={<AuthLayout><ClinicRegister /></AuthLayout>} />
      <Route path="/clinic/login" element={<AuthLayout><ClinicLogin /></AuthLayout>} />
      <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/reset-password/:token" element={<AuthLayout><ResetPassword /></AuthLayout>} />
    </Routes>
  );
}

export default App;
