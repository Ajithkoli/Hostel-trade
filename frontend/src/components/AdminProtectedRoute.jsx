// src/components/AdminProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminProtectedRoute() {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== "admin") {
    // Redirect to admin login if not logged in or not admin
    return <Navigate to="/admin/login" />;
  }
  return <Outlet />;
}
