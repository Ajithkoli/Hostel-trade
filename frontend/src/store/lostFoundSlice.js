import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper to get authentication and content headers
const getAuthHeaders = (isMultipart = false) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const headers = {};
  if (userInfo?.token) {
    headers.Authorization = `Bearer ${userInfo.token}`;
  }
  if (isMultipart) {
    headers["Content-Type"] = "multipart/form-data";
  }
  return { headers };
};

// 1. Fetch paginated Lost & Found posts
export const fetchLostFoundPosts = createAsyncThunk(
  "lostFound/fetchPosts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/lost-found", { params });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load lost & found items"
      );
    }
  }
);

// 2. Fetch single Lost & Found post by ID
export const fetchLostFoundPostDetails = createAsyncThunk(
  "lostFound/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/lost-found/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load post details"
      );
    }
  }
);

// 3. Create a Lost & Found post
export const createLostFoundPost = createAsyncThunk(
  "lostFound/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/lost-found",
        formData,
        getAuthHeaders(true)
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create post"
      );
    }
  }
);

// 4. Update a Lost & Found post
export const updateLostFoundPost = createAsyncThunk(
  "lostFound/updatePost",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/lost-found/${id}`,
        formData,
        getAuthHeaders(true)
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update post"
      );
    }
  }
);

// 5. Delete a Lost & Found post
export const deleteLostFoundPost = createAsyncThunk(
  "lostFound/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/lost-found/${id}`, getAuthHeaders());
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

const lostFoundSlice = createSlice({
  name: "lostFound",
  initialState: {
    items: [],
    currentItem: null,
    relatedItems: [],
    page: 1,
    pages: 1,
    total: 0,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    detailsStatus: "idle",
    error: null,
  },
  reducers: {
    resetCurrentItem: (state) => {
      state.currentItem = null;
      state.relatedItems = [];
      state.detailsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchLostFoundPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLostFoundPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchLostFoundPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch details
      .addCase(fetchLostFoundPostDetails.pending, (state) => {
        state.detailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchLostFoundPostDetails.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.currentItem = action.payload.item;
        state.relatedItems = action.payload.relatedItems || [];
      })
      .addCase(fetchLostFoundPostDetails.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload;
      })
      // Create post
      .addCase(createLostFoundPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update post
      .addCase(updateLostFoundPost.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem && state.currentItem._id === action.payload._id) {
          state.currentItem = action.payload;
        }
      })
      // Delete post
      .addCase(deleteLostFoundPost.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.currentItem && state.currentItem._id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const { resetCurrentItem } = lostFoundSlice.actions;
export default lostFoundSlice.reducer;
