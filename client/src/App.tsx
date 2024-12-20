import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import Login from "./pages/LoginPage.tsx";
import Register from "./pages/RegistrationPage.tsx";
//import AdminDashboard from "./components/AdminDashboard.tsx";
import AgentDashboard from "./components/AgentDashboard.tsx";
import CustomerDashboard from "./components/CustomerDashboard.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
  path="/agent"
  element={
    <ProtectedRoute allowedRoles={['agent']}>
      <AgentDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer"
  element={
    <ProtectedRoute allowedRoles={['customer']}>
      <CustomerDashboard />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AuthProvider>
);

export default App;
