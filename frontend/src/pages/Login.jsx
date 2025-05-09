import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import { FaEnvelope, FaLock, FaExclamationCircle } from "react-icons/fa";
import AuthLayout from "./AuthLayout";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.verified) {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your CampusCart account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-[#212121] font-medium">Email</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#212121]/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              type="email"
              className="input w-full pl-10 border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50] bg-white text-[#212121]"
              placeholder="name@campuscart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-[#212121] font-medium">Password</span>
            <Link to="/forgot-password" className="label-text-alt text-[#FFC107] hover:text-[#FFC107]/80">
              Forgot Password?
            </Link>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#212121]/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              className="input w-full pl-10 border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50] bg-white text-[#212121]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {user && !user.verified && user.role !== 'admin' && (
          <div className="alert alert-info shadow-lg">
            <div>
              <FaExclamationCircle />
              <span>
                Please wait until your account is approved by the admin.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <div>
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`btn w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white border-none ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        <p className="text-center text-[#212121]/70">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FFC107] hover:text-[#FFC107]/80 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
