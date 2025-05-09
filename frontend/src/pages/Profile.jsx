// pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        setProfile(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
      {profile ? (
        <div className="card bg-base-100 shadow-lg p-6">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Hostel:</strong> {profile.hostel}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
        </div>
      ) : (
        <p>No profile found.</p>
      )}
    </div>
  );
}
