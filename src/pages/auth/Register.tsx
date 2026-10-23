import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerWithEmail } from "../../services/authService";
import { fetchFacilities } from "../../services/facilityService";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole, HealthFacility } from "../../types";
import toast from "react-hot-toast";
import { getDashboardPath } from "../../utils/routePaths";

const countries = [
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
];

const Register = () => {
  // 1. ALL HOOKS AT THE TOP
  const [role, setRole] = useState<UserRole>("parent");
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("KE");
  const [facilityId, setFacilityId] = useState("");

  useEffect(() => {
    if (role === "healthWorker") {
      fetchFacilities()
        .then(setFacilities)
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to load facilities";
          toast.error(message);
        });
    }
  }, [role]);

  // 2. EARLY RETURN AFTER HOOKS
  if (user && user.role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
        <div className="card-clinical p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Account already active!
          </h2>
          <Link
            to={getDashboardPath(user.role)}
            className="text-clinical-600 hover:underline font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 3. HANDLERS AND JSX
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithEmail({
        name,
        email,
        phone,
        password,
        role,
        country,
        facilityId: role === "healthWorker" ? facilityId : undefined,
      });
      toast.success("Account created! Redirecting...");

      // 🚀 NUCLEAR LOOP BREAKER
      setTimeout(() => {
        window.location.replace("/");
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
      <div className="w-full max-w-md">
        <div className="card-clinical p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-clinical-600 mb-4">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join AfyaTrack today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`p-3 rounded-lg border-2 transition ${role === "parent" ? "border-clinical-600 bg-clinical-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="text-2xl mb-1">👨‍👩‍👧</div>
                  <div className="text-sm font-medium">Parent</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("healthWorker")}
                  className={`p-3 rounded-lg border-2 transition ${role === "healthWorker" ? "border-clinical-600 bg-clinical-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="text-2xl mb-1">👩‍⚕️</div>
                  <div className="text-sm font-medium">Health Worker</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {role === "healthWorker" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Facility
                </label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a facility</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-clinical-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
