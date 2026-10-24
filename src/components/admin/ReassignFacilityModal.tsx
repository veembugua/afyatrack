import { useState, useEffect } from "react";
import type { User, HealthFacility } from "../../types";
import {
  updateUserFacility,
  fetchAllFacilities,
} from "../../services/adminService";
import toast from "react-hot-toast";

interface ReassignFacilityModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const ReassignFacilityModal = ({
  user,
  onClose,
  onSuccess,
}: ReassignFacilityModalProps) => {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    user.facilityId || "",
  );

  useEffect(() => {
    let isMounted = true;

    const loadFacilities = async () => {
      try {
        const data = await fetchAllFacilities();
        if (isMounted) {
          // ✅ Removed .filter to avoid type errors if isActive is missing from the type
          setFacilities(data);
        }
      } catch {
        // ✅ Removed unused 'err' variable to satisfy ESLint
        if (isMounted) toast.error("Failed to load facilities");
      }
    };

    loadFacilities();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserFacility(user.uid, selectedFacilityId || null);
      toast.success(`Facility reassigned for ${user.name}!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reassign facility";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reassign Facility</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update the assigned facility for{" "}
            <span className="font-semibold text-gray-900">{user.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Facility
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
              required
            >
              <option value="">-- Unassigned (Clear Facility) --</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.region})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm Reassignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignFacilityModal;
