import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper to get authorization headers from localStorage
const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token
    ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
    : {};
};

// Fetch all users
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async () => {
  const res = await axios.get("/api/users", getAuthHeaders());
  return res.data;
});

// Approve a user
export const approveUser = createAsyncThunk("admin/approveUser", async (id) => {
  const res = await axios.patch(`/api/users/${id}/verify`, {}, getAuthHeaders());
  return res.data;
});

// Reject a user (delete)
export const rejectUser = createAsyncThunk("admin/rejectUser", async (id) => {
  await axios.delete(`/api/users/${id}`, getAuthHeaders());
  return id;
});

// Toggle admin role
export const makeAdmin = createAsyncThunk("admin/makeAdmin", async (id) => {
  const res = await axios.patch(`/api/users/${id}/make-admin`, {}, getAuthHeaders());
  return res.data;
});

// Edit (update) a user
export const editUser = createAsyncThunk(
  "admin/editUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/users/${id}`, data, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit user");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload.user?._id || u._id === action.payload._id
        );
        if (index !== -1) {
          // Sync state with updated user payload (backend returns user nested or flat)
          state.users[index] = action.payload.user || action.payload;
        }
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(makeAdmin.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload.user?._id || u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload.user || action.payload;
        }
      })
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default adminSlice.reducer;
