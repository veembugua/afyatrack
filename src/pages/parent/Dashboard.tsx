import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeChildrenByParent } from "../../services/childService";
import type { Child } from "../../types";
import toast from "react-hot-toast";

const ParentDashboard = () => {
  const { user, signOut } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const parentId = user?.uid;

  useEffect(() => {
    if (!parentId) return;

    return subscribeChildrenByParent(
      parentId,
      (data) => {
        setChildren(data);
        setLoadError(null);
        setLoading(false);
      },
      (err: Error) => {
        const message =
          err instanceof Error ? err.message : "Failed to load your children";
        setChildren([]);
        setLoadError(message);
        setLoading(false);
        toast.error(message);
      },
    );
  }, [parentId]);

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birth = new Date(dob);
    let years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    if (years === 0) {
      const totalMonths =
        (today.getFullYear() - birth.getFullYear()) * 12 +
        today.getMonth() -
        birth.getMonth();
      return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👋 Hello, {user?.name}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your children's health records
            </p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Children</div>
            <div className="text-3xl font-bold text-clinical-700">
              {children.length}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Upcoming Vaccines</div>
            <div className="text-3xl font-bold text-warm-600">—</div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Appointments</div>
            <div className="text-3xl font-bold text-clinical-700">—</div>
          </div>
        </div>

        {/* Children List */}
        <div className="card-clinical p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Children</h2>
            <Link
              to="/parent/children/add"
              className="px-4 py-2 bg-clinical-600 text-white rounded-lg text-sm font-medium hover:bg-clinical-700 transition"
            >
              + Add Child
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-clinical-600"></div>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">
                We couldn't load your children's records.
              </p>
              <p className="text-sm text-gray-500">{loadError}</p>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👶</div>
              <p className="text-gray-600 mb-4">No children added yet</p>
              <Link
                to="/parent/children/add"
                className="inline-block px-6 py-2 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition"
              >
                Add Your First Child
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-5 border border-gray-200 rounded-xl hover:border-clinical-300 hover:shadow-md transition bg-white"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-clinical-100 flex items-center justify-center text-clinical-700 text-2xl flex-shrink-0">
                      {child.gender === "male" ? "👦" : "👧"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {calculateAge(child.dateOfBirth)} old
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        DOB: {new Date(child.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center p-2 bg-warm-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Vaccines
                      </div>
                      <div className="text-lg font-bold text-clinical-700">
                        View
                      </div>
                    </div>
                    <div className="text-center p-2 bg-warm-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Growth
                      </div>
                      <div className="text-lg font-bold text-warm-600">
                        View
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/parent/children/${child.id}/vaccinations`}
                      className="flex-1 text-center py-2 bg-clinical-600 text-white rounded-lg text-sm font-medium hover:bg-clinical-700 transition"
                    >
                      Manage Health Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
