// client/src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Set default base URL and configurations for axios
const envUrl = import.meta.env.VITE_SERVER_URL;
let serverUrl;
if (envUrl) {
  serverUrl = envUrl;
} else {
  const apiHostname = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'localhost'
    : window.location.hostname;
  serverUrl = `http://${apiHostname}:5000`;
}
axios.defaults.baseURL = serverUrl;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor to automatically attach JWT token from localStorage to all global axios requests
axios.interceptors.request.use(
  (config) => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${userInfo.token}`);
          } else {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
          }
        }
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', userData);
      const response = await axios.post("/api/auth/login", userData);
      console.log('Login response:', response.data);
      // Store user data in localStorage
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await axios.post("/api/auth/logout");
});

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        return rejectWithValue("No valid token found");
      }
      const { data } = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      return { ...data, token: userInfo.token };
    } catch (error) {
      localStorage.removeItem("userInfo");
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Update profile details
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put("/api/auth/profile", profileData);
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      const updatedUser = { ...userInfo, ...response.data };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// Upload profile picture avatar
export const updateAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.put("/api/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      const updatedUser = { ...userInfo, ...response.data };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload avatar");
    }
  }
);

// Change Password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axios.put("/api/auth/password", passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

// Delete Account
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete("/api/auth/account");
      localStorage.removeItem("userInfo");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete account");
    }
  }
);

// Toggle Wishlist item
export const toggleWishlist = createAsyncThunk(
  "auth/toggleWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/auth/wishlist/${productId}`);
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      const updatedUser = { ...userInfo, wishlist: response.data.wishlist };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update wishlist");
    }
  }
);



const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  user: userInfoFromStorage,
  loading: false,
  error: null,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update avatar cases
      .addCase(updateAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete account cases
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      // Toggle wishlist cases
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = action.payload;
        }
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { clearError, resetRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
