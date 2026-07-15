import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch Products with filters, search, and pagination parameters
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/products", { params });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    status: "idle", // can be "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload && action.payload.products) {
          state.items = action.payload.products;
          state.page = action.payload.page;
          state.pages = action.payload.pages;
          state.total = action.payload.total;
        } else {
          state.items = action.payload || [];
          state.page = 1;
          state.pages = 1;
          state.total = action.payload?.length || 0;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
