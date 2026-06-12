import React, { useState } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

const Layout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Vintage T-Shirt",
      price: 25.0,
      quantity: 2,
      image: "https://placehold.co/60x60/8B5CF6/FFFFFF?text=T-shirt",
    },
    {
      id: 2,
      name: "Retro Hoodie",
      price: 50.0,
      quantity: 1,
      image: "https://placehold.co/60x60/10B981/FFFFFF?text=Hoodie",
    },
    {
      id: 3,
      name: "Classic Denim",
      price: 75.0,
      quantity: 3,
      image: "https://placehold.co/60x60/3B82F6/FFFFFF?text=Denim",
    },
  ]);

  const handleIncreaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleDelete = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.name === product.name);
      if (existingItem) {
        return prevItems.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  return (
    <div className="app-container">
      <Header
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        handleCartClick={handleCartClick}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleDelete={handleDelete}
      />
      <main className="main-content">{React.cloneElement(children, { handleAddToCart })}</main>
      <Footer />
    </div>
  );
};

export default Layout;
