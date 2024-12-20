import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    role: "",
  });

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, number, role } = formData;

    if (!name || !email || !password || !number || !role) {
      setError("All fields are required.");
      return;
    }

    setError(null);

    try {
      // Replace this with your actual API call
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      console.log("Registration successful:", formData);

      // Redirect based on the role
      if (role === "customer") {
        navigate("/customer");
      } else if (role === "agent") {
        navigate("/agent");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-lg p-8 w-96"
        >
          <h2 className="text-2xl font-bold text-gray-600 text-center mb-6">
            Register
          </h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
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
            />
          </div>
          <div className="mb-4">
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
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="number"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Mobile No.
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              placeholder="Mobile Number"
              pattern="[0-9]{10}"
              value={formData.number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Register
          </button>
          <div className="mt-4 flex justify-between text-sm">
            <span>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 font-medium hover:underline"
              >
                Login
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

export default Register;
