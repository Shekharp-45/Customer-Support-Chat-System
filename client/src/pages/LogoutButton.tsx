import React from "react";
import { useAuth } from "../context/AuthContext.tsx";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 font-bold text-white  bg-red-500 rounded hover:bg-red-600 w-50"
    >
      Sign out
    </button>
  );
};

export default LogoutButton;
