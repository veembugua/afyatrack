import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGrowthRecordsByChild } from "../../services/growthService";
import type { GrowthRecord } from "../../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const ChildGrowth = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    fetchGrowthRecordsByChild(childId)
      .then(setRecords)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load growth records";
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [childId]);

  // Format data for Recharts: use measurementDate
  const chartData = records.map((record) => {
    const recordDate = new Date(record.measurementDate); // ✅ Updated here
    // Simplified: just use the record date as the X-axis label for now
    const monthYear = recordDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return {
      ...record,
      monthYear,
      weight: record.weight,
      height: record.height,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/parent")}
            className="text-sm text-clinical-600 hover:text-clinical-700 font-medium flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card-clinical p-6 md:p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Growth Charts
          </h1>

          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No growth records yet.</p>
              <p className="text-sm mt-1">
                Records will appear here after your health worker logs a visit.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Weight Chart */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  ⚖️ Weight Over Time (kg)
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="monthYear" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#0ea5e9" }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Height Chart */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📏 Height Over Time (cm)
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="monthYear" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="height"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#10b981" }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildGrowth;
