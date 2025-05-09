// src/components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkStyle =
    "block py-2.5 px-4 rounded hover:bg-gray-700 transition text-white";
  return (
    <div className="w-64 bg-gray-900 h-screen p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <NavLink to="/admin/dashboard" className={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={linkStyle}>
          User Management
        </NavLink>
        <NavLink to="/admin/products" className={linkStyle}>
          Product Management
        </NavLink>
      </nav>
    </div>
  );
}
