import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "./AuthContext";
import { WishlistContext } from "./WishlistContext";

export const CartContext = createContext();

// Generate or retrieve session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useContext(AuthContext);
  const wishlistContext = useContext(WishlistContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend on mount and when user logs in/out
  useEffect(() => {
    fetchCart();
  }, [user, isLoggedIn]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const sessionId = getSessionId();
      
      const response = await API.get("/cart", {
        params: { session_id: sessionId },
      });

      if (response.data.success) {
        setCartItems(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add product with optional quantity and selected size
  // const addToCart = (product, quantity = 1, selectedSize = null) => {
  //   let cartKey = product.id;

  //   // If product has sizes, ensure size is selected
  //   if (product.sizes && product.sizes.length > 0) {
  //     if (!selectedSize) {
  //       alert("Please select a size before adding to cart!");
  //       return;
  //     }
  //     cartKey = `${product.id}-${selectedSize}`;
  //   }

  //   setCartItems((prev) => {
  //     const existingItemIndex = prev.findIndex(
  //       (item) => item.cartKey === cartKey
  //     );

  //     if (existingItemIndex !== -1) {
  //       // Increase quantity if same item exists
  //       const updatedItems = [...prev];
  //       updatedItems[existingItemIndex].quantity += quantity;
  //       return updatedItems;
  //     }

  //     // Otherwise, add new item
  //     return [
  //       ...prev,
  //       {
  //         ...product,
  //         quantity,
  //         selectedSize,
  //         cartKey,
  //       },
  //     ];
  //   });

  //   setIsCartOpen(true);
  // };

  // Add product with optional quantity and selected size
  const addToCart = async (product, quantity = 1, selectedSize = null) => {
    // If product has sizes, ensure size is selected
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        alert("Please select a size before adding to cart!");
        return;
      }
    }

    try {
      const sessionId = getSessionId();
      
      const payload = {
        product_id: product.id,
        quantity: quantity,
        selectedSize: selectedSize || "",
        selectedColor: product.selectedColor || "",
        session_id: sessionId,
      };

      if (product.custom_design_url) {
        payload.custom_design_url = product.custom_design_url;
      }
      if (product.custom_preview_url) {
        payload.custom_preview_url = product.custom_preview_url;
      }
      if (product.custom_text) {
        payload.custom_text = product.custom_text;
      }

      const response = await API.post("/cart", payload);

      if (response.data.success) {
        // Refresh cart from backend
        await fetchCart();
        setIsCartOpen(true);
        
        // Remove from wishlist if it exists there
        if (wishlistContext?.removeFromWishlistByProductId) {
          await wishlistContext.removeFromWishlistByProductId(product.id);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // alert("Failed to add item to cart. Please try again.");
    }
  };

  // const increaseQuantity = (cartKey) => {
  //   setCartItems((items) =>
  //     items.map((item) =>
  //       item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
  //     )
  //   );
  // };

  // const decreaseQuantity = (cartKey) => {
  //   setCartItems((items) =>
  //     items.map((item) =>
  //       item.cartKey === cartKey
  //         ? { ...item, quantity: Math.max(1, item.quantity - 1) }
  //         : item
  //     )
  //   );
  // };

  // const removeFromCart = (cartKey) => {
  //   setCartItems((items) => items.filter((item) => item.cartKey !== cartKey));
  // };

  const increaseQuantity = async (cartKey) => {
    try {
      // Find the cart item by cartKey
      const item = cartItems.find((i) => i.cartKey === cartKey);
      if (!item) return;

      const response = await API.put(`/cart/${item.cart_id}`, {
        quantity: item.quantity + 1,
        session_id: getSessionId(),
      });

      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const decreaseQuantity = async (cartKey) => {
    try {
      const item = cartItems.find((i) => i.cartKey === cartKey);
      if (!item) return;

      const newQuantity = Math.max(1, item.quantity - 1);
      
      const response = await API.put(`/cart/${item.cart_id}`, {
        quantity: newQuantity,
        session_id: getSessionId(),
      });

      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  const removeFromCart = async (cartKey) => {
    try {
      const item = cartItems.find((i) => i.cartKey === cartKey);
      if (!item) return;

      const response = await API.delete(`/cart/${item.cart_id}`, {
        data: { session_id: getSessionId() },
      });

      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      
      const response = await API.delete("/cart-clear", {
        data: { session_id: sessionId },
      });

      if (response.data.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Merge guest cart with user cart after login
  useEffect(() => {
    const mergeCart = async () => {
      if (isLoggedIn && user) {
        try {
          const sessionId = localStorage.getItem("guest_session_id");
          if (sessionId) {
            await API.post("/cart-merge", { session_id: sessionId });
            // Clear guest session after merge
            localStorage.removeItem("guest_session_id");
            // Refresh cart
            await fetchCart();
          }
        } catch (error) {
          console.error("Error merging cart:", error);
        }
      }
    };

    mergeCart();
  }, [isLoggedIn, user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loading,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export default CartProvider;