import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, approveUser, rejectUser } from "../store/adminSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) => !u.verified)
              .map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.verified ? "Verified" : "Pending"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => dispatch(approveUser(user._id))}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => dispatch(rejectUser(user._id))}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
