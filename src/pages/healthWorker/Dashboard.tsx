import { useAuth } from "../../contexts/AuthContext";

const HealthWorkerDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-warm-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏥 {user?.name}</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
        <div className="card-clinical p-8">
          <p className="text-gray-600">
            Health worker dashboard coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthWorkerDashboard;
