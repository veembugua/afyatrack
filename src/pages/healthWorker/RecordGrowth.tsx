import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addGrowthRecord } from "../../services/growthService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const RecordGrowth = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // ✅ Renamed from 'date' to 'measurementDate'
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !user || !weight || !height) return;

    setSubmitting(true);
    try {
      await addGrowthRecord(
        childId,
        measurementDate, // ✅ Updated
        parseFloat(weight),
        parseFloat(height),
        headCircumference ? parseFloat(headCircumference) : undefined,
        notes,
        user.uid,
        user.facilityId || "",
      );
      toast.success("Growth record saved successfully!");
      navigate("/health-worker");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save record";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

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
            Record Growth Metrics
          </h1>
          <p className="text-gray-500 mb-6">
            Enter the child's latest measurements.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={measurementDate} // ✅ Updated
                onChange={(e) => setMeasurementDate(e.target.value)} // ✅ Updated
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 8.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height/Length (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 70.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head Circumference (cm, optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={headCircumference}
                onChange={(e) => setHeadCircumference(e.target.value)}
                placeholder="e.g., 45.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
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
                disabled={submitting}
                className="flex-1 py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Growth Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordGrowth;
