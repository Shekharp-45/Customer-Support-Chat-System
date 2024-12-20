import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import axios from "axios";
import { useAuth } from "../context/AuthContext.tsx";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth(); // Using AuthContext to manage user state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", formData);

      // Update AuthContext with token and navigate based on role
      login(data.token);
      switch (data.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "agent":
          navigate("/agent", { replace: true });
          break;
        case "customer":
          navigate("/customer", { replace: true });
          break;
        default:
          throw new Error("Unexpected role received. Please contact support.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <form
          className="bg-white shadow-2xl rounded-lg p-8 w-96"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-gray-600 text-center mb-6">
            Login
          </h2>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span className="ml-2">Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          <div className="mt-4 flex justify-between text-sm">
            <span>
              New user?{" "}
              <Link
                to="/register"
                className="text-blue-500 font-medium hover:underline"
              >
                Register
              </Link>
            </span>
            <Link
              to="/forgot-password"
              className="text-red-500 font-medium hover:underline"
            >
              Forgot Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
