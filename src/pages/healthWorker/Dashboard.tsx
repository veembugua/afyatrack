import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchChildrenByFacility } from "../../services/childService";
import type { Child } from "../../types";
import toast from "react-hot-toast";

const HealthWorkerDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (!user?.facilityId) return;

    fetchChildrenByFacility(user.facilityId)
      .then((data) => setChildren(data))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load children";
        toast.error(message);
      });
  }, [user?.facilityId]);

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birth = new Date(dob);
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      today.getMonth() -
      birth.getMonth();
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    return `${years} yr`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  if (!user?.facilityId) {
    return (
      <div className="min-h-screen bg-warm-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="card-clinical p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Facility Assigned
            </h2>
            <p className="text-gray-600 mb-4">
              Your account does not have a health facility assigned. Please
              contact an administrator.
            </p>
            <button
              onClick={signOut}
              className="px-6 py-2 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🏥 Facility Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">
              Registered Children
            </div>
            <div className="text-3xl font-bold text-clinical-700">
              {children.length}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Missed Vaccines</div>
            <div className="text-3xl font-bold text-red-600">0</div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">
              Today's Appointments
            </div>
            <div className="text-3xl font-bold text-warm-600">0</div>
          </div>
        </div>

        <div className="card-clinical p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Children at this Facility
          </h2>

          {children.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-clinical-600 mx-auto mb-4"></div>
              <p>
                Loading children, or no children registered at this facility
                yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-warm-50 text-gray-600 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {children.map((child) => (
                    <tr key={child.id} className="hover:bg-warm-50 transition">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {calculateAge(child.dateOfBirth)}
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">
                        ID: {child.parentId.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/health-worker/children/${child.id}/record-vaccine`}
                          aria-label={`Record vaccination for ${child.firstName} ${child.lastName}`}
                          className="inline-block px-4 py-2 bg-clinical-600 text-white rounded-lg text-sm font-medium hover:bg-clinical-700 transition"
                        >
                          Record Vaccination
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthWorkerDashboard;
