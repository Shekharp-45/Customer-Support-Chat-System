import React from "react";
import { Link } from "react-router-dom";
import NavbarList from "../components/Navbar.tsx";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarList className="sticky top-0 z-10 bg-white text-gray-800 border-b border-gray-200" />
      <div className="flex-grow flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="text-center px-6 py-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            Sorry, the page you are looking for does not exist or has been
            moved.
          </p>

          <Link
            to="/"
            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded shadow hover:bg-gray-700"
          >
            Go Back Home
          </Link>
        </div>
      </div>

      <footer className="py-6 bg-gray-800 text-white text-center">
        <p>&copy; 2024 Customer Support Chat System. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
