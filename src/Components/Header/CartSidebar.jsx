import React, { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext"; 
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



const CartSidebar = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useContext(CartContext);

  const handleCartClick = () => setIsCartOpen(false);
    const { isLoggedIn } = useContext(AuthContext); 

  const navigate = useNavigate();
  const handleCheckout = () => {
  setIsCartOpen(false); // close sidebar
  if (isLoggedIn) {
    console.log("Proceeding to checkout..." ,isLoggedIn );
    console.log("Cart Items:", cartItems.length);
    if(cartItems.length < 1) {
      console.log("Cart is empty, cannot proceed to checkout.");
      toast.warning("Your cart is empty. Add items before proceeding to checkout.");
      return;
    }
    navigate("/checkout");
  } else {
    navigate("/login");
  }
};
  
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

          .cart-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            max-width: 400px;
            height: 100%;
            background-color: white;
            z-index: 50;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            border-top-left-radius: 1rem;
            border-bottom-left-radius: 1rem;
          }
          .cart-sidebar.open {
            transform: translateX(0);
          }
          .cart-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 40;
          }
          .cart-backdrop.open {
            opacity: 1;
          }
          .cart-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 2px 4px;
          }
          .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .cart-title {
            font-size: 1.5rem;
            font-weight: 700;
            /*color: #c88a0b;*/
            /*color: #724cf9;*/
            /*color: var(--accent-color);*/
          }
          .close-cart-button {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            transition: color 0.3s;
            font-size: 1.5rem;
            padding: 0;
          }
          .close-cart-button:hover {
            color: #1f2937;
          }
          .cart-body {
            overflow-y: auto;
            flex-grow: 1;
          }
          .cart-items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .cart-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .cart-item:last-child {
            padding-bottom: 0;
            border-bottom: none;
          }
          .cart-item-details {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .item-image {
            width: 100px;
            height: 100px;
            border-radius: 0.5rem;
            object-fit: cover;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .item-name {
            font-weight: 600;
            color: #1f2937;
          }
          .item-price {
            color: #6b7280;
          }
          .item-controls {
            display: flex;
            align-items: center;
            gap: 1px;
            color: #4b5563;
          }
          .quantity-button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            background-color: #e5e7eb;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
          }
          .quantity-button:hover {
            background-color: #d1d5db;
          }
          .quantity-display {
            font-weight: 700;
            width: 24px;
            text-align: center;
          }
          .delete-button {
            margin-left: 0px;
            color: #ef4444;
            transition: color 0.3s;
            border: none;
            background: none;
            cursor: pointer;
          }
          .delete-button:hover {
            color: #b91c1c;
          }
          .empty-cart-message {
            text-align: center;
            color: #9ca3af;
            padding: 2rem 0;
          }
          .cart-footer {
            margin-top: auto;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }
          .cart-subtotal {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            color: #1f2937;
          }
          .subtotal-label {
            font-size: 1.25rem;
            font-weight: 600;
          }
          .subtotal-value {
            font-size: 1.25rem;
            font-weight: 700;
          }
          .checkout-button {
            width: 100%;
            /*background-color: #c88a0b;*/
            /*background-color: #724cf9;*/
            color: white;
            font-weight: 700;
            padding: 0.75rem 1rem;
            /*border-radius: 9999px;*/
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            transition: transform 0.3s;
            border: none;
            cursor: pointer;
          }
          .checkout-button:hover {
            transform: scale(1.05);
            /*background-color: #c8890b85;*/
            /*background-color: #564592;*/
            background-color: var(--accent-2-color);
          }
        `}
      </style>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />

      {isCartOpen && <div className="cart-backdrop open" onClick={handleCartClick} />}

      <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        <div className="cart-content">
          <div className="cart-header">
            <h3 className="cart-title">Shopping Cart</h3>
            <button onClick={handleCartClick} className="close-cart-button">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="cart-body">
            {cartItems.length > 0 ? (
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="cart-item">
                    <div className="cart-item-details">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                      <div>
                        <p className="item-name">{item.name}</p>
                        {item.selectedSize && (
                            <p className="item-size">Size: {item.selectedSize}</p>
                          )}
                        {/* <p className="item-price">Rs. {item.price.toFixed(2)}</p> */}
                        <p className="item-price">Rs. {(parseFloat(item.price) || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="item-controls">
                      <button
                        onClick={() => decreaseQuantity(item.cartKey)}
                        className="quantity-button"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.cartKey)}
                        className="quantity-button"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.cartKey)}
                        className="delete-button"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-cart-message">Your cart is empty.</p>
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-subtotal">
              <span className="subtotal-label">Subtotal:</span>
              <span className="subtotal-value">
                Rs. {cartItems
                  .reduce((acc, item) => {
                    const itemPrice = parseFloat(item.price) || 0;
                    return acc + (itemPrice * (item.quantity || 1));
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default CartSidebar;
