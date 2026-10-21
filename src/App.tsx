import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ParentDashboard from "./pages/parent/Dashboard";
import AddChild from "./pages/parent/AddChild";
import HealthWorkerDashboard from "./pages/healthWorker/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ChildVaccinations from "./pages/parent/ChildVaccinations";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}`} replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <ProtectedRoute allowedRoles={["parent"]}>
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
          <ProtectedRoute allowedRoles={["healthWorker"]}>
            <HealthWorkerDashboard />
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

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

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
