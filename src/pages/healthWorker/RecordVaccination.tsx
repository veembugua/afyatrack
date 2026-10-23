import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVaccinationsByChild,
  fetchVaccineScheduleByCountry,
  recordVaccination,
} from "../../services/vaccinationService";
import { useAuth } from "../../contexts/AuthContext";
import type { VaccineSchedule } from "../../types";
import toast from "react-hot-toast";

const RecordVaccination = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState<VaccineSchedule[]>([]);
  const [completedVaccineIds, setCompletedVaccineIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedVaccineId, setSelectedVaccineId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!childId || !user) return;
      try {
        const [vaxData, scheduleData] = await Promise.all([
          fetchVaccinationsByChild(childId),
          fetchVaccineScheduleByCountry(user.country || "KE"),
        ]);

        setSchedule(scheduleData);
        const completed = new Set(
          vaxData
            .filter((v) => v.status === "completed")
            .map((v) => v.vaccineId),
        );
        setCompletedVaccineIds(completed);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [childId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !user || !selectedVaccineId) return;

    setSubmitting(true);
    try {
      // Find the scheduled date for this vaccine (default to today if not found)
      const vaccineInfo = schedule.find((v) => v.id === selectedVaccineId);
      const scheduledDate = vaccineInfo ? new Date() : new Date(); // Simplified for MVP

      await recordVaccination(
        childId,
        selectedVaccineId,
        scheduledDate,
        user.facilityId || "",
        user.uid,
        batchNumber,
        notes,
      );

      toast.success("Vaccination recorded successfully!");
      navigate("/health-worker");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to record vaccination";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  const pendingVaccines = schedule.filter(
    (v) => !completedVaccineIds.has(v.id),
  );

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/health-worker")}
            className="text-sm text-clinical-600 hover:text-clinical-700 font-medium flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card-clinical p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Record Vaccination
          </h1>
          <p className="text-gray-500 mb-6">
            Select a pending vaccine and enter administration details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine to Administer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVaccineId}
                onChange={(e) => setSelectedVaccineId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                required
              >
                <option value="">Select a pending vaccine...</option>
                {pendingVaccines.length === 0 && (
                  <option disabled>No pending vaccines</option>
                )}
                {pendingVaccines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Week {v.ageInWeeks}) - {v.disease}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number (Optional)
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., BN-2024-XYZ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any adverse reactions or special notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/health-worker")}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedVaccineId}
                className="flex-1 py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Recording..." : "Record Vaccination"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordVaccination;
