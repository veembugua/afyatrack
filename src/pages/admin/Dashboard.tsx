import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAllChildren,
  fetchAllVaccinations,
  fetchUsersByRole,
  fetchAllFacilities,
  fetchAllVaccineSchedules,
} from "../../services/adminService";
import { calculateVaccineCoverage } from "../../utils/analytics";
import type {
  User,
  HealthFacility,
  Child,
  Vaccination,
  VaccineSchedule,
} from "../../types";
import FacilityForm from "../../components/admin/FacilityForm";
import ReassignFacilityModal from "../../components/admin/ReassignFacilityModal";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalChildren, setTotalChildren] = useState(0);
  const [totalVaccinations, setTotalVaccinations] = useState(0);
  const [totalParents, setTotalParents] = useState(0);
  const [totalHealthWorkers, setTotalHealthWorkers] = useState(0);
  const [totalFacilities, setTotalFacilities] = useState(0);

  // Data for Analytics
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [vaccinationsData, setVaccinationsData] = useState<Vaccination[]>([]);
  const [keyVaccines, setKeyVaccines] = useState<VaccineSchedule[]>([]);

  // Lists
  const [healthWorkers, setHealthWorkers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);

  // Modals
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<HealthFacility | null>(
    null,
  );
  const [reassigningUser, setReassigningUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [
          children,
          vaccinations,
          parents,
          healthWorkers,
          facilities,
          schedules,
        ] = await Promise.all([
          fetchAllChildren(),
          fetchAllVaccinations(),
          fetchUsersByRole("parent"),
          fetchUsersByRole("healthWorker"),
          fetchAllFacilities(),
          fetchAllVaccineSchedules(),
        ]);

        if (isMounted) {
          setTotalChildren(children.length);
          setTotalVaccinations(vaccinations.length);
          setTotalParents(parents.length);
          setTotalHealthWorkers(healthWorkers.length);
          setTotalFacilities(facilities.length);
          setHealthWorkers(healthWorkers);
          setFacilities(facilities);

          // Store raw data for analytics
          setChildrenData(children);
          setVaccinationsData(vaccinations);

          // Pick 4 key milestones to display (e.g., Week 0, Week 6, Week 14, Week 36)
          // We sort by ageInWeeks and pick 4 distinct milestones
          const sortedSchedule = [...schedules].sort(
            (a, b) => a.ageInWeeks - b.ageInWeeks,
          );
          const milestones = [
            sortedSchedule.find((v) => v.ageInWeeks === 0), // Birth
            sortedSchedule.find((v) => v.ageInWeeks === 6), // 6 Weeks
            sortedSchedule.find((v) => v.ageInWeeks === 14), // 14 Weeks
            sortedSchedule.find((v) => v.ageInWeeks >= 36), // 9 Months (approx 36+ weeks)
          ].filter((v): v is VaccineSchedule => v !== undefined);

          setKeyVaccines(milestones);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load stats";
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditFacility = (facility: HealthFacility) => {
    setEditingFacility(facility);
    setShowFacilityForm(true);
  };

  const handleAddFacility = () => {
    setEditingFacility(null);
    setShowFacilityForm(true);
  };

  const handleReassignUser = (user: User) => setReassigningUser(user);

  const handleModalSuccess = () => {
    setLoading(true);
    fetchUsersByRole("healthWorker").then((updatedWorkers) => {
      setHealthWorkers(updatedWorkers);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🔧 Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">System Overview & Analytics</p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Sign Out
          </button>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Children</div>
            <div className="text-3xl font-bold text-clinical-700">
              {totalChildren}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Vaccinations</div>
            <div className="text-3xl font-bold text-green-600">
              {totalVaccinations}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Parents</div>
            <div className="text-3xl font-bold text-blue-600">
              {totalParents}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Health Workers</div>
            <div className="text-3xl font-bold text-purple-600">
              {totalHealthWorkers}
            </div>
          </div>
          <div className="card-clinical p-6">
            <div className="text-sm text-gray-500 mb-1">Facilities</div>
            <div className="text-3xl font-bold text-warm-600">
              {totalFacilities}
            </div>
          </div>
        </div>

        {/* 🌟 NEW: System Analytics - Vaccine Coverage */}
        <div className="card-clinical p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            📊 System Vaccine Coverage
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Percentage of age-eligible children who have received key milestone
            vaccines.
          </p>

          {keyVaccines.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No vaccine schedule data available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyVaccines.map((vaccine) => {
                const stats = calculateVaccineCoverage(
                  vaccine,
                  childrenData,
                  vaccinationsData,
                );
                return (
                  <div
                    key={vaccine.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {vaccine.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Week {vaccine.ageInWeeks}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span
                        className={`text-2xl font-bold ${stats.percentage >= 80 ? "text-green-600" : stats.percentage >= 50 ? "text-warm-600" : "text-red-600"}`}
                      >
                        {stats.percentage}%
                      </span>
                      <span className="text-xs text-gray-500 mb-1">
                        ({stats.vaccinated} / {stats.eligible} eligible)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${stats.percentage >= 80 ? "bg-green-500" : stats.percentage >= 50 ? "bg-warm-500" : "bg-red-500"}`}
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Target: {vaccine.disease}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Health Workers List */}
        <div className="card-clinical p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Health Workers ({healthWorkers.length})
          </h2>
          {healthWorkers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No health workers registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-warm-50 text-gray-600 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Current Facility</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {healthWorkers.map((hw) => (
                    <tr key={hw.uid} className="hover:bg-warm-50 transition">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {hw.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{hw.email}</td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-sm">
                        {hw.facilityId || (
                          <span className="text-red-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleReassignUser(hw)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                        >
                          Reassign Facility
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Facilities List */}
        <div className="card-clinical p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Health Facilities ({facilities.length})
            </h2>
            <button
              onClick={handleAddFacility}
              className="px-4 py-2 bg-clinical-600 text-white rounded-lg text-sm font-medium hover:bg-clinical-700 transition"
            >
              + Add Facility
            </button>
          </div>
          {facilities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No facilities registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-warm-50 text-gray-600 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Facility Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facilities.map((f) => (
                    <tr key={f.id} className="hover:bg-warm-50 transition">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {f.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600 capitalize">
                        {f.type || "clinic"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{f.region}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleEditFacility(f)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFacilityForm && (
        <FacilityForm
          key={editingFacility?.id || "new"}
          facility={editingFacility}
          onClose={() => setShowFacilityForm(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      {reassigningUser && (
        <ReassignFacilityModal
          user={reassigningUser}
          onClose={() => setReassigningUser(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
