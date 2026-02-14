import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import AuditLogs from "./pages/AuditLogs";
import Prescriptions from "./pages/Prescriptions";
import LabResults from "./pages/LabResults";
import Notifications from "./pages/Notifications";
import BookAppointment from "./pages/BookAppointment";


import "./App.css";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Patients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Doctors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "patient"]}>
                <Appointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-records"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={["admin", "patient"]}>
                <Billing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "patient"]}>
                <Prescriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lab-results"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "patient"]}>
                <LabResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "patient"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "patient"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
    
      </div>
    </>
  );
}
