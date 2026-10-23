import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ParentDashboard from "./pages/parent/Dashboard";
import AddChild from "./pages/parent/AddChild";
import ChildVaccinations from "./pages/parent/ChildVaccinations";
import HealthWorkerDashboard from "./pages/healthWorker/Dashboard";
import RecordVaccination from "./pages/healthWorker/RecordVaccination";
import AdminDashboard from "./pages/admin/Dashboard";
import { getDashboardPath } from "./utils/routePaths";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but tries to access the wrong role, send them to their correct dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/parent/*"
        element={
          <ProtectedRoute allowedRoles={["parent", "admin"]}>
            <Routes>
              <Route path="/" element={<ParentDashboard />} />
              <Route path="/children/add" element={<AddChild />} />
              <Route
                path="/children/:childId/vaccinations"
                element={<ChildVaccinations />}
              />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/health-worker/*"
        element={
          <ProtectedRoute allowedRoles={["healthWorker", "admin"]}>
            <Routes>
              <Route path="/" element={<HealthWorkerDashboard />} />
              <Route
                path="/children/:childId/record-vaccine"
                element={<RecordVaccination />}
              />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Safe root redirect: Only triggers when loading is definitively false */}
      <Route
        path="/"
        element={
          user && user.role ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
