import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
import HistoryPemilihan from "./pages/admin/HistoryPemilihan"; // Import Page Baru

// =======================
// Proteksi Admin Route
// =======================
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// =======================
// Proteksi Mahasiswa Route
// =======================
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "user") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// =======================
// Wrapper Animasi Route
// =======================
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ height: "100%" }}
      >
        <Routes location={location}>
          {/* Landing Page */}
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
          {/* Route History Baru */}
          <Route
            path="/admin/history"
            element={
              <AdminRoute>
                <HistoryPemilihan />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;