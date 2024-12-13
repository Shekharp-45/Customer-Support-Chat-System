import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import Login from "./pages/LoginPage.tsx";
import Register from "./pages/RegistrationPage.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import AgentDashboard from "./components/AgentDashboard.tsx";
import CustomerDashboard from "./components/CustomerDashboard.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/admin" element={<AdminDashboard/>} />
      <Route path="/agent" element={<AgentDashboard/>} />
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  );
};
export default App;
