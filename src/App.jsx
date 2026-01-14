import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages Mahasiswa
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Voting from "./pages/Voting";
import Result from "./pages/Result";

// Pages Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCandidate from "./pages/admin/ManageCandidate";
import KelolaPemilih from "./pages/admin/KelolaPemilih";
import VotingResult from "./pages/admin/VotingResult";

// =======================
// Proteksi Admin Route
// =======================
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "admin") {
    return <Navigate to="/" replace />; // redirect ke landing page
  }
  return children;
};

// Proteksi Mahasiswa Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "user") {
    return <Navigate to="/" replace />; // redirect ke landing page
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page sebagai halaman utama */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Mahasiswa */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/voting"
          element={
            <PrivateRoute>
              <Voting />
            </PrivateRoute>
          }
        />
        <Route
          path="/result"
          element={
            <PrivateRoute>
              <Result />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-candidates"
          element={
            <AdminRoute>
              <ManageCandidate />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/kelola-pemilih"
          element={
            <AdminRoute>
              <KelolaPemilih />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <VotingResult />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
