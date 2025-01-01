import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext.tsx";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white text-black shadow-md z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="text-2xl font-bold cursor-pointer">
            Support Connect
          </span>
        </div>
        {user ? (
          <Link
            to="/"
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white text-base font-medium rounded hover:bg-red-800 transition duration-200 ease-in-out"
          >
            Sign Off
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 bg-black text-white text-base font-medium rounded hover:bg-gray-800 transition duration-200 ease-in-out"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
