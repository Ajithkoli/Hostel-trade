import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/authSlice";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaExclamationCircle,
} from "react-icons/fa";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hostel: "Krishna", // Default value
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, registrationSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (registrationSuccess) {
      navigate("/registration-pending");
    }
  }, [registrationSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join CampusCart to start trading">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full pl-10"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full pl-10"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full pl-10"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hostel" className="sr-only">
              Hostel
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="text-gray-400" />
              </div>
              <select
                id="hostel"
                name="hostel"
                required
                value={formData.hostel}
                onChange={handleChange}
                className="select select-bordered w-full pl-10"
              >
                <option value="Krishna">Krishna</option>
                <option value="Kaveri">Kaveri</option>
                <option value="Yamuna">Yamuna</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-500 bg-red-50 p-3 rounded">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-primary-focus">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
