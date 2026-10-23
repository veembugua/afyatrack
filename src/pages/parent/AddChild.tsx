import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addChild } from "../../services/childService";
import { fetchFacilities } from "../../services/facilityService";
import type { HealthFacility } from "../../types";
import toast from "react-hot-toast";

const AddChild = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthWeight, setBirthWeight] = useState("");
  const [birthLength, setBirthLength] = useState("");
  const [facilityId, setFacilityId] = useState("");

  // Fetch facilities for the parent's country
  useEffect(() => {
    fetchFacilities()
      .then((data) => {
        // Filter to only show facilities in the parent's country
        const filtered = data.filter(
          (f) => f.country === (user?.country || "KE"),
        );
        setFacilities(filtered);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load facilities";
        toast.error(message);
      });
  }, [user?.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!facilityId) {
      toast.error("Please select a health facility");
      return;
    }

    setLoading(true);
    try {
      await addChild({
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        parentId: user.uid,
        facilityId, // ✅ Now properly assigned
        country: user.country,
        birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
        birthLength: birthLength ? parseFloat(birthLength) : undefined,
      });
      toast.success(`${firstName} added successfully!`);
      navigate("/parent");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add child";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/parent")}
            className="text-sm text-clinical-600 hover:text-clinical-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card-clinical p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a Child</h1>
          <p className="text-gray-500 mb-6">
            Enter your child's details and select a health facility for their
            care.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`p-3 rounded-lg border-2 transition ${
                    gender === "male"
                      ? "border-clinical-600 bg-clinical-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  👦 Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`p-3 rounded-lg border-2 transition ${
                    gender === "female"
                      ? "border-clinical-600 bg-clinical-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  👧 Female
                </button>
              </div>
            </div>

            {/* ✅ NEW: Facility Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Facility <span className="text-red-500">*</span>
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                required
              >
                <option value="">Select a health facility...</option>
                {facilities.length === 0 && (
                  <option disabled>
                    No facilities available for your country
                  </option>
                )}
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.region}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This is where your child will receive vaccinations and
                check-ups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Weight (kg, optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  placeholder="e.g., 3.2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Length (cm, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={birthLength}
                  onChange={(e) => setBirthLength(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/parent")}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Child"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChild;
