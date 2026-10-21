import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (user) {
    navigate(`/${user.role}`);
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).recaptchaVerifier) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        },
      );
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setupRecaptcha();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const verifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setVerificationId(confirmation.verificationId);
      toast.success("OTP sent to your phone!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;
    setLoading(true);
    try {
      const { PhoneAuthProvider, signInWithCredential } =
        await import("firebase/auth");
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      toast.success("Welcome!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
      <div className="w-full max-w-md">
        <div className="card-clinical p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-clinical-600 mb-4">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to AfyaTrack
            </h1>
            <p className="text-gray-500 mt-1">
              Sign in to manage child health records
            </p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMethod("email")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                method === "email"
                  ? "bg-white shadow-sm text-clinical-700"
                  : "text-gray-600"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setMethod("phone")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                method === "phone"
                  ? "bg-white shadow-sm text-clinical-700"
                  : "text-gray-600"
              }`}
            >
              Phone
            </button>
          </div>

          {method === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {method === "phone" && (
            <>
              {!verificationId ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (with country code)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500 text-center text-2xl tracking-widest"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationId(null)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Use a different number
                  </button>
                </form>
              )}
              <div id="recaptcha-container"></div>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-clinical-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
