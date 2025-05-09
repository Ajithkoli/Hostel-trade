import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  approveUser,
  rejectUser,
  editUser,
  makeAdmin,
} from "../store/adminSlice";
import { toast } from "react-toastify";
import EditUserModal from "../components/EditUserModal";

export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveUser(id)).then(() => {
      toast.success("User approved successfully");
    });
  };

  const handleReject = (id) => {
    dispatch(rejectUser(id)).then(() => {
      toast.success("User deleted successfully");
    });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSave = (updatedData) => {
    dispatch(editUser({ id: selectedUser._id, data: updatedData }))
      .unwrap()
      .then(() => {
        toast.success("User updated successfully");
        handleModalClose();
      })
      .catch((error) => {
        toast.error("Failed to update user: " + error);
      });
  };

  const handleMakeAdmin = (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    dispatch(makeAdmin({ id, role: newRole })).then(() => {
      toast.success(`User role changed to ${newRole}`);
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        User Management Panel
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-dots loading-lg text-primary"></span>
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full rounded-lg shadow-md">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Hostel</th>
                <th>Status</th>
                <th>Role</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.hostel}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.verified
                          ? "badge-success"
                          : "badge-warning text-black"
                      }`}
                    >
                      {user.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "admin"
                          ? "badge-secondary"
                          : "badge-outline"
                      }`}
                    >
                      {user.role || "user"}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {!user.verified && (
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="btn btn-xs btn-success"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(user._id)}
                        className="btn btn-xs btn-error"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="btn btn-xs btn-info"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleMakeAdmin(user._id, user.role)}
                        className={`btn btn-xs ${
                          user.role === "admin"
                            ? "btn-outline btn-secondary"
                            : "btn-warning"
                        }`}
                      >
                        {user.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onSave={handleSave}
      />
    </div>
  );
}
