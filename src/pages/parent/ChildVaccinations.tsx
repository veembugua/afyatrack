import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVaccinationsByChild,
  fetchVaccineScheduleByCountry,
} from "../../services/vaccinationService";
import type { Vaccination, VaccineSchedule } from "../../types";
import toast from "react-hot-toast";

const ChildVaccinations = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [schedule, setSchedule] = useState<VaccineSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!childId) return;
      try {
        // In a real app, you'd fetch the child's country from the child document.
        // For now, we default to 'KE'
        const [vaxData, scheduleData] = await Promise.all([
          fetchVaccinationsByChild(childId),
          fetchVaccineScheduleByCountry("KE"),
        ]);
        setVaccinations(vaxData);
        setSchedule(scheduleData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [childId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "missed":
        return "bg-red-100 text-red-800 border-red-200";
      case "skipped":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; // pending
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/parent")}
            className="text-sm text-clinical-600 hover:text-clinical-700 font-medium flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card-clinical p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Vaccination Record
            </h1>
            <span className="text-sm text-gray-500">
              {vaccinations.filter((v) => v.status === "completed").length} /{" "}
              {schedule.length} Completed
            </span>
          </div>

          <div className="space-y-4">
            {schedule.map((vaccine) => {
              // Find if this vaccine was recorded for this child
              const record = vaccinations.find(
                (v) => v.vaccineId === vaccine.id,
              );
              const status = record ? record.status : "pending";

              return (
                <div
                  key={vaccine.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${getStatusColor(status)}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {vaccine.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 border border-current">
                        Week {vaccine.ageInWeeks}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">
                      Protects against: {vaccine.disease}
                    </p>
                    {record?.notes && (
                      <p className="text-xs mt-1 italic opacity-70">
                        Note: {record.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 md:mt-0 md:ml-4 flex flex-col items-end">
                    <span className="font-semibold capitalize text-sm mb-1">
                      {status === "pending"
                        ? "⏳ Upcoming"
                        : status === "completed"
                          ? "✅ Completed"
                          : status === "missed"
                            ? "⚠️ Missed"
                            : "⏭️ Skipped"}
                    </span>
                    {record?.administeredDate && (
                      <span className="text-xs opacity-70">
                        {new Date(record.administeredDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {vaccinations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No vaccination records found yet.</p>
              <p className="text-sm mt-1">
                Visit your health facility to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildVaccinations;
