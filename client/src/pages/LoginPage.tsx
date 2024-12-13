import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <form className="bg-white shadow-2xl rounded-lg p-8 w-96">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Login
          </button>
          <div className="mt-4 flex justify-between test-sm">
            <span>
              New user?{" "}
              <Link
                to="/register"
                className="text-blue-500 font-medium hover:underline"
              >
                Register
              </Link>
            </span>
            <br />
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
