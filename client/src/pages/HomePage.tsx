import React from "react";
import { Link } from "react-router-dom";
import NavbarList from "../components/Navbar.tsx";
import backimg from "../assets/edited-transformed.jpeg";

const HomePage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${backimg})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NavbarList />
      <div
        className="flex-1 flex flex-col items-center justify-center text-center px-4"
        style={{ marginTop: "-1cm" }}
      >
        <div className="bg-white bg-opacity-0 p-10 md:p-20 rounded-lg max-w-6xl w-full">
          <h1
            className="text-[3rem] md:text-[4rem] lg:text-[5rem] font-bold text-gray-800 mb-4"
            style={{ marginBottom: "50px" }}
          >
            Welcome to Customer Support Chat System
          </h1>
          <p className="text-md md:text-xl mb-6 text-gray-700 px-2">
            Real-time communication platform connecting customers and support
            agents seamlessly.
          </p>
          <button className="px-4 py-2 md:px-5 md:py-3 bg-black text-white font-semibold rounded shadow hover:bg-gray-800 focus:ring-2 focus:ring-gray-500">
            <Link to="/login">Get Started</Link>
          </button>
        </div>
      </div>

      <footer
        className="py-4 md:py-8 bg-white text-black text-center shadow-md"
        style={{
          marginTop: "1rem",
          boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p className="text-sm md:text-base">
          &copy; 2025 Customer Support Chat System. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
