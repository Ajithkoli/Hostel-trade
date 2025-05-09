// utils/cart.js

export function getCartItems() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function addToCart(item) {
  const cart = getCartItems();
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}

export function removeFromCart(index) {
  const cart = getCartItems();
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
}
