import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <form className="bg-white shadow-2xl rounded-lg p-8 w-96">
          <h2 className="text-2xl font-bold text-gray-600 text-center mb-6">
            Register
          </h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Confirm Password"
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
              type="number"
              id="number"
              name="number"
              placeholder="Mobile Number"
              min="1000000000"
              max="9999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
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
