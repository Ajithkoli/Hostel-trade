// client/src/store/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Load cart from localStorage
export const loadCart = createAsyncThunk("cart/load", async () => {
  const savedCart = localStorage.getItem("campusCartCart");
  return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
});

// Save cart to localStorage
export const saveCart = createAsyncThunk("cart/save", async (cartState) => {
  localStorage.setItem("campusCartCart", JSON.stringify(cartState));
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.product._id === action.payload._id
      );
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
      state.total += action.payload.price;
    },
    removeItem: (state, action) => {
      const item = state.items.find(
        (item) => item.product._id === action.payload
      );
      if (item) {
        state.total -= item.product.price * item.quantity;
        state.items = state.items.filter(
          (item) => item.product._id !== action.payload
        );
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
    });
  },
});

// Middleware to auto-save cart on changes
export const cartPersistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith("cart/")) {
    const { cart } = store.getState();
    store.dispatch(saveCart(cart));
  }
  return result;
};

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
