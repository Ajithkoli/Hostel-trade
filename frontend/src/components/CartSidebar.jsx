// client/src/components/CartSidebar.jsx
import { useSelector, useDispatch } from "react-redux";
import { removeItem, clearCart } from "../store/cartSlice";

export default function CartSidebar() {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return (
    <div className="drawer-side">
      <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content">
        <h3 className="text-xl font-bold mb-4">Your Cart</h3>

        {items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <>
            {items.map((item) => (
              <div
                key={item.product._id}
                className="flex justify-between items-center mb-4"
              >
                <div>
                  <h4 className="font-semibold">{item.product.title}</h4>
                  <p className="text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span>${item.product.price * item.quantity}</span>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => dispatch(removeItem(item.product._id))}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="divider"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={() => dispatch(clearCart())}
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
