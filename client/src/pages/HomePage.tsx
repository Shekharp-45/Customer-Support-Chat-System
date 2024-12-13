import React from "react";
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
      <NavbarList className="sticky top-0 z-10 bg-white bg-opacity-80 text-gray-800 shadow-md" />

      <div
        className="flex-1 flex flex-col items-center justify-center text-center px-4"
        style={{ marginTop: "-1cm" }}
      >
        <div className="bg-white bg-opacity-0 p-20 rounded-lg max-w-6xl">
          <h1
            className="text-[8rem] md:text-[4rem] font-bold text-gray-800 mb-4"
            style={{ marginBottom: "100px" }}
          >
            Welcome to Customer Support Chat System
          </h1>
          <p className="text-lg md:text-xl mb-10 text-black-700">
            Real-time communication platform connecting customers and support
            agents seamlessly.
          </p>
          <button className="mb-7 px-5 py-3 bg-black text-white font-semibold rounded shadow hover:bg-gray-800 focus:ring-2 focus:ring-gray-500">
            Get Started
          </button>
        </div>
      </div>

      <footer
        className="py-8 z-10 bg-white text-black text-center shadow-md"
        style={{
          marginTop: "1rem",
          boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p>&copy; 2024 Customer Support Chat System. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
