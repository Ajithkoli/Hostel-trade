// src/components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkStyle =
    "block py-2.5 px-4 rounded hover:bg-gray-700 transition text-white";
  return (
    <div className="w-full md:w-64 bg-gray-900 h-auto md:h-screen p-6 text-white border-b md:border-b-0 md:border-r border-gray-800">
      <h2 className="text-xl font-bold mb-6 text-primary tracking-wide">Admin Panel</h2>
      <nav className="flex flex-col sm:flex-row md:flex-col gap-2">
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
